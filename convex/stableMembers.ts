import { ConvexError, v } from 'convex/values'
import { stableMemberDetailsInputSchema } from '../shared/stables/stableMemberSchema'
import { mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'
import {
  assertCanManageMembers,
  assertCanViewStable,
  assertIsStableParticipant,
  getCurrentUser,
} from './libs/stablePermissions'
import { recordStableAudit } from './libs/audit'
import { queueMembershipRemovedEmail } from './libs/email/notifications'

const validateMemberDetailsInput = (args: {
  displayNameOverride?: string
  phone?: string
  emergencyContact?: string
}) => {
  const result = stableMemberDetailsInputSchema.safeParse(args)

  if (!result.success) {
    throw new ConvexError(
      result.error.issues[0]?.message ?? 'Invalid member details',
    )
  }

  return result.data
}

async function resolveUserProfileImage(
  ctx: QueryCtx,
  user: Doc<'users'> | null,
) {
  if (!user) return null
  if (user.deletedAt !== undefined) return null

  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    preferredName: user.preferredName,
    email: user.email,
    photoUrl: user.profileImageId
      ? ((await ctx.storage.getUrl(user.profileImageId)) ?? user.photoUrl)
      : user.photoUrl,
  }
}

export const listByStable = query({
  args: { stableId: v.id('stables') },
  handler: async (ctx, args) => {
    const access = await assertCanViewStable(ctx, args.stableId)

    const memberships = await ctx.db
      .query('stableMembers')
      .withIndex('by_stable_id', (q) => q.eq('stableId', args.stableId))
      .order('desc')
      .collect()
    const owner = await resolveUserProfileImage(
      ctx,
      await ctx.db.get(access.stable.ownerId),
    )
    const ownerRow = owner
      ? [
          {
            membership: null,
            user: {
              _id: owner._id,
              firstName: owner.firstName,
              lastName: owner.lastName,
              preferredName: owner.preferredName,
              photoUrl: owner.photoUrl,
            },
            role: 'owner' as const,
            canEdit: false,
          },
        ]
      : []

    const memberRows = await Promise.all(
      memberships
        .filter((membership) => membership.role === 'member')
        .map(async (membership) => {
          const user = await resolveUserProfileImage(
            ctx,
            await ctx.db.get(membership.userId),
          )

          return {
            membership: {
              _id: membership._id,
              _creationTime: membership._creationTime,
              stableId: membership.stableId,
              userId: membership.userId,
              role: 'member' as const,
              displayNameOverride: membership.displayNameOverride,
            },
            user: user
              ? {
                  _id: user._id,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  preferredName: user.preferredName,
                  photoUrl: user.photoUrl,
                }
              : null,
            role: 'member' as const,
            canEdit:
              access.role === 'owner' || membership.userId === access.userId,
          }
        }),
    )

    return [...ownerRow, ...memberRows]
  },
})

export const getMyDetails = query({
  args: { stableId: v.id('stables') },
  handler: async (ctx, args) => {
    const access = await assertCanViewStable(ctx, args.stableId)

    if (access.role === 'owner') return null

    return await ctx.db
      .query('stableMembers')
      .withIndex('by_stable_id_user_id', (q) =>
        q.eq('stableId', args.stableId).eq('userId', access.userId),
      )
      .unique()
  },
})

