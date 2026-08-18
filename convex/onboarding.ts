import { ConvexError, v } from 'convex/values'

import { mutation, query } from './_generated/server'
import type { Id } from './_generated/dataModel'
import { getUserFromIdentity } from './libs/auth'
import { ensureStableOnboarding, onboardingVersion } from './libs/onboarding'
import {
  assertCanViewStable,
  getCurrentUser,
  getStableMembership,
} from './libs/stablePermissions'
import {
  assertStorageObjectCanBeClaimed,
  deleteStorageObjectIfUnreferenced,
} from './libs/storageObjects'

const stableOnboardingStep = v.union(
  v.literal('stable-operations'),
  v.literal('stable-introduction'),
  v.literal('member-details'),
  v.literal('first-horse'),
  v.literal('invite-team'),
  v.literal('complete'),
)

type StableOnboardingStep =
  | 'stable-operations'
  | 'stable-introduction'
  | 'member-details'
  | 'first-horse'
  | 'invite-team'
  | 'complete'

const onboardingTransitions: Record<
  'owner' | 'member',
  Partial<Record<StableOnboardingStep, StableOnboardingStep>>
> = {
  owner: {
    'stable-operations': 'first-horse',
    'first-horse': 'invite-team',
    'invite-team': 'complete',
  },
  member: {
    'stable-introduction': 'member-details',
    'member-details': 'first-horse',
    'first-horse': 'complete',
  },
}

const deferrableSteps = new Set<StableOnboardingStep>([
  'stable-operations',
  'member-details',
  'first-horse',
  'invite-team',
])

export const getAccountProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUserFromIdentity(ctx)
    if (!user) return null

    return {
      ...user,
      displayName:
        user.preferredName ||
        [user.firstName, user.lastName].filter(Boolean).join(' '),
      profileImageUrl: user.profileImageId
        ? ((await ctx.storage.getUrl(user.profileImageId)) ?? user.photoUrl)
        : user.photoUrl,
      isComplete: Boolean(user.profileCompletedAt),
    }
  },
})

export const generateProfileImageUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getUserFromIdentity(ctx)
    if (!user) throw new ConvexError('User not found')

    const token = crypto.randomUUID()
    await ctx.db.insert('pendingProfileUploads', {
      userId: user._id,
      token,
      createdAt: Date.now(),
    })

    return {
      uploadUrl: await ctx.storage.generateUploadUrl(),
      uploadToken: token,
    }
  },
})

export const updateAccountProfile = mutation({
  args: {
    preferredName: v.string(),
    phone: v.optional(v.string()),
    timezone: v.optional(v.string()),
    profileImageId: v.optional(v.id('_storage')),
    profileUploadToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const preferredName = args.preferredName.trim()

    if (!preferredName) {
      throw new ConvexError('Add the name you would like people to use')
    }

    let pendingUploadId: Id<'pendingProfileUploads'> | undefined
    if (args.profileImageId) {
      if (!args.profileUploadToken) {
        throw new ConvexError('Profile image upload could not be verified')
      }

      const pendingUpload = await ctx.db
        .query('pendingProfileUploads')
        .withIndex('by_token', (q) => q.eq('token', args.profileUploadToken!))
        .unique()
      const metadata = await assertStorageObjectCanBeClaimed(
        ctx,
        args.profileImageId,
      )

      if (
        !pendingUpload ||
        pendingUpload.userId !== user._id ||
        Date.now() - pendingUpload.createdAt > 15 * 60 * 1000 ||
        metadata._creationTime < pendingUpload.createdAt ||
        !metadata.contentType?.startsWith('image/') ||
        metadata.size > 5 * 1024 * 1024
      ) {
        throw new ConvexError('Profile image upload could not be verified')
      }

      pendingUploadId = pendingUpload._id
      await ctx.db.insert('userStorageObjects', {
        userId: user._id,
        storageId: args.profileImageId,
        kind: 'profile_image',
        createdAt: Date.now(),
      })
    }

    const now = Date.now()
    await ctx.db.patch(user._id, {
      preferredName,
      phone: args.phone?.trim() || undefined,
      ...(args.timezone !== undefined
        ? { timezone: args.timezone.trim() || undefined }
        : {}),
      ...(args.profileImageId ? { profileImageId: args.profileImageId } : {}),
      profileCompletedAt: user.profileCompletedAt ?? now,
      onboardingVersion,
      updatedAt: now,
    })
    if (pendingUploadId) await ctx.db.delete(pendingUploadId)

    if (
      args.profileImageId &&
      user.profileImageId &&
      user.profileImageId !== args.profileImageId
    ) {
      const previousOwnership = await ctx.db
        .query('userStorageObjects')
        .withIndex('by_storage_id', (q) =>
          q.eq('storageId', user.profileImageId!),
        )
        .unique()
      if (previousOwnership?.userId === user._id) {
        await ctx.db.delete(previousOwnership._id)
      }
      await deleteStorageObjectIfUnreferenced(ctx, user.profileImageId)
    }
  },
})

