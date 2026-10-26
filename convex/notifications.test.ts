import { convexTest } from 'convex-test'
import { expect, it } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'
import { enqueueEmail } from './libs/email/outbox'

const modules = import.meta.glob('./**/*.ts')

async function fixture() {
  const t = convexTest(schema, modules)
  const owner = t.withIdentity({ subject: 'owner', email: 'owner@test.com' })
  const recipient = t.withIdentity({
    subject: 'recipient',
    email: 'recipient@test.com',
  })
  const other = t.withIdentity({ subject: 'other', email: 'other@test.com' })
  for (const actor of [owner, recipient, other])
    await actor.mutation(api.users.ensureCurrentUser, {})
  const user = (await recipient.query(api.users.getCurrentUser, {}))!
  const horseId = await owner.mutation(api.horses.add, {
    name: 'Maple',
    age: 8,
  })
  await owner.mutation(api.horseCollaboration.invite, {
    horseId,
    kind: 'carer',
    role: 'viewer',
    email: user.email,
  })
  return { t, owner, recipient, other, user, horseId }
}

it('discovers addressed invitations and persists read status without accepting them', async () => {
  const f = await fixture()
  const items = await f.recipient.query(api.notifications.list, {})
  expect(items).toHaveLength(1)
  expect(items[0]).toMatchObject({
    kind: 'horse_carer',
    name: 'Maple',
    context: 'viewer',
    read: false,
    actionRequired: true,
  })
  expect(await f.other.query(api.notifications.list, {})).toEqual([])
  expect(await f.t.query(api.notifications.list, {})).toEqual([])
  await f.recipient.mutation(api.notifications.markRead, {
    keys: [items[0].key, items[0].key],
  })
  expect(
    (await f.recipient.query(api.notifications.list, {}))[0],
  ).toMatchObject({ read: true, actionRequired: true })
  expect(await f.t.run((ctx) => ctx.db.query('horseCarers').collect())).toEqual(
    [],
  )
  await f.other.mutation(api.notifications.markRead, { keys: [items[0].key] })
  expect(
    await f.t.run((ctx) => ctx.db.query('notificationReads').collect()),
  ).toHaveLength(1)
})

it('hides revoked, expired and stale horse invitations', async () => {
  const f = await fixture()
  const invite = (
    await f.t.run((ctx) => ctx.db.query('horseInvitations').collect())
  )[0]
  await f.t.run((ctx) =>
    ctx.db.patch(invite._id, { expiresAt: Date.now() - 1 }),
  )
  expect(await f.recipient.query(api.notifications.list, {})).toEqual([])
  await f.t.run((ctx) =>
    ctx.db.patch(invite._id, {
      expiresAt: Date.now() + 10000,
      status: 'revoked',
    }),
  )
  expect(await f.recipient.query(api.notifications.list, {})).toEqual([])
  await f.t.run(async (ctx) => {
    await ctx.db.patch(invite._id, { status: 'pending' })
    await ctx.db.patch(f.horseId, { ownerId: f.user._id })
  })
  expect(await f.recipient.query(api.notifications.list, {})).toEqual([])
})

it('finds invitations on verified secondary addresses but not unverified addresses', async () => {
  const f = await fixture()
  await f.t.run((ctx) =>
    ctx.db.patch(f.user._id, {
      email: 'primary@test.com',
      verifiedEmails: ['primary@test.com'],
    }),
  )
  expect(await f.recipient.query(api.notifications.list, {})).toEqual([])
  await f.t.run((ctx) =>
    ctx.db.patch(f.user._id, {
      verifiedEmails: ['primary@test.com', 'recipient@test.com'],
    }),
  )
  expect(await f.recipient.query(api.notifications.list, {})).toHaveLength(1)
})

it('keeps membership updates independent of email delivery and deduplicates them', async () => {
  const f = await fixture()
  const stableId = await f.owner.mutation(api.stables.add, {
    name: 'Oak',
    location: 'Warsaw',
  })
  await f.t.run(async (ctx) => {
    for (let i = 0; i < 2; i++)
      await enqueueEmail(ctx, {
        recipient: f.user.email,
        dedupeKey: 'removed-once',
        relation: { type: 'stable', id: stableId },
        template: { kind: 'stable_membership_removed', stableName: 'Oak' },
      })
  })
  const items = await f.recipient.query(api.notifications.list, {})
  expect(
    items.filter((item) => item.kind === 'stable_membership_removed'),
  ).toHaveLength(1)
  expect(
    items.find((item) => item.kind === 'stable_membership_removed'),
  ).toMatchObject({ name: 'Oak', read: false })
  expect(await f.other.query(api.notifications.list, {})).toEqual([])
})

