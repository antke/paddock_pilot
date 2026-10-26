import { convexTest } from 'convex-test'
import type {
  FunctionArgs,
  FunctionReference,
  FunctionReturnType,
} from 'convex/server'
import { describe, expect, it } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
async function setup() {
  const t = convexTest(schema, modules)
  const owner = t.withIdentity({ subject: 'owner', email: 'owner@test.dev' })
  const admin = t.withIdentity({ subject: 'admin', email: 'admin@test.dev' })
  const stranger = t.withIdentity({
    subject: 'stranger',
    email: 'stranger@test.dev',
  })
  for (const actor of [owner, admin, stranger])
    await actor.mutation(api.users.ensureCurrentUser, {})
  const ownerId = (await owner.query(api.users.getCurrentUser, {}))!._id
  const stableId = await admin.mutation(api.stables.add, {
    name: 'Yard',
    location: 'Warsaw',
  })
  await t.run((ctx) =>
    ctx.db.insert('stableMembers', {
      userId: ownerId,
      stableId,
      role: 'member',
    }),
  )
  const horseId = await owner.mutation(api.horses.add, {
    name: 'Maple',
    age: 8,
  })
  await owner.mutation(api.horseTransitions.connect, { horseId, stableId })
  return { t, owner, admin, stranger, horseId, stableId }
}
const eventInput = {
  title: 'Visit',
  type: 'vet' as const,
  date: '2026-10-20',
  time: '10:00',
}

describe('form persistence across personal and stable workspaces', () => {
  it('lets the advertised manager update a shared personal event and preserves its audience', async () => {
    const f = await setup()
    const id = await f.owner.mutation(api.events.add, {
      ...eventInput,
      horseIds: [f.horseId],
    })
    await f.owner.mutation(api.recordSharing.set, {
      horseId: f.horseId,
      recordId: id,
      enabled: true,
    })
    expect(
      (await f.admin.query(api.events.getPermissions, { id }))?.canManageEvent,
    ).toBe(true)
    await f.admin.mutation(api.events.update, {
      ...eventInput,
      id,
      horseIds: [f.horseId],
      title: 'Revised visit',
    })
    expect(await f.owner.query(api.events.get, { id })).toMatchObject({
      title: 'Revised visit',
    })
    expect(
      (
        await f.owner.query(api.recordSharing.audience, {
          horseId: f.horseId,
          recordId: id,
        })
      ).shared,
    ).toBe(true)
    await f.owner.mutation(api.recordSharing.set, {
      horseId: f.horseId,
      recordId: id,
      enabled: false,
    })
    await expect(
      f.admin.mutation(api.events.update, {
        ...eventInput,
        id,
        horseIds: [f.horseId],
      }),
    ).rejects.toThrow()
  })

  it('clears optional participation fields after a form omits an empty numeric cost', async () => {
    const f = await setup()
    const eventId = await f.owner.mutation(api.events.add, {
      ...eventInput,
      horseIds: [f.horseId],
    })
    const rows = await f.owner.query(api.eventHorseDetails.listForEvent, {
      eventId,
    })
    const id = rows.rows[0].eventHorse._id
    await f.owner.mutation(api.eventHorseDetails.update, {
      id,
      requestedServiceNotes: 'Before',
      completionNotes: 'After',
      costShare: 120,
    })
    // Convex's wire format omits undefined object properties.
    await f.owner.mutation(api.eventHorseDetails.update, {
      id,
      requestedServiceNotes: '',
      completionNotes: '',
    })
    const saved = (
      await f.owner.query(api.eventHorseDetails.listForEvent, { eventId })
    ).rows[0].eventHorse
    expect(saved.requestedServiceNotes).toBeUndefined()
    expect(saved.completionNotes).toBeUndefined()
    expect(saved.costShare).toBeUndefined()
  })

  it('keeps unclaimed-horse records visible in the stable when the fixed audience is shared', async () => {
    const f = await setup()
    const horseId = await f.admin.mutation(
      api.horseCollaboration.addUnclaimed,
      { stableId: f.stableId, name: 'Unclaimed', age: 5 },
    )
    expect(
      (
        await f.admin.query(api.recordSharing.creationAudience, {
          horseIds: [horseId],
        })
      )[0].fixed,
    ).toBe(true)
    const id = await f.admin.mutation(api.horseHealthIssues.add, {
      horseId,
      title: 'Observation',
      shareWithStable: false,
    })
    expect(
      (
        await f.admin.query(api.horseHealthIssues.listForHorse, {
          horseId,
          stableId: f.stableId,
        })
      ).map((row) => row._id),
    ).toContain(id)
  })
})

