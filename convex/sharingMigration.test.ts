import { convexTest } from 'convex-test'
import { expect, it } from 'vitest'
import { api, internal } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
it('backfills only proven current placement origins, preserves withdrawals and reports sole-source snapshots', async () => {
  const t = convexTest(schema, modules)
  const actor = t.withIdentity({
    subject: 'migration-owner',
    email: 'migration@example.test',
  })
  await actor.mutation(api.users.ensureCurrentUser, {})
  const user = (await actor.query(api.users.getCurrentUser, {}))!
  const stableId = await actor.mutation(api.stables.add, {
    name: 'Willow',
    location: 'Warsaw',
  })
  const horseId = await actor.mutation(api.horses.add, {
    name: 'Maple',
    age: 8,
    stableId,
  })
  const { proven, personal, withdrawn } = await t.run(async (ctx) => {
    const horse = (await ctx.db.get(horseId))!
    const base = {
      horseId,
      weight: 500,
      unit: 'kg' as const,
      measuredAt: 1,
      createdAt: 1,
      createdBy: user._id,
    }
    const provenId = await ctx.db.insert('horseWeightRecords', {
      ...base,
      stableId,
      sourcePlacementId: horse.currentPlacementId,
    })
    const withdrawnId = await ctx.db.insert('horseWeightRecords', {
      ...base,
      stableId,
      sourcePlacementId: horse.currentPlacementId,
    })
    const personalId = await ctx.db.insert('horseWeightRecords', base)
    await ctx.db.insert('recordShares', {
      recordId: withdrawnId,
      horseId,
      stableId,
      placementId: horse.currentPlacementId!,
      enabled: false,
      createdBy: user._id,
      updatedAt: 1,
    })
    await ctx.db.insert('horseSnapshots', {
      horseId,
      horseName: 'Maple',
      stableId,
      placementId: horse.currentPlacementId!,
      kind: 'horseWeightRecords',
      sourceId: 'missing-source',
      data: { weight: 480 },
      createdAt: 1,
    })
    return { proven: provenId, personal: personalId, withdrawn: withdrawnId }
  })
  expect(
    await t.mutation(internal.sharingMigration.backfillPage, {
      table: 'horseWeightRecords',
      cursor: null,
    }),
  ).toMatchObject({ granted: 1, withheld: 1, isDone: true })
  expect(
    await t.mutation(internal.sharingMigration.backfillPage, {
      table: 'horseWeightRecords',
      cursor: null,
    }),
  ).toMatchObject({ granted: 0 })
  const grants = await t.run((ctx) => ctx.db.query('recordShares').collect())
  expect(grants.find((g) => g.recordId === proven)?.enabled).toBe(true)
  expect(grants.find((g) => g.recordId === withdrawn)?.enabled).toBe(false)
  expect(grants.find((g) => g.recordId === personal)).toBeUndefined()
  expect(
    (
      await t.query(internal.sharingMigration.snapshotInventory, {
        cursor: null,
      })
    ).rows[0].requiresRecovery,
  ).toBe(true)
})
