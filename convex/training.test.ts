import { describe, expect, it } from 'vitest'
import { convexTest } from 'convex-test'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
async function setup() {
  const t = convexTest(schema, modules)
  const ids = await t.run(async (ctx) => {
    const admin = await ctx.db.insert('users', {
      clerkId: 'admin',
      email: 'admin@example.com',
      firstName: 'Admin',
      createdAt: 0,
      updatedAt: 0,
    })
    const member = await ctx.db.insert('users', {
      clerkId: 'member',
      email: 'member@example.com',
      firstName: 'Member',
      createdAt: 0,
      updatedAt: 0,
    })
    const outsider = await ctx.db.insert('users', {
      clerkId: 'outsider',
      email: 'outsider@example.com',
      firstName: 'Outsider',
      createdAt: 0,
      updatedAt: 0,
    })
    const stableId = await ctx.db.insert('stables', {
      ownerId: admin,
      name: 'Training yard',
      location: 'Warsaw',
    })
    await ctx.db.insert('stableMembers', {
      stableId,
      userId: member,
      role: 'member',
    })
    const horseId = await ctx.db.insert('horses', {
      stableId,
      ownerId: member,
      name: 'Juniper',
      age: 8,
    })
    const otherHorseId = await ctx.db.insert('horses', {
      stableId,
      ownerId: admin,
      name: 'Willow',
      age: 9,
    })
    return { admin, member, outsider, stableId, horseId, otherHorseId }
  })
  return {
    t,
    ...ids,
    asAdmin: t.withIdentity({ subject: 'admin' }),
    asMember: t.withIdentity({ subject: 'member' }),
    asOutsider: t.withIdentity({ subject: 'outsider' }),
  }
}
const details = {
  activities: ['flatwork' as const],
  format: 'lesson' as const,
  durationMinutes: 40,
  focus: 'Transitions',
}
describe('training records', () => {
  it('separates events and records completion per horse and recurring date', async () => {
    const f = await setup()
    const id = await f.asAdmin.mutation(api.events.add, {
      stableId: f.stableId,
      horseIds: [f.horseId, f.otherHorseId],
      date: '2026-01-05',
      time: '10:00',
      title: 'Weekly lesson',
      type: 'training',
      status: 'completed',
      training: details,
      recurrence: {
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: [1],
        end: { type: 'never' },
      },
    })
    expect(
      await f.asAdmin.query(api.events.listForStable, { stableId: f.stableId }),
    ).toEqual([])
    expect(
      await f.asAdmin.query(api.events.listForHorse, { horseId: f.horseId }),
    ).toEqual([])
    let data = await f.asAdmin.query(api.training.listForStable, {
      stableId: f.stableId,
    })
    expect(data.events).toHaveLength(1)
    expect(data.events[0].status).toBe('planned')
    expect(data.records.map((record) => record.date)).toEqual([
      '2026-01-05',
      '2026-01-05',
    ])
    await f.asMember.mutation(api.training.saveRecord, {
      eventId: id,
      horseId: f.horseId,
      date: '2026-01-12',
      status: 'completed',
      details,
      outcome: 'More balanced',
    })
    // Retrying or correcting the same horse/date must not count a second session.
    await f.asMember.mutation(api.training.saveRecord, {
      eventId: id,
      horseId: f.horseId,
      date: '2026-01-12',
      status: 'completed',
      details,
      outcome: 'Corrected notes',
    })
    data = await f.asAdmin.query(api.training.listForStable, {
      stableId: f.stableId,
    })
    expect(data.records).toHaveLength(3)
    expect(
      data.records.find((record) => record.date === '2026-01-12'),
    ).toMatchObject({
      recordedBy: f.member,
      outcome: 'Corrected notes',
      horseId: f.horseId,
    })
    await expect(
      f.asMember.mutation(api.training.saveRecord, {
        eventId: id,
        horseId: f.otherHorseId,
        date: '2026-01-12',
        status: 'completed',
        details,
      }),
    ).rejects.toThrow('Only the horse owner')
    await expect(
      f.asOutsider.query(api.training.listForStable, { stableId: f.stableId }),
    ).rejects.toThrow()
    await expect(
      f.asMember.mutation(api.training.saveRecord, {
        eventId: id,
        horseId: f.horseId,
        date: '2026-01-13',
        status: 'completed',
        details,
      }),
    ).rejects.toThrow('scheduled occurrence')
    await expect(
      f.asMember.mutation(api.training.saveRecord, {
        eventId: id,
        horseId: f.horseId,
        date: '2099-01-05',
        status: 'completed',
        details,
      }),
    ).rejects.toThrow()
    // Withdrawal stops future participation without erasing recorded history.
    const association = await f.t.run((ctx) =>
      ctx.db
        .query('eventsHorses')
        .withIndex('by_horse_id_event_id', (q) =>
          q.eq('horseId', f.horseId).eq('eventId', id),
        )
        .unique(),
    )
    await f.asMember.mutation(api.events.withdrawHorseFromEvent, {
      eventHorseId: association!._id,
    })
    data = await f.asAdmin.query(api.training.listForStable, {
      stableId: f.stableId,
    })
    expect(data.records).toHaveLength(3)
    expect(data.events[0].horseIds).not.toContain(f.horseId)
  })

  it('preserves schedules with history and legacy records without inventing completion', async () => {
    const f = await setup()
    const id = await f.t.run((ctx) =>
      ctx.db.insert('events', {
        stableId: f.stableId,
        horseIds: [f.horseId],
        createdBy: f.member,
        date: '2026-01-05',
        time: '10:00',
        title: 'Legacy training',
        type: 'training',
        status: 'completed',
        recurrence: { interval: 1, frequency: 'weekly', daysOfWeek: [1] },
      }),
    )
    const data = await f.asAdmin.query(api.training.listForStable, {
      stableId: f.stableId,
    })
    expect(data.events[0]._id).toBe(id)
    expect(data.records).toHaveLength(0)
    await expect(
      f.asMember.mutation(api.events.update, {
        id,
        stableId: f.stableId,
        horseIds: [f.horseId],
        date: '2026-01-06',
        time: '10:00',
        title: 'Moved',
        type: 'training',
        training: details,
      }),
    ).rejects.toThrow('training history')
    await expect(
      f.asMember.mutation(api.events.update, {
        id,
        stableId: f.stableId,
        horseIds: [f.horseId],
        date: '2026-01-05',
        time: '10:00',
        title: 'Converted',
        type: 'vet',
      }),
    ).rejects.toThrow('cannot be converted')
    await f.asAdmin.mutation(api.events.add, {
      stableId: f.stableId,
      horseIds: [f.horseId],
      date: '2026-02-01',
      time: '10:00',
      title: 'Show',
      type: 'competition',
    })
    expect(
      (
        await f.asAdmin.query(api.events.listForStable, {
          stableId: f.stableId,
        })
      ).map((event) => event.type),
    ).toEqual(['competition'])
  })
})
