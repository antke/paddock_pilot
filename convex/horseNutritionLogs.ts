import {
  canEditHorseRecord,
  auditHorse,
  assertCanReadHorse,
  assertCanAddHorseRecord,
  assertCanEditHorseRecord,
} from './libs/horsePermissions'
import { ConvexError, v } from 'convex/values'
import { nutritionLogAddSchema } from '../shared/horses/nutritionLogSchema'
import type { Doc } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { getCurrentUser } from './libs/stablePermissions'

const validateAddInput = (args: {
  horseId: string
  changedAt: number
  summary: string
  feedingRoutineSnapshot?: string
  recommendedSnapshot?: Array<string>
  avoidSnapshot?: Array<string>
  notes?: string
}) => {
  const result = nutritionLogAddSchema.safeParse(args)

  if (!result.success) {
    throw new ConvexError(
      result.error.issues[0]?.message ?? 'Invalid nutrition log input',
    )
  }

  return result.data
}

const getLogHorse = async (
  ctx: MutationCtx | QueryCtx,
  log: Doc<'horseNutritionLogs'>,
) => {
  const horse = await ctx.db.get(log.horseId)

  if (!horse) throw new ConvexError('Horse not found')

  return horse
}

const byChangedAtDesc = (
  a: Doc<'horseNutritionLogs'>,
  b: Doc<'horseNutritionLogs'>,
) => b.changedAt - a.changedAt

export const listForHorse = query({
  args: { horseId: v.id('horses') },
  handler: async (ctx, args) => {
    const horse = await ctx.db.get(args.horseId)
    if (!horse) return []

    const access = await assertCanReadHorse(ctx, horse)

    const logs = await ctx.db
      .query('horseNutritionLogs')
      .withIndex('by_horse_id', (q) => q.eq('horseId', args.horseId))
      .collect()

    return logs
      .map((record) => ({
        ...record,
        canEdit: canEditHorseRecord(access, horse, record),
      }))
      .sort(byChangedAtDesc)
  },
})

export const getPermissions = query({
  args: { horseId: v.id('horses') },
  handler: async (ctx, args) => {
    const horse = await ctx.db.get(args.horseId)
    if (!horse) return { canManage: false }

    const access = await assertCanReadHorse(ctx, horse)

    return { canManage: access.canAddRecords }
  },
})

export const add = mutation({
  args: {
    horseId: v.id('horses'),
    changedAt: v.number(),
    summary: v.string(),
    feedingRoutineSnapshot: v.optional(v.string()),
    recommendedSnapshot: v.optional(v.array(v.string())),
    avoidSnapshot: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const horse = await ctx.db.get(args.horseId)
    if (!horse) throw new ConvexError('Horse not found')

    const access = await assertCanAddHorseRecord(ctx, horse, user._id)
    await auditHorse(ctx, horse._id, user._id, 'horseNutritionLogs.added')

    const input = validateAddInput(args)

    return await ctx.db.insert('horseNutritionLogs', {
      horseId: horse._id,
      ...access.recordOrigin,
      changedAt: input.changedAt,
      summary: input.summary,
      feedingRoutineSnapshot: input.feedingRoutineSnapshot,
      recommendedSnapshot: input.recommendedSnapshot,
      avoidSnapshot: input.avoidSnapshot,
      notes: input.notes,
      createdBy: user._id,
      createdAt: Date.now(),
    })
  },
})

export const remove = mutation({
  args: { id: v.id('horseNutritionLogs') },
  handler: async (ctx, args) => {
    const log = await ctx.db.get(args.id)
    if (!log) throw new ConvexError('Nutrition log not found')

    const horse = await getLogHorse(ctx, log)
    const recordAccess = await assertCanEditHorseRecord(ctx, horse, log)
    await auditHorse(
      ctx,
      horse._id,
      recordAccess.userId,
      'horseNutritionLogs.changed',
      JSON.stringify(log),
    )

    await ctx.db.delete(args.id)
  },
})
