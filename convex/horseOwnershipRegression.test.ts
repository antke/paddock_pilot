import { afterEach, expect, it, vi } from 'vitest'
import { convexTest } from 'convex-test'
import schema from './schema'
import { api } from './_generated/api'

const modules = import.meta.glob('./**/*.ts')
afterEach(() => vi.useRealTimers())
async function fixture() {
  vi.useFakeTimers()
  const t = convexTest(schema, modules)
  const client = (name: string) =>
    t.withIdentity({
      subject: name,
      email: `${name}@example.com`,
      emailVerified: true,
    })
  const admin = client('admin'),
    owner = client('owner'),
    recipient = client('recipient')
  for (const user of [admin, owner, recipient])
    await user.mutation(api.users.ensureCurrentUser, {})
  const ownerId = (await owner.query(api.users.getCurrentUser))!._id
  const stableId = await admin.mutation(api.stables.add, {
    name: 'Willow',
    location: 'Warsaw',
  })
  await t.run((ctx) =>
    ctx.db.insert('stableMembers', {
      stableId,
      userId: ownerId,
      role: 'member',
    }),
  )
  const horseId = await owner.mutation(api.horses.add, {
    name: 'Juniper',
    age: 8,
  })
  await owner.mutation(api.horseTransitions.connect, { horseId, stableId })
  return { t, admin, owner, recipient, horseId, stableId }
}

it('returns each training horse and record once after departure and rejoining', async () => {
  const f = await fixture()
  vi.setSystemTime(new Date('2026-10-09T12:00:00Z'))
  const details = {
    activities: ['flatwork' as const],
    format: 'regular' as const,
  }
  const input = {
    stableId: f.stableId,
    horseIds: [f.horseId],
    title: 'Daily schooling',
    date: '2026-10-01',
    time: '10:00',
    type: 'training' as const,
    training: details,
    recurrence: { frequency: 'daily' as const, interval: 1 },
  }
  const eventId = await f.admin.mutation(api.events.add, input)
  await f.owner.mutation(api.training.saveRecord, {
    eventId,
    horseId: f.horseId,
    date: '2026-10-08',
    status: 'completed',
    details,
  })
  const before = await f.owner.query(api.events.getWithHorses, { id: eventId })
  const participationId = before!.eventHorses[0]._id
  const preview = await f.owner.query(api.horseTransitions.preview, {
    horseId: f.horseId,
  })
  await f.owner.mutation(api.horseTransitions.depart, {
    horseId: f.horseId,
    revision: preview.revision,
    carryReminderIds: [],
  })
  await f.t.finishAllScheduledFunctions(vi.runAllTimers)
  await f.owner.mutation(api.horseTransitions.connect, {
    horseId: f.horseId,
    stableId: f.stableId,
  })
  await f.admin.mutation(api.events.update, { ...input, id: eventId })

  for (const context of [
    {},
    { horseId: f.horseId },
    { horseId: f.horseId, participationId },
  ]) {
    const data = await f.admin.query(api.training.listForEvent, {
      eventId,
      ...context,
    })
    expect(data.horses).toHaveLength(1)
    expect(data.records).toHaveLength(1)
    expect(data.horses[0].canRecord).toBe(!('participationId' in context))
  }
})

it('does not reveal shared provider phone numbers through a horse-specific event view', async () => {
  const f = await fixture()
  const eventId = await f.admin.mutation(api.events.add, {
    stableId: f.stableId,
    horseIds: [f.horseId],
    title: 'Vet visit',
    type: 'vet',
    date: '2026-01-02',
    time: '10:00',
    providerPhone: '+48123456789',
  })
  const shared = await f.owner.query(api.events.getWithHorses, { id: eventId })
  expect(shared!.event.providerPhone).toBeUndefined()
  const detail = await f.owner.query(api.events.getWithHorses, {
    id: eventId,
    horseId: f.horseId,
  })
  expect(detail!.event.providerPhone).toBeUndefined()
  const history = await f.owner.query(api.events.listForHorse, {
    horseId: f.horseId,
  })
  expect(history[0].providerPhone).toBeUndefined()
  const adminView = await f.admin.query(api.events.getWithHorses, {
    id: eventId,
  })
  expect(adminView!.event.providerPhone).toBe('+48123456789')
})

