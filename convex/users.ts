import { ConvexError, v } from 'convex/values'
import type { Id } from './_generated/dataModel'
import { internalMutation, mutation, query } from './_generated/server'
import type { MutationCtx } from './_generated/server'
import { getUserFromIdentity, requireAuth } from './libs/auth'
import { reconcilePendingSubscriptions } from './userSubscriptions'
import { deleteStorageObjectIfUnreferenced } from './libs/storageObjects'

export const getCurrentIdentity = query({
  args: {},
  handler: async (ctx) => await ctx.auth.getUserIdentity(),
})

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => await getUserFromIdentity(ctx),
})

export const get = query({
  args: { id: v.id('users') },
  handler: async (ctx, args) => {
    const currentUser = await getUserFromIdentity(ctx)
    if (!currentUser || currentUser._id !== args.id) return null

    return currentUser
  },
})

export const ensureCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await requireAuth(ctx)
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .unique()

    if (existingUser?.deletedAt !== undefined) {
      throw new ConvexError('This account has been deleted')
    }
    if (existingUser) {
      await reconcilePendingSubscriptions(ctx, existingUser)
      return existingUser._id
    }

    const now = Date.now()
    const userId = await ctx.db.insert('users', {
      clerkId: identity.subject,
      email: identity.email?.trim().toLowerCase() ?? '',
      firstName: identity.givenName ?? identity.name ?? 'Member',
      lastName: identity.familyName,
      photoUrl: identity.pictureUrl,
      createdAt: now,
      updatedAt: now,
    })
    const user = await ctx.db.get(userId)
    if (user) await reconcilePendingSubscriptions(ctx, user)

    return userId
  },
})

export const upsertUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .unique()
    const now = Date.now()

    if (existingUser) {
      if (existingUser.deletedAt !== undefined) return

      await ctx.db.patch(existingUser._id, {
        email: args.email.trim().toLowerCase(),
        firstName: args.firstName,
        lastName: args.lastName,
        photoUrl: args.photoUrl,
        updatedAt: now,
      })
      const updatedUser = await ctx.db.get(existingUser._id)
      if (updatedUser) await reconcilePendingSubscriptions(ctx, updatedUser)
      return existingUser._id
    }

    const userId = await ctx.db.insert('users', {
      ...args,
      email: args.email.trim().toLowerCase(),
      createdAt: now,
      updatedAt: now,
    })
    const user = await ctx.db.get(userId)
    if (user) await reconcilePendingSubscriptions(ctx, user)
    return userId
  },
})

async function removeOnboarding(
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

async function archiveOwnedStable(
  ctx: MutationCtx,
  stableId: Id<'stables'>,
  now: number,
) {
  await ctx.db.patch(stableId, {
    archivedAt: now,
    archivedReason: 'owner_account_deleted',
  })
}

export const deleteUser = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', clerkId))
      .unique()
    if (!user || user.deletedAt !== undefined) return

    const now = Date.now()
    const ownedStables = await ctx.db
      .query('stables')
      .withIndex('by_owner_id', (q) => q.eq('ownerId', user._id))
      .collect()
    for (const stable of ownedStables) {
      await archiveOwnedStable(ctx, stable._id, now)
    }

    const memberships = await ctx.db
      .query('stableMembers')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .collect()
    for (const membership of memberships) {
      const stable = await ctx.db.get(membership.stableId)
      if (stable && stable.ownerId !== user._id) {
        const horses = await ctx.db
          .query('horses')
          .withIndex('by_owner_id', (q) => q.eq('ownerId', user._id))
          .filter((q) => q.eq(q.field('stableId'), membership.stableId))
          .collect()
        for (const horse of horses) {
          await ctx.db.patch(horse._id, { ownerId: stable.ownerId })
        }
      }
      await removeOnboarding(ctx, membership.stableId, user._id)
      await ctx.db.delete(membership._id)
    }

    const remainingOnboarding = await ctx.db
      .query('stableOnboarding')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .collect()
    for (const onboarding of remainingOnboarding) {
      await ctx.db.delete(onboarding._id)
    }

    const subscriptions = await ctx.db
      .query('userSubscriptions')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .collect()
    for (const subscription of subscriptions) {
      await ctx.db.delete(subscription._id)
    }
    const pendingSubscriptions = await ctx.db
      .query('pendingUserSubscriptions')
      .withIndex('by_clerk_user_id_plan', (q) =>
        q.eq('clerkUserId', user.clerkId),
      )
      .collect()
    for (const subscription of pendingSubscriptions) {
      await ctx.db.delete(subscription._id)
    }

    const pendingUploads = await ctx.db
      .query('pendingProfileUploads')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .collect()
    for (const pendingUpload of pendingUploads) {
      await ctx.db.delete(pendingUpload._id)
    }

    const ownedStorageObjects = await ctx.db
      .query('userStorageObjects')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .collect()
    for (const storageObject of ownedStorageObjects) {
      await ctx.db.delete(storageObject._id)
    }

    await ctx.db.patch(user._id, {
      email: `deleted-${user._id}@deleted.invalid`,
      firstName: 'Deleted',
      lastName: 'user',
      photoUrl: undefined,
      preferredName: undefined,
      phone: undefined,
      profileImageId: undefined,
      timezone: undefined,
      deletedAt: now,
      updatedAt: now,
    })
    for (const storageObject of ownedStorageObjects) {
      await deleteStorageObjectIfUnreferenced(ctx, storageObject.storageId)
    }
  },
})
