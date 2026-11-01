import crypto from 'node:crypto'
export class ValidationError extends Error { constructor(message) { super(message); this.name = 'ValidationError' } }
export class NotFoundError extends Error { constructor(message = 'Snippet not found') { super(message); this.name = 'NotFoundError' } }
export class ForbiddenError extends Error { constructor(message = 'You do not own this snippet') { super(message); this.name = 'ForbiddenError' } }
const include = { tags: true }
function output(row) { return { id: row.id, content: row.content, owner_id: row.ownerId, visibility: row.visibility, language: row.language, expires_at: row.expiresAt?.toISOString() ?? null, created_at: row.createdAt.toISOString(), updated_at: row.updatedAt.toISOString(), tags: row.tags.map((tag) => tag.tag) } }
function available(row) { return row && (!row.expiresAt || row.expiresAt > new Date()) }
function validate(value) { if (typeof value.content !== 'string' || !value.content || value.content.length > 100000) throw new ValidationError('content must contain 1-100000 characters'); if (!['public', 'unlisted', 'private'].includes(value.visibility ?? 'public')) throw new ValidationError('invalid visibility'); const tags = Array.isArray(value.tags) ? [...new Set(value.tags)] : []; if (tags.some((tag) => typeof tag !== 'string' || !/^[a-zA-Z0-9_-]{1,32}$/.test(tag))) throw new ValidationError('invalid tags'); return { content: value.content, visibility: value.visibility ?? 'public', language: value.language || 'text', expiresAt: value.expires_at ? new Date(value.expires_at) : null, tags } }
export function createRepository(database) {
  return {
    async create(value) { const data = validate(value); const id = crypto.randomBytes(8).toString('base64url'); return output(await database.snippet.create({ data: { id, content: data.content, ownerId: value.owner_id ?? null, visibility: data.visibility, language: data.language, expiresAt: data.expiresAt, tags: { create: data.tags.map((tag) => ({ tag })) } }, include })) },
    async read(id, ownerId) { const row = await database.snippet.findUnique({ where: { id }, include }); if (!available(row) || (row.visibility === 'private' && row.ownerId !== ownerId)) throw new NotFoundError(); return output(row) },
    async list({ query = '', tag }) { const rows = await database.snippet.findMany({ where: { visibility: 'public', ...(tag ? { tags: { some: { tag } } } : {}), OR: [{ content: { contains: query } }, { language: { contains: query } }] }, orderBy: { createdAt: 'desc' }, include }); return { items: rows.filter(available).map(output), page: 1, page_size: rows.length, total: rows.length } },
    async update(id, ownerId, value) { const current = await database.snippet.findUnique({ where: { id } }); if (!available(current)) throw new NotFoundError(); if (current.ownerId !== ownerId) throw new ForbiddenError(); const data = validate({ ...current, ...value }); await database.snippetTag.deleteMany({ where: { snippetId: id } }); const row = await database.snippet.update({ where: { id }, data: { content: data.content, visibility: data.visibility, language: data.language, expiresAt: data.expiresAt, tags: { create: data.tags.map((tag) => ({ tag })) } }, include }); return output(row) },
    async remove(id, ownerId) { const row = await database.snippet.findUnique({ where: { id } }); if (!row) throw new NotFoundError(); if (row.ownerId !== ownerId) throw new ForbiddenError(); await database.snippet.delete({ where: { id } }) },
  }
}

