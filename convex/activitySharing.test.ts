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
  const member = t.withIdentity({
    subject: 'member',
    email: 'member@example.test',
  })
  const outsider = t.withIdentity({
    subject: 'outside',
    email: 'outside@example.test',
  })
  for (const actor of [owner, member, outsider])
    await actor.mutation(api.users.ensureCurrentUser, {})
  const a = await owner.mutation(api.stables.add, {
    name: 'Stable A',
    location: 'Warsaw',
  })
  const b = await owner.mutation(api.stables.add, {
    name: 'Stable B',
    location: 'Warsaw',
  })
  const memberId = (await member.query(api.users.getCurrentUser, {}))!._id
  await t.run(async (ctx) => {
    await ctx.db.insert('stableMembers', {
      userId: memberId,
      stableId: b,
      role: 'member',
    })
  })
  const horse = await owner.mutation(api.horses.add, { name: 'Luna', age: 8 })
  const eventId = await owner.mutation(api.events.add, {
    destination: 'personal',
    sharedStableIds: [a, b],
    horseIds: [horse],
    type: 'training',
    title: 'Shared ride',
    date: '2026-01-05',
    time: '10:00',
    status: 'completed',
    description: 'Private description',
    notesAfterCompletion: 'Private outcome',
    training: {
      activities: ['jumping'],
      format: 'lesson',
      focus: 'Private focus',
    },
  })
  return { t, owner, member, outsider, a, b, horse, eventId, memberId }
}

it('shares one canonical event and its recorded ride across multiple stables without duplicates', async () => {
  const f = await fixture()
  const result = await f.owner.query(api.activities.view, {
    personal: true,
    stableIds: [f.a, f.b],
    training: true,
  })
  expect(result.events.map((event) => event._id)).toEqual([f.eventId])
  expect(result.records).toHaveLength(1)
  for (const stableId of [f.a, f.b]) {
    const selected = await f.owner.query(api.activities.view, {
      personal: false,
      stableIds: [stableId],
      training: true,
    })
    expect(selected.events.map((event) => event._id)).toEqual([f.eventId])
    expect(selected.records[0].status).toBe('completed')
  }
  expect(await f.t.run((ctx) => ctx.db.query('events').collect())).toHaveLength(
    1,
  )
})

it('gives members only the shared activity, not private details or horse access', async () => {
  const f = await fixture()
  const result = await f.member.query(api.activities.view, {
    personal: false,
    stableIds: [f.b],
    training: true,
  })
  expect(result.events).toHaveLength(1)
  expect(result.horses[0].canRecord).toBe(false)
  expect(result.horses[0]).not.toHaveProperty('ownerId')
  expect(JSON.stringify(result)).not.toContain('Private')
  expect(
    await f.member.query(api.activities.detailAccess, { eventId: f.eventId }),
  ).toBe('shared')
  const detail = await f.member.query(api.activitySharing.detail, {
    eventId: f.eventId,
  })
  expect(detail?.event.title).toBe('Shared ride')
  expect(JSON.stringify(detail)).not.toContain('Private')
  await expect(
    f.member.query(api.events.getWithHorses, { id: f.eventId }),
  ).rejects.toThrow()
  await expect(
    f.member.mutation(api.training.setStatus, {
      eventId: f.eventId,
      horseId: f.horse,
      date: '2026-01-05',
      status: 'planned',
    }),
  ).rejects.toThrow()
  expect(
    await f.outsider.query(api.activitySharing.detail, { eventId: f.eventId }),
  ).toBeNull()
  await expect(
    f.outsider.query(api.activities.view, {
      personal: false,
      stableIds: [f.b],
      training: true,
    }),
  ).rejects.toThrow()
})

it('revokes one audience without deleting the record or other audiences', async () => {
  const f = await fixture()
  await f.owner.mutation(api.activitySharing.setCalendars, {
    eventId: f.eventId,
    stableIds: [f.a],
  })
  expect(
    await f.member.query(api.activitySharing.detail, { eventId: f.eventId }),
  ).toBeNull()
  expect(
    (
      await f.member.query(api.activities.view, {
        personal: false,
        stableIds: [f.b],
        training: true,
      })
    ).events,
  ).toEqual([])
  expect(
    (
      await f.owner.query(api.activities.view, {
        personal: true,
        stableIds: [f.a],
        training: true,
      })
    ).records,
  ).toHaveLength(1)
})

