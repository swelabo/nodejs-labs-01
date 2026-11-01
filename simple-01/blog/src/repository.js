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
function mapPost(row, categories, tags) { return { id: row.id, slug: row.slug, title: row.title, body: row.body, author_id: row.author_id, author_name: row.author_name, status: row.status, publish_at: row.publish_at, created_at: row.created_at, updated_at: row.updated_at, categories, tags } }

export function createRepository(database) {
  function postRow(idOrSlug, bySlug = false) {
    return database.prepare(`SELECT posts.*, users.display_name AS author_name FROM posts JOIN users ON users.id = posts.author_id WHERE posts.${bySlug ? 'slug' : 'id'} = ?`).get(idOrSlug)
  }
  function taxonomy(table, joinTable, postId) { return database.prepare(`SELECT ${table}.slug, ${table}.name FROM ${table} JOIN ${joinTable} ON ${joinTable}.${table === 'categories' ? 'category_id' : 'tag_id'} = ${table}.id WHERE ${joinTable}.post_id = ? ORDER BY ${table}.name`).all(postId) }
  function get(id) { const row = postRow(id); return row ? mapPost(row, taxonomy('categories', 'post_categories', id), taxonomy('tags', 'post_tags', id)) : null }
  function canManage(role) { return role === 'editor' || role === 'administrator' }
  function ensureUser(userId, role) { database.prepare('INSERT INTO users (id, slug, display_name, role) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET role = excluded.role').run(userId, userId.toLowerCase().replace(/[^a-z0-9-]/g, '-'), userId, role) }
  return {
    create(userId, role, value) {
      if (!userId || !canManage(role)) throw new ForbiddenError()
      ensureUser(userId, role); const post = input(value); const now = new Date().toISOString()
      try { const result = database.prepare('INSERT INTO posts (slug, title, body, author_id, status, publish_at, created_at, updated_at) VALUES (@slug, @title, @body, @authorId, @status, @publishAt, @now, @now)').run({ ...post, authorId: userId, now }); return get(Number(result.lastInsertRowid)) } catch (error) { if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') throw new ValidationError('slug is already in use', { slug: 'must be unique' }); throw error }
    },
    get,
    publicBySlug(value) { const row = postRow(value, true); if (!published(row)) throw new NotFoundError(); return mapPost(row, taxonomy('categories', 'post_categories', row.id), taxonomy('tags', 'post_tags', row.id)) },
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
  }
}
export { MAX_PAGE_SIZE }

