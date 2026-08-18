import { ConvexError, v } from 'convex/values'
import {
  getEffectiveInvitationStatus,
  maskInvitationEmail,
} from '../shared/stableInvitations/invitationState'
import { stableInvitationSchema } from '../shared/stableInvitations/invitationSchema'
import type { Doc, Id } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import type { MutationCtx } from './_generated/server'
import { hasPersonalPlus } from './libs/entitlements'
import { getUserFromIdentity } from './libs/auth'
import { ensureStableOnboarding } from './libs/onboarding'
import {
  assertCanManageMembers,
  getCurrentUser,
} from './libs/stablePermissions'
import { newStableInvitationRole } from './schema'
import { recordStableAudit } from './libs/audit'
import { enqueueEmail } from './libs/email/outbox'

const INVITATION_TTL_MS = 1000 * 60 * 60 * 24 * 14

const normalizeEmail = (email: string) => email.trim().toLowerCase()

const formatUserName = (user: Doc<'users'> | null) =>
  user ? [user.firstName, user.lastName].filter(Boolean).join(' ') : undefined

const queueInvitationEmail = async (
  ctx: MutationCtx,
  invitation: Doc<'stableInvitations'>,
  stableName: string,
) => {
  await enqueueEmail(ctx, {
    recipient: invitation.email,
    relation: { type: 'stableInvitation', id: invitation._id },
    template: {
      kind: 'stable_invitation',
      stableName,
      token: invitation.token,
    },
  })
}

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

export const preview = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query('stableInvitations')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .unique()

    if (!invitation) return { state: 'not_found' as const }

    const [stable, inviter, viewer] = await Promise.all([
      ctx.db.get(invitation.stableId),
      ctx.db.get(invitation.invitedBy),
      getUserFromIdentity(ctx),
    ])

    if (!stable || stable.archivedAt !== undefined) {
      return { state: 'not_found' as const }
    }

    const status = getEffectiveInvitationStatus({
      status: invitation.status,
      expiresAt: invitation.expiresAt,
    })

    return {
      state: 'found' as const,
      stableId: stable._id,
      stableName: stable.name,
      stableLocation: stable.location,
      inviterName: formatUserName(inviter),
      emailHint: maskInvitationEmail(invitation.email),
      role: invitation.role,
      status,
      expiresAt: invitation.expiresAt,
      viewer: viewer
        ? {
            emailMatches: normalizeEmail(viewer.email) === invitation.email,
            isAcceptedByViewer: invitation.acceptedBy === viewer._id,
            hasRequiredPlan: await hasPersonalPlus(ctx, viewer._id),
          }
        : null,
    }
  },
})

export const create = mutation({
  args: {
    stableId: v.id('stables'),
    email: v.string(),
    role: newStableInvitationRole,
  },
  handler: async (ctx, args) => {
    const { stable, userId } = await assertCanManageMembers(ctx, args.stableId)
    const input = stableInvitationSchema.safeParse({
      email: args.email,
      role: args.role,
    })
    if (!input.success) {
      throw new ConvexError(
        input.error.issues[0]?.message ?? 'Invalid invitation input',
      )
    }

    const email = normalizeEmail(input.data.email)
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

      if (
        existingMembership?.role === 'member' ||
        existingUser._id === stable.ownerId
      ) {
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
      throw new ConvexError(
        'There is already a pending invitation for this email',
      )
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
      deliveryStatus: 'queued',
      deliveryAttempts: 0,
    })

    const invitation = await ctx.db.get(invitationId)
    if (!invitation) throw new ConvexError('Invitation not found')

    await queueInvitationEmail(ctx, invitation, stable.name)
    await recordStableAudit(ctx, {
      stableId: args.stableId,
      actorUserId: userId,
      action: 'member_invitation.created',
      entityType: 'stableInvitation',
      entityId: invitationId,
      summary: email,
    })

    return { invitationId, token: invitation.token }
  },
})