it('rejects sharing changes by recipients and sharing into a stable the owner cannot access', async () => {
  const f = await fixture()
  const other = await f.outsider.mutation(api.stables.add, {
    name: 'Other',
    location: 'Warsaw',
  })
  await expect(
    f.owner.mutation(api.activitySharing.setCalendars, {
      eventId: f.eventId,
      stableIds: [other],
    }),
  ).rejects.toThrow()
  await expect(
    f.member.mutation(api.activitySharing.setCalendars, {
      eventId: f.eventId,
      stableIds: [],
    }),
  ).rejects.toThrow()
  expect(
    (await f.member.query(api.activitySharing.detail, { eventId: f.eventId }))
      ?.event._id,
  ).toBe(f.eventId)
})

it('removes access immediately after membership removal and never includes unshared records', async () => {
  const f = await fixture()
  await f.owner.mutation(api.events.add, {
    horseIds: [f.horse],
    type: 'vet',
    title: 'Secret visit',
    date: '2026-01-06',
    time: '10:00',
  })
  expect(
    (
      await f.member.query(api.activities.view, {
        personal: false,
        stableIds: [f.b],
        training: false,
      })
    ).events,
  ).toEqual([])
  await f.t.run(async (ctx) => {
    const membership = await ctx.db
      .query('stableMembers')
      .withIndex('by_stable_id_user_id', (q) =>
        q.eq('stableId', f.b).eq('userId', f.memberId),
      )
      .unique()
    await ctx.db.delete(membership!._id)
  })
  expect(
    await f.member.query(api.activitySharing.detail, { eventId: f.eventId }),
  ).toBeNull()
})

it('stops the grant when its author loses horse editing permission', async () => {
  const f = await fixture()
  const outsider = await f.outsider.query(api.users.getCurrentUser, {})
  await f.t.run(async (ctx) => {
    await ctx.db.patch(f.horse, { ownerId: outsider!._id })
  })
  expect(
    await f.member.query(api.activitySharing.detail, { eventId: f.eventId }),
  ).toBeNull()
})

it('discloses multi-stable sharing in the existing horse record audience label', async () => {
  const f = await fixture()
  const audience = await f.owner.query(api.recordSharing.audience, {
    horseId: f.horse,
    recordId: f.eventId,
  })
  expect(
    audience.activityCalendars.map((stable) => stable.name).sort(),
  ).toEqual(['Stable A', 'Stable B'])
})

it('does not let a calendar member create a cross-stable grant for another owner’s horse', async () => {
  const f = await fixture()
  await f.owner.mutation(api.horseTransitions.connect, {
    horseId: f.horse,
    stableId: f.b,
  })
  await expect(
    f.member.mutation(api.events.add, {
      horseIds: [f.horse],
      stableId: f.b,
      sharedStableIds: [f.b, f.a],
      type: 'vet',
      title: 'Unauthorized share',
      date: '2026-01-06',
      time: '10:00',
    }),
  ).rejects.toThrow()
})

it('honors an explicitly private audience even when a creation API caller supplies a stable origin', async () => {
  const f = await fixture()
  await f.owner.mutation(api.horseTransitions.connect, {
    horseId: f.horse,
    stableId: f.b,
  })
  const id = await f.owner.mutation(api.events.add, {
    horseIds: [f.horse],
    stableId: f.b,
    sharedStableIds: [],
    type: 'vet',
    title: 'Private visit',
    date: '2026-01-06',
    time: '10:00',
  })
  const result = await f.member.query(api.activities.view, {
    personal: false,
    stableIds: [f.b],
    training: false,
  })
  expect(result.events.some((event) => event._id === id)).toBe(false)
})

it('keeps the rider report view available when the rider also sees the shared stable calendar', async () => {
  const f = await fixture()
  const id = await f.owner.mutation(api.activityParticipants.invite, {
    eventId: f.eventId,
    horseId: f.horse,
    date: '2026-01-05',
    email: 'member@example.test',
    role: 'rider',
  })
  await f.member.mutation(api.activityParticipants.respond, {
    id,
    accept: true,
  })
  expect(
    await f.member.query(api.activities.detailAccess, { eventId: f.eventId }),
  ).toBe('participant')
})

it('shares only with the selected stable, without publishing to the horse’s physical stable', async () => {
  const f = await fixture()
  await f.owner.mutation(api.horseTransitions.connect, {
    horseId: f.horse,
    stableId: f.a,
  })
  const id = await f.owner.mutation(api.events.add, {
    horseIds: [f.horse],
    sharedStableIds: [f.b],
    type: 'vet',
    title: 'Visit shared with B',
    date: '2026-01-06',
    time: '10:00',
  })
  const a = await f.owner.query(api.activities.view, {
    personal: false,
    stableIds: [f.a],
    training: false,
  })
  const b = await f.owner.query(api.activities.view, {
    personal: false,
    stableIds: [f.b],
    training: false,
  })
  expect(a.events.some((event) => event._id === id)).toBe(false)
  expect(b.events.some((event) => event._id === id)).toBe(true)
})
