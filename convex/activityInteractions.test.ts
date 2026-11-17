import { convexTest } from 'convex-test'
import { expect, it, onTestFinished, vi } from 'vitest'
import { api, internal } from './_generated/api'
import type { Id } from './_generated/dataModel'
import schema from './schema'
import { createEventOccurrences } from '../shared/events/eventOccurrences'

const modules = import.meta.glob('./**/*.ts')
const FUTURE = '2099-03-02'
const details = { activities: ['hacking' as const], format: 'regular' as const }

/** Stable owner `admin`; members `creator` (horse A) and `owner` (horse B); `friend` has no horse. */
async function fixture() {
  const t = convexTest(schema, modules)
  const client = (name: string) =>
    t.withIdentity({
      subject: name,
      email: `${name}@example.test`,
      emailVerified: true,
    })
  const admin = client('admin'),
    creator = client('creator'),
    owner = client('owner'),
    friend = client('friend'),
    carer = client('carer'),
    rider = client('rider')
  for (const user of [admin, creator, owner, friend, carer, rider])
    await user.mutation(api.users.ensureCurrentUser, {})
  const ids = await t.run(async (ctx) =>
    Object.fromEntries(
      (await ctx.db.query('users').collect()).map((u) => [u.clerkId, u._id]),
    ),
  )
  const stableId = await admin.mutation(api.stables.add, {
    name: 'Willow',
    location: 'Warsaw',
  })
  const memberships: Record<string, Id<'stableMembers'>> = {}
  for (const name of ['creator', 'owner', 'friend'])
    memberships[name] = await t.run((ctx) =>
      ctx.db.insert('stableMembers', {
        stableId,
        userId: ids[name],
        role: 'member',
      }),
    )
  const horseA = await creator.mutation(api.horses.add, { name: 'A', age: 8 })
  const horseB = await owner.mutation(api.horses.add, { name: 'B', age: 9 })
  await creator.mutation(api.horseTransitions.connect, {
    horseId: horseA,
    stableId,
  })
  await owner.mutation(api.horseTransitions.connect, {
    horseId: horseB,
    stableId,
  })
  const row = (eventId: Id<'events'>, horseId: Id<'horses'>) =>
    t.run(
      async (ctx) =>
        (await ctx.db
          .query('eventsHorses')
          .withIndex('by_horse_id_event_id', (q) =>
            q.eq('horseId', horseId).eq('eventId', eventId),
          )
          .unique())!,
    )
  const stableEvent = (extra: Record<string, unknown> = {}) =>
    creator.mutation(api.events.add, {
      stableId,
      horseIds: [horseA, horseB],
      type: 'vet',
      title: 'Shared vet',
      date: FUTURE,
      time: '10:00',
      ...extra,
    })
  return {
    t,
    admin,
    creator,
    owner,
    friend,
    carer,
    rider,
    ids,
    stableId,
    memberships,
    horseA,
    horseB,
    row,
    stableEvent,
  }
}

it("keeps an accepted horse visible to the event's stable", async () => {
  const f = await fixture()
  const eventId = await f.stableEvent()
  const invitation = await f.row(eventId, f.horseB)
  expect(invitation.status).toBe('invited')
  await f.owner.mutation(api.events.approveHorseInvitation, {
    eventHorseId: invitation._id,
  })
  const shares = await f.t.run((ctx) =>
    ctx.db
      .query('recordShares')
      .withIndex('by_record_horse', (q) =>
        q.eq('recordId', eventId).eq('horseId', f.horseB),
      )
      .collect(),
  )
  expect(shares.some((share) => share.enabled)).toBe(true)
  const stableView = await f.admin.query(api.events.listForStable, {
    stableId: f.stableId,
  })
  expect(stableView.find((e) => e._id === eventId)?.horseIds).toContain(
    f.horseB,
  )
})

it('never hands a horseless event to owners of invited horses', async () => {
  const f = await fixture()
  const eventId = await f.stableEvent()
  await f.creator.mutation(api.events.withdrawHorseFromEvent, {
    eventHorseId: (await f.row(eventId, f.horseA))._id,
  })
  const input = {
    id: eventId,
    stableId: f.stableId,
    horseIds: [],
    type: 'vet' as const,
    title: 'Rewritten',
    date: FUTURE,
    time: '11:00',
  }
  await expect(f.owner.mutation(api.events.update, input)).rejects.toThrow(
    'Not authorized',
  )
  // The organizer and the stable owner still manage it.
  await f.creator.mutation(api.events.update, input)
  await f.admin.mutation(api.events.update, { ...input, title: 'By admin' })
})

