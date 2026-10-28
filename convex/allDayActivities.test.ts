import { convexTest } from 'convex-test'
import { expect, it } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

it('preserves whole-day scheduling across saving, sharing, history, and editing', async () => {
  const t = convexTest(schema, modules)
  const owner = t.withIdentity({
    subject: 'owner',
    email: 'owner@example.test',
  })
  await owner.mutation(api.users.ensureCurrentUser, {})
  const stableId = await owner.mutation(api.stables.add, {
    name: 'Stable A',
    location: 'Warsaw',
  })
  const horseId = await owner.mutation(api.horses.add, { name: 'Luna', age: 8 })
  const fields = {
    horseIds: [horseId],
    type: 'vet' as const,
    title: 'Visit',
    date: '2026-01-05',
    time: 'all-day',
  }
  const eventId = await owner.mutation(api.events.add, {
    ...fields,
    sharedStableIds: [stableId],
  })
  expect(
    (await owner.query(api.events.getWithHorses, { id: eventId }))?.event.time,
  ).toBe('all-day')
  const calendar = await owner.query(api.activities.view, {
    personal: false,
    stableIds: [stableId],
    training: false,
  })
  expect(calendar.events[0]).toMatchObject({
    date: fields.date,
    time: 'all-day',
  })
  const history = await owner.query(api.horseTimeline.listForHorse, { horseId })
  expect(Number.isFinite(history.entries[0].occurredAt)).toBe(true)
  await owner.mutation(api.events.update, {
    ...fields,
    id: eventId,
    time: '14:30',
  })
  expect(
    (await owner.query(api.events.getWithHorses, { id: eventId }))?.event.time,
  ).toBe('14:30')
})

it('records a whole-day training session on its selected date', async () => {
  const t = convexTest(schema, modules)
  const owner = t.withIdentity({
    subject: 'owner',
    email: 'owner@example.test',
  })
  await owner.mutation(api.users.ensureCurrentUser, {})
  const horseId = await owner.mutation(api.horses.add, { name: 'Luna', age: 8 })
  const eventId = await owner.mutation(api.events.add, {
    horseIds: [horseId],
    type: 'training',
    title: 'Clinic',
    date: '2026-01-05',
    time: 'all-day',
    status: 'completed',
    training: {
      activities: ['jumping'],
      format: 'workshop',
      durationMinutes: 90,
    },
  })
  const result = await owner.query(api.training.listForEvent, { eventId })
  expect(result.events[0].time).toBe('all-day')
  expect(result.records[0]).toMatchObject({
    date: '2026-01-05',
    status: 'completed',
    details: { durationMinutes: 90 },
  })
})
