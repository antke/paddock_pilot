import type { Doc } from '../../_generated/dataModel'
import type { MutationCtx } from '../../_generated/server'
import { enqueueEmail } from './outbox'

const formatUserName = (user: Doc<'users'>) =>
  user.preferredName ||
  [user.firstName, user.lastName].filter(Boolean).join(' ') ||
  'Stable member'

const hasMailableAddress = (user: Doc<'users'>) =>
  user.email.trim().includes('@')

export const queueAccountWelcomeEmail = async (
  ctx: MutationCtx,
  user: Doc<'users'>,
) => {
  if (!hasMailableAddress(user)) return

  return await enqueueEmail(ctx, {
    dedupeKey: `account-welcome:${user.clerkId}`,
    recipient: user.email,
    relation: { type: 'user', id: user._id },
    template: {
      kind: 'account_welcome',
      displayName: formatUserName(user),
    },
  })
}

export const queueAccountDeletedEmail = async (
  ctx: MutationCtx,
  user: Doc<'users'>,
) => {
  if (!hasMailableAddress(user)) return

  return await enqueueEmail(ctx, {
    dedupeKey: `account-deleted:${user._id}`,
    recipient: user.email,
    relation: { type: 'user', id: user._id },
    template: {
      kind: 'account_deleted',
      displayName: formatUserName(user),
    },
  })
}

export const queueMembershipActivatedEmails = async (
  ctx: MutationCtx,
  input: {
    invitation: Doc<'stableInvitations'>
    member: Doc<'users'>
    stable: Doc<'stables'>
  },
) => {
  const owner = await ctx.db.get(input.stable.ownerId)

  if (hasMailableAddress(input.member)) {
    await enqueueEmail(ctx, {
      dedupeKey: `stable-membership-activated:${input.invitation._id}:${input.member._id}`,
      recipient: input.member.email,
      relation: { type: 'stableInvitation', id: input.invitation._id },
      template: {
        kind: 'stable_membership_activated',
        stableId: input.stable._id,
        stableName: input.stable.name,
      },
    })
  }

  if (
    !owner ||
    owner.deletedAt !== undefined ||
    owner._id === input.member._id ||
    !hasMailableAddress(owner)
  ) {
    return
  }

  await enqueueEmail(ctx, {
    dedupeKey: `stable-invitation-accepted:${input.invitation._id}:${input.member._id}`,
    recipient: owner.email,
    relation: { type: 'stableInvitation', id: input.invitation._id },
    template: {
      kind: 'stable_invitation_accepted',
      memberName: formatUserName(input.member),
      stableId: input.stable._id,
      stableName: input.stable.name,
    },
  })
}

export const queueMembershipRemovedEmail = async (
  ctx: MutationCtx,
  input: {
    member: Doc<'users'>
    membership: Doc<'stableMembers'>
    stable: Doc<'stables'>
  },
) => {
  if (
    input.member.deletedAt !== undefined ||
    !hasMailableAddress(input.member)
  ) {
    return
  }

  await enqueueEmail(ctx, {
    dedupeKey: `stable-membership-removed:${input.membership._id}`,
    recipient: input.member.email,
    relation: { type: 'stable', id: input.stable._id },
    template: {
      kind: 'stable_membership_removed',
      stableName: input.stable.name,
    },
  })
}

export const queueStableArchivedEmails = async (
  ctx: MutationCtx,
  stable: Doc<'stables'>,
) => {
  const memberships = await ctx.db
    .query('stableMembers')
    .withIndex('by_stable_id', (q) => q.eq('stableId', stable._id))
    .collect()
  const members = await Promise.all(
    memberships
      .filter((membership) => membership.role === 'member')
      .map((membership) => ctx.db.get(membership.userId)),
  )

  await Promise.all(
    members.flatMap((member) =>
      member && member.deletedAt === undefined && hasMailableAddress(member)
        ? [
            enqueueEmail(ctx, {
              dedupeKey: `stable-archived:${stable._id}:${member._id}`,
              recipient: member.email,
              relation: { type: 'stable', id: stable._id },
              template: {
                kind: 'stable_archived',
                stableName: stable.name,
              },
            }),
          ]
        : [],
    ),
  )
}
