import { convexTest } from 'convex-test'
import { expect, it } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
async function fixture() {
  const t = convexTest(schema, modules)
  const owner = t.withIdentity({
    subject: 'owner',
    email: 'owner@example.test',
  })
  const admin = t.withIdentity({
    subject: 'admin',
    email: 'admin@example.test',
  })
  const member = t.withIdentity({
    subject: 'member',
    email: 'member@example.test',
  })
  for (const actor of [owner, admin, member])
    await actor.mutation(api.users.ensureCurrentUser, {})
  const ownerId = (await owner.query(api.users.getCurrentUser, {}))!._id
  const memberId = (await member.query(api.users.getCurrentUser, {}))!._id
  const stableId = await admin.mutation(api.stables.add, {
    name: 'Willow',
    location: 'Warsaw',
  })
  await t.run(async (ctx) => {
    for (const userId of [ownerId, memberId])
      await ctx.db.insert('stableMembers', { userId, stableId, role: 'member' })
  })
  const horseId = await owner.mutation(api.horses.add, {
    name: 'Maple',
    age: 8,
  })
  await owner.mutation(api.horseTransitions.connect, { horseId, stableId })
  return { t, owner, admin, member, horseId, stableId }
}

it('keeps Personal scoped to owned/carer horses even for a stable administrator', async () => {
  const f = await fixture()
  const otherEvent = await f.admin.mutation(api.events.add, {
    stableId: f.stableId,
    horseIds: [f.horseId],
    type: 'vet',
    title: 'Yard appointment',
    date: '2026-10-25',
    time: '10:00',
  })
  await f.admin.mutation(api.careReminders.add, {
    stableId: f.stableId,
    title: 'Yard task',
    category: 'other',
    dueDate: '2026-10-25',
  })
  expect(await f.admin.query(api.events.list, {})).toEqual([])
  expect(await f.admin.query(api.horses.calendarRoster, {})).toEqual([])
  const personal = await f.admin.query(api.userCareOverview.getForCurrentUser, {
    today: '2026-10-25',
  })
  expect(personal.summary.horseCount).toBe(0)
  expect(personal.dueReminders).toEqual([])
  expect(
    (
      await f.admin.query(api.events.listForStable, { stableId: f.stableId })
    ).map((e) => e._id),
  ).toContain(otherEvent)
  expect(
    (await f.owner.query(api.events.list, {})).map((e) => e._id),
  ).toContain(otherEvent)
  const adminId = (await f.admin.query(api.users.getCurrentUser, {}))!._id
  const ownerId = (await f.owner.query(api.users.getCurrentUser, {}))!._id
  await f.t.run((ctx) =>
    ctx.db.insert('horseCarers', {
      horseId: f.horseId,
      userId: adminId,
      role: 'viewer',
      invitedBy: ownerId,
      createdAt: Date.now(),
    }),
  )
  expect(
    (await f.admin.query(api.events.list, {})).map((e) => e._id),
  ).toContain(otherEvent)
})

it('defaults personal care to private and filters it from stable views even for its owner', async () => {
  const f = await fixture()
  const issueId = await f.owner.mutation(api.horseHealthIssues.add, {
    horseId: f.horseId,
    title: 'Private issue',
    severity: 'high',
  })
  expect(
    (
      await f.owner.query(api.horseHealthIssues.listForHorse, {
        horseId: f.horseId,
      })
    ).map((r) => r._id),
  ).toContain(issueId)
  expect(
    await f.owner.query(api.horseHealthIssues.listForHorse, {
      horseId: f.horseId,
      stableId: f.stableId,
    }),
  ).toEqual([])
  expect(
    (
      await f.owner.query(api.horseCareSummary.getForHorse, {
        horseId: f.horseId,
        stableId: f.stableId,
      })
    ).activeHealthIssues,
  ).toEqual([])
  expect(
    (
      await f.owner.query(api.horseTimeline.listForHorse, {
        horseId: f.horseId,
        stableId: f.stableId,
      })
    ).entries,
  ).toEqual([])
  const stable = await f.owner.query(api.userCareOverview.getForCurrentUser, {
    stableId: f.stableId,
    today: '2026-10-25',
  })
  expect(stable.summary.highSeverityIssueCount).toBe(0)
  await f.owner.mutation(api.recordSharing.set, {
    horseId: f.horseId,
    recordId: issueId,
    enabled: true,
  })
  expect(
    (
      await f.owner.query(api.horseHealthIssues.listForHorse, {
        horseId: f.horseId,
        stableId: f.stableId,
      })
    ).map((r) => r._id),
  ).toEqual([issueId])
  expect(
    (
      await f.admin.query(api.horseHealthIssues.listForHorse, {
        horseId: f.horseId,
        stableId: f.stableId,
      })
    ).map((r) => r._id),
  ).toEqual([issueId])
  await f.owner.query(api.horseHealthIssues.listForHorse, {
    horseId: f.horseId,
  })
  expect(
    (
      await f.owner.query(api.recordSharing.audience, {
        horseId: f.horseId,
        recordId: issueId,
      })
    ).shared,
  ).toBe(true)
})

