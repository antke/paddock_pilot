import { convexTest } from 'convex-test'
import { expect, it } from 'vitest'
import { api, internal } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
async function fixture() {
  const t = convexTest(schema, modules)
  const admin = t.withIdentity({
    subject: 'admin',
    email: 'admin@test.example',
  })
  const owner = t.withIdentity({
    subject: 'owner',
    email: 'owner@test.example',
  })
  const member = t.withIdentity({
    subject: 'member',
    email: 'member@test.example',
  })
  const viewer = t.withIdentity({
    subject: 'viewer',
    email: 'viewer@test.example',
  })
  for (const actor of [admin, owner, member, viewer])
    await actor.mutation(api.users.ensureCurrentUser, {})
  const ownerId = (await owner.query(api.users.getCurrentUser, {}))!._id
  const memberId = (await member.query(api.users.getCurrentUser, {}))!._id
  const viewerId = (await viewer.query(api.users.getCurrentUser, {}))!._id
  const stableId = await admin.mutation(api.stables.add, {
    name: 'Willow',
    location: 'Warsaw',
  })
  await t.run(async (ctx) => {
    for (const userId of [ownerId, memberId, viewerId])
      await ctx.db.insert('stableMembers', { userId, stableId, role: 'member' })
  })
  const mine = await member.mutation(api.horses.add, {
    name: 'Mine',
    age: 8,
    stableId,
  })
  const first = await owner.mutation(api.horses.add, {
    name: 'Maple',
    age: 8,
    stableId,
  })
  const second = await owner.mutation(api.horses.add, {
    name: 'Willow',
    age: 8,
    stableId,
  })
  return {
    t,
    admin,
    owner,
    member,
    viewer,
    memberId,
    viewerId,
    stableId,
    mine,
    first,
    second,
  }
}
const event = {
  title: 'Group lesson',
  type: 'training' as const,
  date: '2026-01-05',
  time: '10:00',
  training: { activities: ['flatwork' as const], format: 'regular' as const },
}

it('filters destinations by authority and keeps personal creation private despite submitted sharing overrides', async () => {
  const f = await fixture()
  const options = await f.member.query(api.events.creationOptions, {})
  expect(options.personal.map((h) => h._id)).toEqual([f.mine])
  expect(
    options.stables[0].horses
      .filter((h) => h.requiresApproval)
      .map((h) => h._id)
      .sort(),
  ).toEqual([f.first, f.second].sort())
  const adminOptions = await f.admin.query(api.events.creationOptions, {})
  expect(adminOptions.personal).toHaveLength(0)
  expect(adminOptions.stables[0].horses.every((h) => !h.requiresApproval)).toBe(
    true,
  )
  const id = await f.member.mutation(api.events.add, {
    ...event,
    destination: 'personal',
    horseIds: [f.mine],
    shareWithStable: true,
  })
  expect(
    await f.admin.query(api.training.listForStable, { stableId: f.stableId }),
  ).toMatchObject({ events: [] })
  await expect(f.admin.query(api.events.get, { id })).rejects.toThrow()
  await expect(
    f.admin.mutation(api.events.add, {
      ...event,
      destination: 'personal',
      horseIds: [f.first],
    }),
  ).rejects.toThrow('Personal events')
  await expect(
    f.member.mutation(api.events.add, {
      ...event,
      destination: 'stable',
      horseIds: [f.mine],
    }),
  ).rejects.toThrow('destination')
})

it('groups invitations per owner, exposes approval actions, and sends a summary without access to other horses', async () => {
  const f = await fixture()
  const id = await f.member.mutation(api.events.add, {
    ...event,
    destination: 'stable',
    stableId: f.stableId,
    horseIds: [f.mine, f.first, f.second],
  })
  expect((await f.member.query(api.events.get, { id }))?.horseIds).toEqual([
    f.mine,
  ])
  expect(
    (await f.member.query(api.events.participationSummary, { eventId: id }))
      .map((p) => p.status)
      .sort(),
  ).toEqual(['confirmed', 'invited', 'invited'])
  const invitations = await f.owner.query(
    api.events.listPendingHorseInvitations,
    {},
  )
  expect(invitations).toHaveLength(2)
  expect(
    await f.admin.query(api.events.listPendingHorseInvitations, {
      stableId: f.stableId,
    }),
  ).toHaveLength(2)
  expect(
    await f.viewer.query(api.events.listPendingHorseInvitations, {}),
  ).toHaveLength(0)
  expect((await f.owner.query(api.events.get, { id }))?.title).toBe(event.title)
  await expect(
    f.owner.mutation(api.training.saveRecord, {
      eventId: id,
      horseId: f.first,
      date: event.date,
      status: 'completed',
      details: event.training,
    }),
  ).rejects.toThrow()
  const deliveries = await f.t.run((ctx) =>
    ctx.db.query('emailDeliveries').collect(),
  )
  const invites = deliveries.filter(
    (d) => d.category === 'event_horse_invitation',
  )
  expect(invites).toHaveLength(1)
  expect(invites[0].template).toMatchObject({ horseNames: ['Maple', 'Willow'] })
  await f.owner.mutation(api.events.declineHorseInvitation, {
    eventHorseId: invitations[0].invitation._id,
  })
  const prepared = await f.t.mutation(internal.emailDeliveries.prepareSend, {
    deliveryId: invites[0]._id,
    provider: 'resend',
  })
  expect(prepared).toMatchObject({
    shouldSend: true,
    delivery: { template: { horseNames: [invitations[1].horse.name] } },
  })
  await f.admin.mutation(api.events.approveHorseInvitation, {
    eventHorseId: invitations[1].invitation._id,
  })
  expect(
    await f.owner.query(api.events.listPendingHorseInvitations, {}),
  ).toHaveLength(0)
  expect((await f.admin.query(api.events.get, { id }))?.horseIds).toHaveLength(
    2,
  )
})