it('clears optional horse selections and dates through the same payload used by the profile form', async () => {
  const f = await setup()
  await f.owner.mutation(api.horses.update, {
    id: f.horseId,
    name: 'Maple',
    ownerName: '',
    age: 8,
    sex: 'mare',
    shoeingStatus: 'full_set',
    dateOfBirth: '2018',
    vetName: 'Vet',
    allergies: ['Dust'],
  })
  await f.owner.mutation(api.horses.update, {
    id: f.horseId,
    name: 'Maple',
    ownerName: '',
    age: 9,
    vetName: '',
    allergies: [],
  })
  const horse = await f.owner.query(api.horses.get, { id: f.horseId })
  for (const key of ['sex', 'shoeingStatus', 'dateOfBirth', 'vetName'] as const)
    expect(horse?.[key], key).toBeUndefined()
  expect(horse?.age).toBe(9)
  expect(horse?.allergies).toEqual([])
})

const careCases = [
  {
    name: 'health issue',
    add: api.horseHealthIssues.add,
    list: api.horseHealthIssues.listForHorse,
    remove: api.horseHealthIssues.remove,
    input: { title: 'Observation' },
  },
  {
    name: 'medication',
    add: api.horseMedicationRecords.add,
    list: api.horseMedicationRecords.listForHorse,
    remove: api.horseMedicationRecords.remove,
    input: {
      medicationName: 'Medicine',
      dosage: '10 ml',
      startDate: '2026-01-01',
      status: 'active',
    },
  },
  {
    name: 'weight',
    add: api.horseWeightRecords.add,
    list: api.horseWeightRecords.listForHorse,
    remove: api.horseWeightRecords.remove,
    input: { weight: 500, unit: 'kg', measuredAt: Date.UTC(2026, 0, 1) },
  },
  {
    name: 'nutrition',
    add: api.horseNutritionLogs.add,
    list: api.horseNutritionLogs.listForHorse,
    remove: api.horseNutritionLogs.remove,
    input: { summary: 'More hay', changedAt: Date.UTC(2026, 0, 1) },
  },
] as const

// Each row executes real Convex mutations, authorization and persisted queries.
// Keep the dynamic API union at this table boundary; the cases above retain literal inputs.
it.each(careCases)(
  '$name: retries, sharing, revocation and deletion agree with advertised permissions',
  async ({ add, list, remove, input }) => {
    const f = await setup()
    const args = { ...input, horseId: f.horseId, requestId: 'first-write' }
    const createRecord: FunctionReference<
      'mutation',
      'public',
      FunctionArgs<typeof add>,
      FunctionReturnType<typeof add>
    > = add
    const id = await f.owner.mutation(createRecord, args)
    const deleteRecord: FunctionReference<
      'mutation',
      'public',
      { id: typeof id },
      null
    > = remove
    expect(await f.owner.mutation(createRecord, args)).toBe(id)
    expect(await f.admin.query(list, { horseId: f.horseId })).toEqual([])
    await expect(f.admin.mutation(deleteRecord, { id })).rejects.toThrow()
    await expect(f.stranger.mutation(createRecord, args)).rejects.toThrow()
    await f.owner.mutation(api.recordSharing.set, {
      horseId: f.horseId,
      recordId: id,
      enabled: true,
    })
    expect(
      await f.admin.query(list, { horseId: f.horseId, stableId: f.stableId }),
    ).toMatchObject([{ _id: id, canEdit: true }])
    const next = await f.owner.mutation(createRecord, {
      ...args,
      requestId: 'second-write',
    })
    expect(next).not.toBe(id)
    await f.owner.mutation(api.recordSharing.set, {
      horseId: f.horseId,
      recordId: id,
      enabled: false,
    })
    await expect(f.admin.mutation(deleteRecord, { id })).rejects.toThrow()
    expect(
      (await f.owner.query(list, { horseId: f.horseId })).map((row) => row._id),
    ).toContain(id)
    await f.owner.mutation(deleteRecord, { id })
    expect(
      (await f.owner.query(list, { horseId: f.horseId })).map((row) => row._id),
    ).toEqual([next])
  },
)

