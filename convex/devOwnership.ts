import { ConvexError, v } from 'convex/values'
import { internalAction, internalMutation } from './_generated/server'
import { internal } from './_generated/api'
import type { MutationCtx } from './_generated/server'
import type { Id } from './_generated/dataModel'

const requireTestData = () => {
  if (process.env.DEV_SEED_ENABLED !== 'true')
    throw new ConvexError('Development fixtures are disabled')
}
/** Only for disposable pre-release fixtures; not a migration of real customer data. */
export async function installFixturePlacement(
  ctx: MutationCtx,
  horseId: Id<'horses'>,
) {
  const horse = await ctx.db.get(horseId)
  if (!horse?.stableId || horse.currentPlacementId || !horse.ownerId) return
  const placementId = await ctx.db.insert('horsePlacements', {
    horseId,
    stableId: horse.stableId,
    startedAt: horse._creationTime,
    createdBy: horse.ownerId,
  })
  await ctx.db.patch(horseId, { currentPlacementId: placementId })
  for (const table of [
    'horseHealthIssues',
    'horseWeightRecords',
    'horseMedicationRecords',
    'horseNutritionLogs',
    'trainingRecords',
    'stableDocuments',
    'eventsHorses',
  ] as const) {
    const rows = await ctx.db
      .query(table)
      .withIndex('by_horse_id', (q) => q.eq('horseId', horseId))
      .collect()
    for (const row of rows)
      if (
        !row.sourcePlacementId &&
        ('eventId' in row || row.stableId === horse.stableId)
      )
        await ctx.db.patch(row._id, { sourcePlacementId: placementId })
  }
  const reminders = await ctx.db
    .query('careReminders')
    .withIndex('by_horse_id_due_date', (q) => q.eq('horseId', horseId))
    .collect()
  for (const row of reminders)
    if (row.stableId === horse.stableId && !row.sourcePlacementId)
      await ctx.db.patch(row._id, { sourcePlacementId: placementId })
}
export const prepareTestData = internalMutation({
  args: {
    confirm: v.literal('prepare-disposable-ownership-fixtures'),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requireTestData()
    const page = await ctx.db
      .query('horses')
      .paginate({ numItems: 10, cursor: args.cursor ?? null })
    for (const horse of page.page) await installFixturePlacement(ctx, horse._id)
    if (!page.isDone)
      await ctx.scheduler.runAfter(0, internal.devOwnership.prepareTestData, {
        confirm: args.confirm,
        cursor: page.continueCursor,
      })
    return { processed: page.page.length, complete: page.isDone }
  },
})
const domainTables = [
  'horseTransitions',
  'horseSnapshots',
  'horseInvitations',
  'horseCarers',
  'horsePlacements',
  'horseAuditLogs',
  'eventsHorses',
  'trainingRecords',
  'horseHealthIssues',
  'horseWeightRecords',
  'horseMedicationRecords',
  'horseNutritionLogs',
  'careReminders',
  'stableDocuments',
  'events',
  'horses',
  'stableMembers',
  'stableOnboarding',
  'stableInvitations',
  'stableAuditLogs',
  'stableUpdates',
  'stableProviders',
  'stables',
  'personalProviders',
] as const
export const resetPage = internalMutation({
  args: {
    confirm: v.literal('discard-all-test-domain-data'),
    table: v.union(...domainTables.map((table) => v.literal(table))),
  },
  handler: async (ctx, args) => {
    requireTestData()
    const rows = await ctx.db.query(args.table).take(100)
    for (const row of rows) await ctx.db.delete(row._id)
    return rows.length
  },
})
/** Preserves Clerk-backed users, subscriptions, pending billing sync and user profile files. */
export const resetTestDomain = internalAction({
  args: { confirm: v.literal('discard-all-test-domain-data') },
  handler: async (ctx, args) => {
    requireTestData()
    for (const table of domainTables)
      while (
        (await ctx.runMutation(internal.devOwnership.resetPage, {
          ...args,
          table,
        })) === 100
      ) {
        /* bounded transactions */
      }
    return { reset: true }
  },
})
