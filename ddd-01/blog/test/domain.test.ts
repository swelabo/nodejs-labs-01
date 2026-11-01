import assert from 'node:assert/strict'
import test from 'node:test'
import { Post } from '../src/domain/post.js'
import { InvalidPublicationStateError, InvalidSlugError } from '../src/domain/errors.js'

test('Post aggregate enforces publication invariants', () => {
  assert.throws(() => Post.draft({ slug: 'Bad Slug', title: 'Title', body: 'body' }), InvalidSlugError)
  assert.throws(() => Post.draft({ slug: 'valid', title: 'Title', body: 'body', status: 'scheduled' }), InvalidPublicationStateError)
  const post = Post.draft({ slug: 'valid', title: 'Title', body: 'body' })
  assert.deepEqual(post.toPersistence(), { slug: 'valid', title: 'Title', body: 'body', status: 'draft', publish_at: null })
})

test('domain modules do not depend on infrastructure packages', async () => {
  const source = await import('node:fs/promises')
  for (const file of ['errors.ts', 'slug.ts', 'post.ts']) {
    const contents = await source.readFile(new URL(`../src/domain/${file}`, import.meta.url), 'utf8')
    assert.doesNotMatch(contents, /express|prisma|@prisma|better-sqlite3/)
  }
})
