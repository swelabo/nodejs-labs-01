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
beforeEach(() => { database = openDatabase(':memory:'); app = createApp({ repository: createRepository(database), config: { editorUserIds: new Set(['editor']) } }) })
afterEach(() => database.close())

test('requires an editor to create and publish posts', async () => {
  const denied = await request(app).post('/api/v1/posts').set('x-user-id', 'author').send({ slug: 'draft', title: 'Draft', body: 'body' })
  assert.equal(denied.status, 403)
  const created = await request(app).post('/api/v1/posts').set('x-user-id', 'editor').send({ slug: 'hello-node', title: 'Hello Node', body: '<script>text</script>' })
  assert.equal(created.status, 201); assert.equal(created.body.data.status, 'draft')
  assert.equal((await request(app).get('/api/v1/posts/hello-node')).status, 404)
  const published = await request(app).patch(`/api/v1/posts/${created.body.data.id}`).set('x-user-id', 'editor').send({ status: 'published' })
  assert.equal(published.status, 200)
  const publicPost = await request(app).get('/api/v1/posts/hello-node')
  assert.equal(publicPost.status, 200); assert.equal(publicPost.body.data.body, '<script>text</script>')
})

test('does not expose scheduled posts early and rejects duplicate slugs', async () => {
  const future = new Date(Date.now() + 86_400_000).toISOString()
  const scheduled = await request(app).post('/api/v1/posts').set('x-user-id', 'editor').send({ slug: 'later', title: 'Later', body: 'body', status: 'scheduled', publish_at: future })
  assert.equal(scheduled.status, 201); assert.equal((await request(app).get('/api/v1/posts/later')).status, 404)
  const duplicate = await request(app).post('/api/v1/posts').set('x-user-id', 'editor').send({ slug: 'later', title: 'Again', body: 'body' })
  assert.equal(duplicate.status, 400)
})

test('renders escaped public content and documents the contract', async () => {
  const created = await request(app).post('/api/v1/posts').set('x-user-id', 'editor').send({ slug: 'safe', title: 'Safe', body: '<img src=x onerror=alert(1)>', status: 'published' })
  assert.equal(created.status, 201)
  const page = await request(app).get('/posts/safe')
  assert.equal(page.status, 200); assert.match(page.text, /&lt;img src=x onerror=alert\(1\)&gt;/); assert.doesNotMatch(page.text, /<img src=x onerror=/)
  const document = parseYaml(fs.readFileSync(new URL('../openapi.yaml', import.meta.url), 'utf8'))
  assert.ok(document.paths['/api/v1/posts']); assert.ok(document.paths['/api/v1/posts/{slug}']); assert.ok(document.paths['/feed.xml'])
})

test('submits a one-time comment challenge and moderates the result', async () => {
  const post = await request(app).post('/api/v1/posts').set('x-user-id', 'editor').send({ slug: 'commented', title: 'Commented', body: 'body', status: 'published' })
  const challenge = await request(app).get('/api/v1/posts/commented/comments/challenge')
  assert.equal(challenge.status, 200)
  const answer = challenge.body.data.prompt.match(/What is (\d+) \+ (\d+)\?/)?.slice(1).map(Number).reduce((a, b) => a + b)
  const submitted = await request(app).post('/api/v1/posts/commented/comments').send({ author_name: 'Reader', body: 'Good post', challenge_id: challenge.body.data.id, challenge_answer: String(answer) })
  assert.equal(submitted.status, 201)
  const replay = await request(app).post('/api/v1/posts/commented/comments').send({ author_name: 'Reader', body: 'Replay', challenge_id: challenge.body.data.id, challenge_answer: String(answer) })
  assert.equal(replay.status, 400)
  const pending = await request(app).get('/api/v1/comments/pending').set('x-user-id', 'editor')
  assert.equal(pending.body.data.length, 1)
  const moderated = await request(app).patch(`/api/v1/comments/${submitted.body.data.id}`).set('x-user-id', 'editor').send({ status: 'approved' })
  assert.equal(moderated.status, 200)
  const visible = await request(app).get('/api/v1/posts/commented')
  assert.equal(visible.body.data.comments[0].body, 'Good post')
})

test('rejects category hierarchy cycles and emits feed and sitemap', async () => {
  const root = await request(app).post('/api/v1/categories').set('x-user-id', 'editor').send({ slug: 'root', name: 'Root' })
  const child = await request(app).post('/api/v1/categories').set('x-user-id', 'editor').send({ slug: 'child', name: 'Child', parent_id: root.body.data.id })
  assert.equal(child.status, 201)
  database.prepare('UPDATE categories SET parent_id = ? WHERE id = ?').run(root.body.data.id, root.body.data.id)
  const cycle = await request(app).post('/api/v1/categories').set('x-user-id', 'editor').send({ slug: 'cycle', name: 'Cycle', parent_id: root.body.data.id })
  assert.equal(cycle.status, 400)
  await request(app).post('/api/v1/posts').set('x-user-id', 'editor').send({ slug: 'feed-post', title: 'Feed', body: 'body', status: 'published' })
  assert.match((await request(app).get('/feed.xml')).text, /Feed/)
  assert.match((await request(app).get('/sitemap.xml')).text, /feed-post/)
})

