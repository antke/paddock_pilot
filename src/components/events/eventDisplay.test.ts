import { describe, expect, it } from 'vitest'
import { formatEventDateTime, formatRecurrence } from './eventDisplay'

describe('localized event summaries', () => {
  it('formats dates without translating the stored time or changing its timezone', () => {
    expect(formatEventDateTime('2026-09-29', '09:30', undefined, 'pl')).toBe(
      '29 wrz 2026, godz. 09:30',
    )
    expect(formatEventDateTime('2026-09-29', '09:30')).toBe(
      '29 Sept 2026 at 09:30',
    )
  })
  it.each([
    [1, 'Co tydzień'],
    [2, 'Co 2 tygodnie'],
    [5, 'Co 5 tygodni'],
    [12, 'Co 12 tygodni'],
    [22, 'Co 22 tygodnie'],
  ])('uses Polish recurrence grammar for %s weeks', (interval, expected) => {
    expect(
      formatRecurrence(
        { frequency: 'weekly', interval: Number(interval) },
        'pl',
      ),
    ).toBe(expected)
  })
  it('agrees ordinal gender with the weekday and localizes the recurrence end', () => {
    expect(
      formatRecurrence(
        {
          frequency: 'monthly',
          interval: 1,
          monthlyMode: 'weekdayPattern',
          ordinal: 2,
          weekday: 3,
          end: { type: 'after_occurrences', count: 5 },
        },
        'pl',
      ),
    ).toBe('Co miesiąc: druga środa, 5 razy')
    expect(
      formatRecurrence(
        {
          frequency: 'monthly',
          interval: 1,
          monthlyMode: 'weekdayPattern',
          ordinal: 'last',
          weekday: 1,
          end: { type: 'on_date', date: '2026-12-31' },
        },
        'pl',
      ),
    ).toBe('Co miesiąc: ostatni poniedziałek, do 31 gru 2026')
  })
  it('keeps concurrent English and Polish summaries independent', () => {
    const recurrence = { frequency: 'daily' as const, interval: 2 }
    expect(formatRecurrence(recurrence, 'pl')).toBe('Co 2 dni')
    expect(formatRecurrence(recurrence, 'en')).toBe('Every 2 days')
    expect(formatRecurrence(undefined, 'pl')).toBeNull()
  })
})
