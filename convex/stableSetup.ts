import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import {
  assertCanManageStable,
  assertCanViewStable,
} from './libs/stablePermissions'
import { ensureStableOnboarding } from './libs/onboarding'
import { getStableSetupSteps } from '../shared/stables/stableSetup'
import { getEffectiveInvitationStatus } from '../shared/stableInvitations/invitationState'

export const get = query({
  args: { stableId: v.id('stables') },
  handler: async (ctx, { stableId }) => {
    const access = await assertCanViewStable(ctx, stableId)
    if (access.role !== 'owner') return null
    const [horses, members, invitations, providers, onboarding] =
      await Promise.all([
        ctx.db
          .query('horses')
          .withIndex('by_stable_id', (q) => q.eq('stableId', stableId))
          .collect(),
        ctx.db
          .query('stableMembers')
          .withIndex('by_stable_id', (q) => q.eq('stableId', stableId))
          .collect(),
        ctx.db
          .query('stableInvitations')
          .withIndex('by_stable_id', (q) => q.eq('stableId', stableId))
          .collect(),
        ctx.db
          .query('stableProviders')
          .withIndex('by_stable_id', (q) => q.eq('stableId', stableId))
          .collect(),
        ctx.db
          .query('stableOnboarding')
          .withIndex('by_stable_id_user_id', (q) =>
            q.eq('stableId', stableId).eq('userId', access.userId),
          )
          .unique(),
      ])
    return {
      steps: getStableSetupSteps({
        stable: access.stable,
        providers,
        horseCount: horses.filter((horse) => horse.deletedAt === undefined)
          .length,
        memberCount: members.filter((member) => member.role === 'member')
          .length,
        invitationCount: invitations.filter(
          (invitation) =>
            getEffectiveInvitationStatus(invitation) === 'pending',
        ).length,
      }),
      dismissed: onboarding?.setupPromptDismissed ?? false,
    }
  },
})

export const dismissPrompt = mutation({
  args: { stableId: v.id('stables') },
  handler: async (ctx, { stableId }) => {
    const { userId } = await assertCanManageStable(ctx, stableId)
    const id = await ensureStableOnboarding(ctx, {
      stableId,
      userId,
      role: 'owner',
    })
    await ctx.db.patch(id, {
      setupPromptDismissed: true,
      updatedAt: Date.now(),
    })
  },
})
