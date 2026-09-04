import { ConvexError, v } from 'convex/values'
import {
  stableInputSchema,
  stableOperationsInputSchema,
} from '../shared/stables/stableSchema'
import { mutation, query } from './_generated/server'
import { stableFields } from './schema'
import { getUserFromIdentity, requireAuth } from './libs/auth'
import type { Doc } from './_generated/dataModel'
import { omit } from 'lodash'
import {
  assertCanManageStable,
  assertCanViewStable,
  getCurrentUser,
} from './libs/stablePermissions'
import { ensureStableOnboarding } from './libs/onboarding'
import { recordStableAudit } from './libs/audit'
import { queueStableArchivedEmails } from './libs/email/notifications'

const isStable = (stable: Doc<'stables'> | null): stable is Doc<'stables'> =>
  stable !== null

const validateStableInput = (args: {
  name: string
  location: string
  description?: string
  contactName?: string
  contactPhone?: string
  emergencyPhone?: string
  addressLine1?: string
  addressLine2?: string
  postcode?: string
  country?: string
  yardRules?: string
  openingHours?: string
}) => {
  const result = stableInputSchema.safeParse(args)

  if (!result.success) {
    throw new ConvexError(
      result.error.issues[0]?.message ?? 'Invalid stable input',
    )
  }

  return result.data
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx)

    const ownedStables = await ctx.db
      .query('stables')
      .withIndex('by_owner_id', (q) => q.eq('ownerId', user._id))
      .order('desc')
      .collect()
    const memberships = await ctx.db
      .query('stableMembers')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .collect()

    const memberStables = await Promise.all(
      memberships
        .filter((membership) => membership.role === 'member')
        .map((membership) => ctx.db.get(membership.stableId)),
    )

    const stablesById = new Map(
      [...ownedStables, ...memberStables.filter(isStable)]
        .filter((stable) => stable.archivedAt === undefined)
        .map((stable) => [stable._id, stable]),
    )

    return [...stablesById.values()].sort(
      (a, b) => b._creationTime - a._creationTime,
    )
  },
})

export const getAccess = query({
  args: { id: v.id('stables') },
  handler: async (ctx, args) => {
    const access = await assertCanViewStable(ctx, args.id)

    return {
      role: access.role,
      capabilities: access.capabilities,
      membershipId: access.membership?._id,
    }
  },
})

export const get = query({
  args: { id: v.id('stables') },
  handler: async (ctx, args) => {
    await assertCanViewStable(ctx, args.id)
    return await ctx.db.get(args.id)
  },
})

export const add = mutation({
  args: { ...omit(stableFields, 'ownerId') },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const user = await getUserFromIdentity(ctx)
    if (!user) throw new ConvexError('User not found')

    const stableInput = validateStableInput(args)

    const stableId = await ctx.db.insert('stables', {
      ...stableInput,
      ownerId: user._id,
    })

    await ensureStableOnboarding(ctx, {
      stableId,
      userId: user._id,
      role: 'owner',
    })
    await recordStableAudit(ctx, {
      stableId,
      actorUserId: user._id,
      action: 'stable.created',
      entityType: 'stable',
      entityId: stableId,
      summary: stableInput.name,
    })

    return stableId
  },
})

export const update = mutation({
  args: { ...omit(stableFields, 'ownerId'), id: v.id('stables') },
  handler: async (ctx, args) => {
    const { stable, userId } = await assertCanManageStable(ctx, args.id)

    const stableInput = validateStableInput(args)

    await ctx.db.replace(args.id, {
      ...stableInput,
      ownerId: stable.ownerId,
    })
    await recordStableAudit(ctx, {
      stableId: args.id,
      actorUserId: userId,
      action: 'stable.updated',
      entityType: 'stable',
      entityId: args.id,
      summary: stableInput.name,
    })
  },
})

export const updateOperations = mutation({
  args: {
    id: v.id('stables'),
    contactName: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    emergencyPhone: v.optional(v.string()),
    openingHours: v.optional(v.string()),
    yardRules: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...input } = args
    const { stable, userId } = await assertCanManageStable(ctx, id)
    const result = stableOperationsInputSchema.safeParse(input)

    if (!result.success) {
      throw new ConvexError(
        result.error.issues[0]?.message ?? 'Invalid stable operations input',
      )
    }

    await ctx.db.patch(id, result.data)
    await recordStableAudit(ctx, {
      stableId: id,
      actorUserId: userId,
      action: 'stable.updated',
      entityType: 'stable',
      entityId: id,
      summary: stable.name,
    })
  },
})

export const updateBasics = mutation({
  args: {
    id: v.id('stables'),
    name: v.string(),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    const { stable, userId } = await assertCanManageStable(ctx, args.id)
    const result = stableInputSchema
      .pick({ name: true, location: true })
      .safeParse(args)
    if (!result.success) {
      throw new ConvexError(
        result.error.issues[0]?.message ?? 'Invalid stable details',
      )
    }

    await ctx.db.patch(args.id, result.data)
    await recordStableAudit(ctx, {
      stableId: args.id,
      actorUserId: userId,
      action: 'stable.updated',
      entityType: 'stable',
      entityId: args.id,
      summary: result.data.name || stable.name,
    })
  },
})

export const remove = mutation({
  args: { id: v.id('stables') },
  handler: async (ctx, args) => {
    const { stable, userId } = await assertCanManageStable(ctx, args.id)

    await ctx.db.patch(args.id, {
      archivedAt: Date.now(),
      archivedReason: 'owner_archived',
    })
    await recordStableAudit(ctx, {
      stableId: args.id,
      actorUserId: userId,
      action: 'stable.archived',
      entityType: 'stable',
      entityId: args.id,
      summary: stable.name,
    })
    await queueStableArchivedEmails(ctx, stable)
  },
})

export const getWithOwner = query({
  args: { id: v.id('stables') },
  handler: async (ctx, args) => {
    await assertCanViewStable(ctx, args.id)

    const stable = await ctx.db.get(args.id)
    if (!stable) return null

    const owner = await ctx.db.get(stable.ownerId)

    return {
      stable,
      owner:
        owner && owner.deletedAt === undefined
          ? {
              _id: owner._id,
              firstName: owner.firstName,
              lastName: owner.lastName,
              preferredName: owner.preferredName,
              photoUrl: owner.photoUrl,
            }
          : null,
    }
  },
})
