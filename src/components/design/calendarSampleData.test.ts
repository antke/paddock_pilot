import { describe, expect, it } from 'vitest'
import {
  getCalendarMonthOccurrences,
  groupCalendarOccurrencesByDate,
  getMonthDays,
  getMonthLeadingDayCount,
} from '#/components/stables/stableDashboardDates'
import {
  createCalendarSampleEvents,
  getCalendarSampleMonth,
} from './calendarSampleData'

const month = new Date(2026, 8, 1)
const days = (events: ReturnType<typeof createCalendarSampleEvents>) =>
  groupCalendarOccurrencesByDate(
    getCalendarMonthOccurrences(events, month),
    month,
  )

describe('isolated calendar fixtures', () => {
  it('creates six then two then zero primary-day records without altering secondary or recurring identities', () => {
    const full = createCalendarSampleEvents(month, 'dense')
    const two = createCalendarSampleEvents(month, 'dense', 2)
    const none = createCalendarSampleEvents(month, 'dense', 0)
    expect(days(full).get('2026-09-18')).toHaveLength(6)
    expect(days(two).get('2026-09-18')).toHaveLength(2)
    expect(days(none).has('2026-09-18')).toBe(false)
    for (const events of [full, two, none]) {
      expect(days(events).get('2026-09-21')).toHaveLength(3)
      expect(
        events.find((event) => event._id === 'sample-calendar-weekly')
          ?.recurrence,
      ).toBeTruthy()
    }
    expect(
      days(full)
        .get('2026-09-18')
        ?.some((entry) => entry.position === 'middle'),
    ).toBe(true)
    expect(new Set(full.map((event) => event._id)).size).toBe(full.length)
  })
  it('does not inherit recurrence or ranges into one-off records and preserves original recurring destinations', () => {
    const events = createCalendarSampleEvents(month, 'sparse')
    const singles = events.filter((event) => event._id.includes('sparse'))
    expect(
      singles.every(
        (event) =>
          event.recurrence === undefined && event.endDate === undefined,
      ),
    ).toBe(true)
    expect(singles.map((event) => event.status)).toEqual([
      'planned',
      'completed',
      'cancelled',
    ])
    const weekly = getCalendarMonthOccurrences(events, month).filter(
      (event) => event.event._id === 'sample-calendar-weekly',
    )
    expect(weekly.map((event) => event.startDate)).toEqual([
      '2026-09-01',
      '2026-09-08',
    ])
    expect(new Set(weekly.map((event) => event.occurrenceKey)).size).toBe(2)
    expect(
      days(events)
        .get('2026-09-01')
        ?.some((entry) => entry.position === 'middle'),
    ).toBe(true)
    expect(createCalendarSampleEvents(month, 'empty')).toEqual([])
  })
  it('uses local calendar months with explicit leap, week-start and year-boundary scenarios', () => {
    expect(getCalendarSampleMonth('current', new Date(2030, 5, 25))).toEqual(
      new Date(2030, 5, 1),
    )
    expect(getMonthDays(getCalendarSampleMonth('leap'))).toHaveLength(29)
    expect(getMonthLeadingDayCount(getCalendarSampleMonth('sunday'))).toBe(6)
    expect(getMonthLeadingDayCount(getCalendarSampleMonth('monday'))).toBe(0)
    expect(getCalendarSampleMonth('december')).toEqual(new Date(2026, 11, 1))
    expect(getCalendarSampleMonth('january')).toEqual(new Date(2027, 0, 1))
    const january = createCalendarSampleEvents(
      getCalendarSampleMonth('january'),
      'sparse',
    )
    expect(
      january.find((event) => event._id === 'sample-calendar-spanning'),
    ).toMatchObject({ date: '2026-12-31', endDate: '2027-01-02' })
  })
})