it('keeps declined horses declined when the organizer edits the event', async () => {
  const f = await fixture()
  const eventId = await f.stableEvent()
  const invitation = await f.row(eventId, f.horseB)
  await f.owner.mutation(api.events.declineHorseInvitation, {
    eventHorseId: invitation._id,
  })
  await f.creator.mutation(api.events.update, {
    id: eventId,
    stableId: f.stableId,
    horseIds: [f.horseA],
    type: 'vet',
    title: 'Renamed',
    date: FUTURE,
    time: '10:00',
  })
  expect((await f.row(eventId, f.horseB)).status).toBe('declined')
})

it('keeps invitations an editor could not see when that editor saves', async () => {
  const f = await fixture()
  await f.t.run((ctx) =>
    ctx.db.insert('horseCarers', {
      horseId: f.horseA,
      userId: f.ids.carer,
      role: 'editor',
      invitedBy: f.ids.creator,
      createdAt: Date.now(),
    }),
  )
  await f.t.run((ctx) =>
    ctx.db.insert('stableMembers', {
      stableId: f.stableId,
      userId: f.ids.carer,
      role: 'member',
    }),
  )
  const eventId = await f.stableEvent()
  await f.t.run(async (ctx) => {
    const shares = await ctx.db.query('recordShares').collect()
    for (const share of shares) await ctx.db.patch(share._id, { enabled: true })
  })
  await f.carer.mutation(api.events.update, {
    id: eventId,
    stableId: f.stableId,
    horseIds: [f.horseA],
    type: 'vet',
    title: 'Carer edit',
    date: FUTURE,
    time: '10:00',
  })
  expect((await f.row(eventId, f.horseB)).status).toBe('invited')
})

it('shows a re-invitation as a new unread item', async () => {
  const f = await fixture()
  const eventId = await f.stableEvent()
  const invitation = await f.row(eventId, f.horseB)
  const before = (await f.owner.query(api.notifications.list, {})).find(
    (item) => item.eventHorseId === invitation._id,
  )!
  await f.owner.mutation(api.notifications.markRead, { keys: [before.key] })
  await f.owner.mutation(api.events.declineHorseInvitation, {
    eventHorseId: invitation._id,
  })
  await f.creator.mutation(api.events.update, {
    id: eventId,
    stableId: f.stableId,
    horseIds: [f.horseA, f.horseB],
    type: 'vet',
    title: 'Shared vet',
    date: FUTURE,
    time: '10:00',
  })
  const after = (await f.owner.query(api.notifications.list, {})).find(
    (item) => item.eventHorseId === invitation._id,
  )!
  expect(after.key).not.toBe(before.key)
})

it('withdraws from today on and keeps sessions that already happened', async () => {
  const f = await fixture()
  const pastOneOff = await f.creator.mutation(api.events.add, {
    horseIds: [f.horseA],
    type: 'vet',
    title: 'Done',
    date: '2026-01-05',
    time: '10:00',
  })
  await expect(
    f.creator.mutation(api.events.withdrawHorseFromEvent, {
      eventHorseId: (await f.row(pastOneOff, f.horseA))._id,
      today: '2026-06-01',
    }),
  ).rejects.toThrow('already started')

  const series = await f.creator.mutation(api.events.add, {
    horseIds: [f.horseA],
    type: 'vet',
    title: 'Weekly physio',
    date: '2026-01-05',
    time: '10:00',
    recurrence: { frequency: 'daily', interval: 1 },
  })
  const link = await f.row(series, f.horseA)
  await f.creator.mutation(api.events.withdrawHorseFromEvent, {
    eventHorseId: link._id,
    today: '2026-06-01',
  })
  const after = await f.row(series, f.horseA)
  expect(after).toMatchObject({
    status: 'confirmed',
    participationEndsAt: '2026-05-31',
  })
  expect(after.history?.title).toBe('Weekly physio')
})

it('ends attendance on a stable event when the person leaves the stable', async () => {
  const f = await fixture()
  const eventId = await f.creator.mutation(api.events.add, {
    stableId: f.stableId,
    horseIds: [f.horseA],
    peopleIds: [f.ids.friend],
    type: 'vet',
    title: 'Group visit',
    date: FUTURE,
    time: '10:00',
  })
  const view = () =>
    f.friend.query(api.activities.view, {
      personal: true,
      stableIds: [],
      training: false,
    })
  expect((await view()).events.map((e) => e._id)).toContain(eventId)
  await f.t.run((ctx) => ctx.db.delete(f.memberships.friend))
  expect((await view()).events.map((e) => e._id)).not.toContain(eventId)
})

it('stops participation emails to an organizer who left the stable', async () => {
  const f = await fixture()
  const eventId = await f.stableEvent()
  await f.t.run((ctx) => ctx.db.delete(f.memberships.creator))
  await f.owner.mutation(api.events.declineHorseInvitation, {
    eventHorseId: (await f.row(eventId, f.horseB))._id,
  })
  const toCreator = await f.t.run(async (ctx) =>
    (await ctx.db.query('emailDeliveries').collect()).filter(
      (email) =>
        email.recipient === 'creator@example.test' &&
        email.template?.kind === 'event_participation_update',
    ),
  )
  expect(toCreator).toEqual([])
})

