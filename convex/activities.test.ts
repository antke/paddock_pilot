import { convexTest } from 'convex-test'
import { expect, it } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'
import { writeRecordShare } from './libs/recordSharing'
import { getTrainingEntries } from '../shared/training/trainingEntries'

const modules = import.meta.glob('./**/*.ts')

async function fixture() {
  const t = convexTest(schema, modules)
  const owner = t.withIdentity({
    subject: 'owner',
    email: 'owner@example.test',
  })
  const outsider = t.withIdentity({
    subject: 'outsider',
    email: 'outsider@example.test',
  })
  for (const actor of [owner, outsider])
    await actor.mutation(api.users.ensureCurrentUser, {})
  const a = await owner.mutation(api.stables.add, {
    name: 'Stable A',
    location: 'Warsaw',
  })
  const b = await owner.mutation(api.stables.add, {
    name: 'Stable B',
    location: 'Warsaw',
  })
  const horse = await owner.mutation(api.horses.add, { name: 'Luna', age: 8 })
  await owner.mutation(api.horseTransitions.connect, {
    horseId: horse,
    stableId: a,
  })
  return { t, owner, outsider, a, b, horse }
}

it('shows the same event once across personal and stable selections, and respects empty selection', async () => {
  const f = await fixture()
  const id = await f.owner.mutation(api.events.add, {
    horseIds: [f.horse],
    stableId: f.a,
    type: 'vet',
    title: 'Visit',
    date: '2026-01-05',
    time: '10:00',
  })
  const result = await f.owner.query(api.activities.view, {
    personal: true,
    stableIds: [f.a, f.b, f.a],
    training: false,
  })
  expect(result.events.map((event) => event._id)).toEqual([id])
  expect(
    (
      await f.owner.query(api.activities.view, {
        personal: false,
        stableIds: [],
        training: false,
      })
    ).events,
  ).toEqual([])
  await expect(
    f.outsider.query(api.activities.view, {
      personal: true,
      stableIds: [f.a],
      training: false,
    }),
  ).rejects.toThrow()
})

it('does not duplicate a training entry visible through personal and stable calendars', async () => {
  const f = await fixture()
  const id = await f.owner.mutation(api.events.add, {
    horseIds: [f.horse],
    stableId: f.a,
    type: 'training',
    title: 'Ride',
    date: '2026-01-05',
    time: '10:00',
    training: { activities: ['hacking'], format: 'regular' },
  })
  const result = await f.owner.query(api.activities.view, {
    personal: true,
    stableIds: [f.a, f.b],
    training: true,
  })
  const entries = getTrainingEntries({
    ...result,
    start: '2026-01-05',
    end: '2026-01-05',
    today: '2026-01-05',
  })
  expect(entries).toHaveLength(1)
  expect(entries[0].occurrence.eventId).toBe(id)
})

it('keeps private records out of stable-only views, including for their owner', async () => {
  const f = await fixture()
  await f.owner.mutation(api.events.add, {
    horseIds: [f.horse],
    type: 'vet',
    title: 'Private visit',
    date: '2026-01-05',
    time: '10:00',
  })
  expect(
    (
      await f.owner.query(api.activities.view, {
        personal: false,
        stableIds: [f.a, f.b],
        training: false,
      })
    ).events,
  ).toEqual([])
  expect(
    (
      await f.owner.query(api.activities.view, {
        personal: true,
        stableIds: [f.a],
        training: false,
      })
    ).events,
  ).toHaveLength(1)
})

it('discovers accepted rides without granting horse access or exposing private event details', async () => {
  const f = await fixture()
  const eventId = await f.owner.mutation(api.events.add, {
    horseIds: [f.horse],
    type: 'training',
    title: 'Ride',
    date: '2026-01-05',
    time: '10:00',
    description: 'Secret',
    training: {
      activities: ['hacking'],
      format: 'regular',
      focus: 'Secret focus',
    },
  })
  const id = await f.owner.mutation(api.activityParticipants.invite, {
    eventId,
    horseId: f.horse,
    date: '2026-01-05',
    email: 'outsider@example.test',
    role: 'rider',
  })
  expect(await f.outsider.query(api.activities.detailAccess, { eventId })).toBe(
    'missing',
  )
  await f.outsider.mutation(api.activityParticipants.respond, {
    id,
    accept: true,
  })
  const view = await f.outsider.query(api.activities.view, {
    personal: true,
    stableIds: [],
    training: true,
  })
  expect(view.events).toHaveLength(1)
  expect(view.horses[0].canRecord).toBe(false)
  expect(JSON.stringify(view)).not.toContain('Secret')
  expect(await f.outsider.query(api.activities.detailAccess, { eventId })).toBe(
    'participant',
  )
  await f.owner.mutation(api.activityParticipants.revoke, { id })
  expect(
    (
      await f.outsider.query(api.activities.view, {
        personal: true,
        stableIds: [],
        training: true,
      })
    ).events,
  ).toEqual([])
})

