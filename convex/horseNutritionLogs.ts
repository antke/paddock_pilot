import { ConvexError, v } from 'convex/values'
import { nutritionLogAddSchema } from '../shared/horses/nutritionLogSchema'
import type { Doc } from './_generated/dataModel'
import { mutation, query   } from './_generated/server'
import type {MutationCtx, QueryCtx} from './_generated/server';
import {
  assertCanManageHorse,
  assertCanViewStable,
  getCurrentUser,
} from './libs/stablePermissions'

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

const byChangedAtDesc = (a: Doc<'horseNutritionLogs'>, b: Doc<'horseNutritionLogs'>) =>
  b.changedAt - a.changedAt

export const listForHorse = query({
  args: { horseId: v.id('horses') },
  handler: async (ctx, args) => {
    const horse = await ctx.db.get(args.horseId)
    if (!horse) return []

    await assertCanViewStable(ctx, horse.stableId)

    const logs = await ctx.db
      .query('horseNutritionLogs')
      .withIndex('by_horse_id', (q) => q.eq('horseId', args.horseId))
      .collect()

    return logs.sort(byChangedAtDesc)
  },
})

export const getPermissions = query({
  args: { horseId: v.id('horses') },
  handler: async (ctx, args) => {
    const horse = await ctx.db.get(args.horseId)
    if (!horse) return { canManage: false }

    const access = await assertCanViewStable(ctx, horse.stableId)

    return { canManage: access.role === 'owner' || horse.ownerId === access.userId }
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

    await assertCanManageHorse(ctx, horse, user._id)

    const input = validateAddInput(args)

    return await ctx.db.insert('horseNutritionLogs', {
      horseId: horse._id,
      stableId: horse.stableId,
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
    await assertCanManageHorse(ctx, horse)

    await ctx.db.delete(args.id)
  },
})