it("keeps another editor's stable shares when saving sharing", async () => {
  const f = await fixture()
  const otherStable = await f.carer.mutation(api.stables.add, {
    name: 'Oak',
    location: 'Krakow',
  })
  await f.t.run((ctx) =>
    ctx.db.insert('horseCarers', {
      horseId: f.horseA,
      userId: f.ids.carer,
      role: 'editor',
      invitedBy: f.ids.creator,
      createdAt: Date.now(),
    }),
  )
  const eventId = await f.creator.mutation(api.events.add, {
    horseIds: [f.horseA],
    type: 'vet',
    title: 'Private vet',
    date: FUTURE,
    time: '10:00',
  })
  await f.carer.mutation(api.activitySharing.setCalendars, {
    eventId,
    stableIds: [otherStable],
  })
  await f.creator.mutation(api.activitySharing.setCalendars, {
    eventId,
    stableIds: [f.stableId],
  })
  const stables = await f.t.run(async (ctx) =>
    (
      await ctx.db
        .query('activityCalendarShares')
        .withIndex('by_event', (q) => q.eq('eventId', eventId))
        .collect()
    ).map((share) => share.stableId),
  )
  expect(stables.sort()).toEqual([f.stableId, otherStable].sort())
})

it('does not revive a rider grant when a withdrawn horse is re-added', async () => {
  const f = await fixture()
  const eventId = await f.creator.mutation(api.events.add, {
    horseIds: [f.horseA],
    type: 'training',
    title: 'Ride',
    date: FUTURE,
    time: '10:00',
    training: details,
  })
  const id = await f.creator.mutation(api.activityParticipants.invite, {
    eventId,
    horseId: f.horseA,
    date: FUTURE,
    email: 'rider@example.test',
    role: 'rider',
  })
  await f.rider.mutation(api.activityParticipants.respond, { id, accept: true })
  const input = {
    id: eventId,
    type: 'training' as const,
    title: 'Ride',
    date: FUTURE,
    time: '10:00',
    training: details,
  }
  await f.creator.mutation(api.events.update, { ...input, horseIds: [] })
  await f.creator.mutation(api.events.update, {
    ...input,
    horseIds: [f.horseA],
  })
  const [mine] = await f.rider.query(api.activityParticipants.mine, {})
  expect(mine.canReport).toBe(false)
})

it("stops a rider from overwriting the owner's correction", async () => {
  const f = await fixture()
  const date = '2026-01-05'
  const eventId = await f.creator.mutation(api.events.add, {
    horseIds: [f.horseA],
    type: 'training',
    title: 'Ride',
    date,
    time: '10:00',
    training: details,
  })
  const id = await f.creator.mutation(api.activityParticipants.invite, {
    eventId,
    horseId: f.horseA,
    date,
    email: 'rider@example.test',
    role: 'rider',
  })
  await f.rider.mutation(api.activityParticipants.respond, { id, accept: true })
  await f.rider.mutation(api.activityParticipants.reportRide, { id, details })
  await f.creator.mutation(api.training.saveRecord, {
    eventId,
    horseId: f.horseA,
    date,
    status: 'completed',
    details,
    outcome: 'Owner correction',
  })
  await expect(
    f.rider.mutation(api.activityParticipants.reportRide, {
      id,
      details,
      outcome: 'Rider rewrite',
    }),
  ).rejects.toThrow('already has a report')
})

it('rejects completing a future session through an existing planned record', async () => {
  const f = await fixture()
  const eventId = await f.creator.mutation(api.events.add, {
    horseIds: [f.horseA],
    type: 'training',
    title: 'Ride',
    date: FUTURE,
    time: '10:00',
    training: details,
  })
  const args = { eventId, horseId: f.horseA, date: FUTURE }
  await f.creator.mutation(api.training.setStatus, {
    ...args,
    status: 'planned',
  })
  await expect(
    f.creator.mutation(api.training.setStatus, {
      ...args,
      status: 'completed',
    }),
  ).rejects.toThrow()
})

