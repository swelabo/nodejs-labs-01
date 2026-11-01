import crypto from 'node:crypto'

const MAX_PAGE_SIZE = 100
const STATUSES = new Set(['draft', 'scheduled', 'published'])

export class ValidationError extends Error { constructor(message, errors = {}) { super(message); this.name = 'ValidationError'; this.errors = errors } }
export class NotFoundError extends Error { constructor(message = 'Post not found') { super(message); this.name = 'NotFoundError' } }
export class ForbiddenError extends Error { constructor(message = 'Insufficient role') { super(message); this.name = 'ForbiddenError' } }

function slug(value) {
  if (typeof value !== 'string' || !/^[a-z0-9-]{1,128}$/.test(value)) throw new ValidationError('slug must contain lowercase letters, numbers, or hyphens', { slug: 'invalid slug' })
  return value
}
function input(value) {
  if (typeof value.title !== 'string' || value.title.length < 1 || value.title.length > 200) throw new ValidationError('title must contain 1-200 characters', { title: 'invalid title' })
  if (typeof value.body !== 'string' || value.body.length < 1) throw new ValidationError('body must not be empty', { body: 'must not be empty' })
  const status = value.status ?? 'draft'
  if (!STATUSES.has(status)) throw new ValidationError('status is invalid', { status: 'invalid status' })
  let publishAt = value.publish_at ?? null
  if (publishAt !== null) { const date = new Date(publishAt); if (Number.isNaN(date.valueOf())) throw new ValidationError('publish_at must be an ISO timestamp', { publish_at: 'invalid timestamp' }); publishAt = date.toISOString() }
  return { title: value.title, body: value.body, slug: slug(value.slug), status, publishAt }
}
function published(row) { return row?.status === 'published' && (!row.publish_at || new Date(row.publish_at) <= new Date()) }
function mapPost(row, categories, tags, comments = []) { return { id: row.id, slug: row.slug, title: row.title, body: row.body, author_id: row.author_id, author_name: row.author_name, status: row.status, publish_at: row.publish_at, created_at: row.created_at, updated_at: row.updated_at, categories, tags, comments } }
function mapPage(row) { return { id: row.id, slug: row.slug, title: row.title, body: row.body, author_id: row.author_id, author_name: row.author_name, status: row.status, publish_at: row.publish_at, created_at: row.created_at, updated_at: row.updated_at } }
function xml(value) { return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;') }

export function createRepository(database) {
  function postRow(idOrSlug, bySlug = false) {
    return database.prepare(`SELECT posts.*, users.display_name AS author_name FROM posts JOIN users ON users.id = posts.author_id WHERE posts.${bySlug ? 'slug' : 'id'} = ?`).get(idOrSlug)
  }
  function pageRow(slugValue) { return database.prepare('SELECT pages.*, users.display_name AS author_name FROM pages JOIN users ON users.id = pages.author_id WHERE pages.slug = ?').get(slugValue) }
  function taxonomy(table, joinTable, postId) { return database.prepare(`SELECT ${table}.slug, ${table}.name FROM ${table} JOIN ${joinTable} ON ${joinTable}.${table === 'categories' ? 'category_id' : 'tag_id'} = ${table}.id WHERE ${joinTable}.post_id = ? ORDER BY ${table}.name`).all(postId) }
  function get(id) { const row = postRow(id); return row ? mapPost(row, taxonomy('categories', 'post_categories', id), taxonomy('tags', 'post_tags', id)) : null }
  function approvedComments(postId) { return database.prepare("SELECT id, author_name, body, created_at FROM comments WHERE post_id = ? AND status = 'approved' ORDER BY created_at").all(postId) }
  function mapPublic(row) { return mapPost(row, taxonomy('categories', 'post_categories', row.id), taxonomy('tags', 'post_tags', row.id), approvedComments(row.id)) }
  function canManage(role) { return role === 'editor' || role === 'administrator' }
  function ensureUser(userId, role) { database.prepare('INSERT INTO users (id, slug, display_name, role) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET role = excluded.role').run(userId, userId.toLowerCase().replace(/[^a-z0-9-]/g, '-'), userId, role) }
  function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) { return `${salt}:${crypto.scryptSync(password, salt, 32).toString('hex')}` }
  function verifyPassword(password, encoded) { if (!encoded) return false; const [salt, digest] = encoded.split(':'); return crypto.timingSafeEqual(Buffer.from(digest, 'hex'), crypto.scryptSync(password, salt, 32)) }
  return {
    create(userId, role, value) {
      if (!userId || !canManage(role)) throw new ForbiddenError()
      ensureUser(userId, role); const post = input(value); const now = new Date().toISOString()
      try { const result = database.prepare('INSERT INTO posts (slug, title, body, author_id, status, publish_at, created_at, updated_at) VALUES (@slug, @title, @body, @authorId, @status, @publishAt, @now, @now)').run({ ...post, authorId: userId, now }); return get(Number(result.lastInsertRowid)) } catch (error) { if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') throw new ValidationError('slug is already in use', { slug: 'must be unique' }); throw error }
    },
    get,
    publicBySlug(value) { const row = postRow(value, true); if (!published(row)) throw new NotFoundError(); return mapPublic(row) },
    publicPageBySlug(value) { const row = pageRow(value); if (!published(row)) throw new NotFoundError('Page not found'); return mapPage(row) },
    list({ query = '', page = 1, pageSize = 20, tag, category, author, year, month }) {
      const size = Math.min(MAX_PAGE_SIZE, Math.max(1, Number.isInteger(pageSize) ? pageSize : 20)); const currentPage = Math.max(1, Number.isInteger(page) ? page : 1)
      const clauses = ["posts.status = 'published'", '(posts.publish_at IS NULL OR posts.publish_at <= @now)', '(posts.title LIKE @query OR posts.body LIKE @query)']; const parameters = { now: new Date().toISOString(), query: `%${query}%` }
      if (tag) { clauses.push('EXISTS (SELECT 1 FROM post_tags ptf JOIN tags tf ON tf.id = ptf.tag_id WHERE ptf.post_id = posts.id AND tf.slug = @tag)'); parameters.tag = tag }
      if (category) { clauses.push('EXISTS (SELECT 1 FROM post_categories pcf JOIN categories cf ON cf.id = pcf.category_id WHERE pcf.post_id = posts.id AND cf.slug = @category)'); parameters.category = category }
      if (author) { clauses.push('users.slug = @author'); parameters.author = author }
      if (year) { clauses.push("strftime('%Y', COALESCE(posts.publish_at, posts.created_at)) = @year"); parameters.year = String(year).padStart(4, '0') }
      if (month) { clauses.push("strftime('%m', COALESCE(posts.publish_at, posts.created_at)) = @month"); parameters.month = String(month).padStart(2, '0') }
      const where = clauses.join(' AND '); const rows = database.prepare(`SELECT posts.*, users.display_name AS author_name FROM posts JOIN users ON users.id = posts.author_id WHERE ${where} ORDER BY COALESCE(posts.publish_at, posts.created_at) DESC LIMIT @limit OFFSET @offset`).all({ ...parameters, limit: size, offset: (currentPage - 1) * size }); const total = database.prepare(`SELECT COUNT(*) AS count FROM posts JOIN users ON users.id = posts.author_id WHERE ${where}`).get(parameters).count
      return { items: rows.map((row) => mapPost(row, taxonomy('categories', 'post_categories', row.id), taxonomy('tags', 'post_tags', row.id))), page: currentPage, page_size: size, total: Number(total) }
    },
    authorBySlug(value) {
      const user = database.prepare('SELECT id, slug, display_name FROM users WHERE slug = ?').get(value)
      if (!user) throw new NotFoundError('Author not found')
      return { ...user, posts: this.list({ author: value }).items }
    },
    archive(year, month) {
      if (!/^\d{4}$/.test(String(year)) || (month !== undefined && !/^(0[1-9]|1[0-2])$/.test(String(month).padStart(2, '0')))) throw new NotFoundError('Archive not found')
      return this.list({ year, month }).items
    },
    categories() { return database.prepare('SELECT id, slug, name, parent_id FROM categories ORDER BY name').all() },
    tags() { return database.prepare('SELECT id, slug, name FROM tags ORDER BY name').all() },
    listTaxonomies() { return database.prepare('SELECT id, slug, name, hierarchical FROM taxonomies ORDER BY name').all() },
    createTaxonomy(role, value) {
      if (!canManage(role)) throw new ForbiddenError()
      if (typeof value.slug !== 'string' || !/^[a-z0-9-]{1,128}$/.test(value.slug) || typeof value.name !== 'string' || !value.name.trim()) throw new ValidationError('taxonomy fields are invalid')
      try { const result = database.prepare('INSERT INTO taxonomies (slug, name, hierarchical) VALUES (?, ?, ?)').run(value.slug, value.name.trim(), value.hierarchical ? 1 : 0); return database.prepare('SELECT * FROM taxonomies WHERE id = ?').get(result.lastInsertRowid) } catch (error) { if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') throw new ValidationError('taxonomy slug is already in use'); throw error }
    },
    listTaxonomyTerms(taxonomySlug) {
      const taxonomy = database.prepare('SELECT id FROM taxonomies WHERE slug = ?').get(taxonomySlug)
      if (!taxonomy) throw new NotFoundError('Taxonomy not found')
      return database.prepare('SELECT id, slug, name, parent_id FROM taxonomy_terms WHERE taxonomy_id = ? ORDER BY name').all(taxonomy.id)
    },
    createTaxonomyTerm(role, taxonomySlug, value) {
      if (!canManage(role)) throw new ForbiddenError()
      const taxonomy = database.prepare('SELECT id, hierarchical FROM taxonomies WHERE slug = ?').get(taxonomySlug)
      if (!taxonomy) throw new NotFoundError('Taxonomy not found')
      if (typeof value.slug !== 'string' || !/^[a-z0-9-]{1,128}$/.test(value.slug) || typeof value.name !== 'string' || !value.name.trim()) throw new ValidationError('term fields are invalid')
      const parentId = value.parent_id == null ? null : Number(value.parent_id)
      if (parentId !== null) {
        if (!taxonomy.hierarchical) throw new ValidationError('taxonomy is not hierarchical')
        const parent = database.prepare('SELECT taxonomy_id FROM taxonomy_terms WHERE id = ?').get(parentId)
        if (!parent || parent.taxonomy_id !== taxonomy.id) throw new ValidationError('parent term belongs to another taxonomy')
        let current = parentId; const seen = new Set()
        while (current) { if (seen.has(current)) throw new ValidationError('term hierarchy contains a cycle'); seen.add(current); current = database.prepare('SELECT parent_id FROM taxonomy_terms WHERE id = ?').get(current)?.parent_id ?? 0 }
      }
      try { const result = database.prepare('INSERT INTO taxonomy_terms (taxonomy_id, slug, name, parent_id) VALUES (?, ?, ?, ?)').run(taxonomy.id, value.slug, value.name.trim(), parentId); return database.prepare('SELECT * FROM taxonomy_terms WHERE id = ?').get(result.lastInsertRowid) } catch (error) { if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') throw new ValidationError('term slug is already in use'); throw error }
    },
    update(id, userId, role, value) {
      const current = postRow(id); if (!current) throw new NotFoundError(); if (current.author_id !== userId && role !== 'administrator') throw new ForbiddenError(); if (!canManage(role)) throw new ForbiddenError()
      const post = input({ ...current, ...value }); const now = new Date().toISOString(); database.prepare('UPDATE posts SET slug = @slug, title = @title, body = @body, status = @status, publish_at = @publishAt, updated_at = @now WHERE id = @id').run({ ...post, id, now }); return get(id)
    },
    seedTaxonomy() {
      database.prepare('INSERT OR IGNORE INTO categories (slug, name) VALUES (?, ?)').run('engineering', 'Engineering')
      database.prepare('INSERT OR IGNORE INTO tags (slug, name) VALUES (?, ?)').run('nodejs', 'Node.js')
    },
    issueChallenge() {
      const id = crypto.randomBytes(12).toString('base64url'); const left = crypto.randomInt(1, 10); const right = crypto.randomInt(1, 10); const answer = String(left + right); const answerHash = crypto.createHash('sha256').update(`${id}:${answer}`).digest('hex'); const expiresAt = new Date(Date.now() + 5 * 60_000).toISOString()
      database.prepare('INSERT INTO captcha_challenges (id, answer_hash, expires_at) VALUES (?, ?, ?)').run(id, answerHash, expiresAt)
      return { id, prompt: `What is ${left} + ${right}?`, answer }
    },
    createComment(slugValue, value) {
      const row = postRow(slugValue, true); if (!published(row)) throw new NotFoundError(); if (typeof value.author_name !== 'string' || value.author_name.length < 1 || value.author_name.length > 100 || typeof value.body !== 'string' || value.body.length < 1 || value.body.length > 5000) throw new ValidationError('comment fields are invalid')
      const challenge = database.prepare('SELECT * FROM captcha_challenges WHERE id = ?').get(value.challenge_id); const answerHash = crypto.createHash('sha256').update(`${value.challenge_id}:${value.challenge_answer ?? ''}`).digest('hex')
      if (!challenge || challenge.consumed_at || new Date(challenge.expires_at) <= new Date() || answerHash !== challenge.answer_hash) throw new ValidationError('challenge is invalid or expired', { challenge: 'must be solved once before it expires' })
      const now = new Date().toISOString(); const transaction = database.transaction(() => { database.prepare('UPDATE captcha_challenges SET consumed_at = ? WHERE id = ?').run(now, value.challenge_id); return database.prepare("INSERT INTO comments (post_id, author_name, body, status, created_at) VALUES (?, ?, ?, 'pending', ?)").run(row.id, value.author_name, value.body, now).lastInsertRowid }); const id = transaction(); return { id: Number(id), status: 'pending' }
    },
    pendingComments(role) { if (!canManage(role)) throw new ForbiddenError(); return database.prepare("SELECT comments.*, posts.slug FROM comments JOIN posts ON posts.id = comments.post_id WHERE comments.status = 'pending' ORDER BY comments.created_at").all() },
    moderateComment(id, role, status) { if (!canManage(role)) throw new ForbiddenError(); if (!['approved', 'rejected'].includes(status)) throw new ValidationError('invalid moderation status'); const result = database.prepare('UPDATE comments SET status = ?, moderated_at = ? WHERE id = ?').run(status, new Date().toISOString(), id); if (!result.changes) throw new NotFoundError('Comment not found'); return database.prepare('SELECT * FROM comments WHERE id = ?').get(id) },
    createCategory(role, value) {
      if (!canManage(role)) throw new ForbiddenError(); if (typeof value.slug !== 'string' || !/^[a-z0-9-]{1,128}$/.test(value.slug) || typeof value.name !== 'string' || !value.name.trim()) throw new ValidationError('category fields are invalid')
      if (value.parent_id != null) { let current = Number(value.parent_id); const seen = new Set(); while (current) { if (seen.has(current)) throw new ValidationError('category hierarchy contains a cycle'); seen.add(current); current = database.prepare('SELECT parent_id FROM categories WHERE id = ?').get(current)?.parent_id ?? 0 } }
      const result = database.prepare('INSERT INTO categories (slug, name, parent_id) VALUES (?, ?, ?)').run(value.slug, value.name, value.parent_id ?? null); return database.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid)
    },
    listUsers(role) { if (role !== 'administrator') throw new ForbiddenError(); return database.prepare('SELECT id, slug, display_name, role FROM users ORDER BY id').all() },
    updateUserRole(role, id, newRole) {
      if (role !== 'administrator') throw new ForbiddenError()
      if (!['author', 'editor', 'administrator'].includes(newRole)) throw new ValidationError('invalid user role', { role: 'must be author, editor, or administrator' })
      const result = database.prepare('UPDATE users SET role = ? WHERE id = ?').run(newRole, id)
      if (!result.changes) throw new NotFoundError('User not found')
      return database.prepare('SELECT id, slug, display_name, role FROM users WHERE id = ?').get(id)
    },
    createUser(role, value) {
      if (role !== 'administrator') throw new ForbiddenError()
      if (typeof value.id !== 'string' || !/^[a-zA-Z0-9_-]{3,64}$/.test(value.id) || typeof value.password !== 'string' || value.password.length < 12) throw new ValidationError('user id or password is invalid')
      try { database.prepare('INSERT INTO users (id, slug, display_name, password_hash, role) VALUES (?, ?, ?, ?, ?)').run(value.id, value.id.toLowerCase(), value.display_name || value.id, hashPassword(value.password), value.role || 'author') } catch (error) { if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') throw new ValidationError('user already exists') ; throw error }
      return database.prepare('SELECT id, slug, display_name, role FROM users WHERE id = ?').get(value.id)
    },
    login(userId, password) {
      const user = database.prepare('SELECT id, role, password_hash FROM users WHERE id = ?').get(userId)
      if (!user || !verifyPassword(password, user.password_hash)) throw new ForbiddenError('Invalid credentials')
      const token = crypto.randomBytes(32).toString('base64url'); const tokenHash = crypto.createHash('sha256').update(token).digest('hex'); const expiresAt = new Date(Date.now() + 86_400_000).toISOString()
      database.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(tokenHash, user.id, expiresAt)
      return { token, expires_at: expiresAt, user: { id: user.id, role: user.role } }
    },
    sessionUser(token) {
      if (!token) return null
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex'); const user = database.prepare('SELECT users.id, users.role FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.token_hash = ? AND sessions.expires_at > ?').get(tokenHash, new Date().toISOString())
      return user || null
    },
    logout(token) { if (token) database.prepare('DELETE FROM sessions WHERE token_hash = ?').run(crypto.createHash('sha256').update(token).digest('hex')) },
    feed() { return this.list({ page: 1, pageSize: 20 }).items },
    sitemap() {
      const now = new Date().toISOString()
      return [
        ...database.prepare("SELECT slug, updated_at, 'posts' AS kind FROM posts WHERE status = 'published' AND (publish_at IS NULL OR publish_at <= @now) ORDER BY slug").all({ now }),
        ...database.prepare("SELECT slug, updated_at, 'pages' AS kind FROM pages WHERE status = 'published' AND (publish_at IS NULL OR publish_at <= @now) ORDER BY slug").all({ now }),
      ]
    },
  }
}
export { MAX_PAGE_SIZE, xml }

