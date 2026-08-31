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
