import { ConvexError } from 'convex/values'
import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { getUserFromIdentity, requireAuth } from './auth'

type Ctx = MutationCtx | QueryCtx

export type StableRole = 'owner' | Doc<'stableMembers'>['role']

export const getCurrentUser = async (ctx: Ctx) => {
  await requireAuth(ctx)

  const user = await getUserFromIdentity(ctx)
  if (!user) throw new ConvexError('User not found')

  return user
}

export const getStableMembership = async (
  ctx: Ctx,
  stableId: Id<'stables'>,
  userId: Id<'users'>,
) => {
  const stable = await ctx.db.get(stableId)
  if (!stable) throw new ConvexError('Stable not found')

  if (stable.ownerId === userId) {
    return { stable, membership: null, role: 'owner' as const }
  }

  const membership = await ctx.db
    .query('stableMembers')
    .withIndex('by_stable_id_user_id', (q) =>
      q.eq('stableId', stableId).eq('userId', userId),
    )
    .unique()

  return { stable, membership, role: membership?.role }
}

export const assertCanViewStable = async (
  ctx: Ctx,
  stableId: Id<'stables'>,
  userId?: Id<'users'>,
) => {
  const currentUserId = userId ?? (await getCurrentUser(ctx))._id
  const access = await getStableMembership(ctx, stableId, currentUserId)

  if (!access.role) throw new ConvexError('Not authorized to view this stable')

  return { ...access, userId: currentUserId }
}

export const assertCanManageStable = async (
  ctx: Ctx,
  stableId: Id<'stables'>,
  userId?: Id<'users'>,
) => {
  const access = await assertCanViewStable(ctx, stableId, userId)

  if (access.role !== 'owner') {
    throw new ConvexError('Not authorized to manage this stable')
  }

  return access
}

export const assertCanManageMembers = assertCanManageStable

export const assertCanManageHorse = async (
  ctx: Ctx,
  horse: Doc<'horses'>,
  userId?: Id<'users'>,
) => {
  const access = await assertCanViewStable(ctx, horse.stableId, userId)

  if (access.role === 'owner' || horse.ownerId === access.userId) return access

  throw new ConvexError('Not authorized to manage this horse')
}

export const assertCanCreateStableHorse = async (
  ctx: Ctx,
  stableId: Id<'stables'>,
  userId?: Id<'users'>,
) => {
  const access = await assertCanViewStable(ctx, stableId, userId)

  if (access.role === 'guest') {
    throw new ConvexError('Not authorized to create horses in this stable')
  }

  return access
}
