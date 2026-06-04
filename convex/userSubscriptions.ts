import { v } from 'convex/values'
import { internalMutation, query } from './_generated/server'
import { getCurrentUser } from './libs/stablePermissions'
import { userSubscriptionPlan, userSubscriptionStatus } from './schema'

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx)

    return await ctx.db
      .query('userSubscriptions')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .collect()
  },
})

export const upsertForClerkUser = internalMutation({
  args: {
    clerkUserId: v.string(),
    clerkSubscriptionId: v.optional(v.string()),
    plan: userSubscriptionPlan,
    status: userSubscriptionStatus,
    currentPeriodEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkUserId))
      .unique()

    if (!user) return

    const existingSubscription = await ctx.db
      .query('userSubscriptions')
      .withIndex('by_user_id_plan', (q) =>
        q.eq('userId', user._id).eq('plan', args.plan),
      )
      .unique()

    const now = Date.now()

    if (existingSubscription) {
      await ctx.db.patch(existingSubscription._id, {
        clerkSubscriptionId: args.clerkSubscriptionId,
        status: args.status,
        currentPeriodEnd: args.currentPeriodEnd,
        updatedAt: now,
      })
    } else {
      await ctx.db.insert('userSubscriptions', {
        userId: user._id,
        clerkSubscriptionId: args.clerkSubscriptionId,
        plan: args.plan,
        status: args.status,
        currentPeriodEnd: args.currentPeriodEnd,
        createdAt: now,
        updatedAt: now,
      })
    }

    if (args.status !== 'active' || args.plan === 'free') return

    const invitations = await ctx.db
      .query('stableInvitations')
      .withIndex('by_accepted_by_status', (q) =>
        q
          .eq('acceptedBy', user._id)
          .eq('status', 'accepted_pending_subscription'),
      )
      .collect()

    await Promise.all(
      invitations.map(async (invitation) => {
        const existingMembership = await ctx.db
          .query('stableMembers')
          .withIndex('by_stable_id_user_id', (q) =>
            q.eq('stableId', invitation.stableId).eq('userId', user._id),
          )
          .unique()

        if (!existingMembership) {
          await ctx.db.insert('stableMembers', {
            stableId: invitation.stableId,
            userId: user._id,
            role: invitation.role,
          })
        }

        await ctx.db.patch(invitation._id, {
          status: 'accepted',
          updatedAt: now,
        })
      }),
    )
  },
})
