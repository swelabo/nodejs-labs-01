import assert from 'node:assert/strict'
import test, { after, before } from 'node:test'
import request from 'supertest'
import { createDatabase } from '../src/db.js'
import { createRepository } from '../src/repository.js'
import { createApp } from '../src/app.js'
let database; let app
before(async () => { database = createDatabase(); await database.post.deleteMany(); await database.user.deleteMany(); app = createApp({ repository: createRepository(database), editorIds: new Set(['editor']) }) })
after(async () => database.$disconnect())
test('Prisma preserves role checks, drafts, and publication timing', async () => { assert.equal((await request(app).post('/api/v1/posts').set('x-user-id', 'author').send({ slug: 'no', title: 'No', body: 'x' })).status, 403); const created = await request(app).post('/api/v1/posts').set('x-user-id', 'editor').send({ slug: 'prisma-blog', title: 'Prisma Blog', body: 'body' }); assert.equal(created.status, 201); assert.equal((await request(app).get('/api/v1/posts/prisma-blog')).status, 404); const published = await request(app).patch(`/api/v1/posts/${created.body.data.id}`).set('x-user-id', 'editor').send({ status: 'published' }); assert.equal(published.status, 200); assert.equal((await request(app).get('/api/v1/posts/prisma-blog')).status, 200) })
test('Prisma excludes scheduled posts and rejects duplicate slugs', async () => { const future = new Date(Date.now() + 86400000).toISOString(); assert.equal((await request(app).post('/api/v1/posts').set('x-user-id', 'editor').send({ slug: 'future-prisma', title: 'Future', body: 'body', status: 'scheduled', publish_at: future })).status, 201); assert.equal((await request(app).get('/api/v1/posts/future-prisma')).status, 404); assert.equal((await request(app).post('/api/v1/posts').set('x-user-id', 'editor').send({ slug: 'future-prisma', title: 'Again', body: 'body' })).status, 400) })

