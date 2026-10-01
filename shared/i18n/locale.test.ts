import { describe, expect, it } from 'vitest'
import { resolveLocale } from './locale'

describe('language resolution', () => {
  it('prefers a valid saved choice and recognizes regional browser languages', () => {
    expect(resolveLocale('en', ['pl-PL'])).toBe('en')
    expect(resolveLocale(undefined, ['de-DE', 'pl-PL', 'en-US'])).toBe('pl')
    expect(resolveLocale(undefined, ['EN-us', 'pl'])).toBe('en')
  })
  it('falls back for invalid persisted values and unsupported languages', () => {
    expect(resolveLocale('fr', ['pl'])).toBe('pl')
    expect(resolveLocale('constructor', ['de'])).toBe('en')
    expect(resolveLocale(undefined)).toBe('en')
  })
})
