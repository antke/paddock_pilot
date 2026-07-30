import { v } from 'convex/values'
import { internalMutation, query } from './_generated/server'
import { getUserFromIdentity } from './libs/auth'

// identity is served from auth layer
export const getCurrentIdentity = query({
  args: {},
  handler: async (ctx) => {
    const userData = await ctx.auth.getUserIdentity()

    return userData
  },
})

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return getUserFromIdentity(ctx)
  },
})

export const get = query({
  args: { id: v.id('users') },
  handler: async (ctx, args) => {
    const currentUser = await getUserFromIdentity(ctx)
    if (!currentUser || currentUser._id !== args.id) return null

    return ctx.db.get(args.id)
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
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        photoUrl: args.photoUrl,
        updatedAt: now,
      })

      return
    }

    await ctx.db.insert('users', {
      ...args,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const deleteUser = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', clerkId))
      .unique()
    if (user) await ctx.db.delete(user._id)
  },
})
