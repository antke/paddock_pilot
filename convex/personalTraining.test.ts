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

it.each([false, true])(
  'moves a recorded session to the replacement horse (recurring: %s)',
  async (recurring) => {
    const f = await setup()
    const [originalHorse, replacementHorse] = f.horseIds
    const input = {
      horseIds: [originalHorse],
      title: 'Schooling',
      type: 'training' as const,
      date: '2026-10-08',
      time: '08:00',
      training,
      status: 'completed' as const,
      recurrence: recurring
        ? { frequency: 'daily' as const, interval: 1 }
        : undefined,
    }
    const id = await f.owner.mutation(api.events.add, input)
    const date = recurring ? '2026-10-09' : input.date
    await f.owner.mutation(api.training.saveRecord, {
      eventId: id,
      horseId: originalHorse,
      date,
      status: 'completed',
      details: { ...training, rider: 'Alex', durationMinutes: 25 },
      outcome: 'Good transitions',
    })
    const before = await personalTraining(f.owner)
    const selected = before.records.find((record) => record.date === date)!
    await f.owner.mutation(api.events.update, {
      ...input,
      id,
      horseIds: [replacementHorse],
      trainingOccurrenceDate: date,
      trainingHorseId: originalHorse,
      trainingRecordId: selected._id,
      training: { ...selected.details, activities: ['jumping'] },
      providerName: 'New trainer',
      totalCost: 120,
    })
    const after = await personalTraining(f.owner)
    expect(
      after.records.find((record) => record._id === selected._id),
    ).toMatchObject({
      horseId: replacementHorse,
      status: 'completed',
      date,
      details: { activities: ['jumping'], rider: 'Alex', durationMinutes: 25 },
      outcome: 'Good transitions',
      createdAt: selected.createdAt,
    })
    expect(
      after.records.filter((record) => record._id !== selected._id),
    ).toEqual(before.records.filter((record) => record._id !== selected._id))
    const entries = getTrainingEntries({
      ...after,
      start: date,
      end: date,
      today: date,
    })
    expect(entries).toHaveLength(1)
    expect(entries[0].horse._id).toBe(replacementHorse)
    expect(entries[0].status).toBe('completed')
    const event = await f.t.run((ctx) => ctx.db.get(id))
    expect(event).toMatchObject({
      horseIds: [replacementHorse],
      providerName: 'New trainer',
      totalCost: 120,
    })
    if (recurring) {
      const prior = getTrainingEntries({
        ...after,
        start: input.date,
        end: input.date,
        today: date,
      })
      expect(
        prior.find((entry) => entry.horse._id === originalHorse)?.record?._id,
      ).toBe(before.records.find((record) => record.date === input.date)?._id)
    }
  },
)

it('moves a one-off recording without requiring record context from the editor', async () => {
  const f = await setup()
  const input = {
    horseIds: [f.horseIds[0]],
    title: 'Schooling',
    type: 'training' as const,
    date: '2026-10-09',
    time: '08:00',
    training,
    status: 'completed' as const,
  }
  const id = await f.owner.mutation(api.events.add, input)
  await f.owner.mutation(api.events.update, {
    ...input,
    id,
    horseIds: [f.horseIds[1]],
  })
  const data = await personalTraining(f.owner)
  expect(data.records).toHaveLength(1)
  expect(data.records[0]).toMatchObject({
    horseId: f.horseIds[1],
    status: 'completed',
  })
})

it('does not overwrite an existing recording on the replacement horse', async () => {
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
  const row = await f.t.run((ctx) =>
    ctx.db
      .query('eventsHorses')
      .withIndex('by_event_id', (q) => q.eq('eventId', id))
      .collect(),
  )
  await f.owner.mutation(api.events.withdrawHorseFromEvent, {
    eventHorseId: row.find((r) => r.horseId === f.horseIds[1])!._id,
  })
  const before = await personalTraining(f.owner)
  await expect(
    f.owner.mutation(api.events.update, {
      ...input,
      id,
      horseIds: [f.horseIds[1]],
    }),
  ).rejects.toThrow('already has training recorded')
  expect((await personalTraining(f.owner)).records).toEqual(before.records)
})

