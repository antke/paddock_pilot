import {
  assertHorseWorkspace,
  initializeRecordSharing,
  readableRecords,
  recordCapabilities,
} from './libs/recordCapabilities'
import { creationReplay, recordCreation } from './libs/creationRequests'
import {
  auditHorse,
  assertCanReadHorse,
  assertCanAddHorseRecord,
  assertCanEditHorseRecord,
} from './libs/horsePermissions'
import { compareWeightRecordsNewestFirst } from '../shared/horses/weightRecordOrder'
import { ConvexError, v } from 'convex/values'
import {
  weightRecordAddSchema,
  weightUnitSchema,
} from '../shared/horses/weightRecordSchema'
import type { Doc } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { getCurrentUser } from './libs/stablePermissions'

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

export const listForHorse = query({
  args: { horseId: v.id('horses'), stableId: v.optional(v.id('stables')) },
  handler: async (ctx, args) => {
    const horse = await ctx.db.get(args.horseId)
    if (!horse) return []

    await assertCanReadHorse(ctx, horse)
    await assertHorseWorkspace(ctx, horse, args.stableId)

    const records = await ctx.db
      .query('horseWeightRecords')
      .withIndex('by_horse_id', (q) => q.eq('horseId', args.horseId))
      .collect()

    return (
      await Promise.all(
        (await readableRecords(ctx, horse, records, args.stableId)).map(
          async (record) => ({
            ...record,
            canEdit: (await recordCapabilities(ctx, horse, record)).editContent,
          }),
        ),
      )
    ).sort(compareWeightRecordsNewestFirst)
  },
})

export const getPermissions = query({
  args: { horseId: v.id('horses') },
  handler: async (ctx, args) => {
    const horse = await ctx.db.get(args.horseId)
    if (!horse) return { canManage: false }

    const access = await assertCanReadHorse(ctx, horse)

    return {
      canManage: access.canAddRecords,
    }
  },
})

export const add = mutation({
  args: {
    requestId: v.optional(v.string()),
    horseId: v.id('horses'),
    shareWithStable: v.optional(v.boolean()),
    weight: v.number(),
    unit: weightUnitValidator,
    measuredAt: v.number(),
    bodyConditionScore: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const replay = await creationReplay(
      ctx,
      user._id,
      args.requestId,
      'horseWeightRecords.add',
    )
    if (replay) return ctx.db.normalizeId('horseWeightRecords', replay)!
    const horse = await ctx.db.get(args.horseId)
    if (!horse) throw new ConvexError('Horse not found')

    const access = await assertCanAddHorseRecord(ctx, horse, user._id)
    await auditHorse(ctx, horse._id, user._id, 'horseWeightRecords.added')

    const input = validateAddInput(args)
    const unit = weightUnitSchema.parse(input.unit)
    const now = Date.now()

    const id = await ctx.db.insert('horseWeightRecords', {
      horseId: horse._id,
      ...access.recordOrigin,
      weight: input.weight,
      unit,
      measuredAt: input.measuredAt,
      bodyConditionScore: input.bodyConditionScore,
      notes: input.notes,
      createdBy: user._id,
      createdAt: now,
    })
    await initializeRecordSharing(ctx, horse, id, args.shareWithStable)
    await recordCreation(
      ctx,
      user._id,
      args.requestId,
      'horseWeightRecords.add',
      id,
    )
    return id
  },
})

export const remove = mutation({
  args: { id: v.id('horseWeightRecords') },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.id)
    if (!record) throw new ConvexError('Weight record not found')

    const horse = await getRecordHorse(ctx, record)
    const recordAccess = await assertCanEditHorseRecord(ctx, horse, record)
    await auditHorse(
      ctx,
      horse._id,
      recordAccess.userId,
      'horseWeightRecords.changed',
      JSON.stringify(record),
    )

    await ctx.db.delete(args.id)
  },
})
