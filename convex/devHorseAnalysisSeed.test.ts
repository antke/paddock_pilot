import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { convexTest } from 'convex-test'
import { makeFunctionReference } from 'convex/server'
import schema from './schema'
import { api } from './_generated/api'
import { buildHorseAnalysisDemo } from './libs/horseAnalysisDemo'

const modules = import.meta.glob('./**/*.ts')
const seed = makeFunctionReference<'mutation'>('devHorseAnalysisSeed:seedYear')
beforeEach(() => {
  vi.stubEnv('DEV_SEED_ENABLED', 'true')
  vi.stubEnv('ENFORCE_PREMIUM_ANALYTICS', 'false')
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-09-30T15:00:00Z'))
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.useRealTimers()
})
async function fixture(name = 'Paddock Pilot Demo Yard') {
  const t = convexTest(schema, modules)
  const ids = await t.run(async (ctx) => {
    const ownerId = await ctx.db.insert('users', {
      clerkId: 'analysis-demo-owner',
      email: 'owner@example.com',
      firstName: 'Demo',
      createdAt: 1,
      updatedAt: 1,
    })
    const stableId = await ctx.db.insert('stables', {
      name,
      location: 'Demo',
      ownerId,
    })
    const horseId = await ctx.db.insert('horses', {
      stableId,
      ownerId,
      name: 'Thistle Run',
      age: 5,
    })
    const otherId = await ctx.db.insert('horses', {
      stableId,
      ownerId,
      name: 'Untouched horse',
      age: 6,
    })
    const weightId = await ctx.db.insert('horseWeightRecords', {
      horseId,
      stableId,
      weight: 583,
      unit: 'kg',
      bodyConditionScore: 6,
      measuredAt: Date.UTC(2026, 5, 20, 12),
      createdBy: ownerId,
      createdAt: 1,
      notes: 'Existing observation',
    })
    return { horseId, otherId, weightId }
  })
  return {
    t,
    ...ids,
    args: {
      horseId: ids.horseId,
      end: '2026-09-30',
      confirm: 'seed-horse-analysis-year',
    },
  }
}
describe('additive annual analysis seed', () => {
  it('covers all months and comparison kinds, preserving existing data and remaining idempotent', async () => {
    const f = await fixture()
    const before = await f.t.run((ctx) => ctx.db.get(f.weightId))
    const result = await f.t.mutation(seed, f.args)
    expect(result.start).toBe('2025-10-01')
    expect(result.added.weights).toBeGreaterThan(30)
    expect(result.added.training).toBeGreaterThan(170)
    const second = await f.t.mutation(seed, f.args)
    expect(Object.values(second.added).every((n) => n === 0)).toBe(true)
    expect(await f.t.run((ctx) => ctx.db.get(f.weightId))).toEqual(before)
    expect(
      await f.t.run((ctx) =>
        ctx.db
          .query('horseWeightRecords')
          .withIndex('by_horse_id', (q) => q.eq('horseId', f.otherId))
          .collect(),
      ),
    ).toHaveLength(0)
    const comparison = await f.t
      .withIdentity({ subject: 'analysis-demo-owner' })
      .query(api.stableAnalysis.getHorseComparisons, {
        horseId: f.horseId,
        start: '2025-10-01',
        end: '2026-09-30',
        timeZone: 'Europe/Warsaw',
      })
    expect(new Set(comparison.records.map((r) => r.kind))).toEqual(
      new Set([
        'weight',
        'condition',
        'nutrition',
        'health',
        'medication',
        'training',
        'care',
        'competition',
      ]),
    )
    const training = comparison.records.filter((r) => r.kind === 'training')
    expect(new Set(training.map((r) => r.date.slice(0, 7))).size).toBe(12)
    expect(new Set(training.map((r) => r.status))).toEqual(
      new Set(['completed', 'skipped', 'cancelled']),
    )
    expect(
      training.some(
        (r) => r.status === 'completed' && r.durationMinutes === undefined,
      ),
    ).toBe(true)
    expect(
      comparison.records
        .filter((r) => r.kind === 'weight')
        .every((r) => r.value! > 570 && r.value! < 610),
    ).toBe(true)
    const links = await f.t.run((ctx) => ctx.db.query('eventsHorses').collect())
    expect(links).toHaveLength(result.added.events)
  })
  it('refuses ordinary yards, disabled seeding and future dates', async () => {
    const ordinary = await fixture('Real yard')
    await expect(ordinary.t.mutation(seed, ordinary.args)).rejects.toThrow(
      'Only the active demo yard',
    )
    const f = await fixture()
    await expect(
      f.t.mutation(seed, { ...f.args, end: '2026-10-01' }),
    ).rejects.toThrow('valid past or current')
    vi.stubEnv('DEV_SEED_ENABLED', 'false')
    await expect(f.t.mutation(seed, f.args)).rejects.toThrow('disabled')
  })
  it('keeps historical dates valid across leap years and recovery periods free of completed sessions', () => {
    const plan = buildHorseAnalysisDemo('2024-09-30')
    expect(
      plan.events.every(
        (r) => r.event.date >= plan.start && r.event.date <= plan.end,
      ),
    ).toBe(true)
    for (const issue of plan.health) {
      const start = new Date(issue.notedAt).toISOString().slice(0, 10)
      const end = new Date(issue.resolvedAt!).toISOString().slice(0, 10)
      expect(
        plan.events
          .filter(
            (r) => r.training && r.event.date >= start && r.event.date <= end,
          )
          .every((r) => r.training!.status === 'skipped'),
      ).toBe(true)
    }
  })
})
