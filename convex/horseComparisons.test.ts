import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { convexTest } from 'convex-test'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
beforeEach(() => vi.stubEnv('ENFORCE_PREMIUM_ANALYTICS', 'true'))
afterEach(() => vi.unstubAllEnvs())
async function fixture(premium = true) {
  const t = convexTest(schema, modules)
  const ids = await t.run(async (ctx) => {
    const userId = await ctx.db.insert('users', {
      clerkId: 'comparison-owner',
      email: 'comparison@example.com',
      firstName: 'Owner',
      createdAt: 1,
      updatedAt: 1,
    })
    if (premium)
      await ctx.db.insert('userSubscriptions', {
        userId,
        plan: 'personal_pro',
        status: 'active',
        createdAt: 1,
        updatedAt: 1,
      })
    const stableId = await ctx.db.insert('stables', {
      ownerId: userId,
      name: 'Yard',
      location: 'Sample',
    })
    const horseId = await ctx.db.insert('horses', {
      stableId,
      ownerId: userId,
      name: 'Horse',
      age: 9,
    })
    const otherHorseId = await ctx.db.insert('horses', {
      stableId,
      ownerId: userId,
      name: 'Other',
      age: 9,
    })
    return { userId, stableId, horseId, otherHorseId }
  })
  const owner = t.withIdentity({
    subject: 'comparison-owner',
    email: 'comparison@example.com',
  })
  return {
    t,
    owner,
    ...ids,
    args: {
      horseId: ids.horseId,
      start: '2026-02-01',
      end: '2026-03-31',
      timeZone: 'Europe/Warsaw',
    },
  }
}

