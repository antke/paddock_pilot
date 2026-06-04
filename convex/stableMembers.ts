import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { stableMembersFields } from './schema'
import {
  assertCanManageMembers,
  assertCanViewStable,
  getCurrentUser,
} from './libs/stablePermissions'

export const listByStable = query({
  args: { stableId: v.id('stables') },
  handler: async (ctx, args) => {
    await assertCanViewStable(ctx, args.stableId)

    return await ctx.db
      .query('stableMembers')
      .withIndex('by_stable_id', (q) => q.eq('stableId', args.stableId))
      .order('desc')
      .collect()
  },
})

export const listWithUsers = query({
  args: { stableId: v.id('stables') },
  handler: async (ctx, args) => {
    const { stable } = await assertCanManageMembers(ctx, args.stableId)
    const owner = await ctx.db.get(stable.ownerId)
    const memberships = await ctx.db
      .query('stableMembers')
      .withIndex('by_stable_id', (q) => q.eq('stableId', args.stableId))
      .order('desc')
      .collect()

    const memberRows = await Promise.all(
      memberships
        .filter((membership) => membership.userId !== stable.ownerId)
        .map(async (membership) => ({
          membership,
          user: await ctx.db.get(membership.userId),
        })),
    )

    const invitations = await ctx.db
      .query('stableInvitations')
      .withIndex('by_stable_id', (q) => q.eq('stableId', args.stableId))
      .order('desc')
      .collect()

    return {
      stable,
      owner,
      members: [
        {
          membership: null,
          user: owner,
          role: 'owner' as const,
        },
        ...memberRows.map(({ membership, user }) => ({
          membership,
          user,
          role: membership.role,
        })),
      ],
      invitations,
    }
  },
})

export const listByUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    if (user._id !== args.userId) {
      throw new ConvexError('Not authorized to view these stable memberships')
    }

    return await ctx.db
      .query('stableMembers')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .order('desc')
      .collect()
  },
})

export const add = mutation({
  args: { ...stableMembersFields, role: v.union(v.literal('member'), v.literal('guest')) },
  handler: async (ctx, args) => {
    await assertCanManageMembers(ctx, args.stableId)

    const user = await ctx.db.get(args.userId)
    if (!user) throw new ConvexError('User not found')

    const existingMembership = await ctx.db
      .query('stableMembers')
      .withIndex('by_stable_id_user_id', (q) =>
        q.eq('stableId', args.stableId).eq('userId', args.userId),
      )
      .unique()

    if (existingMembership) {
      throw new ConvexError('User is already a member of this stable')
    }

    return await ctx.db.insert('stableMembers', {
      stableId: args.stableId,
      userId: args.userId,
      role: args.role,
    })
  },
})

export const remove = mutation({
  args: { id: v.id('stableMembers') },
  handler: async (ctx, args) => {
    const membership = await ctx.db.get(args.id)
    if (!membership) throw new ConvexError('Stable member not found')

    const { stable } = await assertCanManageMembers(ctx, membership.stableId)
    if (membership.userId === stable.ownerId) {
      throw new ConvexError('Stable owner cannot be removed')
    }

    await ctx.db.delete(args.id)
  },
})
