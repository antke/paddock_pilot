import { describe, expect, it } from 'vitest'
import { convexTest } from 'convex-test'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
describe('analysis weight chronology', () => {
  it('uses the later same-day entry for latest weight and the earlier entry for change', async () => {
    const t = convexTest(schema, modules)
    const sampleStableId = await t.run(async (ctx) => {
      const ownerId = await ctx.db.insert('users', {
        clerkId: 'weight-owner',
        email: 'weight@example.com',
        firstName: 'Sample',
        createdAt: 1,
        updatedAt: 1,
      })
      await ctx.db.insert('userSubscriptions', {
        userId: ownerId,
        plan: 'personal_pro',
        status: 'active',
        createdAt: 1,
        updatedAt: 1,
      })
      const stableId = await ctx.db.insert('stables', {
        ownerId,
        name: 'Sample stable',
        location: 'Sample',
      })
      const horseId = await ctx.db.insert('horses', {
        ownerId,
        stableId,
        name: 'Sample horse',
        age: 9,
      })
      for (const [weight, createdAt] of [
        [500, 1],
        [510, 2],
      ])
        await ctx.db.insert('horseWeightRecords', {
          horseId,
          stableId,
          createdBy: ownerId,
          createdAt,
          weight,
          unit: 'kg',
          measuredAt: Date.UTC(2026, 8, 19),
        })
      return stableId
    })
    const result = await t
      .withIdentity({ subject: 'weight-owner', email: 'weight@example.com' })
      .query(api.stableAnalysis.getForStable, {
        stableId: sampleStableId,
        today: '2026-09-19',
        timezoneOffsetMinutes: 0,
      })
    expect(result.hasAccess).toBe(true)
    if (!result.hasAccess) throw new Error('Missing sample entitlement')
    expect(result.weightTrends[0]).toMatchObject({
      latestWeight: 510,
      previousWeight: 500,
      weightChange: 10,
    })
  })
})