it('revoked transfer invitations must not return newly added horse tasks', async () => {
  const f = await fixture()
  const id = await f.owner.mutation(api.horseCollaboration.invite, {
    horseId: f.horseId,
    kind: 'transfer',
    email: 'recipient@example.com',
  })
  const invite = (await f.t.run((ctx) => ctx.db.get(id)))!
  await f.owner.mutation(api.horseCollaboration.revokeInvitation, { id })
  await f.admin.mutation(api.careReminders.add, {
    horseId: f.horseId,
    stableId: f.stableId,
    title: 'Private task added after revocation',
    category: 'farrier',
    dueDate: '2027-01-01',
  })
  const result = await f.recipient.query(api.horseCollaboration.invitation, {
    token: invite.token,
  })
  expect(result).toBeNull()
})

it('stable admins must not overwrite owner-authored training outcomes', async () => {
  const f = await fixture()
  const details = { activities: ['other' as const], format: 'regular' as const }
  const eventId = await f.admin.mutation(api.events.add, {
    stableId: f.stableId,
    horseIds: [f.horseId],
    title: 'Lesson',
    date: '2026-01-02',
    time: '10:00',
    type: 'training',
    training: details,
  })
  const args = {
    eventId,
    horseId: f.horseId,
    date: '2026-01-02',
    status: 'completed' as const,
    details,
  }
  await f.owner.mutation(api.training.saveRecord, {
    ...args,
    outcome: 'Owner private outcome',
  })
  await expect(
    f.admin.mutation(api.training.saveRecord, {
      ...args,
      outcome: 'Admin overwrite',
    }),
  ).rejects.toThrow()
  await f.owner.mutation(api.training.saveRecord, {
    ...args,
    outcome: 'Owner correction',
  })
  const calendar = await f.owner.query(api.training.listForStable, {
    stableId: f.stableId,
  })
  expect(calendar.records).toMatchObject([{ outcome: 'Owner correction' }])
  expect(calendar.records[0].stableId).toBeUndefined()
  const adminCalendar = await f.admin.query(api.training.listForStable, {
    stableId: f.stableId,
  })
  expect(adminCalendar.records[0].canEdit).toBe(false)
  const preview = await f.owner.query(api.horseTransitions.preview, {
    horseId: f.horseId,
  })
  await f.owner.mutation(api.horseTransitions.depart, {
    horseId: f.horseId,
    revision: preview.revision,
    carryReminderIds: [],
  })
  await f.t.finishAllScheduledFunctions(vi.runAllTimers)
  const snapshots = await f.admin.query(api.horseTransitions.stableHistory, {
    stableId: f.stableId,
    paginationOpts: { numItems: 100, cursor: null },
  })
  expect(
    snapshots.page.filter((row) => row.kind === 'trainingRecords'),
  ).toHaveLength(0)
})

it('owners can withdraw their stabled horse from a personal event', async () => {
  const f = await fixture()
  const eventId = await f.owner.mutation(api.events.add, {
    horseIds: [f.horseId],
    title: 'Home visit',
    date: '2027-01-02',
    time: '10:00',
    type: 'vet',
  })
  const data = (await f.owner.query(api.events.getWithHorses, { id: eventId }))!
  expect(data.eventHorses[0].status).toBe('confirmed')
  await expect(
    f.owner.mutation(api.events.withdrawHorseFromEvent, {
      eventHorseId: data.eventHorses[0]._id,
    }),
  ).resolves.toBeDefined()
  expect((await f.t.run((ctx) => ctx.db.get(eventId)))!.horseIds).toEqual([])
})

it('shared event management must survive one departing horse', async () => {
  const f = await fixture()
  const otherHorse = await f.admin.mutation(api.horses.add, {
    name: 'Remaining horse',
    age: 9,
    stableId: f.stableId,
  })
  const eventId = await f.admin.mutation(api.events.add, {
    stableId: f.stableId,
    horseIds: [f.horseId, otherHorse],
    title: 'Shared visit',
    date: '2027-01-02',
    time: '10:00',
    type: 'vet',
  })
  const preview = await f.owner.query(api.horseTransitions.preview, {
    horseId: f.horseId,
  })
  await f.owner.mutation(api.horseTransitions.depart, {
    horseId: f.horseId,
    revision: preview.revision,
    carryReminderIds: [],
  })
  await f.t.finishAllScheduledFunctions(vi.runAllTimers)
  const data = (await f.admin.query(api.events.getWithHorses, { id: eventId }))!
  const permissions = (await f.admin.query(api.events.getPermissions, {
    id: eventId,
  }))!
  expect(data.event.horseIds).toContain(otherHorse)
  expect(permissions.canManageEvent).toBe(true)
  await f.admin.mutation(api.events.update, {
    id: eventId,
    stableId: f.stableId,
    horseIds: [otherHorse],
    title: 'Updated shared visit',
    date: '2027-01-03',
    time: '11:00',
    type: 'vet',
  })
  expect(
    (await f.admin.query(api.events.getWithHorses, { id: eventId }))!.event
      .title,
  ).toBe('Updated shared visit')
})