export const resend = mutation({
  args: { id: v.id('stableInvitations') },
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.id)
    if (!invitation) throw new ConvexError('Invitation not found')

    const { stable, userId } = await assertCanManageMembers(
      ctx,
      invitation.stableId,
    )
    if (invitation.role !== 'member') {
      throw new ConvexError('This invitation role is no longer supported')
    }
    if (invitation.status !== 'pending' && invitation.status !== 'expired') {
      throw new ConvexError('Only pending or expired invitations can be resent')
    }

    const now = Date.now()
    const token = crypto.randomUUID()
    await ctx.db.patch(invitation._id, {
      status: 'pending',
      token,
      expiresAt: now + INVITATION_TTL_MS,
      updatedAt: now,
      deliveryStatus: 'queued',
      deliveryError: undefined,
    })

    const refreshedInvitation = await ctx.db.get(invitation._id)
    if (!refreshedInvitation) throw new ConvexError('Invitation not found')

    await queueInvitationEmail(ctx, refreshedInvitation, stable.name)
    await recordStableAudit(ctx, {
      stableId: invitation.stableId,
      actorUserId: userId,
      action: 'member_invitation.resent',
      entityType: 'stableInvitation',
      entityId: invitation._id,
      summary: invitation.email,
    })

    return { token }
  },
})

export const revoke = mutation({
  args: { id: v.id('stableInvitations') },
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.id)
    if (!invitation) throw new ConvexError('Invitation not found')

    const { userId } = await assertCanManageMembers(ctx, invitation.stableId)

    if (invitation.status !== 'pending') {
      throw new ConvexError('Only pending invitations can be revoked')
    }

    await ctx.db.patch(args.id, {
      status: 'revoked',
      updatedAt: Date.now(),
    })
    await recordStableAudit(ctx, {
      stableId: invitation.stableId,
      actorUserId: userId,
      action: 'member_invitation.revoked',
      entityType: 'stableInvitation',
      entityId: invitation._id,
      summary: invitation.email,
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
    const stable = await ctx.db.get(invitation.stableId)
    if (!stable || stable.archivedAt !== undefined) {
      throw new ConvexError('This stable is no longer available')
    }
    if (invitation.role !== 'member') {
      throw new ConvexError(
        'This invitation uses a role that is no longer supported',
      )
    }
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

    if (existingMembership?.role === 'member') {
      await ensureStableOnboarding(ctx, {
        stableId: invitation.stableId,
        userId: user._id,
        role: 'member',
      })
      await ctx.db.patch(invitation._id, {
        status: 'accepted',
        acceptedBy: user._id,
        acceptedAt: now,
        updatedAt: now,
      })
      await recordStableAudit(ctx, {
        stableId: invitation.stableId,
        actorUserId: user._id,
        action: 'member_invitation.accepted',
        entityType: 'stableInvitation',
        entityId: invitation._id,
        summary: invitation.email,
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
      await recordStableAudit(ctx, {
        stableId: invitation.stableId,
        actorUserId: user._id,
        action: 'member_invitation.accepted_pending_plan',
        entityType: 'stableInvitation',
        entityId: invitation._id,
        summary: invitation.email,
      })

      return {
        status: 'accepted_pending_subscription' as const,
        stableId: invitation.stableId,
      }
    }

    if (existingMembership) {
      await ctx.db.patch(existingMembership._id, { role: 'member' })
    } else {
      await ctx.db.insert('stableMembers', {
        stableId: invitation.stableId,
        userId: user._id,
        role: 'member',
      })
    }

    await ensureStableOnboarding(ctx, {
      stableId: invitation.stableId,
      userId: user._id,
      role: 'member',
    })

    await ctx.db.patch(invitation._id, {
      status: 'accepted',
      acceptedBy: user._id,
      acceptedAt: now,
      updatedAt: now,
    })
    await recordStableAudit(ctx, {
      stableId: invitation.stableId,
      actorUserId: user._id,
      action: 'member_invitation.accepted',
      entityType: 'stableInvitation',
      entityId: invitation._id,
      summary: invitation.email,
    })

    return { status: 'accepted' as const, stableId: invitation.stableId }
  },
})
