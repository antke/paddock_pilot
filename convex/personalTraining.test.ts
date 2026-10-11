import { afterEach, expect, it, vi } from 'vitest'
import { convexTest } from 'convex-test'
import schema from './schema'
import { api } from './_generated/api'
import { getTrainingEntries } from '../shared/training/trainingEntries'

const modules = import.meta.glob('./**/*.ts')
async function personalTraining(
  client: Awaited<ReturnType<typeof setup>>['owner'],
) {
  const roster = await client.query(api.horses.listMine, {})
  const rows = await Promise.all(
    roster.map((horse) =>
      client.query(api.training.listForHorse, { horseId: horse._id }),
    ),
  )
  return {
    horses: rows.flatMap((row) => row.horses),
    events: rows.flatMap((row) => row.events),
    records: rows.flatMap((row) => row.records),
  }
}
const training = {
  activities: ['flatwork' as const],
  format: 'regular' as const,
}
afterEach(() => vi.useRealTimers())
async function setup() {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-09T12:00:00Z'))
  const t = convexTest(schema, modules)
  const client = (name: string) =>
    t.withIdentity({
      subject: name,
      email: `${name}@example.com`,
      emailVerified: true,
    })
  const owner = client('owner'),
    viewer = client('viewer'),
    outsider = client('outsider')
  for (const actor of [owner, viewer, outsider])
    await actor.mutation(api.users.ensureCurrentUser, {})
  const horseIds = await Promise.all(
    ['Juniper', 'Willow'].map((name) =>
      owner.mutation(api.horses.add, { name, age: 8 }),
    ),
  )
  return { t, owner, viewer, outsider, horseIds }
}

it('aggregates personal training without duplicating a shared session or exposing other horses', async () => {
  const f = await setup()
  const eventId = await f.owner.mutation(api.events.add, {
    horseIds: f.horseIds,
    title: 'Morning work',
    type: 'training',
    date: '2026-10-09',
    time: '08:00',
    status: 'completed',
    training,
    notesAfterCompletion: 'Shared private notes',
  })
  const viewerId = (await f.viewer.query(api.users.getCurrentUser))!._id
  const ownerId = (await f.owner.query(api.users.getCurrentUser))!._id
  await f.t.run((ctx) =>
    ctx.db.insert('horseCarers', {
      horseId: f.horseIds[0],
      userId: viewerId,
      role: 'viewer',
      invitedBy: ownerId,
      createdAt: 0,
    }),
  )
  const data = await personalTraining(f.owner)
  const entries = getTrainingEntries({
    ...data,
    start: '2026-10-09',
    end: '2026-10-09',
    today: '2026-10-09',
  })
  expect(entries).toHaveLength(2)
  expect(new Set(entries.map((entry) => entry.key)).size).toBe(2)
  expect(entries.every((entry) => entry.status === 'completed')).toBe(true)
  expect(data.horses.every((horse) => horse.canRecord)).toBe(true)
  const shared = await personalTraining(f.viewer)
  expect(shared.horses).toHaveLength(1)
  expect(shared.horses[0].canRecord).toBe(false)
  expect(shared.records).toHaveLength(1)
  expect(shared.records[0].canEdit).toBe(false)
  expect(shared.events[0].horseIds).toEqual([f.horseIds[0]])
  expect(shared.events[0].notesAfterCompletion).toBeUndefined()
  await expect(
    f.viewer.mutation(api.training.saveRecord, {
      eventId,
      horseId: f.horseIds[0],
      date: '2026-10-09',
      status: 'completed',
      details: training,
    }),
  ).rejects.toThrow()
  expect(await personalTraining(f.outsider)).toEqual({
    horses: [],
    events: [],
    records: [],
  })
  await expect(personalTraining(f.t)).rejects.toThrow()
})

it('preserves frozen stable training after departure and excludes future occurrences', async () => {
  const f = await setup()
  const stableId = await f.outsider.mutation(api.stables.add, {
    name: 'Original yard',
    location: 'Warsaw',
  })
  const ownerId = (await f.owner.query(api.users.getCurrentUser))!._id
  const membershipId = await f.t.run((ctx) =>
    ctx.db.insert('stableMembers', {
      stableId,
      userId: ownerId,
      role: 'member',
    }),
  )
  const horseId = f.horseIds[0]
  await f.owner.mutation(api.horseTransitions.connect, { horseId, stableId })
  const eventId = await f.outsider.mutation(api.events.add, {
    stableId,
    horseIds: [horseId],
    title: 'Original training',
    type: 'training',
    date: '2026-10-01',
    time: '08:00',
    training,
    recurrence: { frequency: 'daily', interval: 1 },
  })
  const preview = await f.owner.query(api.horseTransitions.preview, { horseId })
  await f.owner.mutation(api.horseTransitions.depart, {
    horseId,
    revision: preview.revision,
    carryReminderIds: [],
  })
  await f.t.finishAllScheduledFunctions(vi.runAllTimers)
  await f.t.run(async (ctx) => {
    await ctx.db.delete(membershipId)
    await ctx.db.patch(eventId, { title: 'Changed stable training' })
  })
  const data = await personalTraining(f.owner)
  expect(data.events[0]).toMatchObject({
    title: 'Original training',
    contextHorseId: horseId,
    recurrence: { end: { type: 'on_date', date: '2026-10-09' } },
  })
  const entries = getTrainingEntries({
    ...data,
    start: '2026-10-08',
    end: '2026-10-11',
    today: '2026-10-09',
  })
  expect(entries.map((entry) => entry.occurrence.startDate)).toEqual([
    '2026-10-08',
    '2026-10-09',
  ])
})

