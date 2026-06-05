import { ConvexError, v } from 'convex/values'
import {
  weightRecordAddSchema,
  weightUnitSchema,
} from '../shared/horses/weightRecordSchema'
import type { Doc } from './_generated/dataModel'
import { mutation, query   } from './_generated/server'
import type {MutationCtx, QueryCtx} from './_generated/server';
import {
  assertCanManageHorse,
  assertCanViewStable,
  getCurrentUser,
} from './libs/stablePermissions'

const weightUnitValidator = v.union(v.literal('kg'), v.literal('lb'))

const validateAddInput = (args: {
  horseId: string
  weight: number
  unit: 'kg' | 'lb'
  measuredAt: number
  bodyConditionScore?: number
  notes?: string
}) => {
  const result = weightRecordAddSchema.safeParse(args)

  if (!result.success) {
    throw new ConvexError(
      result.error.issues[0]?.message ?? 'Invalid weight record input',
    )
  }

  return result.data
}

const getRecordHorse = async (
  ctx: MutationCtx | QueryCtx,
  record: Doc<'horseWeightRecords'>,
) => {
  const horse = await ctx.db.get(record.horseId)

  if (!horse) throw new ConvexError('Horse not found')

  return horse
}

const byMeasuredAtDesc = (
  a: Doc<'horseWeightRecords'>,
  b: Doc<'horseWeightRecords'>,
) => b.measuredAt - a.measuredAt

export const listForHorse = query({
  args: { horseId: v.id('horses') },
  handler: async (ctx, args) => {
    const horse = await ctx.db.get(args.horseId)
    if (!horse) return []

    await assertCanViewStable(ctx, horse.stableId)

    const records = await ctx.db
      .query('horseWeightRecords')
      .withIndex('by_horse_id', (q) => q.eq('horseId', args.horseId))
      .collect()

    return records.sort(byMeasuredAtDesc)
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
    weight: v.number(),
    unit: weightUnitValidator,
    measuredAt: v.number(),
    bodyConditionScore: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const horse = await ctx.db.get(args.horseId)
    if (!horse) throw new ConvexError('Horse not found')

    await assertCanManageHorse(ctx, horse, user._id)

    const input = validateAddInput(args)
    const unit = weightUnitSchema.parse(input.unit)
    const now = Date.now()

    return await ctx.db.insert('horseWeightRecords', {
      horseId: horse._id,
      stableId: horse.stableId,
      weight: input.weight,
      unit,
      measuredAt: input.measuredAt,
      bodyConditionScore: input.bodyConditionScore,
      notes: input.notes,
      createdBy: user._id,
      createdAt: now,
    })
  },
})

export const remove = mutation({
  args: { id: v.id('horseWeightRecords') },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.id)
    if (!record) throw new ConvexError('Weight record not found')

    const horse = await getRecordHorse(ctx, record)
    await assertCanManageHorse(ctx, horse)

    await ctx.db.delete(args.id)
  },
})
