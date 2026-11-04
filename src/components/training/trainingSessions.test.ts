import { expect, it } from 'vitest'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { getTrainingEntries } from './trainingCalendarData'
import { getSessionLeader, groupTrainingSessions } from './trainingSessions'

const horses = ['A', 'B', 'C'].map((name) => ({
  _id: name as Id<'horses'>,
  name,
}))
const event = {
  _id: 'session',
  _creationTime: 0,
  createdBy: 'owner',
  title: 'Schooling',
  date: '2026-10-26',
  time: '10:00',
  type: 'training',
  horseIds: horses.map((h) => h._id),
  training: { activities: ['flatwork'], format: 'regular' },
} as Doc<'events'>
const window = { start: event.date, end: '2026-10-27', today: event.date }

it('groups three authorized horses once per occurrence and keeps different sessions separate', () => {
  const entries = getTrainingEntries({
    events: [
      event,
      { ...event, _id: 'other' as Id<'events'> },
      { ...event, date: '2026-10-27' },
    ],
    horses,
    records: [],
    ...window,
  })
  const sessions = groupTrainingSessions([...entries, ...entries])
  expect(sessions).toHaveLength(3)
  expect(sessions.every((session) => session.entries.length === 3)).toBe(true)
})
it('never adds horses outside the authorized or filtered input', () => {
  const entries = getTrainingEntries({
    events: [event],
    horses: horses.slice(0, 1),
    records: [],
    ...window,
  })
  expect(
    groupTrainingSessions(entries)[0].entries.map((e) => e.horse._id),
  ).toEqual(['A'])
})
it('keeps frozen participation separate from the current session', () => {
  const current = getTrainingEntries({
    events: [event],
    horses,
    records: [],
    ...window,
  })
  const historical = {
    ...current[0],
    occurrence: {
      ...current[0].occurrence,
      event: {
        ...event,
        contextHistorical: true,
        contextParticipationId: 'old-participation',
        contextHorseId: 'A',
      },
    },
  }
  expect(
    groupTrainingSessions([...current, historical]).map(
      (s) => s.entries.length,
    ),
  ).toEqual([3, 1])
})

const record = (horseId: string, rider?: string) =>
  ({
    _id: `record-${horseId}`,
    _creationTime: 0,
    eventId: event._id,
    horseId,
    date: event.date,
    status: 'planned',
    details: { activities: ['flatwork'], format: 'regular', rider },
    recordedBy: 'owner',
    createdAt: 0,
    updatedAt: 0,
  }) as Doc<'trainingRecords'>
const entriesWith = (records: Doc<'trainingRecords'>[], eventRider?: string) =>
  getTrainingEntries({
    events: [{ ...event, training: { ...event.training!, rider: eventRider } }],
    horses,
    records,
    ...window,
  }).filter((entry) => entry.occurrence.startDate === event.date)

it('reads the leader from the recorded sessions, so an edit made from a horse is shown', () => {
  // The event still names the old leader; the edit updated the horse's record.
  const entries = entriesWith(
    ['A', 'B', 'C'].map((id) => record(id, 'Anna')),
    'Old leader',
  )
  expect(getSessionLeader(entries, entries[0].occurrence.event)).toBe('Anna')
})

it('has no single leader when horses differ, and falls back to the event without entries', () => {
  const mixed = entriesWith(
    [record('A', 'Anna'), record('B', 'Piotr'), record('C', 'Anna')],
    'Old leader',
  )
  expect(getSessionLeader(mixed, mixed[0].occurrence.event)).toBeUndefined()
  const partial = entriesWith([record('A', 'Anna')], 'Old leader')
  expect(getSessionLeader(partial)).toBeUndefined()
  expect(getSessionLeader([], { training: { rider: 'Anna' } })).toBe('Anna')
  expect(getSessionLeader([], undefined)).toBeUndefined()
})