it('keeps the organizer in charge after another owner joins, including horse notes', async () => {
  const f = await fixture()
  const eventId = await f.stableEvent()
  const invitation = await f.row(eventId, f.horseB)
  await f.owner.mutation(api.events.approveHorseInvitation, {
    eventHorseId: invitation._id,
  })
  const input = {
    id: eventId,
    stableId: f.stableId,
    horseIds: [f.horseA, f.horseB],
    type: 'vet' as const,
    title: 'Moved vet',
    date: FUTURE,
    time: '12:00',
  }
  expect(
    (await f.creator.query(api.events.getPermissions, { id: eventId }))
      ?.canManageEvent,
  ).toBe(true)
  await f.creator.mutation(api.events.update, input)
  await f.admin.mutation(api.events.update, { ...input, title: 'By admin' })
  await f.creator.mutation(api.eventHorseDetails.update, {
    id: invitation._id,
    requestedServiceNotes: 'Bring passport',
  })
  const horseDetails = await f.creator.query(
    api.eventHorseDetails.listForEvent,
    { eventId },
  )
  expect(
    horseDetails.rows.find((row) => row.eventHorse._id === invitation._id),
  ).toMatchObject({ canManage: true, canWithdraw: false })
  // The horse owner manages participation, not the shared schedule.
  await expect(f.owner.mutation(api.events.update, input)).rejects.toThrow(
    'Not authorized',
  )
  await f.t.run((ctx) => ctx.db.delete(f.memberships.creator))
  await expect(f.creator.mutation(api.events.update, input)).rejects.toThrow()
})

it('cancels with cleanup and lets nobody accept a closed invitation', async () => {
  const f = await fixture()
  const eventId = await f.stableEvent()
  const invitation = await f.row(eventId, f.horseB)
  await f.creator.mutation(api.events.setCancelled, {
    id: eventId,
    cancelled: true,
  })
  expect((await f.row(eventId, f.horseB)).status).toBe('withdrawn')
  await expect(
    f.owner.mutation(api.events.approveHorseInvitation, {
      eventHorseId: invitation._id,
    }),
  ).rejects.toThrow()
  const inbox = await f.owner.query(api.notifications.list, {})
  expect(inbox.map((item) => item.kind)).toContain('event_cancelled')
  expect(inbox.some((item) => item.kind === 'event_invitation')).toBe(false)
  await f.creator.mutation(api.events.setCancelled, {
    id: eventId,
    cancelled: false,
  })
  expect((await f.creator.query(api.events.get, { id: eventId }))?.status).toBe(
    'planned',
  )
})

it('ticks an ordinary event off and back for its managers only', async () => {
  const f = await fixture()
  const eventId = await f.stableEvent()
  const status = async () =>
    (await f.creator.query(api.events.get, { id: eventId }))?.status
  await expect(
    f.owner.mutation(api.events.setCompleted, { id: eventId, completed: true }),
  ).rejects.toThrow('Not authorized')
  await f.creator.mutation(api.events.setCompleted, {
    id: eventId,
    completed: true,
  })
  expect(await status()).toBe('completed')
  await f.creator.mutation(api.events.setCompleted, {
    id: eventId,
    completed: false,
  })
  expect(await status()).toBe('planned')
  await f.creator.mutation(api.events.setCancelled, {
    id: eventId,
    cancelled: true,
  })
  await expect(
    f.creator.mutation(api.events.setCompleted, {
      id: eventId,
      completed: true,
    }),
  ).rejects.toThrow()
  const trainingId = await f.creator.mutation(api.events.add, {
    horseIds: [f.horseA],
    type: 'training',
    title: 'Ride',
    date: FUTURE,
    time: '10:00',
    training: details,
  })
  await expect(
    f.creator.mutation(api.events.setCompleted, {
      id: trainingId,
      completed: true,
    }),
  ).rejects.toThrow()
})

it('cancels a training session as a whole', async () => {
  const f = await fixture()
  const eventId = await f.creator.mutation(api.events.add, {
    horseIds: [f.horseA],
    type: 'training',
    title: 'Ride',
    date: FUTURE,
    time: '10:00',
    training: details,
  })
  await f.creator.mutation(api.events.setCancelled, {
    id: eventId,
    cancelled: true,
  })
  expect((await f.creator.query(api.events.get, { id: eventId }))?.status).toBe(
    'cancelled',
  )
})

it('deletes only events nobody else depends on, and tells the invited', async () => {
  const f = await fixture()
  const eventId = await f.stableEvent({ peopleIds: [f.ids.friend] })
  await f.creator.mutation(api.events.remove, { id: eventId })
  expect(await f.t.run((ctx) => ctx.db.get(eventId))).toBeNull()
  const leftovers = await f.t.run(async (ctx) => [
    ...(await ctx.db.query('eventsHorses').collect()),
    ...(await ctx.db.query('eventAttendees').collect()),
  ])
  expect(leftovers).toEqual([])
  for (const person of [f.owner, f.friend])
    expect(
      (await person.query(api.notifications.list, {})).find(
        (item) => item.kind === 'event_deleted',
      ),
    ).toMatchObject({ name: 'Shared vet' })

  const joined = await f.stableEvent()
  await f.owner.mutation(api.events.approveHorseInvitation, {
    eventHorseId: (await f.row(joined, f.horseB))._id,
  })
  await expect(
    f.creator.mutation(api.events.remove, { id: joined }),
  ).rejects.toThrow('Cancel it instead')
})

