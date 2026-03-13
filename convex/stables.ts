import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { stableFields } from './schema'
import { requireAuth } from './libs/auth'

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

export const add = mutation({
  args: { ...stableFields },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx)

    return await ctx.db.insert('stables', {
      name: args.name,
      location: args.location,
      description: args.description,
      ownerId: identity.subject,
    })
  },
})

export const remove = mutation({
  args: { id: v.id('stables') },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id)
  },
})
