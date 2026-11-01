import assert from 'node:assert/strict'
import test from 'node:test'
import { Link, InvalidLinkError } from '../src/domain/link.js'

test('Link aggregate protects destination protocol and alias invariants', () => {
  assert.throws(() => Link.create({ destination_url: 'file:///tmp/x' }), InvalidLinkError)
  assert.throws(() => Link.create({ destination_url: 'https://example.com', alias: 'x' }), InvalidLinkError)
  assert.deepEqual(Link.create({ destination_url: 'https://example.com' }).toPersistence(), { destination_url: 'https://example.com/' })
})
