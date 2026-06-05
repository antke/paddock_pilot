import { ConvexError, v } from 'convex/values'
import {
  medicationRecordAddSchema,
  medicationRecordStatusSchema,
} from '../shared/horses/medicationRecordSchema'
import type { Doc } from './_generated/dataModel'
import { mutation, query   } from './_generated/server'
import type {MutationCtx, QueryCtx} from './_generated/server';
import {
  assertCanManageHorse,
  assertCanViewStable,
  getCurrentUser,
} from './libs/stablePermissions'

const medicationStatusValidator = v.union(
  v.literal('active'),
  v.literal('completed'),
)

const validateAddInput = (args: {
  horseId: string
  medicationName: string
  dosage: string
  frequency?: string
  startDate: string
  endDate?: string
  prescribedBy?: string
  reason?: string
  notes?: string
  status: 'active' | 'completed'
}) => {
  const result = medicationRecordAddSchema.safeParse(args)

  if (!result.success) {
    throw new ConvexError(
      result.error.issues[0]?.message ?? 'Invalid medication record input',
    )
  }

  return result.data
}

const getRecordHorse = async (
  ctx: MutationCtx | QueryCtx,
  record: Doc<'horseMedicationRecords'>,
) => {
  const horse = await ctx.db.get(record.horseId)

  if (!horse) throw new ConvexError('Horse not found')

  return horse
}

const byStatusAndStartDate = (
  a: Doc<'horseMedicationRecords'>,
  b: Doc<'horseMedicationRecords'>,
) => {
  if (a.status !== b.status) return a.status === 'active' ? -1 : 1

  return b.startDate.localeCompare(a.startDate)
}

export const listForHorse = query({
  args: { horseId: v.id('horses') },
  handler: async (ctx, args) => {
    const horse = await ctx.db.get(args.horseId)
    if (!horse) return []

    await assertCanViewStable(ctx, horse.stableId)

    const records = await ctx.db
      .query('horseMedicationRecords')
      .withIndex('by_horse_id', (q) => q.eq('horseId', args.horseId))
      .collect()

    return records.sort(byStatusAndStartDate)
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
    medicationName: v.string(),
    dosage: v.string(),
    frequency: v.optional(v.string()),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    prescribedBy: v.optional(v.string()),
    reason: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: medicationStatusValidator,
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const horse = await ctx.db.get(args.horseId)
    if (!horse) throw new ConvexError('Horse not found')

    await assertCanManageHorse(ctx, horse, user._id)

    const input = validateAddInput(args)
    const status = medicationRecordStatusSchema.parse(input.status)
    const now = Date.now()

    return await ctx.db.insert('horseMedicationRecords', {
      horseId: horse._id,
      stableId: horse.stableId,
      medicationName: input.medicationName,
      dosage: input.dosage,
      frequency: input.frequency,
      startDate: input.startDate,
      endDate: input.endDate,
      prescribedBy: input.prescribedBy,
      reason: input.reason,
      notes: input.notes,
      status,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const complete = mutation({
  args: { id: v.id('horseMedicationRecords'), endDate: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.id)
    if (!record) throw new ConvexError('Medication record not found')

    const horse = await getRecordHorse(ctx, record)
    await assertCanManageHorse(ctx, horse)

    const endDate = args.endDate ?? new Date().toISOString().slice(0, 10)
    const input = validateAddInput({ ...record, status: 'completed', endDate })

    await ctx.db.patch(args.id, {
      status: 'completed',
      endDate: input.endDate,
      updatedAt: Date.now(),
    })
  },
})

export const remove = mutation({
  args: { id: v.id('horseMedicationRecords') },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.id)
    if (!record) throw new ConvexError('Medication record not found')

    const horse = await getRecordHorse(ctx, record)
    await assertCanManageHorse(ctx, horse)

    await ctx.db.delete(args.id)
  },
})