it('adds editor-carer horses directly, excludes viewers, and rejects completed group logs with invitations', async () => {
  const f = await fixture()
  await f.t.run(async (ctx) => {
    await ctx.db.insert('horseCarers', {
      horseId: f.first,
      userId: f.memberId,
      role: 'editor',
      createdAt: 0,
      invitedBy: f.memberId,
    })
    await ctx.db.insert('horseCarers', {
      horseId: f.second,
      userId: f.viewerId,
      role: 'viewer',
      createdAt: 0,
      invitedBy: f.memberId,
    })
  })
  expect(
    (await f.member.query(api.events.creationOptions, {})).personal,
  ).toHaveLength(2)
  expect(
    (await f.viewer.query(api.events.creationOptions, {})).personal,
  ).toHaveLength(0)
  const id = await f.member.mutation(api.events.add, {
    ...event,
    destination: 'stable',
    stableId: f.stableId,
    horseIds: [f.mine, f.first],
  })
  expect((await f.member.query(api.events.get, { id }))?.horseIds).toHaveLength(
    2,
  )
  await expect(
    f.member.mutation(api.events.add, {
      ...event,
      status: 'completed',
      destination: 'stable',
      stableId: f.stableId,
      horseIds: [f.mine, f.second],
    }),
  ).rejects.toThrow('Completed training')
  const completed = await f.admin.mutation(api.events.add, {
    ...event,
    status: 'completed',
    destination: 'stable',
    stableId: f.stableId,
    horseIds: [f.mine, f.first, f.second],
  })
  expect(
    (await f.admin.query(api.training.listForEvent, { eventId: completed }))
      .records,
  ).toHaveLength(3)
})

it('preserves pending invitations when the organizer edits event details', async () => {
  const f = await fixture()
  const id = await f.member.mutation(api.events.add, {
    ...event,
    destination: 'stable',
    stableId: f.stableId,
    horseIds: [f.mine, f.first, f.second],
  })
  const editable = await f.member.query(api.events.getWithHorses, { id })
  expect(editable?.pendingEventHorses).toHaveLength(2)
  expect(editable?.eventHorses.map((row) => row.horseId).sort()).toEqual(
    [f.mine, f.first, f.second].sort(),
  )
  await f.member.mutation(api.events.update, {
    ...event,
    id,
    stableId: f.stableId,
    title: 'Updated lesson',
    horseIds: editable!.eventHorses.map((row) => row.horseId),
  })
  expect(
    await f.owner.query(api.events.listPendingHorseInvitations, {}),
  ).toHaveLength(2)
})

it('rejects adding an admin-only horse to a private event without publishing it', async () => {
  const f = await fixture()
  const own = await f.admin.mutation(api.horses.add, {
    name: 'Admin horse',
    age: 8,
    stableId: f.stableId,
  })
  const id = await f.admin.mutation(api.events.add, {
    ...event,
    destination: 'personal',
    horseIds: [own],
  })
  await expect(
    f.admin.mutation(api.events.update, {
      ...event,
      id,
      horseIds: [own, f.first],
    }),
  ).rejects.toThrow('Personal events')
  expect((await f.admin.query(api.events.get, { id }))?.horseIds).toEqual([own])
  expect(
    (await f.member.query(api.training.listForStable, { stableId: f.stableId }))
      .events,
  ).toHaveLength(0)
})

it('suppresses queued invitation emails after all pending invitations are declined', async () => {
  const f = await fixture()
  await f.member.mutation(api.events.add, {
    ...event,
    destination: 'stable',
    stableId: f.stableId,
    horseIds: [f.mine, f.first],
  })
  const [invite] = await f.owner.query(
    api.events.listPendingHorseInvitations,
    {},
  )
  await f.owner.mutation(api.events.declineHorseInvitation, {
    eventHorseId: invite.invitation._id,
  })
  const delivery = await f.t.run(async (ctx) =>
    (await ctx.db.query('emailDeliveries').collect()).find(
      (d) => d.category === 'event_horse_invitation',
    )!,
  )
  expect(
    await f.t.mutation(internal.emailDeliveries.prepareSend, {
      deliveryId: delivery._id,
      provider: 'resend',
    }),
  ).toEqual({ shouldSend: false })
})

it('keeps implicit personal creation private even with obsolete sharing fields', async () => {
  const f = await fixture()
  const id = await f.member.mutation(api.events.add, {
    ...event,
    horseIds: [f.mine],
    shareWithStable: true,
    sharing: [{ horseId: f.mine, enabled: true }],
  })
  await expect(f.admin.query(api.events.get, { id })).rejects.toThrow()
  expect(
    (await f.admin.query(api.training.listForStable, { stableId: f.stableId }))
      .events,
  ).toHaveLength(0)
  await f.member.mutation(api.recordSharing.set, {
    horseId: f.mine,
    recordId: id,
    enabled: true,
  })
  expect(
    (await f.admin.query(api.training.listForStable, { stableId: f.stableId }))
      .events,
  ).toHaveLength(1)
})
