import assert from 'node:assert/strict'
import test, { after, before } from 'node:test'
import request from 'supertest'
import { createDatabase } from '../src/db.js'
import { createRepository } from '../src/repository.js'
import { createApp } from '../src/app.js'
let database; let app
before(async () => { database = createDatabase(); await database.$executeRawUnsafe('DELETE FROM SnippetTag'); await database.$executeRawUnsafe('DELETE FROM Snippet'); app = createApp({ repository: createRepository(database) }) })
after(async () => database.$disconnect())
test('Prisma preserves visibility, raw text, tags, and ownership', async () => { const created = await request(app).post('/api/v1/snippets').set('x-user-id', 'alice').send({ content: '<script>x</script>', visibility: 'private', tags: ['node'] }); assert.equal(created.status, 201); const id = created.body.data.id; assert.equal((await request(app).get(`/api/v1/snippets/${id}`).set('x-user-id', 'bob')).status, 404); const raw = await request(app).get(`/api/v1/snippets/${id}`).set('x-user-id', 'alice'); assert.equal(raw.body.data.tags[0], 'node'); const denied = await request(app).delete(`/api/v1/snippets/${id}`).set('x-user-id', 'bob'); assert.equal(denied.status, 403) })
test('Prisma lists public snippets and rejects invalid visibility', async () => { const created = await request(app).post('/api/v1/snippets').send({ content: 'public node', visibility: 'public', tags: ['node'] }); assert.equal(created.status, 201); const listed = await request(app).get('/api/v1/snippets?q=node&tag=node'); assert.equal(listed.body.total, 1); const invalid = await request(app).post('/api/v1/snippets').send({ content: 'x', visibility: 'secret' }); assert.equal(invalid.status, 400) })

