import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { stableFields } from './schema'
import { getUserFromIdentity, requireAuth } from './libs/auth'
import { Id } from './_generated/dataModel'
import { omit } from 'lodash'

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('stables')
      .withIndex('by_creation_time')
      .order('desc')
      .collect()
  },
})

export const get = query({
  args: { id: v.id('stables') },
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    return await ctx.db.get(args.id)
  },
})

export const add = mutation({
  args: { ...omit(stableFields, 'ownerId') },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const user = await getUserFromIdentity(ctx)
    if (!user) throw new ConvexError('User not found')

    return await ctx.db.insert('stables', {
      name: args.name,
      location: args.location,
      description: args.description,
      ownerId: user._id,
    })
  },
})

export const remove = mutation({
  args: { id: v.id('stables') },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id)
  },
})

export const getWithOwner = query({
  args: { id: v.id('stables') },
  handler: async (ctx, args) => {
    const stable = await ctx.db.get(args.id)
    if (!stable) return null

    const owner = await ctx.db.get(stable.ownerId as Id<'users'>)

    return { stable, owner }
  },
})
