import { describe, expect, it } from 'vitest'
import { showsInEvents } from '../events/eventSchema'
import { currencyForLanguages } from './currency'

describe('currencyForLanguages', () => {
  it('uses the first language that names a known country', () => {
    expect(currencyForLanguages(['pl', 'en-GB'])).toBe('GBP')
    expect(currencyForLanguages(['de-AT'])).toBe('EUR')
    expect(currencyForLanguages(['pl-PL', 'en-US'])).toBe('PLN')
  })

  it('leaves the choice open without a known country', () => {
    expect(currencyForLanguages(['en', 'xx-ZZ', 'not a tag'])).toBeUndefined()
  })
})

describe('showsInEvents', () => {
  it('keeps training logs out of Events unless added there', () => {
    expect(showsInEvents({ type: 'vet' })).toBe(true)
    expect(showsInEvents({ type: 'training' })).toBe(false)
    expect(showsInEvents({ type: 'training', listedInEvents: true })).toBe(true)
  })
})
