import crypto from 'node:crypto'

export class ValidationError extends Error { constructor(message, errors = {}) { super(message); this.name = 'ValidationError'; this.errors = errors } }
export class NotFoundError extends Error { constructor(message = 'Link not found') { super(message); this.name = 'NotFoundError' } }
export class ForbiddenError extends Error { constructor(message = 'You do not own this link') { super(message); this.name = 'ForbiddenError' } }
const aliasPattern = /^[a-zA-Z0-9_-]{3,64}$/
function destination(value) { try { const url = new URL(value); if (!['http:', 'https:'].includes(url.protocol)) throw new Error(); return url.toString() } catch { throw new ValidationError('destination_url must be an absolute HTTP or HTTPS URL', { destination_url: 'invalid URL' }) } }
function output(link) { return { alias: link.alias, destination_url: link.destinationUrl, owner_id: link.ownerId, active: link.active, expires_at: link.expiresAt?.toISOString() ?? null, created_at: link.createdAt.toISOString(), updated_at: link.updatedAt.toISOString(), click_count: link._count?.clicks ?? 0 } }
function available(link) { return link && link.active && (!link.expiresAt || link.expiresAt > new Date()) }

export function createRepository(database) {
  const include = { _count: { select: { clicks: true } } }
  return {
    async create(value) {
      if (typeof value.destination_url !== 'string') throw new ValidationError('destination_url is required')
      if (value.alias !== undefined && (typeof value.alias !== 'string' || !aliasPattern.test(value.alias))) throw new ValidationError('alias is invalid', { alias: 'must match [a-zA-Z0-9_-]{3,64}' })
      const alias = value.alias ?? crypto.randomBytes(5).toString('base64url').slice(0, 8)
      try { return output(await database.link.create({ data: { alias, destinationUrl: destination(value.destination_url), ownerId: value.owner_id ?? null, expiresAt: value.expires_at ? new Date(value.expires_at) : null }, include })) } catch (error) { if (error.code === 'P2002') throw new ValidationError('alias is already in use', { alias: 'must be unique' }); throw error }
    },
    async get(alias) { const link = await database.link.findUnique({ where: { alias }, include }); return link ? output(link) : null },
    async list(ownerId) { const items = await database.link.findMany({ where: { ownerId }, orderBy: { createdAt: 'desc' }, include }); return { items: items.map(output), total: items.length, page: 1, page_size: items.length } },
    async update(alias, ownerId, value) { const link = await database.link.findUnique({ where: { alias }, include }); if (!link) throw new NotFoundError(); if (link.ownerId !== ownerId) throw new ForbiddenError(); const updated = await database.link.update({ where: { alias }, data: { active: value.active ?? link.active, expiresAt: value.expires_at === undefined ? link.expiresAt : value.expires_at ? new Date(value.expires_at) : null }, include }); return output(updated) },
    async remove(alias, ownerId) { const link = await database.link.findUnique({ where: { alias } }); if (!link) throw new NotFoundError(); if (link.ownerId !== ownerId) throw new ForbiddenError(); await database.link.delete({ where: { alias } }) },
    async resolve(alias, referrerHost) { const link = await database.link.findUnique({ where: { alias } }); if (!available(link)) throw new NotFoundError('Link is unavailable'); await database.click.create({ data: { alias, referrerHost } }); return link.destinationUrl },
  }
}

