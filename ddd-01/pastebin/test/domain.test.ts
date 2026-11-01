import assert from 'node:assert/strict'
import test from 'node:test'
import { Snippet, InvalidSnippetError } from '../src/domain/snippet.js'

test('Snippet aggregate protects content and visibility invariants', () => {
  assert.throws(() => Snippet.create({ content: '', visibility: 'public' }), InvalidSnippetError)
  assert.throws(() => Snippet.create({ content: 'text', visibility: 'secret' }), InvalidSnippetError)
  assert.deepEqual(Snippet.create({ content: 'text' }).toPersistence(), { content: 'text', visibility: 'public' })
})
