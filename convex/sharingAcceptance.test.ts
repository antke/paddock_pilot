import { convexTest } from 'convex-test'
import { afterEach, expect, it, vi } from 'vitest'
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
const session = {
  title: 'Schooling',
  type: 'training' as const,
  date: '2026-01-05',
  time: '10:00',
  training: { activities: ['flatwork' as const], format: 'regular' as const },
}

it('creates personally, completes and reopens the same canonical result across views', async () => {
  const f = await fixture()
  const eventId = await f.owner.mutation(api.events.add, {
    ...session,
    horseIds: [f.horseId],
  })
  for (const horseId of [f.horseId]) {
    await f.owner.mutation(api.recordSharing.set, {
      horseId,
      recordId: eventId,
      enabled: true,
    })
  }
  expect(
    (
      await f.admin.query(api.training.listForStable, { stableId: f.stableId })
    ).events.map((e) => e._id),
  ).toEqual([eventId])
  await f.admin.mutation(api.training.saveRecord, {
    eventId,
    horseId: f.horseId,
    date: session.date,
    status: 'completed',
    details: session.training,
    outcome: 'Balanced',
  })
  const before = (
    await f.owner.query(api.training.listForHorse, { horseId: f.horseId })
  ).records[0]
  await f.owner.mutation(api.training.setStatus, {
    eventId,
    horseId: f.horseId,
    date: session.date,
    status: 'planned',
  })
  const after = (
    await f.admin.query(api.training.listForStable, { stableId: f.stableId })
  ).records[0]
  expect(after).toMatchObject({
    _id: before._id,
    status: 'planned',
    outcome: 'Balanced',
  })
  await expect(
    f.member.mutation(api.training.setStatus, {
      eventId,
      horseId: f.horseId,
      date: session.date,
      status: 'completed',
    }),
  ).rejects.toThrow()
})

it('blocks private activity discovery and completion by the stable administrator', async () => {
  const f = await fixture()
  const eventId = await f.owner.mutation(api.events.add, {
    ...session,
    horseIds: [f.horseId],
    shareWithStable: false,
  })
  expect(
    (await f.admin.query(api.training.listForStable, { stableId: f.stableId }))
      .events,
  ).toEqual([])
  await expect(f.admin.query(api.events.get, { id: eventId })).rejects.toThrow()
  await expect(
    f.admin.query(api.events.getWithHorses, {
      id: eventId,
      horseId: f.horseId,
    }),
  ).rejects.toThrow()
  await expect(
    f.admin.mutation(api.training.setStatus, {
      eventId,
      horseId: f.horseId,
      date: session.date,
      status: 'completed',
    }),
  ).rejects.toThrow()
  await f.owner.mutation(api.recordSharing.set, {
    horseId: f.horseId,
    recordId: eventId,
    enabled: true,
  })
  expect((await f.admin.query(api.events.get, { id: eventId }))?._id).toBe(
    eventId,
  )
  await f.owner.mutation(api.recordSharing.set, {
    horseId: f.horseId,
    recordId: eventId,
    enabled: false,
  })
  await expect(f.admin.query(api.events.get, { id: eventId })).rejects.toThrow()
})

it('enforces care sharing on lists, aggregates and edits without losing the record', async () => {
  const f = await fixture()
  const id = await f.owner.mutation(api.horseHealthIssues.add, {
    horseId: f.horseId,
    title: 'Private condition',
    shareWithStable: false,
  })
  expect(
    await f.admin.query(api.horseHealthIssues.listForHorse, {
      horseId: f.horseId,
    }),
  ).toEqual([])
  expect(
    (
      await f.admin.query(api.horseCareSummary.getForHorse, {
        horseId: f.horseId,
      })
    ).activeHealthIssues,
  ).toEqual([])
  await expect(
    f.admin.mutation(api.horseHealthIssues.resolve, { id }),
  ).rejects.toThrow()
  await f.owner.mutation(api.recordSharing.set, {
    horseId: f.horseId,
    recordId: id,
    enabled: true,
  })
  await f.admin.mutation(api.horseHealthIssues.resolve, { id })
  await f.owner.mutation(api.recordSharing.set, {
    horseId: f.horseId,
    recordId: id,
    enabled: false,
  })
  expect(
    await f.admin.query(api.horseHealthIssues.listForHorse, {
      horseId: f.horseId,
    }),
  ).toEqual([])
  expect(
    (
      await f.owner.query(api.horseHealthIssues.listForHorse, {
        horseId: f.horseId,
      })
    )[0],
  ).toMatchObject({ _id: id, status: 'resolved' })
})

