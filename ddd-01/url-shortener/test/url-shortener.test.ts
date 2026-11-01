import assert from 'node:assert/strict'
import test, { after, before } from 'node:test'
import request from 'supertest'
import { createDatabase } from '../src/db.js'
import { createRepository } from '../src/repository.js'
import { createApp } from '../src/app.js'
import { createUseCases } from '../src/usecases.js'
import { requireLinkPort } from '../src/ports.js'

let database
let app
before(async () => { database = createDatabase('file:./data/test.db'); await database.$executeRawUnsafe('DELETE FROM Click'); await database.$executeRawUnsafe('DELETE FROM Link'); const repository = createRepository(database); app = createApp({ repository, useCases: createUseCases(repository) }) })
after(async () => database.$disconnect())

test('Prisma persists links and resolves redirects', async () => {
  const created = await request(app).post('/api/v1/links').set('x-user-id', 'alice').send({ destination_url: 'https://example.com/path', alias: 'prisma' })
  assert.equal(created.status, 201)
  const redirect = await request(app).get('/prisma').set('referer', 'https://reader.example')
  assert.equal(redirect.status, 302); assert.equal(redirect.headers.location, 'https://example.com/path')
  const listed = await request(app).get('/api/v1/links').set('x-user-id', 'alice')
  assert.equal(listed.body.items[0].click_count, 1)
})

test('Prisma preserves alias uniqueness and ownership', async () => {
  const duplicate = await request(app).post('/api/v1/links').set('x-user-id', 'bob').send({ destination_url: 'https://other.example', alias: 'prisma' })
  assert.equal(duplicate.status, 400)
  const forbidden = await request(app).delete('/api/v1/links/prisma').set('x-user-id', 'bob')
  assert.equal(forbidden.status, 403)
})

test('HTTP delivery delegates to explicit use cases', async () => {
  const calls = []
  const fake = { createLink: async (value) => { calls.push(['createLink', value]); return { alias: 'fake' } }, listLinks: async () => ({ items: [], total: 0 }), updateLink: async () => ({}), deleteLink: async () => {}, resolveLink: async () => 'https://example.com' }
  const isolated = createApp({ useCases: fake })
  const response = await request(isolated).post('/api/v1/links').send({ destination_url: 'https://example.com' })
  assert.equal(response.status, 201); assert.equal(calls[0][0], 'createLink')
})

test('use cases depend on a validated port, not Prisma', async () => {
  const calls = []
  const memoryPort = requireLinkPort({ create: async (value) => { calls.push(value); return { alias: 'memory' } }, list: async () => ({}), update: async () => ({}), remove: async () => {}, resolve: async () => 'https://example.com' })
  const isolated = createApp({ useCases: createUseCases(memoryPort) })
  const response = await request(isolated).post('/api/v1/links').send({ destination_url: 'https://example.com' })
  assert.equal(response.status, 201); assert.equal(calls.length, 1)
})

