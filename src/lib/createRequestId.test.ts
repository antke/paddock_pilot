import { afterEach, expect, it, vi } from 'vitest'
import { createRequestId } from './createRequestId'

afterEach(() => vi.unstubAllGlobals())
it('uses native UUIDs when available', () => {
  vi.stubGlobal('crypto', { randomUUID: () => 'native-request' })
  expect(createRequestId()).toBe('native-request')
})
it('creates independent cryptographic retry keys without the secure-context UUID API', () => {
  const crypto = globalThis.crypto
  vi.stubGlobal('crypto', {
    getRandomValues: crypto.getRandomValues.bind(crypto),
  })
  const first = createRequestId()
  expect(first).toMatch(/^[0-9a-f]{32}$/)
  expect(createRequestId()).not.toBe(first)
})