it('keeps a private occurrence out of shared calendars and exposes only status to members', async () => {
  const f = await fixture()
  const eventId = await f.owner.mutation(api.events.add, {
    ...session,
    horseIds: [f.horseId],
    recurrence: { frequency: 'daily', interval: 1 },
  })
  for (const horseId of [f.horseId]) {
    await f.owner.mutation(api.recordSharing.set, {
      horseId,
      recordId: eventId,
      enabled: true,
    })
  }
  await f.owner.mutation(api.recordSharing.set, {
    horseId: f.horseId,
    recordId: eventId,
    enabled: false,
    occurrenceDate: '2026-01-06',
  })
  await f.owner.mutation(api.training.saveRecord, {
    eventId,
    horseId: f.horseId,
    date: '2026-01-06',
    status: 'completed',
    details: session.training,
    outcome: 'Private result',
  })
  await f.owner.mutation(api.training.saveRecord, {
    eventId,
    horseId: f.horseId,
    date: '2026-01-05',
    status: 'completed',
    details: { ...session.training, focus: 'Protected detail' },
    outcome: 'Protected result',
  })
  const member = await f.member.query(api.training.listForStable, {
    stableId: f.stableId,
  })
  expect(member.records).toHaveLength(1)
  expect(member.records[0]).toMatchObject({
    status: 'completed',
    canEdit: false,
  })
  expect(member.records[0].outcome).toBeUndefined()
  expect(member.records[0].details.focus).toBeUndefined()
  const { createEventOccurrences } =
    await import('../shared/events/eventOccurrences')
  expect(
    createEventOccurrences({
      events: member.events,
      windowStart: '2026-01-05',
      windowEnd: '2026-01-07',
    }).map((o) => o.startDate),
  ).toEqual(['2026-01-05', '2026-01-07'])
  await expect(
    f.admin.mutation(api.training.setStatus, {
      eventId,
      horseId: f.horseId,
      date: '2026-01-06',
      status: 'planned',
    }),
  ).rejects.toThrow()
  await f.owner.mutation(api.recordSharing.set, {
    horseId: f.horseId,
    recordId: eventId,
    enabled: true,
    occurrenceDate: '2026-01-07',
  })
  await f.owner.mutation(api.recordSharing.set, {
    horseId: f.horseId,
    recordId: eventId,
    enabled: false,
  })
  const withdrawn = await f.member.query(api.training.listForStable, {
    stableId: f.stableId,
  })
  expect(withdrawn.events).toHaveLength(0)
  expect(withdrawn.records).toHaveLength(0)
  expect(
    (await f.owner.query(api.training.listForHorse, { horseId: f.horseId }))
      .records,
  ).toHaveLength(2)
})

it('replays creation by request key while allowing intentionally similar sessions', async () => {
  const f = await fixture()
  const input = {
    ...session,
    horseIds: [f.horseId],
    requestId: 'first-request',
  }
  const id = await f.owner.mutation(api.events.add, input)
  expect(await f.owner.mutation(api.events.add, input)).toBe(id)
  expect(
    await f.owner.mutation(api.events.add, {
      ...input,
      requestId: 'second-request',
    }),
  ).not.toBe(id)
  expect(
    (await f.owner.query(api.training.listForHorse, { horseId: f.horseId }))
      .events,
  ).toHaveLength(2)
})

afterEach(() => vi.useRealTimers())
it('shares selected existing history resumably without publishing future occurrences or excluded care', async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-24T12:00:00Z'))
  const f = await fixture()
  const horseId = await f.owner.mutation(api.horses.add, {
    name: 'Juniper',
    age: 9,
  })
  const eventId = await f.owner.mutation(api.events.add, {
    ...session,
    horseIds: [horseId],
    recurrence: { frequency: 'daily', interval: 1 },
    status: 'completed',
  })
  await f.owner.mutation(api.horseHealthIssues.add, {
    horseId,
    title: 'Excluded care',
  })
  vi.advanceTimersByTime(1000)
  const preview = await f.owner.query(api.historySharing.preview, { horseId })
  expect(preview.counts.training).toBe(1)
  const input = {
    horseId,
    stableId: f.stableId,
    categories: ['training' as const],
    cutoff: preview.cutoff,
    requestId: 'history-join',
  }
  const jobId = await f.owner.mutation(api.historySharing.start, input)
  expect(await f.owner.mutation(api.historySharing.start, input)).toBe(jobId)
  await f.t.finishAllScheduledFunctions(vi.runAllTimers)
  expect(
    (await f.owner.query(api.historySharing.jobsForHorse, { horseId }))[0],
  ).toMatchObject({ status: 'complete', processed: 1 })
  expect(
    await f.admin.query(api.horseHealthIssues.listForHorse, { horseId }),
  ).toEqual([])
  const stable = await f.admin.query(api.training.listForStable, {
    stableId: f.stableId,
  })
  expect(stable.events.map((event) => event._id)).toContain(eventId)
  const { createEventOccurrences } =
    await import('../shared/events/eventOccurrences')
  expect(
    createEventOccurrences({
      events: stable.events,
      windowStart: '2026-10-24',
      windowEnd: '2026-10-25',
    }).map((item) => item.startDate),
  ).toEqual(['2026-10-24'])
  expect(
    (await f.owner.query(api.training.listForHorse, { horseId })).records[0]
      .eventId,
  ).toBe(eventId)
})