it('keeps two accepted dates of the same series and exposes only the invited horse identity', async () => {
  const f = await fixture()
  const eventId = await f.owner.mutation(api.events.add, {
    horseIds: [f.horse],
    type: 'training',
    title: 'Lessons',
    date: '2026-01-05',
    time: '10:00',
    training: {
      activities: ['jumping'],
      format: 'lesson',
      focus: 'Private focus',
    },
    recurrence: { frequency: 'weekly', interval: 1, daysOfWeek: [1] },
  })
  for (const date of ['2026-01-05', '2026-01-12']) {
    const id = await f.owner.mutation(api.activityParticipants.invite, {
      eventId,
      horseId: f.horse,
      date,
      email: 'outsider@example.test',
      role: 'rider',
    })
    await f.outsider.mutation(api.activityParticipants.respond, {
      id,
      accept: true,
    })
  }
  const view = await f.outsider.query(api.activities.view, {
    personal: true,
    stableIds: [],
    training: true,
  })
  expect(view.events.map((event) => event.date).sort()).toEqual([
    '2026-01-05',
    '2026-01-12',
  ])
  expect(view.horses[0]).not.toHaveProperty('ownerId')
  expect(view.horses[0]).not.toHaveProperty('stableId')
  expect(view.horses[0]).not.toHaveProperty('age')
  const own = await f.outsider.query(api.activityParticipants.mine, {})
  expect(own[0].plannedTraining).toMatchObject({
    activities: ['jumping'],
    format: 'lesson',
  })
  expect(JSON.stringify(own)).not.toContain('Private focus')
})

it('keeps an accepted horse visible when only another horse is shared for that occurrence', async () => {
  const f = await fixture()
  const second = await f.owner.mutation(api.horses.add, {
    name: 'Maple',
    age: 9,
  })
  await f.owner.mutation(api.horseTransitions.connect, {
    horseId: second,
    stableId: f.a,
  })
  const eventId = await f.owner.mutation(api.events.add, {
    horseIds: [f.horse, second],
    stableId: f.a,
    type: 'training',
    title: 'Group lesson',
    date: '2026-01-05',
    time: '10:00',
    training: { activities: ['jumping'], format: 'lesson' },
    recurrence: { frequency: 'weekly', interval: 1, daysOfWeek: [1] },
  })
  const outsider = (await f.outsider.query(api.users.getCurrentUser, {}))!
  const owner = (await f.owner.query(api.users.getCurrentUser, {}))!
  await f.t.run(async (ctx) => {
    await ctx.db.insert('stableMembers', {
      userId: outsider._id,
      stableId: f.a,
      role: 'member',
    })
    const horse = (await ctx.db.get(f.horse))!
    await writeRecordShare(ctx, {
      recordId: eventId,
      horseId: f.horse,
      stableId: f.a,
      placementId: horse.currentPlacementId!,
      createdBy: owner._id,
      enabled: false,
      occurrenceDate: '2026-01-05',
    })
  })
  const id = await f.owner.mutation(api.activityParticipants.invite, {
    eventId,
    horseId: f.horse,
    date: '2026-01-05',
    email: 'outsider@example.test',
    role: 'rider',
  })
  await f.outsider.mutation(api.activityParticipants.respond, {
    id,
    accept: true,
  })
  await f.outsider.mutation(api.activityParticipants.reportRide, {
    id,
    details: { activities: ['jumping'], format: 'lesson' },
    outcome: 'Good round',
  })
  const view = await f.outsider.query(api.activities.view, {
    personal: true,
    stableIds: [f.a],
    training: true,
  })
  const entries = getTrainingEntries({
    ...view,
    start: '2026-01-05',
    end: '2026-01-05',
    today: '2026-01-05',
  })
  expect(entries).toHaveLength(2)
  expect(entries.find((entry) => entry.horse._id === f.horse)).toMatchObject({
    status: 'completed',
    horse: { canRecord: false },
    record: { outcome: 'Good round' },
  })
})
