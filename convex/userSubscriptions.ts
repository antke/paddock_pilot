import { v } from 'convex/values'
import type { Doc, Id } from './_generated/dataModel'
import { internal } from './_generated/api'
import { internalMutation, query } from './_generated/server'
import type { MutationCtx } from './_generated/server'
import { getCurrentUser } from './libs/stablePermissions'
import { activateAcceptedInvitationsForUser } from './libs/membershipActivation'
import { userSubscriptionPlan, userSubscriptionStatus } from './schema'

type SubscriptionSnapshot = {
  clerkSubscriptionId?: string
  plan: Doc<'userSubscriptions'>['plan']
  status: Doc<'userSubscriptions'>['status']
  currentPeriodEnd?: number
  sourceUpdatedAt: number
}

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

async function applySubscriptionSnapshot(
  ctx: MutationCtx,
  userId: Id<'users'>,
  snapshot: SubscriptionSnapshot,
) {
  const existingSubscription = await ctx.db
    .query('userSubscriptions')
    .withIndex('by_user_id_plan', (q) =>
      q.eq('userId', userId).eq('plan', snapshot.plan),
    )
    .unique()

  if (
    existingSubscription?.sourceUpdatedAt !== undefined &&
    existingSubscription.sourceUpdatedAt > snapshot.sourceUpdatedAt
  ) {
    return
  }

  const now = Date.now()

  let subscriptionId: Id<'userSubscriptions'>
  if (existingSubscription) {
    await ctx.db.patch(existingSubscription._id, {
      clerkSubscriptionId: snapshot.clerkSubscriptionId,
      status: snapshot.status,
      currentPeriodEnd: snapshot.currentPeriodEnd,
      sourceUpdatedAt: snapshot.sourceUpdatedAt,
      updatedAt: now,
    })
    subscriptionId = existingSubscription._id
  } else {
    subscriptionId = await ctx.db.insert('userSubscriptions', {
      userId,
      clerkSubscriptionId: snapshot.clerkSubscriptionId,
      plan: snapshot.plan,
      status: snapshot.status,
      currentPeriodEnd: snapshot.currentPeriodEnd,
      sourceUpdatedAt: snapshot.sourceUpdatedAt,
      createdAt: now,
      updatedAt: now,
    })
  }

  if (
    snapshot.status === 'canceled' &&
    snapshot.currentPeriodEnd !== undefined
  ) {
    await ctx.scheduler.runAt(
      Math.max(snapshot.currentPeriodEnd, now),
      internal.userSubscriptions.expireCanceledSubscription,
      {
        subscriptionId,
        sourceUpdatedAt: snapshot.sourceUpdatedAt,
      },
    )
  }

  if (snapshot.status === 'active' && snapshot.plan !== 'free') {
    await activateAcceptedInvitationsForUser(ctx, userId)
  }
}

async function storePendingSubscription(
  ctx: MutationCtx,
  clerkUserId: string,
  snapshot: SubscriptionSnapshot,
) {
  const existing = await ctx.db
    .query('pendingUserSubscriptions')
    .withIndex('by_clerk_user_id_plan', (q) =>
      q.eq('clerkUserId', clerkUserId).eq('plan', snapshot.plan),
    )
    .unique()

  if (existing && existing.sourceUpdatedAt > snapshot.sourceUpdatedAt) return

  const now = Date.now()
  if (existing) {
    await ctx.db.patch(existing._id, { ...snapshot, updatedAt: now })
    return
  }

  await ctx.db.insert('pendingUserSubscriptions', {
    clerkUserId,
    ...snapshot,
    createdAt: now,
    updatedAt: now,
  })
}

export async function reconcilePendingSubscriptions(
  ctx: MutationCtx,
  user: Doc<'users'>,
) {
  const pending = await ctx.db
    .query('pendingUserSubscriptions')
    .withIndex('by_clerk_user_id_plan', (q) =>
      q.eq('clerkUserId', user.clerkId),
    )
    .collect()

  for (const snapshot of pending) {
    await applySubscriptionSnapshot(ctx, user._id, snapshot)
    await ctx.db.delete(snapshot._id)
  }
}

export const upsertForClerkUser = internalMutation({
  args: {
    clerkUserId: v.string(),
    clerkSubscriptionId: v.optional(v.string()),
    plan: userSubscriptionPlan,
    status: userSubscriptionStatus,
    currentPeriodEnd: v.optional(v.number()),
    sourceUpdatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkUserId))
      .unique()
    const snapshot = {
      clerkSubscriptionId: args.clerkSubscriptionId,
      plan: args.plan,
      status: args.status,
      currentPeriodEnd: args.currentPeriodEnd,
      sourceUpdatedAt: args.sourceUpdatedAt,
    }

    if (!user) {
      await storePendingSubscription(ctx, args.clerkUserId, snapshot)
      return
    }
    if (user.deletedAt !== undefined) return

    await applySubscriptionSnapshot(ctx, user._id, snapshot)
  },
})

export const expireCanceledSubscription = internalMutation({
  args: {
    subscriptionId: v.id('userSubscriptions'),
    sourceUpdatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db.get(args.subscriptionId)
    if (
      !subscription ||
      subscription.status !== 'canceled' ||
      subscription.sourceUpdatedAt !== args.sourceUpdatedAt ||
      (subscription.currentPeriodEnd ?? 0) > Date.now()
    ) {
      return
    }

    await ctx.db.patch(subscription._id, {
      status: 'ended',
      updatedAt: Date.now(),
    })
  },
})