it('corrects dates and details after completion without changing record identity or notes', async () => {
  const f = await setup()
  const input = {
    horseIds: [f.horseIds[0]],
    title: 'Lesson',
    type: 'training' as const,
    date: '2026-10-08',
    time: '10:00',
    training,
    status: 'completed' as const,
    notesAfterCompletion: 'Original outcome',
  }
  const id = await f.owner.mutation(api.events.add, input)
  const before = (await personalTraining(f.owner)).records[0]
  await f.owner.mutation(api.events.update, {
    ...input,
    id,
    date: '2026-10-07',
    time: '11:00',
    totalCost: 120,
    training: { ...training, activities: ['jumping'] },
  })
  const data = await personalTraining(f.owner)
  expect(data.records[0]).toMatchObject({
    _id: before._id,
    date: '2026-10-07',
    status: 'completed',
    outcome: 'Original outcome',
    recordedBy: before.recordedBy,
    createdAt: before.createdAt,
    details: { activities: ['jumping'] },
  })
  expect(
    getTrainingEntries({
      ...data,
      start: '2026-10-07',
      end: '2026-10-08',
      today: '2026-10-09',
    }),
  ).toHaveLength(1)
})

it('keeps recordings visible outside an edited recurrence and accepts normalized form defaults', async () => {
  const f = await setup()
  const input = {
    horseIds: [f.horseIds[0]],
    title: 'Lesson',
    type: 'training' as const,
    date: '2026-10-08',
    time: '10:00',
    training,
    status: 'completed' as const,
    recurrence: { frequency: 'daily' as const, interval: 1 },
  }
  const id = await f.owner.mutation(api.events.add, input)
  await f.owner.mutation(api.events.update, {
    ...input,
    id,
    title: 'Corrected title',
    recurrence: { ...input.recurrence, end: { type: 'never' } },
  })
  await f.owner.mutation(api.events.update, {
    ...input,
    id,
    date: '2026-10-09',
    recurrence: { frequency: 'weekly', interval: 1, daysOfWeek: [5] },
  })
  const data = await personalTraining(f.owner)
  const old = getTrainingEntries({
    ...data,
    start: '2026-10-08',
    end: '2026-10-08',
    today: '2026-10-09',
  })
  expect(old).toHaveLength(1)
  expect(old[0].status).toBe('completed')
  expect(old[0].record?.date).toBe('2026-10-08')
})

it.each(['training', 'vet'] as const)(
  'preserves participation data when replacing or removing horses (%s)',
  async (type) => {
    const f = await setup()
    const input = {
      horseIds: [f.horseIds[0]],
      title: 'Visit',
      type,
      date: '2026-10-08',
      time: '10:00',
      training: type === 'training' ? training : undefined,
      status: 'completed' as const,
    }
    const id = await f.owner.mutation(api.events.add, input)
    const before = (await f.owner.query(api.events.getWithHorses, { id }))!
    const participation = before.eventHorses[0]
    const notes = {
      requestedServiceNotes: 'Preparation',
      completionNotes: 'Outcome',
      costShare: 100,
    }
    await f.owner.mutation(api.eventHorseDetails.update, {
      id: participation._id,
      ...notes,
    })
    await f.owner.mutation(api.events.update, {
      ...input,
      id,
      horseIds: [f.horseIds[1]],
    })
    const after = (await f.owner.query(api.events.getWithHorses, { id }))!
    expect(
      after.eventHorses.find((row) => row.horseId === f.horseIds[1]),
    ).toMatchObject(notes)
    expect(await f.t.run((ctx) => ctx.db.get(participation._id))).toMatchObject(
      { ...notes, status: 'withdrawn' },
    )
    await f.owner.mutation(api.eventHorseDetails.update, {
      id: participation._id,
      completionNotes: 'Corrected old note',
    })
    await f.owner.mutation(api.events.update, { ...input, id, horseIds: [] })
    expect(
      (await f.owner.query(api.events.getPermissions, { id }))?.canManageEvent,
    ).toBe(true)
    if (type === 'vet')
      expect(
        (await f.owner.query(api.events.list, {})).some(
          (event) => event._id === id,
        ),
      ).toBe(true)
    await f.owner.mutation(api.events.update, {
      ...input,
      id,
      horseIds: [f.horseIds[1]],
    })
    expect(
      (await f.owner.query(api.events.getWithHorses, { id }))?.event.horseIds,
    ).toEqual([f.horseIds[1]])
  },
)

