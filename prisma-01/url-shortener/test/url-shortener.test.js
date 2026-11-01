import assert from 'node:assert/strict'
import test, { after, before } from 'node:test'
import request from 'supertest'
import { createDatabase } from '../src/db.js'
import { createRepository } from '../src/repository.js'
import { createApp } from '../src/app.js'

let database
let app
before(async () => { database = createDatabase('file:./data/url-shortener.db'); await database.$executeRawUnsafe('DELETE FROM Click'); await database.$executeRawUnsafe('DELETE FROM Link'); app = createApp({ repository: createRepository(database) }) })
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

