import { describe, expect, it } from 'vitest'
import type { Id } from 'convex/_generated/dataModel'
import type { TimelineEntry } from './HorseTimelinePage'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import {
  createHorseHistorySummary,
  createHorseHistoryTimeline,
} from '#/components/page-lab/prototypes/horseHistoryFixtures'
import {
  getTimelineEntryDate,
  timelineEntryOccursOn,
} from './horseTimelineCalendarData'

const entries: Array<TimelineEntry> = createHorseHistoryTimeline(
  createHorseHistorySummary(createDashboardLabFixtureData(), 'standard'),
  'standard',
).entries

describe('timeline calendar dates', () => {
  it('uses the recorded calendar date for events and medication, even when server timestamps differ', () => {
    const event = entries.find(
      (entry): entry is Extract<TimelineEntry, { id: Id<'events'> }> =>
        entry.kind === 'event' && !('trainingRecord' in entry),
    )!
    const medication = entries.find(
      (entry): entry is Extract<TimelineEntry, { kind: 'medicationRecord' }> =>
        entry.kind === 'medicationRecord',
    )!
    expect(
      getTimelineEntryDate({ ...event, date: '2026-10-04', occurredAt: 0 }),
    ).toBe('2026-10-04')
    expect(
      getTimelineEntryDate({
        ...medication,
        startDate: '2026-10-04',
        occurredAt: 0,
      }),
    ).toBe('2026-10-04')
  })

  it('includes every day of an event crossing the month boundary, without repeating point-in-time care records', () => {
    const event = {
      ...entries.find(
        (entry): entry is Extract<TimelineEntry, { id: Id<'events'> }> =>
          entry.kind === 'event' && !('trainingRecord' in entry),
      )!,
      date: '2026-09-30',
      endDate: '2026-10-02',
    }
    expect(timelineEntryOccursOn(event, '2026-09-29')).toBe(false)
    expect(timelineEntryOccursOn(event, '2026-09-30')).toBe(true)
    expect(timelineEntryOccursOn(event, '2026-10-01')).toBe(true)
    expect(timelineEntryOccursOn(event, '2026-10-02')).toBe(true)
    expect(timelineEntryOccursOn(event, '2026-10-03')).toBe(false)
    const weight = {
      ...entries.find(
        (entry): entry is Extract<TimelineEntry, { kind: 'weightRecord' }> =>
          entry.kind === 'weightRecord',
      )!,
      occurredAt: new Date(2026, 9, 4, 23, 30).getTime(),
    }
    expect(getTimelineEntryDate(weight)).toBe('2026-10-04')
    expect(timelineEntryOccursOn(weight, '2026-10-05')).toBe(false)
  })
})