it('deletes a training session with its own records, but not another owner’s history', async () => {
  const f = await fixture()
  const PAST = '2026-01-05'
  const add = () =>
    f.creator.mutation(api.events.add, {
      horseIds: [f.horseA],
      type: 'training',
      title: 'Flatwork',
      date: PAST,
      time: '10:00',
      training: details,
    })
  const mine = await add()
  await f.creator.mutation(api.training.setStatus, {
    eventId: mine,
    horseId: f.horseA,
    date: PAST,
    status: 'completed',
  })
  await f.creator.mutation(api.events.remove, { id: mine })
  expect(
    await f.t.run((ctx) =>
      ctx.db
        .query('trainingRecords')
        .withIndex('by_event_id', (q) => q.eq('eventId', mine))
        .collect(),
    ),
  ).toEqual([])

  const shared = await add()
  await f.t.run((ctx) =>
    ctx.db.insert('trainingRecords', {
      eventId: shared,
      horseId: f.horseB,
      date: PAST,
      status: 'completed',
      details,
      recordedBy: f.ids.owner,
      createdAt: 0,
      updatedAt: 0,
    }),
  )
  await expect(
    f.creator.mutation(api.events.remove, { id: shared }),
  ).rejects.toThrow('Cancel it instead')
})

it('drops invitations for events that already happened from every inbox', async () => {
  const f = await fixture()
  const past = await f.stableEvent({ date: '2026-01-05' })
  expect(
    (await f.owner.query(api.notifications.list, {})).some(
      (item) => item.kind === 'event_invitation',
    ),
  ).toBe(false)
  expect(
    await f.owner.query(api.events.listPendingHorseInvitations, {}),
  ).toEqual([])
  await expect(
    f.owner.mutation(api.events.approveHorseInvitation, {
      eventHorseId: (await f.row(past, f.horseB))._id,
    }),
  ).rejects.toThrow()
})

it('shows the stable owner member-horse invitations outside the stable too', async () => {
  const f = await fixture()
  await f.stableEvent()
  expect(
    await f.admin.query(api.events.listPendingHorseInvitations, {}),
  ).toHaveLength(1)
})

it('tells attendees when the schedule changes', async () => {
  const f = await fixture()
  const eventId = await f.stableEvent({ peopleIds: [f.ids.friend] })
  await f.creator.mutation(api.events.update, {
    id: eventId,
    stableId: f.stableId,
    horseIds: [f.horseA, f.horseB],
    peopleIds: [f.ids.friend],
    type: 'vet',
    title: 'Shared vet',
    date: FUTURE,
    time: '15:00',
  })
  expect(
    (await f.friend.query(api.notifications.list, {})).map((i) => i.kind),
  ).toContain('event_details_changed')
})

it('lets an owner undo a decline, but not an organizer removal', async () => {
  const f = await fixture()
  const eventId = await f.stableEvent()
  const invitation = await f.row(eventId, f.horseB)
  await f.owner.mutation(api.events.declineHorseInvitation, {
    eventHorseId: invitation._id,
  })
  const summary = await f.owner.query(api.events.participationSummary, {
    eventId,
  })
  expect(summary.find((row) => row.id === invitation._id)?.canRejoin).toBe(true)
  await f.owner.mutation(api.events.rejoinHorse, {
    eventHorseId: invitation._id,
  })
  expect((await f.row(eventId, f.horseB)).status).toBe('confirmed')
  expect(
    (await f.creator.query(api.notifications.list, {})).map((i) => i.kind),
  ).toContain('event_horse_rejoined')

  // The organizer removes it; the owner cannot override that.
  await f.creator.mutation(api.events.update, {
    id: eventId,
    stableId: f.stableId,
    horseIds: [f.horseA],
    type: 'vet',
    title: 'Shared vet',
    date: FUTURE,
    time: '10:00',
  })
  await expect(
    f.owner.mutation(api.events.rejoinHorse, { eventHorseId: invitation._id }),
  ).rejects.toThrow('cannot rejoin')
})

it('lets attendees know they were added and leave on their own', async () => {
  const f = await fixture()
  const eventId = await f.stableEvent({ peopleIds: [f.ids.friend] })
  expect(
    (await f.friend.query(api.notifications.list, {})).map((i) => i.kind),
  ).toContain('event_attendance_added')
  expect(
    (await f.friend.query(api.events.attendingPeople, { eventId }))[0].isMe,
  ).toBe(true)
  await f.friend.mutation(api.events.leaveAttendance, { eventId })
  expect(await f.friend.query(api.events.attendingPeople, { eventId })).toEqual(
    [],
  )
  expect(
    (await f.creator.query(api.notifications.list, {})).map((i) => i.kind),
  ).toContain('event_attendee_left')
})