export const getStableProgress = query({
  args: { stableId: v.id('stables') },
  handler: async (ctx, args) => {
    const access = await assertCanViewStable(ctx, args.stableId)
    const state = await ctx.db
      .query('stableOnboarding')
      .withIndex('by_stable_id_user_id', (q) =>
        q.eq('stableId', args.stableId).eq('userId', access.userId),
      )
      .unique()

    return (
      state ?? {
        stableId: args.stableId,
        userId: access.userId,
        role: access.role,
        currentStep:
          access.role === 'owner' ? 'stable-operations' : 'stable-introduction',
        completedSteps:
          access.role === 'owner' ? ['stable-basics'] : ['invitation'],
        deferredSteps: [],
        version: onboardingVersion,
      }
    )
  },
})

export const getNextIncompleteStable = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx)
    const states = await ctx.db
      .query('stableOnboarding')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .order('desc')
      .collect()

    for (const state of states) {
      if (state.completedAt !== undefined) continue

      const stable = await ctx.db.get(state.stableId)
      if (!stable || stable.archivedAt !== undefined) continue

      const access = await getStableMembership(ctx, state.stableId, user._id)
      if (!access.role) continue

      return {
        stableId: state.stableId,
        stableName: stable.name,
        role: access.role,
        currentStep: state.currentStep,
      }
    }

    return null
  },
})

export const resolveStableId = query({
  args: { stableId: v.string() },
  handler: async (ctx, args) => {
    const stableId = ctx.db.normalizeId('stables', args.stableId)
    if (!stableId) return null

    const stable = await ctx.db.get(stableId)
    if (!stable || stable.archivedAt !== undefined) return null

    await assertCanViewStable(ctx, stableId)
    return stableId
  },
})

export const recordStableStep = mutation({
  args: {
    stableId: v.id('stables'),
    step: stableOnboardingStep,
    nextStep: stableOnboardingStep,
    deferred: v.boolean(),
  },
  handler: async (ctx, args) => {
    const access = await assertCanViewStable(ctx, args.stableId)
    const stateId = await ensureStableOnboarding(ctx, {
      stableId: args.stableId,
      userId: access.userId,
      role: access.role,
    })
    const state = await ctx.db.get(stateId)
    if (!state) throw new ConvexError('Onboarding progress not found')

    const expectedNextStep = onboardingTransitions[access.role][args.step]
    if (
      state.currentStep !== args.step ||
      expectedNextStep !== args.nextStep ||
      (args.deferred && !deferrableSteps.has(args.step))
    ) {
      throw new ConvexError('This onboarding step is out of sequence')
    }

    const completedSteps = args.deferred
      ? state.completedSteps.filter((step) => step !== args.step)
      : [...new Set([...state.completedSteps, args.step])]
    const deferredSteps = args.deferred
      ? [...new Set([...state.deferredSteps, args.step])]
      : state.deferredSteps.filter((step) => step !== args.step)

    await ctx.db.patch(stateId, {
      currentStep: args.nextStep,
      completedSteps,
      deferredSteps,
      updatedAt: Date.now(),
    })
  },
})

export const completeStableOnboarding = mutation({
  args: { stableId: v.id('stables') },
  handler: async (ctx, args) => {
    const access = await assertCanViewStable(ctx, args.stableId)
    const stateId = await ensureStableOnboarding(ctx, {
      stableId: args.stableId,
      userId: access.userId,
      role: access.role,
    })
    const state = await ctx.db.get(stateId)
    if (!state) throw new ConvexError('Onboarding progress not found')
    if (state.currentStep !== 'complete') {
      throw new ConvexError('Finish the current onboarding step first')
    }

    const now = Date.now()
    await ctx.db.patch(stateId, {
      currentStep: 'complete',
      completedAt: now,
      updatedAt: now,
    })
  },
})