it('rechecks event access before returning an update', async () => {
  const f = await fixture()
  const eventId = await f.owner.mutation(api.events.add, {
    horseIds: [f.horseId],
    title: 'Private care',
    type: 'vet',
    date: '2026-10-25',
    time: '10:00',
  })
  await f.t.run(async (ctx) => {
    await ctx.db.insert('notifications', {
      userId: f.user._id,
      kind: 'event_details_changed',
      eventId,
      createdAt: Date.now(),
    })
  })
  expect(
    (await f.recipient.query(api.notifications.list, {})).some(
      (item) => item.kind === 'event_details_changed',
    ),
  ).toBe(false)
  const invite = (
    await f.t.run((ctx) => ctx.db.query('horseInvitations').collect())
  )[0]
  await f.recipient.mutation(api.horseCollaboration.respond, {
    token: invite.token,
    accept: true,
  })
  expect(
    (await f.recipient.query(api.notifications.list, {})).some(
      (item) => item.name === 'Private care',
    ),
  ).toBe(true)
  await f.t.run(async (ctx) => {
    for (const carer of await ctx.db.query('horseCarers').collect())
      await ctx.db.delete(carer._id)
  })
  expect(await f.recipient.query(api.notifications.list, {})).toEqual([])
})

it('includes stable invitations and removes them after decline', async () => {
  const f = await fixture()
  const stableId = await f.owner.mutation(api.stables.add, {
    name: 'Oak',
    location: 'Warsaw',
  })
  await f.owner.mutation(api.stableInvitations.create, {
    stableId,
    email: f.user.email,
    role: 'member',
  })
  const invitation = (await f.recipient.query(api.notifications.list, {})).find(
    (item) => item.kind === 'stable_invitation',
  )!
  expect(invitation.name).toBe('Oak')
  const token = invitation.href!.split('/').at(-1)!
  await f.recipient.mutation(api.stableInvitations.decline, { token })
  expect(
    (await f.recipient.query(api.notifications.list, {})).some(
      (item) => item.key === invitation.key,
    ),
  ).toBe(false)
})

it('makes a completed sharing job unread even when its running state was read', async () => {
  const f = await fixture()
  const stableId = await f.owner.mutation(api.stables.add, {
    name: 'Oak',
    location: 'Warsaw',
  })
  await f.owner.mutation(api.horseTransitions.connect, {
    horseId: f.horseId,
    stableId,
  })
  const ownerId = (await f.owner.query(api.users.getCurrentUser, {}))!._id
  const jobId = await f.t.run(async (ctx) => {
    const horse = (await ctx.db.get(f.horseId))!
    return ctx.db.insert('historySharingJobs', {
      horseId: f.horseId,
      stableId,
      placementId: horse.currentPlacementId!,
      userId: ownerId,
      requestId: 'test',
      cutoff: Date.now(),
      categories: [],
      phase: 0,
      processed: 0,
      status: 'running',
    })
  })
  await f.owner.mutation(api.notifications.markRead, {
    keys: [`${jobId}:running`],
  })
  expect(
    (await f.owner.query(api.notifications.list, {})).find(
      (item) => item.key === `${jobId}:running`,
    )?.read,
  ).toBe(true)
  await f.t.run((ctx) => ctx.db.patch(jobId, { status: 'complete' }))
  expect(
    (await f.owner.query(api.notifications.list, {})).find(
      (item) => item.key === `${jobId}:complete`,
    )?.read,
  ).toBe(false)
})

it('surfaces event decisions across workspaces and removes an accepted invitation', async () => {
  const f = await fixture()
  const stableId = await f.recipient.mutation(api.stables.add, {
    name: 'Oak',
    location: 'Warsaw',
  })
  const ownerId = (await f.owner.query(api.users.getCurrentUser, {}))!._id
  await f.t.run((ctx) =>
    ctx.db.insert('stableMembers', {
      stableId,
      userId: ownerId,
      role: 'member',
    }),
  )
  await f.owner.mutation(api.horseTransitions.connect, {
    horseId: f.horseId,
    stableId,
  })
  const otherId = (await f.other.query(api.users.getCurrentUser, {}))!._id
  await f.t.run((ctx) =>
    ctx.db.insert('stableMembers', {
      stableId,
      userId: otherId,
      role: 'member',
    }),
  )
  const otherHorse = await f.other.mutation(api.horses.add, {
    name: 'Birch',
    age: 5,
  })
  await f.other.mutation(api.horseTransitions.connect, {
    horseId: otherHorse,
    stableId,
  })
  await f.other.mutation(api.events.add, {
    stableId,
    horseIds: [f.horseId, otherHorse],
    title: 'Vet visit',
    type: 'vet',
    date: '2026-10-25',
    time: '10:00',
  })
  const decision = (await f.owner.query(api.notifications.list, {})).find(
    (item) => item.kind === 'event_invitation',
  )!
  expect(decision).toMatchObject({
    name: 'Vet visit',
    context: 'Maple',
    actionRequired: true,
  })
  expect(
    (await f.other.query(api.notifications.list, {})).some(
      (item) => item.kind === 'event_invitation',
    ),
  ).toBe(false)
  await f.owner.mutation(api.events.approveHorseInvitation, {
    eventHorseId: decision.eventHorseId!,
  })
  expect(
    (await f.owner.query(api.notifications.list, {})).some(
      (item) => item.key === decision.key,
    ),
  ).toBe(false)
})
