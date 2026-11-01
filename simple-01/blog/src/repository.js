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
function xml(value) { return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;') }

export function createRepository(database) {
  function postRow(idOrSlug, bySlug = false) {
    return database.prepare(`SELECT posts.*, users.display_name AS author_name FROM posts JOIN users ON users.id = posts.author_id WHERE posts.${bySlug ? 'slug' : 'id'} = ?`).get(idOrSlug)
  }
  function taxonomy(table, joinTable, postId) { return database.prepare(`SELECT ${table}.slug, ${table}.name FROM ${table} JOIN ${joinTable} ON ${joinTable}.${table === 'categories' ? 'category_id' : 'tag_id'} = ${table}.id WHERE ${joinTable}.post_id = ? ORDER BY ${table}.name`).all(postId) }
  function get(id) { const row = postRow(id); return row ? mapPost(row, taxonomy('categories', 'post_categories', id), taxonomy('tags', 'post_tags', id)) : null }
  function approvedComments(postId) { return database.prepare("SELECT id, author_name, body, created_at FROM comments WHERE post_id = ? AND status = 'approved' ORDER BY created_at").all(postId) }
  function mapPublic(row) { return mapPost(row, taxonomy('categories', 'post_categories', row.id), taxonomy('tags', 'post_tags', row.id), approvedComments(row.id)) }
  function canManage(role) { return role === 'editor' || role === 'administrator' }
  function ensureUser(userId, role) { database.prepare('INSERT INTO users (id, slug, display_name, role) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET role = excluded.role').run(userId, userId.toLowerCase().replace(/[^a-z0-9-]/g, '-'), userId, role) }
  return {
    create(userId, role, value) {
      if (!userId || !canManage(role)) throw new ForbiddenError()
      ensureUser(userId, role); const post = input(value); const now = new Date().toISOString()
      try { const result = database.prepare('INSERT INTO posts (slug, title, body, author_id, status, publish_at, created_at, updated_at) VALUES (@slug, @title, @body, @authorId, @status, @publishAt, @now, @now)').run({ ...post, authorId: userId, now }); return get(Number(result.lastInsertRowid)) } catch (error) { if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') throw new ValidationError('slug is already in use', { slug: 'must be unique' }); throw error }
    },
    get,
    publicBySlug(value) { const row = postRow(value, true); if (!published(row)) throw new NotFoundError(); return mapPublic(row) },
    list({ query = '', page = 1, pageSize = 20, tag, category }) {
      const size = Math.min(MAX_PAGE_SIZE, Math.max(1, Number.isInteger(pageSize) ? pageSize : 20)); const currentPage = Math.max(1, Number.isInteger(page) ? page : 1)
      const clauses = ["posts.status = 'published'", '(posts.publish_at IS NULL OR posts.publish_at <= @now)', '(posts.title LIKE @query OR posts.body LIKE @query)']; const parameters = { now: new Date().toISOString(), query: `%${query}%` }
      if (tag) { clauses.push('EXISTS (SELECT 1 FROM post_tags ptf JOIN tags tf ON tf.id = ptf.tag_id WHERE ptf.post_id = posts.id AND tf.slug = @tag)'); parameters.tag = tag }
      if (category) { clauses.push('EXISTS (SELECT 1 FROM post_categories pcf JOIN categories cf ON cf.id = pcf.category_id WHERE pcf.post_id = posts.id AND cf.slug = @category)'); parameters.category = category }
      const where = clauses.join(' AND '); const rows = database.prepare(`SELECT posts.*, users.display_name AS author_name FROM posts JOIN users ON users.id = posts.author_id WHERE ${where} ORDER BY COALESCE(posts.publish_at, posts.created_at) DESC LIMIT @limit OFFSET @offset`).all({ ...parameters, limit: size, offset: (currentPage - 1) * size }); const total = database.prepare(`SELECT COUNT(*) AS count FROM posts WHERE ${where}`).get(parameters).count
      return { items: rows.map((row) => mapPost(row, taxonomy('categories', 'post_categories', row.id), taxonomy('tags', 'post_tags', row.id))), page: currentPage, page_size: size, total: Number(total) }
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
    feed() { return this.list({ page: 1, pageSize: 20 }).items },
    sitemap() { return database.prepare("SELECT slug, updated_at FROM posts WHERE status = 'published' AND (publish_at IS NULL OR publish_at <= @now) ORDER BY slug").all({ now: new Date().toISOString() }) },
  }
}
export { MAX_PAGE_SIZE, xml }