it('lets an accepted rider leave and tells the inviter', async () => {
  const f = await fixture()
  const eventId = await f.creator.mutation(api.events.add, {
    horseIds: [f.horseA],
    type: 'training',
    title: 'Ride',
    date: FUTURE,
    time: '10:00',
    training: details,
  })
  const id = await f.creator.mutation(api.activityParticipants.invite, {
    eventId,
    horseId: f.horseA,
    date: FUTURE,
    email: 'rider@example.test',
    role: 'rider',
  })
  await f.rider.mutation(api.activityParticipants.respond, { id, accept: true })
  await f.rider.mutation(api.activityParticipants.revoke, { id })
  expect(
    (await f.creator.query(api.notifications.list, {})).map((i) => i.kind),
  ).toContain('activity_participant_left')
})

it('lets a member leave a stable: horses depart, tasks are unassigned, owner is told', async () => {
  const f = await fixture()
  const reminderId = await f.t.run((ctx) =>
    ctx.db.insert('careReminders', {
      stableId: f.stableId,
      assignedTo: f.ids.owner,
      title: 'Sweep the yard',
      category: 'other',
      dueDate: FUTURE,
      status: 'pending',
      createdBy: f.ids.admin,
      createdAt: 1,
      updatedAt: 1,
    }),
  )
  await f.owner.mutation(api.stableMembers.leave, { stableId: f.stableId })
  const state = await f.t.run(async (ctx) => ({
    membership: await ctx.db.get(f.memberships.owner),
    reminder: await ctx.db.get(reminderId),
    horse: await ctx.db.get(f.horseB),
  }))
  expect(state.membership).toBeNull()
  expect(state.reminder?.assignedTo).toBeUndefined()
  expect(state.horse?.transitionId).toBeDefined()
  expect(
    (await f.admin.query(api.notifications.list, {})).map((i) => i.kind),
  ).toContain('stable_member_left')
  await expect(
    f.admin.mutation(api.stableMembers.leave, { stableId: f.stableId }),
  ).rejects.toThrow()
})

it('lets a receiving stable owner remove an activity shared into their stable', async () => {
  const f = await fixture()
  const otherStable = await f.carer.mutation(api.stables.add, {
    name: 'Oak',
    location: 'Krakow',
  })
  await f.t.run((ctx) =>
    ctx.db.insert('stableMembers', {
      stableId: otherStable,
      userId: f.ids.creator,
      role: 'member',
    }),
  )
  const eventId = await f.creator.mutation(api.events.add, {
    horseIds: [f.horseA],
    type: 'vet',
    title: 'Private vet',
    date: FUTURE,
    time: '10:00',
  })
  await f.creator.mutation(api.activitySharing.setCalendars, {
    eventId,
    stableIds: [otherStable],
  })
  expect(
    await f.carer.query(api.activitySharing.detail, { eventId }),
  ).toMatchObject({ removableStableId: otherStable })
  await expect(
    f.creator.mutation(api.activitySharing.removeFromStable, {
      eventId,
      stableId: otherStable,
    }),
  ).rejects.toThrow()
  await f.carer.mutation(api.activitySharing.removeFromStable, {
    eventId,
    stableId: otherStable,
  })
  expect(
    await f.carer.query(api.activitySharing.detail, { eventId }),
  ).toBeNull()
})

it('tells owners when someone else books, confirms or removes their horse', async () => {
  const f = await fixture()
  const kinds = async () =>
    (await f.owner.query(api.notifications.list, {})).map((i) => i.kind)
  const booked = await f.admin.mutation(api.events.add, {
    stableId: f.stableId,
    horseIds: [f.horseB],
    type: 'vet',
    title: 'Booked by admin',
    date: FUTURE,
    time: '10:00',
  })
  expect(booked).toBeDefined()
  expect(await kinds()).toContain('event_horse_booked')

  const eventId = await f.stableEvent()
  await f.admin.mutation(api.events.approveHorseInvitation, {
    eventHorseId: (await f.row(eventId, f.horseB))._id,
  })
  expect(await kinds()).toContain('event_horse_approved_for_you')

  await f.creator.mutation(api.events.update, {
    id: eventId,
    stableId: f.stableId,
    horseIds: [f.horseA],
    type: 'vet',
    title: 'Shared vet',
    date: FUTURE,
    time: '10:00',
  })
  const removed = (await f.owner.query(api.notifications.list, {})).find(
    (item) => item.kind === 'event_horse_removed',
  )
  expect(removed).toMatchObject({ context: 'B' })
})