it('corrects an individual recorded date without leaving a duplicate scheduled entry', async () => {
  const f = await setup()
  const input = {
    horseIds: [f.horseIds[0]],
    title: 'Lesson',
    type: 'training' as const,
    date: '2026-10-08',
    time: '10:00',
    training,
    status: 'completed' as const,
  }
  const id = await f.owner.mutation(api.events.add, input)
  const before = (await personalTraining(f.owner)).records[0]
  await f.owner.mutation(api.training.saveRecord, {
    eventId: id,
    horseId: f.horseIds[0],
    date: input.date,
    newDate: '2026-10-07',
    status: 'completed',
    details: training,
    outcome: 'Correct date',
  })
  const data = await personalTraining(f.owner)
  expect(data.records[0]).toMatchObject({
    _id: before._id,
    date: '2026-10-07',
    scheduledDate: input.date,
    recordedBy: before.recordedBy,
  })
  const entries = getTrainingEntries({
    ...data,
    start: '2026-10-07',
    end: '2026-10-08',
    today: '2026-10-09',
  })
  expect(entries).toHaveLength(1)
  expect(entries[0].occurrence.startDate).toBe('2026-10-07')
  // A separate entry subsequently recorded in the original slot stays visible.
  await f.owner.mutation(api.training.saveRecord, {
    eventId: id,
    horseId: f.horseIds[0],
    date: input.date,
    status: 'completed',
    details: training,
  })
  const withAnotherRecord = await personalTraining(f.owner)
  expect(
    getTrainingEntries({
      ...withAnotherRecord,
      start: '2026-10-07',
      end: '2026-10-08',
      today: '2026-10-09',
    }),
  ).toHaveLength(2)
})

it('attributes existing events and records without exposing private account data', async () => {
  const f = await setup()
  const user = (await f.owner.query(api.users.getCurrentUser))!
  await f.t.run((ctx) =>
    ctx.db.patch(user._id, {
      firstName: 'Alex',
      lastName: 'Rider',
      preferredName: 'Alex R.',
    }),
  )
  const id = await f.owner.mutation(api.events.add, {
    horseIds: [f.horseIds[0]],
    title: 'Lesson',
    type: 'training',
    date: '2026-10-08',
    time: '10:00',
    training,
    status: 'completed',
  })
  expect(
    (await f.owner.query(api.events.getWithHorses, { id }))?.createdByName,
  ).toBe('Alex R.')
  expect((await personalTraining(f.owner)).records[0].createdByName).toBe(
    'Alex R.',
  )
  await expect(
    f.outsider.query(api.events.getWithHorses, { id }),
  ).rejects.toThrow()
  await f.t.run((ctx) =>
    ctx.db.patch(user._id, { preferredName: '', firstName: '', lastName: '' }),
  )
  expect(
    (await f.owner.query(api.events.getWithHorses, { id }))?.createdByName,
  ).toBeNull()
})

it.each([
  ['planned', false],
  ['completed', false],
  ['planned', true],
  ['completed', true],
] as const)(
  'adding a horse to a %s training keeps one event and one log row per horse (stable: %s)',
  async (status, inStable) => {
    const f = await setup()
    const stableId = inStable
      ? await f.owner.mutation(api.stables.add, {
          name: 'Training yard',
          location: 'Warsaw',
        })
      : undefined
    if (stableId)
      for (const horseId of f.horseIds)
        await f.owner.mutation(api.horseTransitions.connect, {
          horseId,
          stableId,
        })
    const input = {
      stableId,
      horseIds: [f.horseIds[0]],
      title: 'Shared schooling',
      type: 'training' as const,
      date: '2026-10-09',
      time: '10:00',
      status,
      training,
    }
    const id = await f.owner.mutation(api.events.add, input)
    const before = await personalTraining(f.owner)
    const originalRecord = before.records[0]
    const update = {
      ...input,
      id,
      horseIds: f.horseIds,
      trainingOccurrenceDate: input.date,
      trainingHorseId: f.horseIds[0],
      trainingRecordId: originalRecord?._id,
    }
    await f.owner.mutation(api.events.update, update)
    // Repeating the save must not create another event or participation either.
    await f.owner.mutation(api.events.update, update)
    const persisted = await f.t.run((ctx) => ctx.db.query('events').collect())
    expect(persisted).toHaveLength(1)
    expect(persisted[0]._id).toBe(id)
    expect(new Set(persisted[0].horseIds)).toEqual(new Set(f.horseIds))
    const session = await f.owner.query(api.training.listForEvent, {
      eventId: id,
    })
    expect(session.events.map((event) => event._id)).toEqual([id])
    const detail = await f.owner.query(api.events.getWithHorses, { id })
    expect(detail?.eventHorses).toHaveLength(2)
    const data = stableId
      ? await f.owner.query(api.training.listForStable, { stableId })
      : await personalTraining(f.owner)
    const entries = getTrainingEntries({
      ...data,
      start: input.date,
      end: input.date,
      today: input.date,
    })
    expect(entries).toHaveLength(2)
    expect(new Set(entries.map((entry) => entry.key)).size).toBe(2)
    expect(new Set(entries.map((entry) => entry.occurrence.eventId))).toEqual(
      new Set([id]),
    )
    expect(new Set(entries.map((entry) => entry.horse._id))).toEqual(
      new Set(f.horseIds),
    )
    if (originalRecord)
      expect(
        data.records.find((record) => record._id === originalRecord._id),
      ).toEqual(originalRecord)
  },
)
