import { ConvexError } from 'convex/values'
import type { Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'

type Ctx = MutationCtx | QueryCtx

export const getActivePersonalPlan = async (ctx: Ctx, userId: Id<'users'>) => {
  const subscriptions = await ctx.db
    .query('userSubscriptions')
    .withIndex('by_user_id', (q) => q.eq('userId', userId))
    .collect()

  return subscriptions.find(
    (subscription) =>
      subscription.status === 'active' && subscription.plan === 'personal_pro',
  ) ?? subscriptions.find(
    (subscription) =>
      subscription.status === 'active' &&
      (subscription.plan === 'personal_plus' ||
        subscription.plan === 'personal_pro'),
  )
}

export const hasPersonalPlus = async (ctx: Ctx, userId: Id<'users'>) => {
  return Boolean(await getActivePersonalPlan(ctx, userId))
}

export const hasPersonalPro = async (ctx: Ctx, userId: Id<'users'>) => {
  const subscription = await getActivePersonalPlan(ctx, userId)

  return subscription?.plan === 'personal_pro'
}

export const assertHasPersonalPlus = async (
  ctx: Ctx,
  userId: Id<'users'>,
) => {
  if (await hasPersonalPlus(ctx, userId)) return

  throw new ConvexError('A Personal Plus subscription is required')
}

export const assertHasPersonalPro = async (ctx: Ctx, userId: Id<'users'>) => {
  if (await hasPersonalPro(ctx, userId)) return

  throw new ConvexError('A Personal Pro subscription is required')
}
