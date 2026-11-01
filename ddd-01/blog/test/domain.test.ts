import assert from 'node:assert/strict'
import test from 'node:test'
import { Post } from '../src/domain/post.js'
import { InvalidPublicationStateError, InvalidSlugError } from '../src/domain/errors.js'
import { createTransactionBoundary } from '../src/application/transaction.js'

test('Post aggregate enforces publication invariants', () => {
  assert.throws(() => Post.draft({ slug: 'Bad Slug', title: 'Title', body: 'body' }), InvalidSlugError)
  assert.throws(() => Post.draft({ slug: 'valid', title: 'Title', body: 'body', status: 'scheduled' }), InvalidPublicationStateError)
  const post = Post.draft({ slug: 'valid', title: 'Title', body: 'body' })
  assert.deepEqual(post.toPersistence(), { slug: 'valid', title: 'Title', body: 'body', status: 'draft', publish_at: null })
  const published = Post.draft({ slug: 'published', title: 'Title', body: 'body', status: 'published' })
  assert.equal(published.pullEvents()[0].type, 'PostPublished')
  assert.deepEqual(published.pullEvents(), [])
})

test('domain modules do not depend on infrastructure packages', async () => {
  const source = await import('node:fs/promises')
  for (const file of ['errors.ts', 'slug.ts', 'post.ts']) {
    const contents = await source.readFile(new URL(`../src/domain/${file}`, import.meta.url), 'utf8')
    assert.doesNotMatch(contents, /express|prisma|@prisma|better-sqlite3/)
  }
})

test('application work is expressed through a transaction boundary', async () => {
  let calls = 0
  const boundary = createTransactionBoundary({ $transaction: async (work) => { calls += 1; return work() } })
  assert.equal(await boundary.run(async () => 'committed'), 'committed')
  assert.equal(calls, 1)
})
