import crypto from 'node:crypto'

const ALIAS_PATTERN = /^[a-zA-Z0-9_-]{3,64}$/
const MAX_PAGE_SIZE = 100

export class ValidationError extends Error {
  constructor(message, errors = {}) {
    super(message)
    this.name = 'ValidationError'
    this.errors = errors
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Link not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'You do not own this link') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

function parseDestination(value) {
  if (typeof value !== 'string' || value.length > 2048) {
    throw new ValidationError('destination_url must be an absolute HTTP or HTTPS URL', {
      destination_url: 'must be an absolute HTTP or HTTPS URL no longer than 2048 characters',
    })
  }

  let url
  try {
    url = new URL(value)
  } catch {
    throw new ValidationError('destination_url must be an absolute HTTP or HTTPS URL', {
      destination_url: 'must be an absolute HTTP or HTTPS URL',
    })
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new ValidationError('destination_url must be an absolute HTTP or HTTPS URL', {
      destination_url: 'must use http or https',
    })
  }
  return url.toString()
}

function parseExpiration(value) {
  if (value === undefined || value === null || value === '') return null
  if (typeof value !== 'string') {
    throw new ValidationError('expires_at must be an ISO timestamp', { expires_at: 'must be a string' })
  }
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) {
    throw new ValidationError('expires_at must be an ISO timestamp', { expires_at: 'must be valid' })
  }
  if (date <= new Date()) {
    throw new ValidationError('expires_at must be in the future', { expires_at: 'must be in the future' })
  }
  return date.toISOString()
}

function parseAlias(value) {
  if (value === undefined || value === null || value === '') return null
  if (typeof value !== 'string' || !ALIAS_PATTERN.test(value)) {
    throw new ValidationError('alias must contain 3-64 letters, numbers, underscores, or hyphens', {
      alias: 'must match [a-zA-Z0-9_-]{3,64}',
    })
  }
  return value
}

function generateAlias() {
  return crypto.randomBytes(5).toString('base64url').slice(0, 8)
}

function mapLink(row) {
  return {
    alias: row.alias,
    destination_url: row.destination_url,
    owner_id: row.owner_id,
    active: Boolean(row.active),
    expires_at: row.expires_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    click_count: Number(row.click_count ?? 0),
  }
}

function isAvailable(row, now = new Date()) {
  return Boolean(row && row.active && (!row.expires_at || new Date(row.expires_at) > now))
}