it('preserves a shared reminder across edit, completion, follow-up and reopen from either workspace', async () => {
  const f = await setup()
  const input = {
    horseId: f.horseId,
    title: 'Care',
    category: 'other' as const,
    dueDate: '2026-10-20',
    shareWithStable: true,
    requestId: 'task',
  }
  const id = await f.owner.mutation(api.careReminders.add, input)
  expect(await f.owner.mutation(api.careReminders.add, input)).toBe(id)
  await f.admin.mutation(api.careReminders.update, {
    id,
    horseId: f.horseId,
    title: 'Revised care',
    category: 'other',
    dueDate: '2026-10-21',
  })
  const followUp = await f.admin.mutation(api.careReminders.complete, {
    id,
    nextDueDate: '2026-11-20',
  })
  expect(
    await f.admin.mutation(api.careReminders.complete, {
      id,
      nextDueDate: '2026-11-20',
    }),
  ).toBe(followUp)
  expect(
    (
      await f.owner.query(api.careReminders.listForHorse, {
        horseId: f.horseId,
      })
    ).reminders,
  ).toHaveLength(2)
  await f.owner.mutation(api.careReminders.reopen, { id })
  const rows = (
    await f.admin.query(api.careReminders.listForHorse, {
      horseId: f.horseId,
      stableId: f.stableId,
    })
  ).reminders
  expect(rows.find((row) => row._id === id)).toMatchObject({
    title: 'Revised care',
    status: 'pending',
  })
  expect(rows.find((row) => row._id === followUp)).toMatchObject({
    dueDate: '2026-11-20',
  })
})

it('cannot add an inaccessible horse while editing an otherwise shared personal event', async () => {
  const f = await setup()
  const id = await f.owner.mutation(api.events.add, {
    ...eventInput,
    horseIds: [f.horseId],
  })
  await f.owner.mutation(api.recordSharing.set, {
    horseId: f.horseId,
    recordId: id,
    enabled: true,
  })
  const otherHorse = await f.stranger.mutation(api.horses.add, {
    name: 'Private horse',
    age: 5,
  })
  await expect(
    f.admin.mutation(api.events.update, {
      ...eventInput,
      id,
      horseIds: [f.horseId, otherHorse],
    }),
  ).rejects.toThrow()
  expect((await f.owner.query(api.events.get, { id }))?.horseIds).toEqual([
    f.horseId,
  ])
})

it('allows a personal editor without stable membership to save an existing stable-origin event', async () => {
  const f = await setup()
  const editorId = (await f.stranger.query(api.users.getCurrentUser, {}))!._id
  const ownerId = (await f.owner.query(api.users.getCurrentUser, {}))!._id
  await f.t.run((ctx) =>
    ctx.db.insert('horseCarers', {
      horseId: f.horseId,
      userId: editorId,
      role: 'editor',
      invitedBy: ownerId,
      createdAt: Date.now(),
    }),
  )
  const id = await f.admin.mutation(api.events.add, {
    ...eventInput,
    stableId: f.stableId,
    horseIds: [f.horseId],
  })
  expect(
    (await f.stranger.query(api.events.getPermissions, { id }))?.canManageEvent,
  ).toBe(true)
  await f.stranger.mutation(api.events.update, {
    ...eventInput,
    id,
    stableId: f.stableId,
    horseIds: [f.horseId],
    title: 'Carer update',
  })
  expect((await f.owner.query(api.events.get, { id }))?.title).toBe(
    'Carer update',
  )
})
