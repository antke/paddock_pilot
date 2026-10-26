import { convexTest } from 'convex-test'
import { expect, it } from 'vitest'
import schema from './schema'
import {
  effectiveShare,
  isRecordShared,
  writeRecordShare,
} from './libs/recordSharing'

const modules = import.meta.glob('./**/*.ts')

it('gives an occurrence exception precedence and bounds historical series sharing', () => {
  const shares = [
    { enabled: true, throughDate: '2026-10-24' },
    { enabled: false, occurrenceDate: '2026-10-23' },
    { enabled: true, occurrenceDate: '2026-10-25' },
  ]
  expect(effectiveShare(shares, '2026-10-22')).toBe(true)
  expect(effectiveShare(shares, '2026-10-23')).toBe(false)
  expect(effectiveShare(shares, '2026-10-24')).toBe(true)
  expect(effectiveShare(shares, '2026-10-25')).toBe(true)
  expect(effectiveShare(shares, '2026-10-26')).toBe(false)
  expect(effectiveShare(shares)).toBe(false)
  expect(
    effectiveShare(
      [{ enabled: false }, { enabled: true, occurrenceDate: '2026-10-23' }],
      '2026-10-23',
    ),
  ).toBe(true)
})

it('upserts grants safely and revokes on departure, transition, archive and rejoining', async () => {
  const t = convexTest(schema, modules)
  await t.run(async (ctx) => {
    const userId = await ctx.db.insert('users', {
      clerkId: 'owner',
      firstName: 'Owner',
      email: 'owner@example.test',
      createdAt: 0,
      updatedAt: 0,
    })
    const stableId = await ctx.db.insert('stables', {
      name: 'Willow',
      location: 'Warsaw',
      ownerId: userId,
    })
    const horseId = await ctx.db.insert('horses', {
      name: 'Maple',
      age: 8,
      ownerId: userId,
      stableId,
    })
    const placementId = await ctx.db.insert('horsePlacements', {
      horseId,
      stableId,
      startedAt: 0,
      createdBy: userId,
    })
    await ctx.db.patch(horseId, { currentPlacementId: placementId })
    const grant = {
      recordId: 'canonical-record',
      horseId,
      stableId,
      placementId,
      enabled: true,
      createdBy: userId,
    }
    const id = await writeRecordShare(ctx, grant)
    expect(await writeRecordShare(ctx, grant)).toBe(id)
    const horse = (await ctx.db.get(horseId))!
    expect(await isRecordShared(ctx, grant.recordId, horse, stableId)).toBe(
      true,
    )
    await writeRecordShare(ctx, {
      ...grant,
      enabled: false,
      occurrenceDate: '2026-10-24',
    })
    expect(
      await isRecordShared(ctx, grant.recordId, horse, stableId, '2026-10-24'),
    ).toBe(false)
    expect(
      await isRecordShared(ctx, grant.recordId, horse, stableId, '2026-10-25'),
    ).toBe(true)
    await ctx.db.patch(stableId, { archivedAt: 1 })
    expect(await isRecordShared(ctx, grant.recordId, horse, stableId)).toBe(
      false,
    )
    await ctx.db.patch(stableId, { archivedAt: undefined })
    await ctx.db.patch(placementId, { endedAt: 1 })
    expect(await isRecordShared(ctx, grant.recordId, horse, stableId)).toBe(
      false,
    )
    const nextPlacement = await ctx.db.insert('horsePlacements', {
      horseId,
      stableId,
      startedAt: 2,
      createdBy: userId,
    })
    await ctx.db.patch(horseId, { currentPlacementId: nextPlacement })
    expect(
      await isRecordShared(
        ctx,
        grant.recordId,
        (await ctx.db.get(horseId))!,
        stableId,
      ),
    ).toBe(false)
    await expect(writeRecordShare(ctx, grant)).rejects.toThrow(
      'placement changed',
    )
    expect(await ctx.db.query('recordShares').collect()).toHaveLength(2)
  })
})
