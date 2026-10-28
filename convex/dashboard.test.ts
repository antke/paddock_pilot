import { convexTest } from 'convex-test'
import { expect, it } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'
import { writeRecordShare } from './libs/recordSharing'

const modules = import.meta.glob('./**/*.ts')
const today = '2026-01-05'
async function fixture() {
  const t = convexTest(schema, modules)
  const viewer = t.withIdentity({
    subject: 'viewer',
    email: 'viewer@example.test',
  })
  const aOwner = t.withIdentity({ subject: 'a-owner', email: 'a@example.test' })
  const bOwner = t.withIdentity({ subject: 'b-owner', email: 'b@example.test' })
  for (const actor of [viewer, aOwner, bOwner])
    await actor.mutation(api.users.ensureCurrentUser, {})
  const viewerId = (await viewer.query(api.users.getCurrentUser, {}))!._id
  const aOwnerId = (await aOwner.query(api.users.getCurrentUser, {}))!._id
  const a = await aOwner.mutation(api.stables.add, {
    name: 'Stable A',
    location: 'Warsaw',
  })
  const b = await bOwner.mutation(api.stables.add, {
    name: 'Stable B',
    location: 'Warsaw',
  })
  await t.run(async (ctx) => {
    for (const stableId of [a, b])
      await ctx.db.insert('stableMembers', {
        userId: viewerId,
        stableId,
        role: 'member',
      })
  })
  const personalHorse = await viewer.mutation(api.horses.add, {
    name: 'Personal horse',
    age: 8,
  })
  await viewer.mutation(api.horseTransitions.connect, {
    horseId: personalHorse,
    stableId: a,
  })
  const horseA = await aOwner.mutation(api.horses.add, {
    name: 'Horse A',
    age: 8,
  })
  await aOwner.mutation(api.horseTransitions.connect, {
    horseId: horseA,
    stableId: a,
  })
  const horseB = await bOwner.mutation(api.horses.add, {
    name: 'Horse B',
    age: 8,
  })
  await bOwner.mutation(api.horseTransitions.connect, {
    horseId: horseB,
    stableId: b,
  })
  const personalEvent = await viewer.mutation(api.events.add, {
    horseIds: [personalHorse],
    type: 'vet',
    title: 'Personal visit',
    date: today,
    time: '09:00',
  })
  const eventA = await aOwner.mutation(api.events.add, {
    stableId: a,
    horseIds: [horseA],
    type: 'vet',
    title: 'Shared visit A',
    date: today,
    time: '10:00',
  })
  const eventB = await bOwner.mutation(api.events.add, {
    stableId: b,
    horseIds: [horseB],
    type: 'vet',
    title: 'Shared visit B',
    date: today,
    time: '11:00',
  })
  await aOwner.mutation(api.events.add, {
    horseIds: [horseA],
    type: 'vet',
    title: 'Secret visit A',
    date: today,
    time: '12:00',
  })
  const trainingA = await aOwner.mutation(api.events.add, {
    stableId: a,
    horseIds: [horseA],
    type: 'training',
    title: 'Shared lesson A',
    date: today,
    time: 'all-day',
    training: {
      activities: ['jumping'],
      format: 'lesson',
      focus: 'Secret training focus',
    },
  })
  await t.run(async (ctx) => {
    const now = Date.now()
    const addIssue = (horseId: typeof horseA, title: string) =>
      ctx.db.insert('horseHealthIssues', {
        horseId,
        title,
        severity: 'high',
        status: 'active',
        notedAt: now,
        createdBy: aOwnerId,
        createdAt: now,
        updatedAt: now,
      })
    await addIssue(personalHorse, 'Personal concern')
    const sharedIssue = await addIssue(horseA, 'Shared concern')
    await addIssue(horseA, 'Secret diagnosis')
    const horse = (await ctx.db.get(horseA))!
    const share = (recordId: string) =>
      writeRecordShare(ctx, {
        recordId,
        horseId: horseA,
        stableId: a,
        placementId: horse.currentPlacementId!,
        enabled: true,
        createdBy: aOwnerId,
      })
    await share(sharedIssue)
    await ctx.db.insert('careReminders', {
      stableId: a,
      title: 'Yard reminder A',
      dueDate: today,
      category: 'other',
      status: 'pending',
      createdBy: aOwnerId,
      createdAt: now,
      updatedAt: now,
    })
    const sharedReminder = await ctx.db.insert('careReminders', {
      stableId: a,
      horseId: horseA,
      title: 'Shared horse reminder A',
      dueDate: today,
      category: 'other',
      status: 'pending',
      createdBy: aOwnerId,
      createdAt: now,
      updatedAt: now,
    })
    await share(sharedReminder)
    await ctx.db.insert('careReminders', {
      horseId: horseA,
      title: 'Secret horse reminder',
      dueDate: today,
      category: 'other',
      status: 'pending',
      createdBy: aOwnerId,
      createdAt: now,
      updatedAt: now,
    })
    await ctx.db.patch(horseA, { allergies: ['Secret allergy'] })
  })
  return {
    t,
    viewer,
    aOwner,
    bOwner,
    viewerId,
    a,
    b,
    personalHorse,
    horseA,
    horseB,
    personalEvent,
    eventA,
    eventB,
    trainingA,
  }
}