it('completes and reopens exactly one horse/date without overwriting details or notes', async () => {
  const f = await setup()
  const eventId = await f.owner.mutation(api.events.add, {
    horseIds: f.horseIds,
    title: 'Daily schooling',
    type: 'training',
    date: '2026-10-08',
    time: '08:00',
    training,
    recurrence: { frequency: 'daily', interval: 1 },
  })
  const target = {
    eventId,
    horseId: f.horseIds[0],
    date: '2026-10-09',
  }
  const calendarTarget = { ...target, errorFormat: 'structured' as const }
  await f.owner.mutation(api.training.setStatus, {
    ...calendarTarget,
    status: 'completed',
  })
  await f.owner.mutation(api.training.setStatus, {
    ...calendarTarget,
    status: 'completed',
  })
  let data = await personalTraining(f.owner)
  expect(data.records).toHaveLength(1)
  expect(data.records[0]).toMatchObject({
    ...target,
    status: 'completed',
    details: training,
  })
  const corrected = {
    ...training,
    activities: ['groundwork' as const],
    durationMinutes: 25,
  }
  await f.owner.mutation(api.training.saveRecord, {
    ...target,
    status: 'completed',
    details: corrected,
    outcome: 'Calm and balanced',
  })
  await f.owner.mutation(api.training.setStatus, {
    ...calendarTarget,
    status: 'planned',
  })
  data = await personalTraining(f.owner)
  expect(data.records[0]).toMatchObject({
    status: 'planned',
    details: corrected,
    outcome: 'Calm and balanced',
  })
  await expect(
    f.outsider.mutation(api.training.setStatus, {
      ...target,
      status: 'completed',
    }),
  ).rejects.toThrow()
  await expect(
    f.owner.mutation(api.training.setStatus, {
      ...calendarTarget,
      date: '2099-01-01',
      status: 'completed',
    }),
  ).rejects.toMatchObject({ data: { code: 'futureTraining' } })
  await expect(
    f.owner.mutation(api.training.setStatus, {
      ...calendarTarget,
      date: '2026-10-07',
      status: 'completed',
    }),
  ).rejects.toMatchObject({ data: { code: 'trainingOccurrence' } })
})

it('updates a completed one-off log when its shared work type changes, preserving individual notes', async () => {
  const f = await setup()
  const input = {
    horseIds: f.horseIds,
    title: 'Schooling',
    type: 'training' as const,
    date: '2026-10-09',
    time: '08:00',
    training,
    status: 'completed' as const,
  }
  const id = await f.owner.mutation(api.events.add, input)
  await f.owner.mutation(api.training.saveRecord, {
    eventId: id,
    horseId: f.horseIds[0],
    date: input.date,
    status: 'completed',
    details: { ...training, rider: 'Alex', durationMinutes: 25 },
    outcome: 'Good transitions',
  })
  await f.owner.mutation(api.events.update, {
    ...input,
    id,
    training: { ...training, activities: ['groundwork'] },
  })
  const data = await personalTraining(f.owner)
  const entries = getTrainingEntries({
    ...data,
    start: input.date,
    end: input.date,
    today: input.date,
  })
  expect(
    entries.every((entry) => entry.details.activities[0] === 'groundwork'),
  ).toBe(true)
  expect(
    data.records.find((record) => record.horseId === f.horseIds[0]),
  ).toMatchObject({
    status: 'completed',
    details: { rider: 'Alex', durationMinutes: 25 },
    outcome: 'Good transitions',
  })
})

it('edits the selected recorded session without changing the series or another horse/date', async () => {
  const f = await setup()
  const input = {
    horseIds: f.horseIds,
    title: 'Daily schooling',
    type: 'training' as const,
    date: '2026-10-08',
    time: '08:00',
    training,
    status: 'completed' as const,
    recurrence: { frequency: 'daily' as const, interval: 1 },
  }
  const id = await f.owner.mutation(api.events.add, input)
  await f.owner.mutation(api.training.saveRecord, {
    eventId: id,
    horseId: f.horseIds[0],
    date: '2026-10-09',
    status: 'completed',
    details: { ...training, activities: ['groundwork'] },
    outcome: 'Keep this result',
  })
  const before = await personalTraining(f.owner)
  const selected = before.records.find(
    (record) => record.date === '2026-10-09',
  )!
  await f.owner.mutation(api.events.update, {
    ...input,
    id,
    trainingRecordId: selected._id,
    trainingOccurrenceDate: selected.date,
    trainingHorseId: selected.horseId,
    training: { ...training, activities: ['jumping'] },
  })
  const after = await personalTraining(f.owner)
  expect(after.events[0].training).toEqual(training)
  expect(after.records.filter((record) => record._id !== selected._id)).toEqual(
    before.records.filter((record) => record._id !== selected._id),
  )
  expect(
    after.records.find((record) => record._id === selected._id),
  ).toMatchObject({
    details: { activities: ['jumping'] },
    outcome: 'Keep this result',
    status: 'completed',
  })
  await expect(
    f.owner.mutation(api.events.update, {
      ...input,
      id,
      trainingRecordId: selected._id,
      trainingOccurrenceDate: '2026-10-08',
    }),
  ).rejects.toThrow('scheduled occurrence')
})
