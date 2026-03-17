import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getUserFromIdentity } from './libs/auth'
import { horsesFields } from './schema'

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
    const user = await getUserFromIdentity(ctx)
    if (!user) throw new ConvexError('User not found')

    return await ctx.db.insert('horses', {
      stableId: args.stableId,
      ownerId: user?._id,
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
