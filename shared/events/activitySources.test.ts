import { expect, it } from 'vitest'
import type { Doc, Id } from '../../convex/_generated/dataModel'
import { mergeCalendarEvents, mergeTrainingSources } from './activitySources'
import { createEventOccurrences } from './eventOccurrences'

it('does not let a stable date restriction override personal access when other horses are merged', () => {
  const mine = 'mine' as Id<'horses'>
  const other = 'other' as Id<'horses'>
  const event: Doc<'events'> = {
    _id: 'event' as Id<'events'>,
    _creationTime: 0,
    createdBy: 'owner' as Id<'users'>,
    title: 'Visit',
    type: 'vet',
    date: '2026-01-05',
    time: '10:00',
    horseIds: [mine],
  }
  const merged = mergeTrainingSources([
    {
      horses: [],
      records: [],
      events: [
        {
          ...event,
          audienceRules: [{ horseId: mine, rules: [{ enabled: true }] }],
        },
      ],
    },
    {
      horses: [],
      records: [],
      events: [
        {
          ...event,
          horseIds: [mine, other],
          audienceRules: [
            {
              horseId: mine,
              rules: [
                { enabled: true },
                { occurrenceDate: event.date, enabled: false },
              ],
            },
            { horseId: other, rules: [{ enabled: true }] },
          ],
        },
      ],
    },
  ])
  expect(merged.events).toHaveLength(1)
  const occurrence = createEventOccurrences({
    events: merged.events,
    windowStart: event.date,
    windowEnd: event.date,
  })[0]
  expect(occurrence.event.horseIds).toEqual([mine, other])
})

it('keeps frozen horse participation separate from the current event', () => {
  const horse = 'horse' as Id<'horses'>
  const event: Doc<'events'> = {
    _id: 'event' as Id<'events'>,
    _creationTime: 0,
    createdBy: 'owner' as Id<'users'>,
    title: 'Lesson',
    type: 'training',
    date: '2026-01-05',
    time: '10:00',
    horseIds: [horse],
  }
  const result = mergeTrainingSources([
    {
      horses: [],
      records: [],
      events: [
        {
          ...event,
          contextHistorical: true,
          contextParticipationId: 'old',
          contextHorseId: horse,
        },
        { ...event, contextParticipationId: 'current', contextHorseId: horse },
      ],
    },
  ])
  expect(result.events.map((item) => item.contextParticipationId)).toEqual([
    'old',
    'current',
  ])
})

it('unions a single accepted occurrence without granting the rest of a restricted series', () => {
  const horse = 'horse' as Id<'horses'>
  const event: Doc<'events'> = {
    _id: 'event' as Id<'events'>,
    _creationTime: 0,
    createdBy: 'owner' as Id<'users'>,
    title: 'Lesson',
    type: 'training',
    date: '2026-01-05',
    time: '10:00',
    horseIds: [horse],
    recurrence: { frequency: 'weekly', interval: 1, daysOfWeek: [1] },
  }
  const events = mergeCalendarEvents([
    {
      ...event,
      audienceRules: [
        {
          horseId: horse,
          rules: [
            { enabled: true, throughDate: '2026-01-05' },
            { occurrenceDate: '2026-01-12', enabled: false },
          ],
        },
      ],
    },
    {
      ...event,
      audienceRules: [
        {
          horseId: horse,
          rules: [{ occurrenceDate: '2026-01-12', enabled: true }],
        },
      ],
    },
  ])
  expect(
    createEventOccurrences({
      events,
      windowStart: '2026-01-05',
      windowEnd: '2026-01-26',
    }).map((o) => o.startDate),
  ).toEqual(['2026-01-05', '2026-01-12'])
})

it.each([false, true])(
  'unions attendance with stable restrictions before deduplication (attendance first: %s)',
  (attendanceFirst) => {
    const horse = 'horse' as Id<'horses'>
    const event: Doc<'events'> = {
      _id: 'event' as Id<'events'>,
      _creationTime: 0,
      createdBy: 'owner' as Id<'users'>,
      title: 'Visit',
      type: 'vet',
      date: '2026-01-05',
      time: '10:00',
      horseIds: [horse],
    }
    const attendance = { horses: [], records: [], events: [event] }
    const stable = {
      horses: [],
      records: [],
      events: [
        {
          ...event,
          audienceRules: [
            {
              horseId: horse,
              rules: [
                { enabled: true },
                { occurrenceDate: event.date, enabled: false },
              ],
            },
          ],
        },
      ],
    }
    const merged = mergeTrainingSources(
      attendanceFirst ? [attendance, stable] : [stable, attendance],
    )
    expect(merged.events).toHaveLength(1)
    expect(
      createEventOccurrences({
        events: merged.events,
        windowStart: event.date,
        windowEnd: event.date,
      }),
    ).toHaveLength(1)
  },
)
