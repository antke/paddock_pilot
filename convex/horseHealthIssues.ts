import {
  canEditHorseRecord,
  auditHorse,
  assertCanReadHorse,
  assertCanAddHorseRecord,
  assertCanEditHorseRecord,
} from './libs/horsePermissions'
import { ConvexError, v } from 'convex/values'
import {
  healthIssueAddSchema,
  healthIssueUpdateSchema,
} from '../shared/horses/healthIssueSchema'
import type { Doc, Id } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { getCurrentUser } from './libs/stablePermissions'

const healthIssueSeverity = v.union(
  v.literal('low'),
  v.literal('medium'),
  v.literal('high'),
)

const healthIssueStatus = v.union(v.literal('active'), v.literal('resolved'))

type Ctx = MutationCtx | QueryCtx

const validateAddInput = (args: {
  horseId: Id<'horses'>
  title: string
  description?: string
  severity?: Doc<'horseHealthIssues'>['severity']
}) => {
  const result = healthIssueAddSchema.safeParse(args)

  if (!result.success) {
    throw new ConvexError(
      result.error.issues[0]?.message ?? 'Invalid health issue input',
    )
  }

  return result.data
}

const validateUpdateInput = (args: {
  title?: string
  description?: string
  status?: Doc<'horseHealthIssues'>['status']
  severity?: Doc<'horseHealthIssues'>['severity']
}) => {
  const result = healthIssueUpdateSchema.safeParse(args)

  if (!result.success) {
    throw new ConvexError(
      result.error.issues[0]?.message ?? 'Invalid health issue input',
    )
  }

  return result.data
}

const getIssueHorse = async (ctx: Ctx, issue: Doc<'horseHealthIssues'>) => {
  const horse = await ctx.db.get(issue.horseId)
  if (!horse) throw new ConvexError('Horse not found')

  return horse
}

export const listForHorse = query({
  args: { horseId: v.id('horses') },
  handler: async (ctx, args) => {
    const horse = await ctx.db.get(args.horseId)
    if (!horse) return []

    const access = await assertCanReadHorse(ctx, horse)

    const issues = await ctx.db
      .query('horseHealthIssues')
      .withIndex('by_horse_id', (q) => q.eq('horseId', args.horseId))
      .collect()

    return issues
      .map((record) => ({
        ...record,
        canEdit: canEditHorseRecord(access, horse, record),
      }))
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === 'active' ? -1 : 1

        return b.notedAt - a.notedAt
      })
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
    horseId: v.id('horses'),
    title: v.string(),
    description: v.optional(v.string()),
    severity: v.optional(healthIssueSeverity),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const horse = await ctx.db.get(args.horseId)
    if (!horse) throw new ConvexError('Horse not found')

    const access = await assertCanAddHorseRecord(ctx, horse, user._id)
    await auditHorse(ctx, horse._id, user._id, 'horseHealthIssues.added')

    const issueInput = validateAddInput(args)
    const now = Date.now()

    return await ctx.db.insert('horseHealthIssues', {
      horseId: args.horseId,
      ...access.recordOrigin,
      title: issueInput.title,
      description: issueInput.description,
      severity: issueInput.severity,
      status: 'active',
      notedAt: now,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const update = mutation({
  args: {
    id: v.id('horseHealthIssues'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(healthIssueStatus),
    severity: v.optional(healthIssueSeverity),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    const issue = await ctx.db.get(id)
    if (!issue) throw new ConvexError('Health issue not found')

    const horse = await getIssueHorse(ctx, issue)
    const recordAccess = await assertCanEditHorseRecord(ctx, horse, issue)
    await auditHorse(
      ctx,
      horse._id,
      recordAccess.userId,
      'horseHealthIssues.changed',
      JSON.stringify(issue),
    )

    const issueInput = validateUpdateInput(updates)
    const nextStatus = issueInput.status ?? issue.status

    await ctx.db.patch(id, {
      ...issueInput,
      resolvedAt:
        nextStatus === 'resolved'
          ? (issue.resolvedAt ?? Date.now())
          : undefined,
      updatedAt: Date.now(),
    })
  },
})

export const resolve = mutation({
  args: { id: v.id('horseHealthIssues') },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.id)
    if (!issue) throw new ConvexError('Health issue not found')

    const horse = await getIssueHorse(ctx, issue)
    const recordAccess = await assertCanEditHorseRecord(ctx, horse, issue)
    await auditHorse(
      ctx,
      horse._id,
      recordAccess.userId,
      'horseHealthIssues.changed',
      JSON.stringify(issue),
    )

    const now = Date.now()
    await ctx.db.patch(args.id, {
      status: 'resolved',
      resolvedAt: issue.resolvedAt ?? now,
      updatedAt: now,
    })
  },
})

export const remove = mutation({
  args: { id: v.id('horseHealthIssues') },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.id)
    if (!issue) throw new ConvexError('Health issue not found')

    const horse = await getIssueHorse(ctx, issue)
    const recordAccess = await assertCanEditHorseRecord(ctx, horse, issue)
    await auditHorse(
      ctx,
      horse._id,
      recordAccess.userId,
      'horseHealthIssues.changed',
      JSON.stringify(issue),
    )

    await ctx.db.delete(args.id)
  },
})
