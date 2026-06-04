import { ConvexError, v } from 'convex/values'
import { internal } from './_generated/api'
import type { Id } from './_generated/dataModel'
import {
  internalMutation,
  mutation,
  query,
  type MutationCtx,
} from './_generated/server'
import { hasPersonalPlus } from './libs/entitlements'
import {
  assertCanManageMembers,
  getCurrentUser,
} from './libs/stablePermissions'
import { stableInvitationRole } from './schema'

const INVITATION_TTL_MS = 1000 * 60 * 60 * 24 * 14

const normalizeEmail = (email: string) => email.trim().toLowerCase()

const findMembership = async (
  ctx: MutationCtx,
  stableId: Id<'stables'>,
  userId: Id<'users'>,
) => {
  return await ctx.db
    .query('stableMembers')
    .withIndex('by_stable_id_user_id', (q) =>
      q.eq('stableId', stableId).eq('userId', userId),
    )
    .unique()
}

export const listForStable = query({
  args: { stableId: v.id('stables') },
  handler: async (ctx, args) => {
    await assertCanManageMembers(ctx, args.stableId)

    return await ctx.db
      .query('stableInvitations')
      .withIndex('by_stable_id', (q) => q.eq('stableId', args.stableId))
      .order('desc')
      .collect()
  },
})

export const create = mutation({
  args: {
    stableId: v.id('stables'),
    email: v.string(),
    role: stableInvitationRole,
  },
  handler: async (ctx, args) => {
    const { stable, userId } = await assertCanManageMembers(ctx, args.stableId)
    const email = normalizeEmail(args.email)
    const now = Date.now()

    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique()

    if (existingUser) {
      const existingMembership = await findMembership(
        ctx,
        args.stableId,
        existingUser._id,
      )

      if (existingMembership || existingUser._id === stable.ownerId) {
        throw new ConvexError('This user already has access to the stable')
      }
    }

    const existingInvitation = await ctx.db
      .query('stableInvitations')
      .withIndex('by_email_status', (q) =>
        q.eq('email', email).eq('status', 'pending'),
      )
      .filter((q) => q.eq(q.field('stableId'), args.stableId))
      .first()

    if (existingInvitation) {
      throw new ConvexError('There is already a pending invitation for this email')
    }

    const invitationId = await ctx.db.insert('stableInvitations', {
      stableId: args.stableId,
      email,
      role: args.role,
      status: 'pending',
      token: crypto.randomUUID(),
      invitedBy: userId,
      createdAt: now,
      updatedAt: now,
      expiresAt: now + INVITATION_TTL_MS,
    })

    const invitation = await ctx.db.get(invitationId)
    if (!invitation) throw new ConvexError('Invitation not found')

    await ctx.scheduler.runAfter(0, internal.emails.sendStableInvitation, {
      email,
      stableName: stable.name,
      token: invitation.token,
    })

    return invitationId
  },
})

export const revoke = mutation({
  args: { id: v.id('stableInvitations') },
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.id)
    if (!invitation) throw new ConvexError('Invitation not found')

    await assertCanManageMembers(ctx, invitation.stableId)

    if (invitation.status !== 'pending') {
      throw new ConvexError('Only pending invitations can be revoked')
    }

    await ctx.db.patch(args.id, {
      status: 'revoked',
      updatedAt: Date.now(),
    })
  },
})

export const accept = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const invitation = await ctx.db
      .query('stableInvitations')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .unique()

    if (!invitation) throw new ConvexError('Invitation not found')
    if (invitation.status !== 'pending') {
      throw new ConvexError('Invitation is no longer pending')
    }

    const now = Date.now()
    if (invitation.expiresAt < now) {
      await ctx.db.patch(invitation._id, {
        status: 'expired',
        updatedAt: now,
      })
      throw new ConvexError('Invitation has expired')
    }

    if (normalizeEmail(user.email) !== invitation.email) {
      throw new ConvexError('Sign in with the invited email to accept')
    }

    const existingMembership = await findMembership(
      ctx,
      invitation.stableId,
      user._id,
    )

    if (existingMembership) {
      await ctx.db.patch(invitation._id, {
        status: 'accepted',
        acceptedBy: user._id,
        acceptedAt: now,
        updatedAt: now,
      })

      return { status: 'accepted' as const, stableId: invitation.stableId }
    }

    if (!(await hasPersonalPlus(ctx, user._id))) {
      await ctx.db.patch(invitation._id, {
        status: 'accepted_pending_subscription',
        acceptedBy: user._id,
        acceptedAt: now,
        updatedAt: now,
      })

      return {
        status: 'accepted_pending_subscription' as const,
        stableId: invitation.stableId,
      }
    }

    await ctx.db.insert('stableMembers', {
      stableId: invitation.stableId,
      userId: user._id,
      role: invitation.role,
    })

    await ctx.db.patch(invitation._id, {
      status: 'accepted',
      acceptedBy: user._id,
      acceptedAt: now,
      updatedAt: now,
    })

    return { status: 'accepted' as const, stableId: invitation.stableId }
  },
})

export const activateAcceptedForUser = internalMutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    if (!(await hasPersonalPlus(ctx, args.userId))) return

    const invitations = await ctx.db
      .query('stableInvitations')
      .withIndex('by_accepted_by_status', (q) =>
        q
          .eq('acceptedBy', args.userId)
          .eq('status', 'accepted_pending_subscription'),
      )
      .collect()

    const now = Date.now()

    await Promise.all(
      invitations.map(async (invitation) => {
        const existingMembership = await findMembership(
          ctx,
          invitation.stableId,
          args.userId,
        )

        if (!existingMembership) {
          await ctx.db.insert('stableMembers', {
            stableId: invitation.stableId,
            userId: args.userId,
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
