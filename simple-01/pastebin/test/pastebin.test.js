import assert from 'node:assert/strict'
import test, { afterEach, beforeEach } from 'node:test'
import fs from 'node:fs'
import { parse as parseYaml } from 'yaml'
import request from 'supertest'
import { createApp } from '../src/app.js'
import { createRepository } from '../src/repository.js'
import { openDatabase } from '../src/db/database.js'

let database
let app
beforeEach(() => { database = openDatabase(':memory:'); app = createApp({ repository: createRepository(database), config: { allowAnonymousSubmissions: true } }) })
afterEach(() => database.close())

test('creates, reads, and returns raw text without HTML interpretation', async () => {
  const created = await request(app).post('/api/v1/snippets').set('x-user-id', 'alice').send({ content: '<script>alert(1)</script>', visibility: 'public', tags: ['js'] })
  assert.equal(created.status, 201)
  const id = created.body.data.id
  const read = await request(app).get(`/api/v1/snippets/${id}`)
  assert.equal(read.status, 200); assert.equal(read.body.data.content, '<script>alert(1)</script>')
  const raw = await request(app).get(`/api/v1/snippets/${id}/raw`)
  assert.equal(raw.status, 200); assert.match(raw.headers['content-type'], /^text\/plain/)
})

test('supports password accounts, sessions, and CSRF-protected mutations', async () => {
  const registration = await request(app).post('/api/v1/auth/register').send({ id: 'alice', password: 'correct horse battery staple' })
  assert.equal(registration.status, 201)
  const csrf = registration.headers['set-cookie'].find((value) => value.startsWith('pastebin_csrf=')).split(';')[0].split('=')[1]
  const agent = request.agent(app)
  agent.jar.setCookie(registration.headers['set-cookie'][0])
  agent.jar.setCookie(registration.headers['set-cookie'][1])
  assert.equal((await agent.post('/api/v1/snippets').send({ content: 'blocked' })).status, 403)
  const created = await agent.post('/api/v1/snippets').set('x-csrf-token', csrf).send({ content: 'owned' })
  assert.equal(created.status, 201); assert.equal(created.body.data.owner_id, 'alice')
  assert.equal((await agent.get('/api/v1/admin/snippets')).status, 200)
})

test('renders escaped browser output and accepts a form submission', async () => {
  const page = await request(app).get('/')
  assert.equal(page.status, 200)
  assert.match(page.text, /Create snippet/)
  const created = await request(app).post('/snippets').type('form').send({ content: '<img src=x onerror=alert(1)>', language: 'html', visibility: 'public' })
  assert.equal(created.status, 303)
  const detail = await request(app).get(created.headers.location)
  assert.equal(detail.status, 200)
  assert.match(detail.text, /&lt;img src=x onerror=alert\(1\)&gt;/)
  assert.doesNotMatch(detail.text, /<img src=x onerror=/)
})

test('highlights selected languages only after escaping source text', async () => {
  const created = await request(app).post('/api/v1/snippets').send({ content: 'const answer = "<script>"', language: 'javascript' })
  const detail = await request(app).get(`/snippets/${created.body.data.id}`)
  assert.match(detail.text, /token-keyword/)
  assert.match(detail.text, /&lt;script&gt;/)
  assert.doesNotMatch(detail.text, /<script>/)
})

test('distinguishes public, unlisted, and private visibility', async () => {
  const unlisted = await request(app).post('/api/v1/snippets').set('x-user-id', 'alice').send({ content: 'unlisted', visibility: 'unlisted' })
  const privateSnippet = await request(app).post('/api/v1/snippets').set('x-user-id', 'alice').send({ content: 'private', visibility: 'private' })
  assert.equal((await request(app).get(`/api/v1/snippets/${unlisted.body.data.id}`)).status, 200)
  assert.equal((await request(app).get(`/api/v1/snippets/${privateSnippet.body.data.id}`).set('x-user-id', 'bob')).status, 404)
  assert.equal((await request(app).get(`/api/v1/snippets/${privateSnippet.body.data.id}`).set('x-user-id', 'alice')).status, 200)
  assert.equal((await request(app).get('/api/v1/snippets')).body.total, 0)
})

test('enforces ownership and validates tags', async () => {
  const created = await request(app).post('/api/v1/snippets').set('x-user-id', 'alice').send({ content: 'owned', visibility: 'private' })
  const forbidden = await request(app).patch(`/api/v1/snippets/${created.body.data.id}`).set('x-user-id', 'bob').send({ content: 'changed' })
  assert.equal(forbidden.status, 403)
  const invalid = await request(app).post('/api/v1/snippets').send({ content: 'x', tags: ['not valid'] })
  assert.equal(invalid.status, 400)
})

test('searches public snippets and documents essential paths', async () => {
  await request(app).post('/api/v1/snippets').send({ content: 'node database', language: 'javascript', tags: ['node'] })
  const found = await request(app).get('/api/v1/snippets?q=database&tag=node')
  assert.equal(found.status, 200); assert.equal(found.body.total, 1)
  const document = parseYaml(fs.readFileSync(new URL('../openapi.yaml', import.meta.url), 'utf8'))
  assert.ok(document.paths['/api/v1/snippets']); assert.ok(document.paths['/api/v1/snippets/{id}/raw'])
})

test('keeps search parameterized and rejects oversized payloads', async () => {
  const injection = await request(app).get('/api/v1/snippets').query({ q: "' OR 1=1 --" })
  assert.equal(injection.status, 200)
  assert.equal(injection.body.total, 0)
  const oversized = await request(app).post('/api/v1/snippets').send({ content: 'x'.repeat(200_000) })
  assert.equal(oversized.status, 413)
})

