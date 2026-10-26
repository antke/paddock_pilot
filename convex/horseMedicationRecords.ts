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
import { ConvexError, v } from 'convex/values'
import {
  medicationRecordAddSchema,
  medicationRecordStatusSchema,
} from '../shared/horses/medicationRecordSchema'
import type { Doc } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { getCurrentUser } from './libs/stablePermissions'
import { resolveTodayDateKey } from './libs/dateKeys'

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
  args: { horseId: v.id('horses'), stableId: v.optional(v.id('stables')) },
  handler: async (ctx, args) => {
    const horse = await ctx.db.get(args.horseId)
    if (!horse) return []

    await assertCanReadHorse(ctx, horse)
    await assertHorseWorkspace(ctx, horse, args.stableId)

    const records = await ctx.db
      .query('horseMedicationRecords')
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
    ).sort(byStatusAndStartDate)
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
    const replay = await creationReplay(
      ctx,
      user._id,
      args.requestId,
      'horseMedicationRecords.add',
    )
    if (replay) return ctx.db.normalizeId('horseMedicationRecords', replay)!
    const horse = await ctx.db.get(args.horseId)
    if (!horse) throw new ConvexError('Horse not found')

    const access = await assertCanAddHorseRecord(ctx, horse, user._id)
    await auditHorse(ctx, horse._id, user._id, 'horseMedicationRecords.added')

    const input = validateAddInput(args)
    const status = medicationRecordStatusSchema.parse(input.status)
    const now = Date.now()

    const id = await ctx.db.insert('horseMedicationRecords', {
      horseId: horse._id,
      ...access.recordOrigin,
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
    await initializeRecordSharing(ctx, horse, id, args.shareWithStable)
    await recordCreation(
      ctx,
      user._id,
      args.requestId,
      'horseMedicationRecords.add',
      id,
    )
    return id
  },
})

export const complete = mutation({
  args: { id: v.id('horseMedicationRecords'), endDate: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.id)
    if (!record) throw new ConvexError('Medication record not found')

    const horse = await getRecordHorse(ctx, record)
    const recordAccess = await assertCanEditHorseRecord(ctx, horse, record)
    await auditHorse(
      ctx,
      horse._id,
      recordAccess.userId,
      'horseMedicationRecords.changed',
      JSON.stringify(record),
    )

    const endDate = args.endDate ?? resolveTodayDateKey()
    if (endDate < record.startDate) {
      throw new ConvexError(
        'A medication course cannot be completed before its start date.',
      )
    }
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
    const recordAccess = await assertCanEditHorseRecord(ctx, horse, record)
    await auditHorse(
      ctx,
      horse._id,
      recordAccess.userId,
      'horseMedicationRecords.changed',
      JSON.stringify(record),
    )

    await ctx.db.delete(args.id)
  },
})
