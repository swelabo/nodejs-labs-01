import assert from 'node:assert/strict'
import test, { afterEach, beforeEach } from 'node:test'
import Database from 'better-sqlite3'
import request from 'supertest'
import { parse as parseYaml } from 'yaml'
import fs from 'node:fs'

import { createApp } from '../src/app.js'
import { createRepository, MAX_PAGE_SIZE } from '../src/repository.js'
import { openDatabase } from '../src/db/database.js'

let database
let app

beforeEach(() => {
  database = openDatabase(':memory:')
  app = createApp({
    repository: createRepository(database),
    config: { allowAnonymousCreation: false, developmentUserId: 'dev-user' },
  })
})

afterEach(() => database.close())

test('creates a link and redirects to its validated destination', async () => {
  const create = await request(app)
    .post('/api/v1/links')
    .set('x-user-id', 'alice')
    .send({ destination_url: 'https://example.com/docs', alias: 'docs' })

  assert.equal(create.status, 201)
  assert.equal(create.body.data.alias, 'docs')

  const redirect = await request(app).get('/docs').set('referer', 'https://reader.example/path')
  assert.equal(redirect.status, 302)
  assert.equal(redirect.headers.location, 'https://example.com/docs')

  const stored = database.prepare('SELECT referrer_host FROM clicks WHERE alias = ?').get('docs')
  assert.equal(stored.referrer_host, 'reader.example')
})

test('does not treat an anonymous request as the development user', async () => {
  const response = await request(app).post('/api/v1/links').send({ destination_url: 'https://example.com' })
  assert.equal(response.status, 401)
})

test('supports password accounts, sessions, and CSRF-protected management', async () => {
  const registration = await request(app).post('/api/v1/auth/register').send({ id: 'alice', password: 'correct horse battery staple' })
  assert.equal(registration.status, 201)
  const cookies = registration.headers['set-cookie']
  const csrf = cookies.find((value) => value.startsWith('shortener_csrf=')).split(';')[0].split('=')[1]
  const agent = request.agent(app); agent.jar.setCookie(cookies[0]); agent.jar.setCookie(cookies[1])
  assert.equal((await agent.post('/api/v1/links').send({ destination_url: 'https://blocked.example', alias: 'blocked' })).status, 403)
  const created = await agent.post('/api/v1/links').set('x-csrf-token', csrf).send({ destination_url: 'https://owned.example', alias: 'owned' })
  assert.equal(created.status, 201); assert.equal(created.body.data.owner_id, 'alice')
})

test('returns owned analytics and a PNG QR code', async () => {
  await request(app).post('/api/v1/links').set('x-user-id', 'alice').send({ destination_url: 'https://example.com', alias: 'stats' })
  await request(app).get('/stats').set('referer', 'https://reader.example')
  const analytics = await request(app).get('/api/v1/links/stats/analytics').set('x-user-id', 'alice')
  assert.equal(analytics.status, 200)
  assert.equal(analytics.body.data.total_clicks, 1)
  assert.equal(analytics.body.data.referrers[0].referrer_host, 'reader.example')

  const qr = await request(app).get('/api/v1/links/stats/qr').set('x-user-id', 'alice')
  assert.equal(qr.status, 200)
  assert.equal(qr.headers['content-type'], 'image/png')
})

test('applies a bounded creation rate limit', async () => {
  const limitedApp = createApp({
    repository: createRepository(database),
    config: { allowAnonymousCreation: false, developmentUserId: 'dev-user', rateLimitPerMinute: 1 },
  })
  const first = await request(limitedApp).post('/api/v1/links').set('x-user-id', 'alice').send({ destination_url: 'https://one.example', alias: 'one' })
  const second = await request(limitedApp).post('/api/v1/links').set('x-user-id', 'alice').send({ destination_url: 'https://two.example', alias: 'two' })
  assert.equal(first.status, 201)
  assert.equal(second.status, 429)
  assert.ok(second.headers['retry-after'])
})

test('renders the browser dashboard and creates links from a form', async () => {
  const page = await request(app).get('/').set('x-user-id', 'alice')
  assert.equal(page.status, 200)
  assert.match(page.text, /Create a link/)
  assert.match(page.text, /hx-post="\/links"/)

  const created = await request(app)
    .post('/links')
    .set('x-user-id', 'alice')
    .type('form')
    .send({ destination_url: 'https://example.com/form', alias: 'form' })
  assert.equal(created.status, 303)
  assert.equal(created.headers.location, '/')
})