it('keeps administrator-created care shared and rejects a mismatched stable scope', async () => {
  const f = await fixture()
  const issueId = await f.admin.mutation(api.horseHealthIssues.add, {
    horseId: f.horseId,
    title: 'Shared issue',
    shareWithStable: false,
  })
  expect(
    (
      await f.owner.query(api.recordSharing.audience, {
        horseId: f.horseId,
        recordId: issueId,
      })
    ).shared,
  ).toBe(true)
  const otherStable = await f.owner.mutation(api.stables.add, {
    name: 'Other',
    location: 'Warsaw',
  })
  await expect(
    f.owner.query(api.horseHealthIssues.listForHorse, {
      horseId: f.horseId,
      stableId: otherStable,
    }),
  ).rejects.toThrow('Horse is not in this stable')
})

it('uses sharing rather than creation origin for stable activity detail links', async () => {
  const f = await fixture()
  const id = await f.owner.mutation(api.events.add, {
    destination: 'personal',
    horseIds: [f.horseId],
    type: 'vet',
    title: 'Personal appointment',
    date: '2026-10-25',
    time: '10:00',
  })
  expect(
    await f.owner.query(api.events.getWithHorses, { id, stableId: f.stableId }),
  ).toBeNull()
  expect(
    await f.owner.query(api.events.listForHorse, {
      horseId: f.horseId,
      stableId: f.stableId,
    }),
  ).toEqual([])
  await f.owner.mutation(api.recordSharing.set, {
    horseId: f.horseId,
    recordId: id,
    enabled: true,
  })
  const detail = await f.owner.query(api.events.getWithHorses, {
    id,
    stableId: f.stableId,
  })
  expect(detail?.event._id).toBe(id)
  expect(detail?.event.stableId).toBeUndefined()
  expect(detail?.horses.map((h) => h._id)).toEqual([f.horseId])
  await f.owner.mutation(api.recordSharing.set, {
    horseId: f.horseId,
    recordId: id,
    enabled: false,
  })
  expect(
    await f.owner.query(api.events.getWithHorses, { id, stableId: f.stableId }),
  ).toBeNull()
  expect(
    (await f.owner.query(api.events.list, {})).map((e) => e._id),
  ).toContain(id)
})

