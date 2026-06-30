const test = require('node:test')
const assert = require('node:assert/strict')
const { createConnectionCache } = require('../lib/db/connection-cache.js')

test('returns cached offline status before the TTL expires', () => {
  const cache = createConnectionCache(1000)
  cache.markUnavailable(1000)

  const result = cache.read(1500)

  assert.equal(result.fromCache, true)
  assert.equal(result.available, false)
})

test('does not reuse a stale status after the TTL expires', () => {
  const cache = createConnectionCache(1000)
  cache.markUnavailable(1000)

  const result = cache.read(2500)

  assert.equal(result.fromCache, false)
})
