import { describe, expect, it } from 'vitest'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import { createDashboardCommandData } from './dashboardData'
import { dashboardUpcomingEvents } from './dashboardUpcomingEvents'
import type { DashboardCommandEvent } from './dashboardTypes'

const fixture = createDashboardLabFixtureData()
function event(
  id: string,
  date: string,
  overrides: Partial<DashboardCommandEvent> = {},
): DashboardCommandEvent {
  return {
    ...fixture.events[0],
    _id: id as DashboardCommandEvent['_id'],
    stableId: fixture.stable._id,
    date,
    time: '10:00',
    type: 'vet',
    status: 'planned',
    ...overrides,
  }
}
function upcoming(events: DashboardCommandEvent[]) {
  return dashboardUpcomingEvents(
    createDashboardCommandData({ ...fixture, events, todayKey: '2026-10-09' }),
  )
}
describe('upcoming dashboard events', () => {
  it('shows tomorrow through the seventh day, excludes cancelled/completed/training and other stables', () => {
    const result = upcoming([
      event('today', '2026-10-09'),
      event('tomorrow', '2026-10-10'),
      event('last', '2026-10-16'),
      event('late', '2026-10-17'),
      event('cancel', '2026-10-10', { status: 'cancelled' }),
      event('done', '2026-10-10', { status: 'completed' }),
      event('train', '2026-10-10', { type: 'training' }),
      event('foreign', '2026-10-10', {
        stableId: 'other' as typeof fixture.stable._id,
      }),
    ])
    expect(result.startKey).toBe('2026-10-10')
    expect(result.endKey).toBe('2026-10-16')
    expect(result.events.map((e) => e._id)).toEqual(['tomorrow', 'last'])
  })
  it('counts a multi-day occurrence once and leaves ongoing events in Today', () => {
    const result = upcoming([
      event('ongoing', '2026-10-08', { endDate: '2026-10-12' }),
      event('trip', '2026-10-11', { endDate: '2026-10-14' }),
    ])
    expect(result.events).toHaveLength(1)
    expect(result.events[0]).toMatchObject({
      _id: 'trip',
      date: '2026-10-11',
      endDate: '2026-10-14',
    })
  })
  it('keeps separate recurring occurrences with unique keys', () => {
    const result = upcoming([
      event('daily', '2026-10-01', {
        recurrence: { frequency: 'daily', interval: 1, end: { type: 'never' } },
      }),
    ])
    expect(result.events).toHaveLength(7)
    expect(new Set(result.events.map((e) => e.occurrenceKey)).size).toBe(7)
  })
})
