import { convexTest } from 'convex-test'
import { expect, it } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
async function fixture() {
  const t = convexTest(schema, modules)
  const owner = t.withIdentity({
    subject: 'owner',
    email: 'owner@test.example',
  })
  const rider = t.withIdentity({
    subject: 'rider',
    email: 'rider@test.example',
  })
  const stranger = t.withIdentity({
    subject: 'stranger',
    email: 'stranger@test.example',
  })
  for (const actor of [owner, rider, stranger])
    await actor.mutation(api.users.ensureCurrentUser, {})
  const stableId = await owner.mutation(api.stables.add, {
    name: 'Willow',
    location: 'Warsaw',
  })
  const horseId = await owner.mutation(api.horses.add, { name: 'Luna', age: 8 })
  const ids = await t.run(async (ctx) => {
    const users = await ctx.db.query('users').collect()
    const riderId = users.find((u) => u.clerkId === 'rider')!._id
    const strangerId = users.find((u) => u.clerkId === 'stranger')!._id
    await ctx.db.insert('stableMembers', {
      stableId,
      userId: riderId,
      role: 'member',
    })
    return { riderId, strangerId }
  })
  return { t, owner, rider, stranger, horseId, ...ids }
}

it.each(['other', 'training'] as const)(
  'adds independent people to their personal %s calendar without horse permissions',
  async (type) => {
    const f = await fixture()
    const args = {
      horseIds: [f.horseId],
      peopleIds: [f.riderId],
      type,
      title: 'Together',
      date: '2026-10-28',
      time: '10:00',
      description: 'Private notes',
      totalCost: 90,
      status: 'completed' as const,
      notesAfterCompletion: 'Private outcome',
      training:
        type === 'training'
          ? {
              activities: ['hacking' as const],
              format: 'regular' as const,
              rider: 'Private rider',
            }
          : undefined,
    }
    const eventId = await f.owner.mutation(api.events.add, args)
    const calendar = () =>
      f.rider.query(api.activities.view, {
        personal: true,
        stableIds: [],
        training: type === 'training',
      })
    const data = await calendar()
    expect(data.events.map((e) => e._id)).toEqual([eventId])
    expect(data.events[0].description).toBeUndefined()
    expect(data.events[0].totalCost).toBeUndefined()
    expect(data.events[0].training).toBeUndefined()
    expect(data.horses[0].canRecord).toBe(false)
    if (type === 'training') {
      expect(data.records[0].status).toBe('completed')
      expect(data.records[0].outcome).toBeUndefined()
      expect(data.records[0].details.rider).toBeUndefined()
      expect(data.records[0].canEdit).toBe(false)
      await expect(
        f.rider.mutation(api.training.setStatus, {
          eventId,
          horseId: f.horseId,
          date: args.date,
          status: 'planned',
        }),
      ).rejects.toThrow()
    }
    expect(
      await f.rider.query(api.events.attendingPeople, { eventId }),
    ).toHaveLength(1)
    expect(
      await f.stranger.query(api.events.attendingPeople, { eventId }),
    ).toEqual([])
    expect(await f.rider.query(api.activities.detailAccess, { eventId })).toBe(
      'shared',
    )
    expect(
      (await f.rider.query(api.activitySharing.detail, { eventId }))?.event
        .title,
    ).toBe('Together')
    await expect(
      f.rider.query(api.events.get, { id: eventId }),
    ).rejects.toThrow()
    await expect(
      f.rider.mutation(api.events.update, { ...args, id: eventId }),
    ).rejects.toThrow()
    expect(
      (
        await f.stranger.query(api.activities.view, {
          personal: true,
          stableIds: [],
          training: type === 'training',
        })
      ).events,
    ).toEqual([])
    await f.owner.mutation(api.events.update, {
      ...args,
      id: eventId,
      peopleIds: [],
    })
    expect((await calendar()).events).toEqual([])
    expect(
      await f.rider.query(api.activitySharing.detail, { eventId }),
    ).toBeNull()
  },
)

it('rejects unrelated accounts and rolls back the whole creation', async () => {
  const f = await fixture()
  await expect(
    f.owner.mutation(api.events.add, {
      horseIds: [f.horseId],
      peopleIds: [f.strangerId],
      type: 'other',
      title: 'No',
      date: '2026-10-28',
      time: '10:00',
    }),
  ).rejects.toThrow('Choose people')
  expect(await f.t.run((ctx) => ctx.db.query('events').collect())).toEqual([])
})

it('preserves recurrence and avoids duplicating the owner’s personal entry', async () => {
  const f = await fixture()
  const ownerId = await f.t.run(
    async (ctx) =>
      (await ctx.db
        .query('users')
        .withIndex('by_clerk_id', (q) => q.eq('clerkId', 'owner'))
        .unique())!._id,
  )
  await f.owner.mutation(api.events.add, {
    horseIds: [f.horseId],
    peopleIds: [ownerId, f.riderId],
    type: 'other',
    title: 'Weekly',
    date: '2026-10-28',
    time: '10:00',
    recurrence: { frequency: 'weekly', interval: 1, daysOfWeek: [3] },
  })
  for (const actor of [f.owner, f.rider]) {
    const data = await actor.query(api.activities.view, {
      personal: true,
      stableIds: [],
      training: false,
    })
    expect(data.events).toHaveLength(1)
    expect(data.events[0].recurrence?.frequency).toBe('weekly')
  }
})

it('keeps existing attendees editable after they leave the stable', async () => {
  const f = await fixture()
  const eventId = await f.owner.mutation(api.events.add, {
    horseIds: [f.horseId],
    peopleIds: [f.riderId],
    type: 'other',
    title: 'Ride',
    date: '2026-10-28',
    time: '10:00',
  })
  await f.t.run(async (ctx) => {
    for (const member of await ctx.db.query('stableMembers').collect())
      if (member.userId === f.riderId) await ctx.db.delete(member._id)
  })
  expect(
    (await f.owner.query(api.events.creationOptions, {})).people.some(
      (p) => p.id === f.riderId,
    ),
  ).toBe(false)
  expect(
    (await f.owner.query(api.events.creationOptions, { eventId })).people.some(
      (p) => p.id === f.riderId,
    ),
  ).toBe(true)
  await expect(
    f.stranger.query(api.events.creationOptions, { eventId }),
  ).rejects.toThrow()
})
