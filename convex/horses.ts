import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { horsesFields } from './schema'
import { requireAuth } from './libs/auth'

export const list = query({
  args: { stableId: v.id('stables') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('horses')
      .withIndex('by_stable_id', (q) => q.eq('stableId', args.stableId))
      .order('desc')
      .collect()
  },
})

export const add = mutation({
  args: { ...horsesFields },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx)

    return await ctx.db.insert('horses', {
      stableId: args.stableId,
      ownerId: identity.subject,
      name: args.name,
      age: args.age,
      breed: args.breed,
    })
  },
})

export const update = mutation({
  args: { id: v.id('horses'), ...horsesFields },
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    await ctx.db.patch(id, updates)
  },
})

export const deleteHorse = mutation({
  args: { id: v.id('horses') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})
