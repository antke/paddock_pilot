import { describe, expect, it } from 'vitest'
import type { Doc, Id } from 'convex/_generated/dataModel'
import {
  formatTrainingTimeRange,
  getTrainingEntries,
  trainingWindow,
} from './trainingCalendarData'
import { getTrainingStatus } from 'shared/training/trainingSchema'

const horse = { _id: 'horse1' as Id<'horses'>, name: 'Juniper' }
const event: Doc<'events'> = {
  _id: 'session1' as Id<'events'>,
  _creationTime: 0,
  stableId: 'stable' as Id<'stables'>,
  createdBy: 'owner' as Id<'users'>,
  horseIds: [horse._id],
  type: 'training',
  title: 'Weekly lesson',
  date: '2026-01-05',
  time: '10:00',
  status: 'completed',
  recurrence: { frequency: 'weekly', interval: 1, daysOfWeek: [1] },
}
const record: Doc<'trainingRecords'> = {
  _id: 'record1' as Id<'trainingRecords'>,
  _creationTime: 0,
  eventId: event._id,
  horseId: horse._id,
  stableId: event.stableId,
  date: '2026-01-05',
  status: 'completed',
  details: { activities: ['jumping'], format: 'regular', durationMinutes: 30 },
  recordedBy: event.createdBy,
  createdAt: 0,
  updatedAt: 0,
}
describe('training calendar', () => {
  it('shows start and end times, including midnight and missing duration', () => {
    expect(formatTrainingTimeRange('10:00', 40)).toBe('10:00–10:40')
    expect(formatTrainingTimeRange('10:45', 90)).toBe('10:45–12:15')
    expect(formatTrainingTimeRange('23:30', 60)).toBe('23:30–00:30 (+1 day)')
    expect(formatTrainingTimeRange('10:00')).toBe('10:00 · End not set')
  })
  it('handles weeks across year boundaries and leap-year months', () => {
    expect(trainingWindow('2026-01-01', 'week')).toMatchObject({
      start: '2025-12-29',
      end: '2026-01-04',
    })
    expect(trainingWindow('2024-02-12', 'month').days).toHaveLength(29)
  })
  it('does not spread a shared legacy status or a completion to other dates', () => {
    const entries = getTrainingEntries({
      events: [event],
      records: [record],
      horses: [horse],
      start: '2026-01-01',
      end: '2026-01-31',
      today: '2026-01-20',
    })
    expect(entries.map((entry) => entry.status)).toEqual([
      'completed',
      'unconfirmed',
      'unconfirmed',
      'planned',
    ])
    expect(
      getTrainingStatus({ status: 'completed' }, '2026-01-05', '2026-01-20'),
    ).toBe('completed')
  })
  it('keeps withdrawn horses recorded sessions but not future bookings', () => {
    const entries = getTrainingEntries({
      events: [{ ...event, horseIds: [] }],
      records: [record],
      horses: [horse],
      start: '2026-01-01',
      end: '2026-01-31',
      today: '2026-01-20',
    })
    expect(entries).toHaveLength(1)
    expect(entries[0].status).toBe('completed')
    expect(
      getTrainingEntries({
        events: [event],
        records: [record],
        horses: [],
        start: '2026-01-01',
        end: '2026-01-31',
        today: '2026-01-20',
      }),
    ).toEqual([])
  })
})
