import assert from 'node:assert/strict'
import test, { after, before } from 'node:test'
import request from 'supertest'
import { createDatabase } from '../src/db.js'
import { createRepository } from '../src/repository.js'
import { createApp } from '../src/app.js'
import { createUseCases } from '../src/usecases.js'
let database; let app
before(async () => { database = createDatabase(); await database.page.deleteMany(); await database.post.deleteMany(); await database.user.deleteMany(); const repository = createRepository(database); app = createApp({ repository, useCases: createUseCases(repository), editorIds: new Set(['editor']) }) })
after(async () => database.$disconnect())
test('Prisma preserves role checks, drafts, and publication timing', async () => { assert.equal((await request(app).post('/api/v1/posts').set('x-user-id', 'author').send({ slug: 'no', title: 'No', body: 'x' })).status, 403); const created = await request(app).post('/api/v1/posts').set('x-user-id', 'editor').send({ slug: 'prisma-blog', title: 'Prisma Blog', body: 'body' }); assert.equal(created.status, 201); assert.equal((await request(app).get('/api/v1/posts/prisma-blog')).status, 404); const published = await request(app).patch(`/api/v1/posts/${created.body.data.id}`).set('x-user-id', 'editor').send({ status: 'published' }); assert.equal(published.status, 200); assert.equal((await request(app).get('/api/v1/posts/prisma-blog')).status, 200) })
test('Prisma excludes scheduled posts and rejects duplicate slugs', async () => { const future = new Date(Date.now() + 86400000).toISOString(); assert.equal((await request(app).post('/api/v1/posts').set('x-user-id', 'editor').send({ slug: 'future-prisma', title: 'Future', body: 'body', status: 'scheduled', publish_at: future })).status, 201); assert.equal((await request(app).get('/api/v1/posts/future-prisma')).status, 404); assert.equal((await request(app).post('/api/v1/posts').set('x-user-id', 'editor').send({ slug: 'future-prisma', title: 'Again', body: 'body' })).status, 400) })
test('use-case delivery reads a published page through the repository boundary', async () => { await database.page.create({ data: { slug: 'about-usecases', title: 'About', body: 'body', authorId: 'editor', status: 'published' } }); const response = await request(app).get('/api/v1/pages/about-usecases'); assert.equal(response.status, 200); assert.equal(response.body.data.slug, 'about-usecases') })

test('HTTP delivery delegates post creation', async () => { const fake = { listPosts: async () => ({}), createPost: async () => ({ slug: 'fake' }), readPost: async () => ({}), updatePost: async () => ({}) }; const isolated = createApp({ useCases: fake, editorIds: new Set(['editor']) }); const response = await request(isolated).post('/api/v1/posts').set('x-user-id', 'editor').send({}); assert.equal(response.status, 201) })

