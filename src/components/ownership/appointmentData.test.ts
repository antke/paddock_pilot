import { describe, expect, it } from 'vitest'
import type { Doc, Id } from 'convex/_generated/dataModel'
import {
  getUpcomingAppointmentOccurrences,
  parseAppointmentSearch,
} from './appointmentData'

const today = '2026-10-07'
function event(overrides: Partial<Doc<'events'>> = {}): Doc<'events'> {
  return {
    _id: 'visit' as Id<'events'>,
    _creationTime: 1,
    createdBy: 'owner' as Id<'users'>,
    horseIds: [],
    title: 'Vet visit',
    type: 'vet',
    date: today,
    time: '09:00',
    ...overrides,
  }
}

describe('personal upcoming appointments', () => {
  it('includes upcoming repeats when the series began in the past', () => {
    const series = event({
      date: '2026-09-30',
      recurrence: { frequency: 'weekly', interval: 1, daysOfWeek: [3] },
    })
    const rows = getUpcomingAppointmentOccurrences([series], today)
    expect(rows[0].startDate).toBe(today)
    expect(rows[1].startDate).toBe('2026-10-14')
    expect(rows).toHaveLength(12)
    expect(series.date).toBe('2026-09-30')
  })

  it('includes a multi-day visit already in progress but excludes finished visits', () => {
    const rows = getUpcomingAppointmentOccurrences(
      [
        event({
          _id: 'ongoing' as Id<'events'>,
          date: '2026-10-05',
          endDate: today,
        }),
        event({
          _id: 'finished' as Id<'events'>,
          date: '2026-10-05',
          endDate: '2026-10-06',
        }),
      ],
      today,
    )
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      eventId: 'ongoing',
      startDate: '2026-10-05',
      endDate: today,
      startsBeforeWindow: true,
    })
  })

  it('honors recurrence end conditions and the 90-day window', () => {
    const rows = getUpcomingAppointmentOccurrences(
      [
        event({
          _id: 'ended' as Id<'events'>,
          date: '2026-10-01',
          recurrence: {
            frequency: 'daily',
            interval: 1,
            end: { type: 'after_occurrences', count: 3 },
          },
        }),
        event({ _id: 'last-day' as Id<'events'>, date: '2027-01-04' }),
        event({ _id: 'beyond' as Id<'events'>, date: '2027-01-05' }),
      ],
      today,
    )
    expect(rows.map((row) => row.eventId)).toEqual(['last-day'])
  })

  it('sorts the next 12 without modifying the complete appointment collection', () => {
    const events = Array.from({ length: 15 }, (_, index) =>
      event({
        _id: `visit-${index}` as Id<'events'>,
        title: `Visit ${index}`,
        date: `2026-10-${String(7 + index).padStart(2, '0')}`,
      }),
    ).reverse()
    const rows = getUpcomingAppointmentOccurrences(events, today)
    expect(rows).toHaveLength(12)
    expect(rows[0].eventId).toBe('visit-0')
    expect(rows[11].eventId).toBe('visit-11')
    expect(events).toHaveLength(15)
    expect(events[0]._id).toBe('visit-14')
  })

  it('keeps completed and cancelled visits out of the upcoming preview', () => {
    expect(
      getUpcomingAppointmentOccurrences(
        [event({ status: 'completed' }), event({ status: 'cancelled' })],
        today,
      ),
    ).toEqual([])
  })

  it('uses separate keys for a current schedule and a frozen horse participation', () => {
    const shared = event()
    const snapshot = { ...shared, contextParticipationId: 'past-participation' }
    const rows = getUpcomingAppointmentOccurrences([shared, snapshot], today)
    expect(new Set(rows.map((row) => row.occurrenceKey)).size).toBe(2)
  })
})

it('keeps explicit calendar and list links bookmarkable and defaults unsupported views', () => {
  expect(parseAppointmentSearch({ view: 'calendar' })).toEqual({
    view: 'calendar',
  })
  expect(parseAppointmentSearch({ view: 'list' })).toEqual({ view: 'list' })
  expect(parseAppointmentSearch({ view: 'unknown' })).toEqual({})
})