it.each(['training', 'vet'] as const)(
  'lets a stable member open a shared %s from a horse-specific link without exposing private details',
  async (type) => {
    const f = await fixture()
    const eventId = await f.admin.mutation(api.events.add, {
      stableId: f.stableId,
      horseIds: [f.horseId],
      type,
      title: 'Shared appointment',
      date: '2026-10-25',
      time: '10:00',
      description: 'Private notes',
      totalCost: 100,
      ...(type === 'training'
        ? {
            training: {
              activities: ['flatwork' as const],
              format: 'regular' as const,
              focus: 'Private focus',
            },
          }
        : {}),
    })
    const row = (
      await f.owner.query(api.eventHorseDetails.listForEvent, { eventId })
    ).rows[0].eventHorse
    await f.owner.mutation(api.eventHorseDetails.update, {
      id: row._id,
      requestedServiceNotes: 'Private request',
      costShare: 50,
    })
    const detail = await f.member.query(api.events.getWithHorses, {
      id: eventId,
      horseId: f.horseId,
      participationId: row._id,
    })
    expect(detail?.event.title).toBe('Shared appointment')
    expect(detail?.event.description).toBeUndefined()
    expect(detail?.event.training).toBeUndefined()
    expect(detail?.eventHorses[0].costShare).toBeUndefined()
    expect(detail?.eventHorses[0].requestedServiceNotes).toBeUndefined()
    expect(
      (await f.member.query(api.events.getPermissions, { id: eventId }))
        ?.canManageEvent,
    ).toBe(false)
    expect(
      (await f.member.query(api.eventHorseDetails.listForEvent, { eventId }))
        .rows,
    ).toEqual([])
    await f.member.query(api.events.participationSummary, { eventId })
    await f.member.query(api.recordSharing.audience, {
      horseId: f.horseId,
      recordId: eventId,
      occurrenceDate: '2026-10-25',
    })
    if (type === 'training') {
      const training = await f.member.query(api.training.listForEvent, {
        eventId,
        horseId: f.horseId,
        participationId: row._id,
      })
      expect(training.events[0].training).toBeUndefined()
      expect(training.horses[0].canRecord).toBe(false)
    }
    await f.owner.mutation(api.recordSharing.set, {
      horseId: f.horseId,
      recordId: eventId,
      enabled: false,
    })
    await expect(
      f.member.query(api.events.getWithHorses, {
        id: eventId,
        horseId: f.horseId,
      }),
    ).rejects.toThrow()
  },
)

it('keeps grouped session visibility and atomic completion within the workspace and per-horse permissions', async () => {
  const f = await fixture()
  const second = await f.owner.mutation(api.horses.add, {
    name: 'Private horse',
    age: 8,
  })
  await f.owner.mutation(api.horseTransitions.connect, {
    horseId: second,
    stableId: f.stableId,
  })
  const date = '2026-10-25'
  const eventId = await f.owner.mutation(api.events.add, {
    destination: 'personal',
    horseIds: [f.horseId, second],
    type: 'training',
    title: 'One session',
    date,
    time: '10:00',
    training: { activities: ['flatwork'], format: 'regular' },
  })
  await f.owner.mutation(api.recordSharing.set, {
    horseId: f.horseId,
    recordId: eventId,
    enabled: true,
  })
  const personal = await f.owner.query(api.training.listForEvent, { eventId })
  expect(personal.horses).toHaveLength(2)
  for (const actor of [f.owner, f.admin, f.member]) {
    const stable = await actor.query(api.training.listForEvent, {
      eventId,
      stableId: f.stableId,
    })
    expect(stable.horses.map((h) => h._id)).toEqual([f.horseId])
    expect(stable.events[0].horseIds).toEqual([f.horseId])
  }
  const input = {
    eventId,
    horseIds: [f.horseId, second],
    date,
    status: 'completed' as const,
  }
  await expect(
    f.member.mutation(api.training.setSessionStatus, input),
  ).rejects.toThrow()
  // Even the personal owner cannot bulk-update a private horse through a stable-scoped action.
  await expect(
    f.owner.mutation(api.training.setSessionStatus, {
      ...input,
      stableId: f.stableId,
    }),
  ).rejects.toThrow()
  expect(
    await f.t.run((ctx) => ctx.db.query('trainingRecords').collect()),
  ).toEqual([])
  await f.owner.mutation(api.training.saveRecord, {
    eventId,
    horseId: f.horseId,
    date,
    status: 'planned',
    details: { activities: ['jumping'], format: 'lesson' },
    outcome: 'Keep these notes',
  })
  await f.owner.mutation(api.training.setSessionStatus, input)
  await f.owner.mutation(api.training.setSessionStatus, input)
  const records = await f.t.run((ctx) =>
    ctx.db.query('trainingRecords').collect(),
  )
  expect(records).toHaveLength(2)
  expect(records.every((r) => r.status === 'completed')).toBe(true)
  expect(records.find((r) => r.horseId === f.horseId)).toMatchObject({
    details: { activities: ['jumping'], format: 'lesson' },
    outcome: 'Keep these notes',
  })
  const member = await f.member.query(api.training.listForEvent, {
    eventId,
    stableId: f.stableId,
  })
  expect(member.horses.every((h) => !h.canRecord)).toBe(true)
  expect(member.records.every((r) => !r.canEdit && !r.outcome)).toBe(true)
})