it('puts ride invitations in the bell and dates recurring invitations by the next session', async () => {
  const f = await fixture()
  const ride = await f.creator.mutation(api.events.add, {
    horseIds: [f.horseA],
    type: 'training',
    title: 'Ride',
    date: FUTURE,
    time: '10:00',
    training: details,
  })
  await f.creator.mutation(api.activityParticipants.invite, {
    eventId: ride,
    horseId: f.horseA,
    date: FUTURE,
    email: 'rider@example.test',
    role: 'rider',
  })
  expect(
    (await f.rider.query(api.notifications.list, {})).find(
      (item) => item.kind === 'activity_invitation',
    ),
  ).toMatchObject({ actionRequired: true, href: '/training', context: 'A' })

  await f.stableEvent({
    date: '2026-01-05',
    recurrence: { frequency: 'daily', interval: 1 },
  })
  const invitation = (await f.owner.query(api.notifications.list, {})).find(
    (item) => item.kind === 'event_invitation',
  )
  expect((invitation?.eventDate ?? '') > '2026-01-05').toBe(true)
})

it('leaves no rider grants or sharing rules behind when a horse is purged', async () => {
  const f = await fixture()
  const pony = await f.creator.mutation(api.horses.add, { name: 'P', age: 5 })
  const eventId = await f.creator.mutation(api.events.add, {
    horseIds: [pony, f.horseA],
    type: 'training',
    title: 'Pair ride',
    date: FUTURE,
    time: '10:00',
    training: details,
  })
  await f.creator.mutation(api.activityParticipants.invite, {
    eventId,
    horseId: pony,
    date: FUTURE,
    email: 'rider@example.test',
    role: 'rider',
  })
  await f.t.run((ctx) => ctx.db.patch(pony, { deletedAt: 1 }))
  await f.creator.mutation(api.horses.permanentlyDeleteHorse, { id: pony })
  const leftovers = await f.t.run(async (ctx) => ({
    riders: await ctx.db.query('activityParticipants').collect(),
    shares: (await ctx.db.query('recordShares').collect()).filter(
      (share) => share.horseId === pony,
    ),
  }))
  expect(leftovers).toEqual({ riders: [], shares: [] })
})

it('removes a deleted account from attendance and scrubs their ride invitations', async () => {
  const f = await fixture()
  const eventId = await f.stableEvent({ peopleIds: [f.ids.friend] })
  const ride = await f.creator.mutation(api.events.add, {
    horseIds: [f.horseA],
    type: 'training',
    title: 'Ride',
    date: FUTURE,
    time: '10:00',
    training: details,
  })
  const rideId = await f.creator.mutation(api.activityParticipants.invite, {
    eventId: ride,
    horseId: f.horseA,
    date: FUTURE,
    email: 'friend@example.test',
    role: 'rider',
  })
  await f.t.mutation(internal.users.deleteUser, { clerkId: 'friend' })
  const state = await f.t.run(async (ctx) => ({
    event: await ctx.db.get(eventId),
    attendees: await ctx.db.query('eventAttendees').collect(),
    ride: await ctx.db.get(rideId),
  }))
  expect(state.event?.peopleIds).toEqual([])
  expect(state.attendees).toEqual([])
  expect(state.ride).toMatchObject({ status: 'revoked' })
  expect(state.ride?.email).not.toContain('friend@')
})

it('takes a transferred horse out of the old owner’s shared personal events', async () => {
  const f = await fixture()
  const other = await f.creator.mutation(api.horses.add, { name: 'C', age: 6 })
  const eventId = await f.creator.mutation(api.events.add, {
    horseIds: [f.horseA, other],
    type: 'vet',
    title: 'Two-horse vet',
    date: FUTURE,
    time: '10:00',
  })
  const id = await f.creator.mutation(api.horseCollaboration.invite, {
    horseId: f.horseA,
    kind: 'transfer',
    email: 'owner@example.test',
  })
  const invitation = (await f.t.run((ctx) => ctx.db.get(id)))!
  await f.owner.mutation(api.horseCollaboration.respond, {
    token: invitation.token,
    accept: true,
  })
  expect((await f.t.run((ctx) => ctx.db.get(eventId)))?.horseIds).toEqual([
    other,
  ])
  expect((await f.row(eventId, f.horseA)).status).toBe('withdrawn')
})

it('lets an owner edit a task carried out of a stable', async () => {
  vi.useFakeTimers()
  onTestFinished(() => {
    vi.useRealTimers()
  })
  const f = await fixture()
  // Staff-created, so it is a stable task the owner chooses to carry.
  const reminderId = await f.admin.mutation(api.careReminders.add, {
    stableId: f.stableId,
    horseId: f.horseB,
    title: 'Farrier',
    category: 'farrier',
    dueDate: FUTURE,
  })
  const preview = await f.owner.query(api.horseTransitions.preview, {
    horseId: f.horseB,
  })
  await f.owner.mutation(api.horseTransitions.depart, {
    horseId: f.horseB,
    revision: preview.revision,
    carryReminderIds: [reminderId],
  })
  await f.t.finishAllScheduledFunctions(vi.runAllTimers)
  await f.owner.mutation(api.careReminders.update, {
    id: reminderId,
    horseId: f.horseB,
    title: 'Farrier (rescheduled)',
    category: 'farrier',
    dueDate: FUTURE,
  })
  expect((await f.t.run((ctx) => ctx.db.get(reminderId)))?.title).toBe(
    'Farrier (rescheduled)',
  )
})