test('rejects unsafe destinations and duplicate aliases', async () => {
  const unsafe = await request(app)
    .post('/api/v1/links')
    .set('x-user-id', 'alice')
    .send({ destination_url: 'javascript:alert(1)', alias: 'bad' })
  assert.equal(unsafe.status, 400)

  await request(app).post('/api/v1/links').set('x-user-id', 'alice').send({ destination_url: 'https://a.example', alias: 'same' })
  const duplicate = await request(app).post('/api/v1/links').set('x-user-id', 'alice').send({ destination_url: 'https://b.example', alias: 'same' })
  assert.equal(duplicate.status, 400)
  assert.equal(duplicate.body.errors.alias, 'must be unique')
})

test('allows only one concurrent owner of a custom alias', async () => {
  const responses = await Promise.all([
    request(app).post('/api/v1/links').set('x-user-id', 'race').send({ destination_url: 'https://one.example', alias: 'race-alias' }),
    request(app).post('/api/v1/links').set('x-user-id', 'race').send({ destination_url: 'https://two.example', alias: 'race-alias' }),
  ])
  assert.deepEqual(responses.map((response) => response.status).sort(), [201, 400])
})

test('does not redirect an expired link', async () => {
  await request(app).post('/api/v1/links').set('x-user-id', 'alice').send({
    destination_url: 'https://expired.example',
    alias: 'expired',
    expires_at: new Date(Date.now() + 60_000).toISOString(),
  })
  database.prepare('UPDATE links SET expires_at = ? WHERE alias = ?').run(new Date(Date.now() - 60_000).toISOString(), 'expired')
  const response = await request(app).get('/expired')
  assert.equal(response.status, 404)
})

test('enforces ownership for updates and deletes', async () => {
  await request(app).post('/api/v1/links').set('x-user-id', 'alice').send({ destination_url: 'https://a.example', alias: 'owned' })
  const forbidden = await request(app).patch('/api/v1/links/owned').set('x-user-id', 'bob').send({ active: false })
  assert.equal(forbidden.status, 403)

  const updated = await request(app).patch('/api/v1/links/owned').set('x-user-id', 'alice').send({ active: false })
  assert.equal(updated.status, 200)
  const unavailable = await request(app).get('/owned')
  assert.equal(unavailable.status, 404)

  const deleted = await request(app).delete('/api/v1/links/owned').set('x-user-id', 'alice')
  assert.equal(deleted.status, 204)
})

test('does not expose private links in another owner list', async () => {
  await request(app).post('/api/v1/links').set('x-user-id', 'alice').send({ destination_url: 'https://a.example', alias: 'alice-link' })
  const bobList = await request(app).get('/api/v1/links').set('x-user-id', 'bob')
  assert.equal(bobList.status, 200)
  assert.equal(bobList.body.total, 0)
})

test('bounds list page size', () => {
  const isolatedDatabase = new Database(':memory:')
  isolatedDatabase.exec(`CREATE TABLE links (alias TEXT PRIMARY KEY, destination_url TEXT NOT NULL, owner_id TEXT, active INTEGER NOT NULL, expires_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL); CREATE TABLE clicks (id INTEGER PRIMARY KEY, alias TEXT NOT NULL, occurred_at TEXT NOT NULL, referrer_host TEXT);`)
  const repository = createRepository(isolatedDatabase)
  const result = repository.list({ ownerId: null, page: 1, pageSize: 1000 })
  assert.equal(result.page_size, MAX_PAGE_SIZE)
  isolatedDatabase.close()
})

test('OpenAPI documents the implemented essential paths', () => {
  const document = parseYaml(fs.readFileSync(new URL('../openapi.yaml', import.meta.url), 'utf8'))
  assert.equal(document.openapi, '3.1.0')
  for (const pathName of ['/api/v1/links', '/api/v1/links/{alias}', '/{alias}']) {
    assert.ok(document.paths[pathName], `missing ${pathName}`)
  }
  assert.ok(document.paths['/{alias}'].get.responses['302'])
})

