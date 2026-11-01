import crypto from 'node:crypto'

const MAX_CONTENT_LENGTH = 100_000
const MAX_PAGE_SIZE = 100
const VISIBILITIES = new Set(['public', 'unlisted', 'private'])
export class ValidationError extends Error { constructor(message, errors = {}) { super(message); this.name = 'ValidationError'; this.errors = errors } }
export class NotFoundError extends Error { constructor(message = 'Snippet not found') { super(message); this.name = 'NotFoundError' } }
export class ForbiddenError extends Error { constructor(message = 'You do not own this snippet') { super(message); this.name = 'ForbiddenError' } }

function validate(input) {
  // Request bodies are ordinary JavaScript objects and may contain values from
  // an untrusted client. Validate before opening a transaction so malformed
  // data never reaches SQL; parameter placeholders protect the query itself,
  // but they do not define the application's visibility policy.
  if (typeof input.content !== 'string' || input.content.length === 0 || input.content.length > MAX_CONTENT_LENGTH) throw new ValidationError('content must contain 1-100000 characters', { content: 'must contain 1-100000 characters' })
  if (!VISIBILITIES.has(input.visibility ?? 'public')) throw new ValidationError('visibility must be public, unlisted, or private', { visibility: 'invalid visibility' })
  const expiresAt = input.expires_at == null || input.expires_at === '' ? null : new Date(input.expires_at)
  if (expiresAt && Number.isNaN(expiresAt.valueOf())) throw new ValidationError('expires_at must be an ISO timestamp', { expires_at: 'must be valid' })
  if (expiresAt && expiresAt <= new Date()) throw new ValidationError('expires_at must be in the future', { expires_at: 'must be in the future' })
  const tags = Array.isArray(input.tags) ? input.tags : []
  if (tags.some((tag) => typeof tag !== 'string' || !/^[a-zA-Z0-9_-]{1,32}$/.test(tag))) throw new ValidationError('tags contain invalid values', { tags: 'invalid tag' })
  return { content: input.content, visibility: input.visibility ?? 'public', language: typeof input.language === 'string' && input.language.length <= 32 ? input.language : 'text', expiresAt: expiresAt?.toISOString() ?? null, tags: [...new Set(tags)] }
}
function highlighted(content, language) {
  // Highlighting starts from escaped text, never from the original snippet.
  // This keeps presentation separate from HTML trust: a pasted script remains inert.
  const escaped = content.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')
  if (!['javascript', 'js', 'typescript', 'ts', 'json'].includes(language.toLowerCase())) return escaped
  return escaped.replace(/\b(const|let|var|function|return|async|await|true|false|null|undefined)\b/g, '<span class="token-keyword">$1</span>')
}
function mapSnippet(row, tags) { return { id: row.id, content: row.content, highlighted_html: highlighted(row.content, row.language), owner_id: row.owner_id, visibility: row.visibility, language: row.language, expires_at: row.expires_at, created_at: row.created_at, updated_at: row.updated_at, tags } }
function active(row) { return row && (!row.expires_at || new Date(row.expires_at) > new Date()) }

export function createRepository(database) {
  function getRow(id) { return database.prepare('SELECT * FROM snippets WHERE id = ?').get(id) }
  function tagsFor(id) { return database.prepare('SELECT tag FROM tags WHERE snippet_id = ? ORDER BY tag').all(id).map((row) => row.tag) }
  function get(id) { const row = getRow(id); return row && active(row) ? mapSnippet(row, tagsFor(id)) : null }
  function canRead(row, ownerId) { return row && active(row) && (row.visibility !== 'private' || row.owner_id === ownerId) }
  return {
    create(input) {
      const value = validate(input); const id = crypto.randomBytes(8).toString('base64url'); const now = new Date().toISOString()
      // better-sqlite3 transactions are synchronous callbacks. This is useful
      // here because the driver completes the whole write atomically before the
      // handler returns; it is not the same as an async Promise transaction.
      const transaction = database.transaction(() => {
        database.prepare('INSERT INTO snippets (id, content, owner_id, visibility, language, expires_at, created_at, updated_at) VALUES (@id, @content, @ownerId, @visibility, @language, @expiresAt, @now, @now)').run({ id, content: value.content, ownerId: input.owner_id ?? null, ...value, now })
        const insertTag = database.prepare('INSERT INTO tags (snippet_id, tag) VALUES (?, ?)')
        for (const tag of value.tags) insertTag.run(id, tag)
      })
      transaction(); return get(id)
    },
    get,
    read(id, ownerId) { const row = getRow(id); if (!canRead(row, ownerId)) throw new NotFoundError(); return mapSnippet(row, tagsFor(id)) },
    raw(id, ownerId) { return this.read(id, ownerId).content },
    list({ query = '', tag, page = 1, pageSize = 20 }) {
      const size = Math.min(MAX_PAGE_SIZE, Math.max(1, Number.isInteger(pageSize) ? pageSize : 20)); const currentPage = Math.max(1, Number.isInteger(page) ? page : 1)
      const clauses = ["snippets.visibility = 'public'", '(snippets.expires_at IS NULL OR snippets.expires_at > @now)', '(snippets.content LIKE @query OR snippets.language LIKE @query)']; const parameters = { now: new Date().toISOString(), query: `%${query}%` }
      if (tag) { clauses.push('EXISTS (SELECT 1 FROM tags filter_tags WHERE filter_tags.snippet_id = snippets.id AND filter_tags.tag = @tag)'); parameters.tag = tag }
      const where = clauses.join(' AND ')
      const rows = database.prepare(`SELECT snippets.* FROM snippets WHERE ${where} ORDER BY snippets.created_at DESC LIMIT @limit OFFSET @offset`).all({ ...parameters, limit: size, offset: (currentPage - 1) * size })
      const total = database.prepare(`SELECT COUNT(*) AS count FROM snippets WHERE ${where}`).get(parameters).count
      return { items: rows.map((row) => mapSnippet(row, tagsFor(row.id))), page: currentPage, page_size: size, total: Number(total) }
    },
    update(id, ownerId, input) {
      const current = getRow(id); if (!current || !active(current)) throw new NotFoundError(); if (current.owner_id !== ownerId) throw new ForbiddenError()
      const value = validate({ ...current, ...input }); const transaction = database.transaction(() => {
        database.prepare('UPDATE snippets SET content = @content, visibility = @visibility, language = @language, expires_at = @expiresAt, updated_at = @now WHERE id = @id').run({ id, ...value, now: new Date().toISOString() })
        database.prepare('DELETE FROM tags WHERE snippet_id = ?').run(id); const insertTag = database.prepare('INSERT INTO tags (snippet_id, tag) VALUES (?, ?)'); for (const tag of value.tags) insertTag.run(id, tag)
      }); transaction(); return get(id)
    },
    remove(id, ownerId) { const current = getRow(id); if (!current || !active(current)) throw new NotFoundError(); if (current.owner_id !== ownerId) throw new ForbiddenError(); database.prepare('DELETE FROM snippets WHERE id = ?').run(id) },
    purgeExpired() {
      return database.prepare("DELETE FROM snippets WHERE expires_at IS NOT NULL AND expires_at <= datetime('now')").run().changes
    },
  }
}
export { MAX_CONTENT_LENGTH, MAX_PAGE_SIZE }