describe('horse comparison evidence and access', () => {
  it('normalises units, keeps same-day observations and excludes another horse', async () => {
    const f = await fixture()
    await f.t.run(async (ctx) => {
      for (const [horseId, weight, unit, createdAt] of [
        [f.horseId, 500, 'kg', 1],
        [f.horseId, 500 / 0.45359237, 'lb', 2],
        [f.otherHorseId, 650, 'kg', 3],
      ] as const) {
        await ctx.db.insert('horseWeightRecords', {
          horseId,
          stableId: f.stableId,
          createdBy: f.userId,
          weight,
          unit,
          measuredAt: Date.UTC(2026, 1, 2, 23, 30),
          createdAt,
        })
      }
    })
    const result = await f.owner.query(
      api.stableAnalysis.getHorseComparisons,
      f.args,
    )
    expect(result.records).toHaveLength(2)
    expect(result.records.every((r) => r.date === '2026-02-03')).toBe(true)
    for (const record of result.records) expect(record.value).toBeCloseTo(500)
    expect(result.records.some((r) => r.originalUnit === 'lb')).toBe(true)
  })
  it('includes courses overlapping the range, without inventing end dates', async () => {
    const f = await fixture()
    await f.t.run(async (ctx) => {
      await ctx.db.insert('horseMedicationRecords', {
        horseId: f.horseId,
        stableId: f.stableId,
        medicationName: 'Recorded course',
        dosage: 'Recorded dose',
        startDate: '2026-01-20',
        status: 'active',
        createdBy: f.userId,
        createdAt: 1,
        updatedAt: 1,
      })
      await ctx.db.insert('horseHealthIssues', {
        horseId: f.horseId,
        stableId: f.stableId,
        title: 'Earlier issue',
        notedAt: Date.UTC(2026, 0, 20),
        resolvedAt: Date.UTC(2026, 1, 4),
        status: 'resolved',
        createdBy: f.userId,
        createdAt: 1,
        updatedAt: 1,
      })
    })
    const result = await f.owner.query(
      api.stableAnalysis.getHorseComparisons,
      f.args,
    )
    expect(result.records).toHaveLength(2)
    expect(result.records.find((r) => r.kind === 'medication')).toMatchObject({
      date: '2026-01-20',
      endUnknown: true,
    })
    expect(result.records.find((r) => r.kind === 'health')).toMatchObject({
      endDate: '2026-02-04',
    })
  })
  it('uses per-occurrence completion, preserves withdrawn history and excludes recurring care inference', async () => {
    const f = await fixture()
    await f.t.run(async (ctx) => {
      const details = {
        activities: ['flatwork' as const],
        format: 'regular' as const,
      }
      const eventId = await ctx.db.insert('events', {
        stableId: f.stableId,
        createdBy: f.userId,
        horseIds: [],
        type: 'training',
        title: 'Recurring session',
        date: '2026-02-01',
        time: '10:00',
        status: 'completed',
        training: details,
        recurrence: { frequency: 'weekly', interval: 1, daysOfWeek: [0] },
      })
      await ctx.db.insert('trainingRecords', {
        stableId: f.stableId,
        eventId,
        horseId: f.horseId,
        date: '2026-02-08',
        status: 'completed',
        details,
        recordedBy: f.userId,
        createdAt: 1,
        updatedAt: 1,
      })
      await ctx.db.insert('events', {
        stableId: f.stableId,
        createdBy: f.userId,
        horseIds: [f.horseId],
        type: 'training',
        title: 'Legacy one-off',
        date: '2026-02-05',
        time: '10:00',
        status: 'completed',
        training: { ...details, durationMinutes: 40 },
      })
      await ctx.db.insert('events', {
        stableId: f.stableId,
        createdBy: f.userId,
        horseIds: [f.horseId],
        type: 'vet',
        title: 'Recurring care',
        date: '2026-02-01',
        time: '10:00',
        status: 'completed',
        recurrence: { frequency: 'weekly', interval: 1, daysOfWeek: [0] },
      })
    })
    const result = await f.owner.query(
      api.stableAnalysis.getHorseComparisons,
      f.args,
    )
    expect(result.records).toHaveLength(2)
    expect(result.records.map((r) => r.date)).toEqual([
      '2026-02-05',
      '2026-02-08',
    ])
    expect(result.records[1].durationMinutes).toBeUndefined()
    expect(result.records.every((r) => r.kind === 'training')).toBe(true)
  })
  it('enforces membership and premium access server-side', async () => {
    const f = await fixture(false)
    expect(
      await f.owner.query(api.stableAnalysis.getHorseComparisons, f.args),
    ).toEqual({ hasAccess: false, records: [] })
    await expect(
      f.t
        .withIdentity({ subject: 'outsider' })
        .query(api.stableAnalysis.getHorseComparisons, f.args),
    ).rejects.toThrow()
    await expect(
      f.t.query(api.stableAnalysis.getHorseComparisons, f.args),
    ).rejects.toThrow()
  })
  it('rejects invalid dates, zones, and deleted horses', async () => {
    const f = await fixture()
    await expect(
      f.owner.query(api.stableAnalysis.getHorseComparisons, {
        ...f.args,
        start: '2026-02-30',
      }),
    ).rejects.toThrow()
    await expect(
      f.owner.query(api.stableAnalysis.getHorseComparisons, {
        ...f.args,
        timeZone: 'not-a-zone',
      }),
    ).rejects.toThrow()
    await f.t.run((ctx) => ctx.db.patch(f.horseId, { deletedAt: 1 }))
    await expect(
      f.owner.query(api.stableAnalysis.getHorseComparisons, f.args),
    ).rejects.toThrow('Horse not found')
  })
})

it('does not label unrelated completed events as care visits', async () => {
  const f = await fixture()
  await f.t.run(async (ctx) => {
    for (const type of [
      'other',
      'vet',
      'dentist',
      'hoof_trimming',
      'massage',
      'competition',
    ] as const)
      await ctx.db.insert('events', {
        stableId: f.stableId,
        createdBy: f.userId,
        horseIds: [f.horseId],
        type,
        title: type,
        date: '2026-02-12',
        time: '10:00',
        status: 'completed',
      })
  })
  const result = await f.owner.query(
    api.stableAnalysis.getHorseComparisons,
    f.args,
  )
  expect(
    result.records
      .filter((record) => record.kind === 'care')
      .map((record) => record.title)
      .sort(),
  ).toEqual(['dentist', 'hoof_trimming', 'massage', 'vet'])
  expect(result.records.some((record) => record.title === 'other')).toBe(false)
  expect(
    result.records.filter((record) => record.kind === 'competition'),
  ).toHaveLength(1)
})
