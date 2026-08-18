import type { Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import { ensureStableOnboarding } from './onboarding'
import { recordStableAudit } from './audit'

export async function activateAcceptedInvitationsForUser(
  ctx: MutationCtx,
  userId: Id<'users'>,
) {
  const invitations = await ctx.db
    .query('stableInvitations')
    .withIndex('by_accepted_by_status', (q) =>
      q.eq('acceptedBy', userId).eq('status', 'accepted_pending_subscription'),
    )
    .collect()
  const now = Date.now()

  for (const invitation of invitations) {
    if (invitation.role !== 'member') continue

    const stable = await ctx.db.get(invitation.stableId)
    if (!stable || stable.archivedAt !== undefined) continue

    const existingMembership = await ctx.db
      .query('stableMembers')
      .withIndex('by_stable_id_user_id', (q) =>
        q.eq('stableId', invitation.stableId).eq('userId', userId),
      )
      .unique()

    if (existingMembership) {
      await ctx.db.patch(existingMembership._id, { role: 'member' })
    } else {
      await ctx.db.insert('stableMembers', {
        stableId: invitation.stableId,
        userId,
        role: 'member',
      })
    }

    await ensureStableOnboarding(ctx, {
      stableId: invitation.stableId,
      userId,
      role: 'member',
    })
    await ctx.db.patch(invitation._id, {
      status: 'accepted',
      updatedAt: now,
    })
    await recordStableAudit(ctx, {
      stableId: invitation.stableId,
      actorUserId: userId,
      action: 'member_invitation.activated',
      entityType: 'stableInvitation',
      entityId: invitation._id,
      summary: invitation.email,
    })
  }
}
