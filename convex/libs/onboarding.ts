import type { Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'

export const onboardingVersion = 1

export async function ensureStableOnboarding(
  ctx: MutationCtx,
  input: {
    stableId: Id<'stables'>
    userId: Id<'users'>
    role: 'owner' | 'member'
    currentStep?: string
  },
) {
  const existing = await ctx.db
    .query('stableOnboarding')
    .withIndex('by_stable_id_user_id', (q) =>
      q.eq('stableId', input.stableId).eq('userId', input.userId),
    )
    .unique()

  if (existing) return existing._id

  const now = Date.now()

  return await ctx.db.insert('stableOnboarding', {
    stableId: input.stableId,
    userId: input.userId,
    role: input.role,
    currentStep:
      input.currentStep ??
      (input.role === 'owner' ? 'stable-operations' : 'stable-introduction'),
    completedSteps: input.role === 'owner' ? ['stable-basics'] : ['invitation'],
    deferredSteps: [],
    version: onboardingVersion,
    createdAt: now,
    updatedAt: now,
  })
}