it('forces staff creations shared while withholding private care profiles until explicitly granted', async () => {
  const f = await fixture()
  await f.owner.mutation(api.horses.update, {
    id: f.horseId,
    name: 'Maple',
    ownerName: '',
    age: 8,
    allergies: ['Dust'],
    emergencyNotes: 'Call owner',
    vetPhone: 'private-contact',
  })
  expect(
    (await f.admin.query(api.horses.get, { id: f.horseId }))?.allergies,
  ).toBeUndefined()
  const id = await f.admin.mutation(api.horseHealthIssues.add, {
    horseId: f.horseId,
    title: 'Staff observation',
    shareWithStable: false,
  })
  expect(
    (
      await f.owner.query(api.horseHealthIssues.listForHorse, {
        horseId: f.horseId,
      })
    )[0]._id,
  ).toBe(id)
  expect(
    (
      await f.admin.query(api.horseHealthIssues.listForHorse, {
        horseId: f.horseId,
      })
    )[0]._id,
  ).toBe(id)
  await f.owner.mutation(api.recordSharing.set, {
    horseId: f.horseId,
    recordId: f.horseId,
    enabled: true,
  })
  expect(await f.admin.query(api.horses.get, { id: f.horseId })).toMatchObject({
    allergies: ['Dust'],
    emergencyNotes: 'Call owner',
  })
  expect(
    (await f.admin.query(api.horses.get, { id: f.horseId }))?.vetPhone,
  ).toBeUndefined()
  expect(
    (await f.member.query(api.horses.list, { stableId: f.stableId }))[0]
      .allergies,
  ).toBeUndefined()
})

it('isolates participants and group details between destinations', async () => {
  const f = await fixture()
  const secondAdmin = f.t.withIdentity({
    subject: 'second-admin',
    email: 'second@example.test',
  })
  await secondAdmin.mutation(api.users.ensureCurrentUser, {})
  const secondStable = await secondAdmin.mutation(api.stables.add, {
    name: 'Cedar',
    location: 'Warsaw',
  })
  const ownerId = (await f.owner.query(api.users.getCurrentUser, {}))!._id
  await f.t.run((ctx) =>
    ctx.db.insert('stableMembers', {
      userId: ownerId,
      stableId: secondStable,
      role: 'member',
    }),
  )
  const secondHorse = await f.owner.mutation(api.horses.add, {
    name: 'Birch',
    age: 5,
  })
  await f.owner.mutation(api.horseTransitions.connect, {
    horseId: secondHorse,
    stableId: secondStable,
  })
  const eventId = await f.owner.mutation(api.events.add, {
    ...session,
    horseIds: [f.horseId, secondHorse],
    description: 'Private group context',
  })
  for (const horseId of [f.horseId, secondHorse]) {
    await f.owner.mutation(api.recordSharing.set, {
      horseId,
      recordId: eventId,
      enabled: true,
    })
  }
  for (const [actor, stableId, horseId] of [
    [f.admin, f.stableId, f.horseId],
    [secondAdmin, secondStable, secondHorse],
  ] as const) {
    const data = await actor.query(api.training.listForStable, { stableId })
    expect(data.events[0]).toMatchObject({ _id: eventId, horseIds: [horseId] })
    expect(data.events[0].description).toBeUndefined()
    const detail = await actor.query(api.events.getWithHorses, { id: eventId })
    expect(detail!.horses.map((h) => h._id)).toEqual([horseId])
  }
  await f.owner.mutation(api.recordSharing.set, {
    horseId: f.horseId,
    recordId: eventId,
    enabled: false,
  })
  expect(
    (await f.admin.query(api.training.listForStable, { stableId: f.stableId }))
      .events,
  ).toEqual([])
  expect(
    (
      await secondAdmin.query(api.training.listForStable, {
        stableId: secondStable,
      })
    ).events,
  ).toHaveLength(1)
})

it('can explicitly share frozen participation history after departure without reviving its future series', async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-24T12:00:00Z'))
  const f = await fixture()
  const eventId = await f.admin.mutation(api.events.add, {
    ...session,
    stableId: f.stableId,
    horseIds: [f.horseId],
    recurrence: { frequency: 'daily', interval: 1 },
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
  await f.owner.mutation(api.horseTransitions.connect, {
    horseId: f.horseId,
    stableId: f.stableId,
  })
  expect(
    (await f.admin.query(api.training.listForStable, { stableId: f.stableId }))
      .events,
  ).toEqual([])
  await f.owner.mutation(api.recordSharing.set, {
    horseId: f.horseId,
    recordId: eventId,
    enabled: true,
  })
  const shared = await f.admin.query(api.training.listForStable, {
    stableId: f.stableId,
  })
  expect(shared.events).toHaveLength(1)
  const { createEventOccurrences } =
    await import('../shared/events/eventOccurrences')
  expect(
    createEventOccurrences({
      events: shared.events,
      windowStart: '2026-10-23',
      windowEnd: '2026-10-25',
    }).map((e) => e.startDate),
  ).toEqual(['2026-10-23', '2026-10-24'])
})
