import { describe, expect, it } from 'vitest'
import {
  addDaysToDateKey,
  resolveTodayDateKey,
  timestampToDateKey,
} from './dateKeys'

describe('local date keys', () => {
  it('uses the date key supplied by the client', () => {
    expect(resolveTodayDateKey('2026-07-30')).toBe('2026-07-30')
  })

  it('adds calendar days without local timezone drift', () => {
    expect(addDaysToDateKey('2026-03-28', 2)).toBe('2026-03-30')
  })

  it('maps a timestamp into the user local calendar day', () => {
    const timestamp = Date.parse('2026-07-29T22:30:00.000Z')

    expect(timestampToDateKey(timestamp, -120)).toBe('2026-07-30')
    expect(timestampToDateKey(timestamp, 240)).toBe('2026-07-29')
  })
})
