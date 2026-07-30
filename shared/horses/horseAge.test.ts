import { describe, expect, it } from 'vitest'

import { calculateHorseAge, getTodayDateKey } from './horseAge'

describe('calculateHorseAge', () => {
  const asOf = new Date(2026, 6, 23)

  it('calculates age after the birthday has passed', () => {
    expect(calculateHorseAge('2017-04-12', asOf)).toBe(9)
  })

  it('subtracts a year when the birthday is still upcoming', () => {
    expect(calculateHorseAge('2017-09-03', asOf)).toBe(8)
  })

  it('returns zero for a foal born today', () => {
    expect(calculateHorseAge('2026-07-23', asOf)).toBe(0)
  })

  it('returns undefined for impossible dates', () => {
    expect(calculateHorseAge('2026-02-31', asOf)).toBeUndefined()
  })
})

describe('getTodayDateKey', () => {
  it('formats a local calendar date for a date input', () => {
    expect(getTodayDateKey(new Date(2026, 6, 3))).toBe('2026-07-03')
  })
})