export function createRepository(database) {
  const insertLink = database.prepare(`
    INSERT INTO links (alias, destination_url, owner_id, active, expires_at, created_at, updated_at)
    VALUES (@alias, @destinationUrl, @ownerId, 1, @expiresAt, @now, @now)
  `)
  const insertClick = database.prepare(`
    INSERT INTO clicks (alias, occurred_at, referrer_host)
    VALUES (@alias, @occurredAt, @referrerHost)
  `)

  function get(alias) {
    const row = database.prepare(`
      SELECT links.*, COUNT(clicks.id) AS click_count
      FROM links LEFT JOIN clicks ON clicks.alias = links.alias
      WHERE links.alias = ?
      GROUP BY links.alias
    `).get(alias)
    return row ? mapLink(row) : null
  }

  function passwordHash(password, salt = crypto.randomBytes(16).toString('hex')) { return `${salt}:${crypto.scryptSync(password, salt, 32).toString('hex')}` }
  function verifyPassword(password, encoded) { if (!encoded) return false; const [salt, digest] = encoded.split(':'); const actual = crypto.scryptSync(password, salt, 32); const expected = Buffer.from(digest, 'hex'); return expected.length === actual.length && crypto.timingSafeEqual(expected, actual) }

  return {
    register({ id, password }) {
      if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{3,64}$/.test(id) || typeof password !== 'string' || password.length < 10 || password.length > 256) throw new ValidationError('id or password is invalid')
      try { database.prepare('INSERT INTO users (id, password_hash, created_at) VALUES (?, ?, ?)').run(id, passwordHash(password), new Date().toISOString()) } catch (error) { if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') throw new ValidationError('account already exists'); throw error }
      return { id }
    },
    login({ id, password }) {
      const user = database.prepare('SELECT id, password_hash FROM users WHERE id = ?').get(id)
      if (!user || !verifyPassword(password, user.password_hash)) throw new ForbiddenError('Invalid credentials')
      const token = crypto.randomBytes(32).toString('base64url'); const tokenHash = crypto.createHash('sha256').update(token).digest('hex'); const expiresAt = new Date(Date.now() + 86_400_000).toISOString()
      database.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(tokenHash, user.id, expiresAt); return { token, user: { id: user.id }, expires_at: expiresAt }
    },
    sessionUser(token) { if (!token) return null; const hash = crypto.createHash('sha256').update(token).digest('hex'); return database.prepare('SELECT user_id AS id FROM sessions WHERE token_hash = ? AND expires_at > ?').get(hash, new Date().toISOString()) ?? null },
    logout(token) { if (token) database.prepare('DELETE FROM sessions WHERE token_hash = ?').run(crypto.createHash('sha256').update(token).digest('hex')) },
    create(input) {
      const destinationUrl = parseDestination(input.destination_url)
      const alias = parseAlias(input.alias)
      const expiresAt = parseExpiration(input.expires_at)
      const now = new Date().toISOString()
      let selectedAlias = alias

      for (let attempt = 0; !selectedAlias && attempt < 5; attempt += 1) {
        const candidate = generateAlias()
        if (!get(candidate)) selectedAlias = candidate
      }
      if (!selectedAlias) throw new Error('Could not allocate a unique alias')

      try {
        insertLink.run({ alias: selectedAlias, destinationUrl, ownerId: input.owner_id ?? null, expiresAt, now })
      } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
          throw new ValidationError('alias is already in use', { alias: 'must be unique' })
        }
        throw error
      }
      return get(selectedAlias)
    },

    get,

    list({ ownerId, query = '', page = 1, pageSize = 20 }) {
      const boundedPage = Math.max(1, Number.isInteger(page) ? page : 1)
      const boundedSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number.isInteger(pageSize) ? pageSize : 20))
      const offset = (boundedPage - 1) * boundedSize
      const filter = `%${query}%`
      const where = ownerId ? 'WHERE links.owner_id = @ownerId AND (links.alias LIKE @filter OR links.destination_url LIKE @filter)' : 'WHERE links.alias LIKE @filter OR links.destination_url LIKE @filter'
      const parameters = ownerId ? { ownerId, filter } : { filter }
      const rows = database.prepare(`
        SELECT links.*, COUNT(clicks.id) AS click_count
        FROM links LEFT JOIN clicks ON clicks.alias = links.alias
        ${where}
        GROUP BY links.alias
        ORDER BY links.created_at DESC
        LIMIT @limit OFFSET @offset
      `).all({ ...parameters, limit: boundedSize, offset })
      const total = database.prepare(`SELECT COUNT(*) AS count FROM links ${where}`).get(parameters).count
      return { items: rows.map(mapLink), page: boundedPage, page_size: boundedSize, total: Number(total) }
    },

    update(alias, ownerId, changes) {
      const current = get(alias)
      if (!current) throw new NotFoundError()
      if (current.owner_id !== ownerId) throw new ForbiddenError()
      const active = changes.active === undefined ? current.active : changes.active
      if (typeof active !== 'boolean') throw new ValidationError('active must be a boolean', { active: 'must be boolean' })
      const expiresAt = changes.expires_at === undefined ? current.expires_at : parseExpiration(changes.expires_at)
      const now = new Date().toISOString()
      database.prepare(`UPDATE links SET active = @active, expires_at = @expiresAt, updated_at = @now WHERE alias = @alias`)
        .run({ alias, active: active ? 1 : 0, expiresAt, now })
      return get(alias)
    },

    remove(alias, ownerId) {
      const current = get(alias)
      if (!current) throw new NotFoundError()
      if (current.owner_id !== ownerId) throw new ForbiddenError()
      database.prepare('DELETE FROM links WHERE alias = ?').run(alias)
    },

    resolve(alias, referrerHost) {
      const current = get(alias)
      if (!isAvailable(current)) throw new NotFoundError('Link is unavailable')
      try {
        insertClick.run({ alias, occurredAt: new Date().toISOString(), referrerHost: referrerHost ?? null })
      } catch {
        // Analytics are best effort; a redirect must not become an error page.
      }
      return current.destination_url
    },

    analytics(alias, ownerId) {
      const current = get(alias)
      if (!current) throw new NotFoundError()
      if (current.owner_id !== ownerId) throw new ForbiddenError()
      const row = database.prepare(`
        SELECT COUNT(*) AS total_clicks, MIN(occurred_at) AS first_click_at,
          MAX(occurred_at) AS last_click_at
        FROM clicks WHERE alias = ?
      `).get(alias)
      const referrers = database.prepare(`
        SELECT referrer_host, COUNT(*) AS clicks
        FROM clicks WHERE alias = ? AND referrer_host IS NOT NULL
        GROUP BY referrer_host ORDER BY clicks DESC, referrer_host ASC
      `).all(alias)
      return { alias, total_clicks: Number(row.total_clicks), first_click_at: row.first_click_at, last_click_at: row.last_click_at, referrers }
    },
  }
}

export { MAX_PAGE_SIZE }

