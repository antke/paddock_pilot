import { describe, expect, it } from 'vitest'
import type { Id } from 'convex/_generated/dataModel'

import {
  getCalendarMonthOccurrences,
  getMonthLeadingDayCount,
  groupCalendarOccurrencesByDate,
  weekdayLabels,
} from './stableDashboardDates'
import type { StableDashboardEvent } from './stableDashboardDates'

const august2026 = new Date(2026, 7, 1)

describe('calendar month projection', () => {
  it('uses the en-GB Monday-first week order', () => {
    expect(weekdayLabels).toEqual([
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
      'Sun',
    ])
    expect(getMonthLeadingDayCount(new Date(2026, 7, 3))).toBe(5)
  })

  it('sorts several same-day events chronologically', () => {
    const events = [
      createEvent('late', '2026-08-12', '17:30'),
      createEvent('early', '2026-08-12', '07:15'),
      createEvent('middle', '2026-08-12', '12:00'),
    ]

    const occurrences = getCalendarMonthOccurrences(events, august2026)
    const byDate = groupCalendarOccurrencesByDate(occurrences, august2026)

    expect(
      byDate.get('2026-08-12')?.map(({ occurrence }) => occurrence.event._id),
    ).toEqual(['early', 'middle', 'late'])
  })

  it('keeps a cross-month event visible on every day it occupies', () => {
    const event = createEvent('clinic', '2026-07-31', '09:00', {
      endDate: '2026-08-02',
    })

    const occurrences = getCalendarMonthOccurrences([event], august2026)
    const byDate = groupCalendarOccurrencesByDate(occurrences, august2026)

    expect([...byDate.keys()]).toEqual(['2026-08-01', '2026-08-02'])
    expect(byDate.get('2026-08-01')?.[0].position).toBe('middle')
    expect(byDate.get('2026-08-02')?.[0].position).toBe('end')
  })

  it('materializes recurring occurrences inside the visible month', () => {
    const event = createEvent('weekly', '2026-08-03', '08:00', {
      recurrence: {
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: [1],
        end: { type: 'after_occurrences', count: 4 },
      },
    })

    const occurrences = getCalendarMonthOccurrences([event], august2026)

    expect(occurrences.map(({ startDate }) => startDate)).toEqual([
      '2026-08-03',
      '2026-08-10',
      '2026-08-17',
      '2026-08-24',
    ])
  })

  it('returns an empty projection for an empty month', () => {
    expect(getCalendarMonthOccurrences([], august2026)).toEqual([])
    expect(groupCalendarOccurrencesByDate([], august2026).size).toBe(0)
  })
})

function createEvent(
  id: string,
  date: string,
  time: string,
  overrides: Partial<StableDashboardEvent> = {},
): StableDashboardEvent {
  return {
    _id: id as Id<'events'>,
    _creationTime: 0,
    stableId: 'stable' as Id<'stables'>,
    createdBy: 'user' as Id<'users'>,
    horseIds: [],
    date,
    time,
    type: 'other',
    title: id,
    ...overrides,
  }
}
