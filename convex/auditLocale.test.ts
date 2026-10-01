import { describe, expect, it } from 'vitest'
import { convexTest } from 'convex-test'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

async function setup() {
  const t = convexTest(schema, modules)
  const ids = await t.run(async (ctx) => {
    const ownerId = await ctx.db.insert('users', {
      clerkId: 'owner',
      email: 'owner@example.com',
      firstName: 'Owner',
      createdAt: 0,
      updatedAt: 0,
    })
    const memberId = await ctx.db.insert('users', {
      clerkId: 'member',
      email: 'member@example.com',
      firstName: 'Żaneta',
      lastName: 'Łącka',
      createdAt: 0,
      updatedAt: 0,
    })
    const stableId = await ctx.db.insert('stables', {
      ownerId,
      name: 'Test stable',
      location: 'Warsaw',
    })
    const membershipId = await ctx.db.insert('stableMembers', {
      stableId,
      userId: memberId,
      role: 'member',
    })
    const horseId = await ctx.db.insert('horses', {
      stableId,
      ownerId,
      name: 'Location changed',
      age: 8,
    })
    return { ownerId, memberId, stableId, membershipId, horseId }
  })
  return { t, asOwner: t.withIdentity({ subject: 'owner' }), ...ids }
}
describe('translation-friendly audit details', () => {
  it('stores event change codes alongside the readable legacy summary', async () => {
    const f = await setup()
    const input = {
      stableId: f.stableId,
      horseIds: [f.horseId],
      date: '2026-09-10',
      time: '10:00',
      type: 'vet' as const,
      title: 'Location changed',
      status: 'planned' as const,
    }
    const id = await f.asOwner.mutation(api.events.add, input)
    await f.asOwner.mutation(api.events.update, { ...input, id, time: '11:00' })
    const entries = await f.t.run((ctx) =>
      ctx.db.query('stableAuditLogs').collect(),
    )
    expect(
      entries.find((entry) => entry.action === 'event.created')?.summary,
    ).toBe('Location changed')
    expect(
      entries.find((entry) => entry.action === 'event.updated'),
    ).toMatchObject({
      summary: 'Event time changed',
      details: { kind: 'event_changes', changes: ['time'] },
    })
  })
  it.each([false, true])(
    'records member names and reassignment counts (reassign=%s)',
    async (reassign) => {
      const f = await setup()
      if (reassign)
        await f.t.run((ctx) => ctx.db.patch(f.horseId, { ownerId: f.memberId }))
      if (reassign)
        await f.asOwner.mutation(
          api.stableMembers.removeWithHorseReassignment,
          { id: f.membershipId, reassignToUserId: f.ownerId },
        )
      else
        await f.asOwner.mutation(api.stableMembers.remove, {
          id: f.membershipId,
        })
      const entries = await f.t.run((ctx) =>
        ctx.db.query('stableAuditLogs').collect(),
      )
      expect(
        entries.find((entry) => entry.action === 'member.removed')?.details,
      ).toEqual({
        kind: 'member_removed',
        memberName: 'Żaneta Łącka',
        reassignedHorseCount: reassign ? 1 : 0,
      })
    },
  )
})
