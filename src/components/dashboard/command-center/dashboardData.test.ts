import { describe, expect, it } from 'vitest'

import { createDashboardCommandData } from './dashboardData'
import type {
  DashboardCommandEvent,
  DashboardCommandOverview,
  DashboardCommandStable,
} from './dashboardTypes'

const stable = {
  _id: 'stable-primary',
  name: 'Cedar Ridge Barn',
} as unknown as DashboardCommandStable

const overview = {
  summary: {
    overdueReminderCount: 0,
    highSeverityIssueCount: 0,
  },
  upcomingEvents: [],
  dueReminders: [],
  attentionHorses: [],
} as unknown as DashboardCommandOverview

function createEvent({
  id,
  stableId = stable._id,
  date,
  time,
}: {
  id: string
  stableId?: DashboardCommandStable['_id']
  date: string
  time: string
}) {
  return {
    _id: id,
    stableId,
    date,
    time,
    title: id,
    type: 'other',
  } as unknown as DashboardCommandEvent
}

describe('createDashboardCommandData', () => {
  const build = (events: Array<DashboardCommandEvent>) =>
    createDashboardCommandData({
      stable,
      stables: [stable],
      events,
      horses: [],
      overview,
      todayKey: '2040-02-28',
    })

  it('includes recurring and continuing occurrences with their original identities and truthful statuses', () => {
    const events: Array<DashboardCommandEvent> = [
      {
        ...createEvent({ id: 'recurring', date: '2040-02-26', time: '10:00' }),
        recurrence: {
          frequency: 'daily',
          interval: 1,
          end: { type: 'after_occurrences', count: 4 },
        },
      },
      {
        ...createEvent({ id: 'continuing', date: '2040-02-27', time: '11:00' }),
        endDate: '2040-03-01',
        status: 'completed',
      },
      {
        ...createEvent({ id: 'cancelled', date: '2040-02-29', time: '12:00' }),
        status: 'cancelled',
      },
      {
        ...createEvent({
          id: 'finished-series',
          date: '2040-02-26',
          time: '13:00',
        }),
        recurrence: {
          frequency: 'daily',
          interval: 1,
          end: { type: 'on_date', date: '2040-02-27' },
        },
      },
    ]
    const before = JSON.stringify(events)
    const data = build(events)
    expect(data.todayEvents.map((event) => event._id)).toEqual([
      'continuing',
      'recurring',
    ])
    expect(data.todayEvents[0]).toMatchObject({
      date: '2040-02-27',
      endDate: '2040-03-01',
      status: 'completed',
    })
    expect(data.todayEvents[1]).toMatchObject({
      _id: 'recurring',
      date: '2040-02-28',
      status: 'planned',
      occurrenceKey: 'recurring:2040-02-28',
    })
    expect(data.weekDays.map((day) => day.eventCount)).toEqual([
      2, 3, 1, 0, 0, 0, 0,
    ])
    expect(
      data.weekDays[1].events.find((event) => event._id === 'cancelled')
        ?.status,
    ).toBe('cancelled')
    expect(data.events).toHaveLength(4)
    expect(JSON.stringify(events)).toBe(before)
  })

  it('retains distinct overlapping daily occurrences instead of collapsing them by event ID', () => {
    const data = build([
      {
        ...createEvent({ id: 'overlap', date: '2040-02-27', time: '10:00' }),
        endDate: '2040-02-28',
        recurrence: {
          frequency: 'daily',
          interval: 1,
          end: { type: 'after_occurrences', count: 2 },
        },
      },
    ])
    expect(data.todayEvents.map((event) => event.occurrenceKey)).toEqual([
      'overlap',
      'overlap:2040-02-28',
    ])
    expect(data.todayEvents.map((event) => event._id)).toEqual([
      'overlap',
      'overlap',
    ])
    expect(data.weekDays.map((day) => day.eventCount)).toEqual([
      2, 1, 0, 0, 0, 0, 0,
    ])
  })

  it('uses the supplied local date key and keeps stable events ordered', () => {
    const afternoonEvent = createEvent({
      id: 'afternoon',
      date: '2040-02-28',
      time: '14:00',
    })
    const morningEvent = createEvent({
      id: 'morning',
      date: '2040-02-28',
      time: '09:00',
    })
    const otherStableEvent = createEvent({
      id: 'other-stable',
      stableId: 'stable-secondary' as DashboardCommandStable['_id'],
      date: '2040-02-28',
      time: '08:00',
    })

    const data = createDashboardCommandData({
      stable,
      stables: [stable],
      events: [afternoonEvent, otherStableEvent, morningEvent],
      horses: [],
      overview,
      todayKey: '2040-02-28',
    })

    expect(data.weekDays.map((day) => day.key)).toEqual([
      '2040-02-28',
      '2040-02-29',
      '2040-03-01',
      '2040-03-02',
      '2040-03-03',
      '2040-03-04',
      '2040-03-05',
    ])
    expect(data.todayEvents.map((event) => event._id)).toEqual([
      morningEvent._id,
      afternoonEvent._id,
    ])
    expect(data.events).not.toContain(otherStableEvent)
  })
})