it.each(['expired', 'declined', 'owner changed', 'placement changed'])(
  '%s transfer invitations do not expose current horse data',
  async (reason) => {
    const f = await fixture()
    const id = await f.owner.mutation(api.horseCollaboration.invite, {
      horseId: f.horseId,
      kind: 'transfer',
      email: 'recipient@example.com',
    })
    const invite = (await f.t.run((ctx) => ctx.db.get(id)))!
    await f.t.run(async (ctx) => {
      if (reason === 'expired') await ctx.db.patch(id, { expiresAt: 1 })
      if (reason === 'declined') await ctx.db.patch(id, { status: 'declined' })
      if (reason === 'owner changed')
        await ctx.db.patch(f.horseId, { ownerId: undefined })
      if (reason === 'placement changed')
        await ctx.db.patch(f.horseId, { currentPlacementId: undefined })
    })
    expect(
      await f.recipient.query(api.horseCollaboration.invitation, {
        token: invite.token,
      }),
    ).toBeNull()
  },
)

it('accepted carer links stop revealing data when access is revoked', async () => {
  const f = await fixture()
  const id = await f.owner.mutation(api.horseCollaboration.invite, {
    horseId: f.horseId,
    kind: 'carer',
    role: 'viewer',
    email: 'recipient@example.com',
  })
  const invite = (await f.t.run((ctx) => ctx.db.get(id)))!
  await f.recipient.mutation(api.horseCollaboration.respond, {
    token: invite.token,
    accept: true,
  })
  expect(
    (
      await f.recipient.query(api.horseCollaboration.invitation, {
        token: invite.token,
      })
    )?.invitation.status,
  ).toBe('accepted')
  const management = await f.owner.query(api.horseCollaboration.management, {
    horseId: f.horseId,
  })
  await f.owner.mutation(api.horseCollaboration.updateCarer, {
    id: management.carers[0]._id,
  })
  expect(
    await f.recipient.query(api.horseCollaboration.invitation, {
      token: invite.token,
    }),
  ).toBeNull()
})

it('keeps a valid transfer readable while processing and after acceptance', async () => {
  const f = await fixture()
  const id = await f.owner.mutation(api.horseCollaboration.invite, {
    horseId: f.horseId,
    kind: 'transfer',
    email: 'recipient@example.com',
  })
  const invite = (await f.t.run((ctx) => ctx.db.get(id)))!
  const preview = (await f.recipient.query(api.horseCollaboration.invitation, {
    token: invite.token,
  }))!
  await f.recipient.mutation(api.horseCollaboration.respond, {
    token: invite.token,
    accept: true,
    departureRevision: preview.departure!.revision,
    carryReminderIds: [],
  })
  expect(
    (
      await f.recipient.query(api.horseCollaboration.invitation, {
        token: invite.token,
      })
    )?.processing,
  ).toBe(true)
  await f.t.finishAllScheduledFunctions(vi.runAllTimers)
  const accepted = (await f.recipient.query(api.horseCollaboration.invitation, {
    token: invite.token,
  }))!
  expect(accepted.invitation.status).toBe('accepted')
  expect(accepted.departure).toBeNull()
  expect(accepted.processing).toBe(false)
})

it('applies author provenance when creating an already completed lesson', async () => {
  const f = await fixture()
  const values = {
    stableId: f.stableId,
    horseIds: [f.horseId],
    title: 'Recorded lesson',
    date: '2026-01-02',
    time: '10:00',
    type: 'training' as const,
    status: 'completed' as const,
    training: { activities: ['other' as const], format: 'regular' as const },
  }
  const personalEvent = await f.owner.mutation(api.events.add, values)
  const stableEvent = await f.admin.mutation(api.events.add, values)
  const calendar = await f.admin.query(api.training.listForStable, {
    stableId: f.stableId,
  })
  const personalRecord = calendar.records.find(
    (record) => record.eventId === personalEvent,
  )!
  const stableRecord = calendar.records.find(
    (record) => record.eventId === stableEvent,
  )!
  expect(personalRecord.stableId).toBeUndefined()
  expect(personalRecord.canEdit).toBe(false)
  expect(stableRecord.stableId).toBe(f.stableId)
  expect(stableRecord.sourcePlacementId).toBeDefined()
  expect(stableRecord.canEdit).toBe(true)
})
