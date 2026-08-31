import { ConvexError } from 'convex/values'
import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { getUserFromIdentity, requireAuth } from './auth'
import {
  canManageOwnedRecord,
  getStableCapabilities,
} from '../../shared/stables/stableAccess'
import type {
  StableCapabilities,
  StableRole,
} from '../../shared/stables/stableAccess'

type Ctx = MutationCtx | QueryCtx

export type { StableCapabilities, StableRole }

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
  if (stable.archivedAt !== undefined) {
    throw new ConvexError('Stable is archived')
  }

  if (stable.ownerId === userId) {
    return { stable, membership: null, role: 'owner' as const }
  }

  const membership = await ctx.db
    .query('stableMembers')
    .withIndex('by_stable_id_user_id', (q) =>
      q.eq('stableId', stableId).eq('userId', userId),
    )
    .unique()

  const hasActiveMemberAccess = membership?.role === 'member'

  return {
    stable,
    membership,
    role: hasActiveMemberAccess ? ('member' as const) : undefined,
  }
}

export const assertCanViewStable = async (
  ctx: Ctx,
  stableId: Id<'stables'>,
  userId?: Id<'users'>,
) => {
  const currentUserId = userId ?? (await getCurrentUser(ctx))._id
  const access = await getStableMembership(ctx, stableId, currentUserId)

  if (!access.role) throw new ConvexError('Not authorized to view this stable')

  return {
    ...access,
    role: access.role,
    capabilities: getStableCapabilities(access.role),
    userId: currentUserId,
  }
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

export const assertCanManageProviders = assertCanManageStable

export const assertCanManageStableReminders = assertCanManageStable

export const assertCanManageStableDocuments = assertCanManageStable

export const assertCanPermanentlyDeleteHorses = assertCanManageStable

export const assertCanManageHorse = async (
  ctx: Ctx,
  horse: Doc<'horses'>,
  userId?: Id<'users'>,
) => {
  if (horse.deletedAt !== undefined) {
    throw new ConvexError('Horse is in the deleted horses area')
  }

  return assertCanManageDeletedHorse(ctx, horse, userId)
}

export const assertCanManageDeletedHorse = async (
  ctx: Ctx,
  horse: Doc<'horses'>,
  userId?: Id<'users'>,
) => {
  const access = await assertCanViewStable(ctx, horse.stableId, userId)

  if (
    canManageOwnedRecord({
      role: access.role,
      userId: access.userId,
      ownerId: horse.ownerId,
    })
  ) {
    return access
  }

  throw new ConvexError('Not authorized to manage this horse')
}

export const assertCanCreateStableHorse = async (
  ctx: Ctx,
  stableId: Id<'stables'>,
  userId?: Id<'users'>,
) => {
  return await assertCanViewStable(ctx, stableId, userId)
}

export const assertIsStableParticipant = async (
  ctx: Ctx,
  stableId: Id<'stables'>,
  userId: Id<'users'>,
) => {
  const access = await getStableMembership(ctx, stableId, userId)

  if (!access.role) {
    throw new ConvexError('Horse owner must belong to this stable')
  }

  return access
}