it('cancels one date of a series, and lets an owner sit one date out', async () => {
  const f = await fixture()
  const eventId = await f.stableEvent({
    date: '2099-03-01',
    recurrence: { frequency: 'daily', interval: 1 },
  })
  await f.owner.mutation(api.events.approveHorseInvitation, {
    eventHorseId: (await f.row(eventId, f.horseB))._id,
  })
  const dates = async () => {
    const event = (await f.t.run((ctx) => ctx.db.get(eventId)))!
    return createEventOccurrences({
      events: [event],
      windowStart: '2099-03-01',
      windowEnd: '2099-03-03',
    }).map((o) => [o.startDate, o.event.horseIds.length])
  }
  await f.creator.mutation(api.events.setOccurrenceSkip, {
    eventId,
    date: '2099-03-02',
    skipped: true,
  })
  await f.owner.mutation(api.events.setOccurrenceSkip, {
    eventId,
    date: '2099-03-03',
    horseId: f.horseB,
    skipped: true,
  })
  expect(await dates()).toEqual([
    ['2099-03-01', 2],
    ['2099-03-03', 1],
  ])
  expect(
    (await f.owner.query(api.notifications.list, {})).map((i) => i.kind),
  ).toContain('event_date_cancelled')
  expect(
    (await f.creator.query(api.notifications.list, {})).map((i) => i.kind),
  ).toContain('event_horse_skipped_date')
  // Only the horse side can sit a horse out; only the organizer cancels a date.
  await expect(
    f.creator.mutation(api.events.setOccurrenceSkip, {
      eventId,
      date: '2099-03-04',
      horseId: f.horseB,
      skipped: true,
    }),
  ).rejects.toThrow()
  await expect(
    f.owner.mutation(api.events.setOccurrenceSkip, {
      eventId,
      date: '2099-03-04',
      skipped: true,
    }),
  ).rejects.toThrow()
  await f.creator.mutation(api.events.setOccurrenceSkip, {
    eventId,
    date: '2099-03-02',
    skipped: false,
  })
  expect((await dates()).map(([date]) => date)).toContain('2099-03-02')
})

it('keeps a series with an accepted rider on its schedule', async () => {
  const f = await fixture()
  const input = {
    horseIds: [f.horseA],
    type: 'training' as const,
    title: 'Weekly ride',
    date: '2026-01-05',
    time: '10:00',
    training: details,
    recurrence: { frequency: 'daily' as const, interval: 1 },
  }
  const eventId = await f.creator.mutation(api.events.add, input)
  const id = await f.creator.mutation(api.activityParticipants.invite, {
    eventId,
    horseId: f.horseA,
    date: '2026-01-05',
    email: 'rider@example.test',
    role: 'rider',
  })
  await f.rider.mutation(api.activityParticipants.respond, { id, accept: true })
  await f.rider.mutation(api.activityParticipants.reportRide, { id, details })
  await expect(
    f.creator.mutation(api.events.update, {
      ...input,
      id: eventId,
      date: '2026-01-06',
    }),
  ).rejects.toThrow('training history')
})

it('reads as not found without access, and drops changed sessions from a rider’s calendar', async () => {
  const f = await fixture()
  const stableEventId = await f.stableEvent()
  expect(
    await f.rider.query(api.events.getPermissions, { id: stableEventId }),
  ).toBeNull()
  expect(
    await f.rider.query(api.events.getWithHorses, {
      id: stableEventId,
      stableId: f.stableId,
    }),
  ).toBeNull()

  const ride = await f.creator.mutation(api.events.add, {
    horseIds: [f.horseA],
    type: 'training',
    title: 'Ride',
    date: FUTURE,
    time: '10:00',
    training: details,
  })
  const id = await f.creator.mutation(api.activityParticipants.invite, {
    eventId: ride,
    horseId: f.horseA,
    date: FUTURE,
    email: 'rider@example.test',
    role: 'rider',
  })
  await f.rider.mutation(api.activityParticipants.respond, { id, accept: true })
  const calendar = () =>
    f.rider.query(api.activities.view, {
      personal: true,
      stableIds: [],
      training: true,
    })
  expect((await calendar()).events.map((e) => e._id)).toContain(ride)
  await f.creator.mutation(api.events.setCancelled, {
    id: ride,
    cancelled: true,
  })
  expect((await calendar()).events.map((e) => e._id)).not.toContain(ride)
  expect(
    (await f.rider.query(api.activityParticipants.mine, {}))[0].sessionChanged,
  ).toBe(true)
})
