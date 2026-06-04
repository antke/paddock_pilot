import { ConvexError, v } from 'convex/values'
import { stableInputSchema } from '../shared/stables/stableSchema'
import { mutation, query } from './_generated/server'
import { stableFields } from './schema'
import { getUserFromIdentity, requireAuth } from './libs/auth'
import type { Doc, Id } from './_generated/dataModel'
import { omit } from 'lodash'
import {
  assertCanManageStable,
  assertCanViewStable,
  getCurrentUser,
} from './libs/stablePermissions'

const isStable = (stable: Doc<'stables'> | null): stable is Doc<'stables'> =>
  stable !== null

const validateStableInput = (args: {
  name: string
  location: string
  description?: string
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
      memberships.map((membership) => ctx.db.get(membership.stableId)),
    )

    const stablesById = new Map(
      [...ownedStables, ...memberStables.filter(isStable)].map((stable) => [
        stable._id,
        stable,
      ]),
    )

    return [...stablesById.values()].sort((a, b) => b._creationTime - a._creationTime)
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

    return await ctx.db.insert('stables', {
      ...stableInput,
      ownerId: user._id,
    })
  },
})

export const update = mutation({
  args: { ...omit(stableFields, 'ownerId'), id: v.id('stables') },
  handler: async (ctx, args) => {
    const { stable } = await assertCanManageStable(ctx, args.id)

    const stableInput = validateStableInput(args)

    await ctx.db.replace(args.id, {
      ...stableInput,
      ownerId: stable.ownerId,
    })
  },
})

export const remove = mutation({
  args: { id: v.id('stables') },
  handler: async (ctx, args) => {
    await assertCanManageStable(ctx, args.id)

    return await ctx.db.delete(args.id)
  },
})

export const getWithOwner = query({
  args: { id: v.id('stables') },
  handler: async (ctx, args) => {
    await assertCanViewStable(ctx, args.id)

    const stable = await ctx.db.get(args.id)
    if (!stable) return null

    const owner = await ctx.db.get(stable.ownerId as Id<'users'>)

    return { stable, owner }
  },
})