it('adds selected stable data consistently while keeping personal data and counting horses once', async () => {
  const f = await fixture()
  const personal = await f.viewer.query(api.dashboard.view, {
    stableIds: [],
    today,
  })
  expect(personal.events.map((event) => event._id)).toEqual([f.personalEvent])
  expect(personal.horses.map((horse) => horse._id)).toEqual([f.personalHorse])
  expect(personal.overview.dueReminders).toEqual([])
  const combined = await f.viewer.query(api.dashboard.view, {
    stableIds: [f.a, f.b, f.a],
    today,
  })
  expect(new Set(combined.events.map((event) => event._id))).toEqual(
    new Set([f.personalEvent, f.eventA, f.eventB]),
  )
  expect(combined.training.events.map((event) => event._id)).toEqual([
    f.trainingA,
  ])
  expect(combined.overview.summary).toMatchObject({
    horseCount: 3,
    stableCount: 2,
    upcomingEventCount: 3,
    dueReminderCount: 2,
    highSeverityIssueCount: 1,
  })
  expect(
    combined.horses.filter((horse) => horse._id === f.personalHorse),
  ).toHaveLength(1)
  expect(combined.horses.find((horse) => horse._id === f.horseA)).toMatchObject(
    { personal: false, canRead: false, canRecord: false },
  )
  expect(
    combined.overview.dueReminders.find(
      (reminder) => reminder.title === 'Shared horse reminder A',
    ),
  ).toMatchObject({ stableId: f.a, canReadHorse: false })
  expect(JSON.stringify(combined)).not.toContain('Secret')
  const onlyB = await f.viewer.query(api.dashboard.view, {
    stableIds: [f.b],
    today,
  })
  expect(onlyB.events.map((event) => event._id).sort()).toEqual(
    [f.personalEvent, f.eventB].sort(),
  )
  expect(onlyB.overview.summary.dueReminderCount).toBe(0)
})

it('counts only shared clinical data for a stable administrator and does not duplicate reminders', async () => {
  const f = await fixture()
  await f.t.run((ctx) => ctx.db.patch(f.a, { ownerId: f.viewerId }))
  const result = await f.viewer.query(api.dashboard.view, {
    stableIds: [f.a],
    today,
  })
  expect(result.overview.summary).toMatchObject({
    highSeverityIssueCount: 2,
    dueReminderCount: 2,
  })
  expect(result.overview.stableSummaries[0]).toMatchObject({
    highSeverityIssueCount: 1,
    dueReminderCount: 2,
  })
  expect(
    result.overview.dueReminders.map((reminder) => reminder.title).sort(),
  ).toEqual(['Shared horse reminder A', 'Yard reminder A'])
  expect(JSON.stringify(result)).not.toContain('Secret diagnosis')
  expect(JSON.stringify(result)).not.toContain('Secret allergy')
})

it('deduplicates an activity shared through personal and two stable calendars', async () => {
  const f = await fixture()
  const eventId = await f.viewer.mutation(api.events.add, {
    sharedStableIds: [f.a, f.b],
    horseIds: [f.personalHorse],
    type: 'vet',
    title: 'One shared visit',
    date: today,
    time: '14:00',
  })
  const result = await f.viewer.query(api.dashboard.view, {
    stableIds: [f.a, f.b],
    today,
  })
  expect(result.events.filter((event) => event._id === eventId)).toHaveLength(1)
  expect(
    result.overview.upcomingEvents.filter((event) => event.id === eventId),
  ).toHaveLength(1)
})

it('rejects an inaccessible stable and revoked membership instead of trusting selected IDs', async () => {
  const f = await fixture()
  await expect(
    f.bOwner.query(api.dashboard.view, { stableIds: [f.a], today }),
  ).rejects.toThrow()
  await f.t.run(async (ctx) => {
    const member = await ctx.db
      .query('stableMembers')
      .withIndex('by_stable_id_user_id', (q) =>
        q.eq('stableId', f.a).eq('userId', f.viewerId),
      )
      .unique()
    await ctx.db.delete(member!._id)
  })
  await expect(
    f.viewer.query(api.dashboard.view, { stableIds: [f.a], today }),
  ).rejects.toThrow()
  expect(
    (
      await f.viewer.query(api.dashboard.view, { stableIds: [], today })
    ).events.map((event) => event._id),
  ).toContain(f.personalEvent)
})

it('includes an accepted rider’s session without adding a horse profile to their roster', async () => {
  const f = await fixture()
  const rider = f.t.withIdentity({
    subject: 'rider',
    email: 'rider@example.test',
  })
  await rider.mutation(api.users.ensureCurrentUser, {})
  const id = await f.aOwner.mutation(api.activityParticipants.invite, {
    eventId: f.trainingA,
    horseId: f.horseA,
    date: today,
    email: 'rider@example.test',
    role: 'rider',
  })
  await rider.mutation(api.activityParticipants.respond, { id, accept: true })
  const result = await rider.query(api.dashboard.view, { stableIds: [], today })
  expect(result.horses).toEqual([])
  expect(result.training.events.map((event) => event._id)).toEqual([
    f.trainingA,
  ])
  expect(result.training.horses[0].canRecord).toBe(false)
  expect(JSON.stringify(result)).not.toContain('Secret')
})