export const listWithUsers = query({
  args: { stableId: v.id('stables') },
  handler: async (ctx, args) => {
    const { stable } = await assertCanManageMembers(ctx, args.stableId)
    const owner = await resolveUserProfileImage(
      ctx,
      await ctx.db.get(stable.ownerId),
    )
    const memberships = await ctx.db
      .query('stableMembers')
      .withIndex('by_stable_id', (q) => q.eq('stableId', args.stableId))
      .order('desc')
      .collect()

    const memberRows = await Promise.all(
      memberships
        .filter(
          (membership) =>
            membership.role === 'member' &&
            membership.userId !== stable.ownerId,
        )
        .map(async (membership) => ({
          membership,
          user: await resolveUserProfileImage(
            ctx,
            await ctx.db.get(membership.userId),
          ),
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
      .filter((q) => q.eq(q.field('role'), 'member'))
      .order('desc')
      .collect()
  },
})

export const remove = mutation({
  args: { id: v.id('stableMembers') },
  handler: async (ctx, args) => {
    const membership = await ctx.db.get(args.id)
    if (!membership) throw new ConvexError('Stable member not found')

    const { stable, userId } = await assertCanManageMembers(
      ctx,
      membership.stableId,
    )
    if (membership.userId === stable.ownerId) {
      throw new ConvexError('Stable owner cannot be removed')
    }
    const member = await ctx.db.get(membership.userId)

    const ownedHorse = await ctx.db
      .query('horses')
      .withIndex('by_owner_id', (q) => q.eq('ownerId', membership.userId))
      .filter((q) => q.eq(q.field('stableId'), membership.stableId))
      .first()

    if (ownedHorse) {
      throw new ConvexError(
        'Reassign or remove this member’s horses before removing the member',
      )
    }

    await removeStableOnboarding(ctx, membership.stableId, membership.userId)
    await ctx.db.delete(args.id)
    await recordStableAudit(ctx, {
      stableId: membership.stableId,
      actorUserId: userId,
      action: 'member.removed',
      entityType: 'stableMember',
      entityId: membership._id,
      summary: `Removed member ${membership.userId}`,
    })
    if (member) {
      await queueMembershipRemovedEmail(ctx, { member, membership, stable })
    }
  },
})

export const removeWithHorseReassignment = mutation({
  args: {
    id: v.id('stableMembers'),
    reassignToUserId: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db.get(args.id)
    if (!membership || membership.role !== 'member') {
      throw new ConvexError('Stable member not found')
    }

    const { stable, userId } = await assertCanManageMembers(
      ctx,
      membership.stableId,
    )
    if (membership.userId === stable.ownerId) {
      throw new ConvexError('Stable owner cannot be removed')
    }
    const member = await ctx.db.get(membership.userId)

    const horses = await ctx.db
      .query('horses')
      .withIndex('by_owner_id', (q) => q.eq('ownerId', membership.userId))
      .filter((q) => q.eq(q.field('stableId'), membership.stableId))
      .collect()

    if (horses.length > 0) {
      if (!args.reassignToUserId) {
        throw new ConvexError(
          'Choose a new owner for this member’s horses before removing them',
        )
      }
      if (args.reassignToUserId === membership.userId) {
        throw new ConvexError('Choose a different owner for these horses')
      }

      await assertIsStableParticipant(
        ctx,
        membership.stableId,
        args.reassignToUserId,
      )
      await Promise.all(
        horses.map((horse) =>
          ctx.db.patch(horse._id, { ownerId: args.reassignToUserId! }),
        ),
      )
    }

    await removeStableOnboarding(ctx, membership.stableId, membership.userId)
    await ctx.db.delete(membership._id)
    await recordStableAudit(ctx, {
      stableId: membership.stableId,
      actorUserId: userId,
      action: 'member.removed',
      entityType: 'stableMember',
      entityId: membership._id,
      summary:
        horses.length > 0
          ? `Removed member and reassigned ${horses.length} horse${horses.length === 1 ? '' : 's'}`
          : `Removed member ${membership.userId}`,
    })
    if (member) {
      await queueMembershipRemovedEmail(ctx, { member, membership, stable })
    }

    return { reassignedHorseCount: horses.length }
  },
})

async function removeStableOnboarding(
  ctx: MutationCtx,
  stableId: Id<'stables'>,
  userId: Id<'users'>,
) {
  const onboarding = await ctx.db
    .query('stableOnboarding')
    .withIndex('by_stable_id_user_id', (q) =>
      q.eq('stableId', stableId).eq('userId', userId),
    )
    .unique()

  if (onboarding) await ctx.db.delete(onboarding._id)
}

export const updateDetails = mutation({
  args: {
    id: v.id('stableMembers'),
    displayNameOverride: v.optional(v.string()),
    phone: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const membership = await ctx.db.get(args.id)
    if (!membership) throw new ConvexError('Stable member not found')

    const access = await assertCanViewStable(ctx, membership.stableId, user._id)

    if (access.role !== 'owner' && membership.userId !== user._id) {
      throw new ConvexError('Not authorized to update these member details')
    }

    const memberDetailsInput = validateMemberDetailsInput(args)

    await ctx.db.patch(args.id, memberDetailsInput)
  },
})
