import { mutation, query } from './_generated/server'
import { stableMembersFields } from './schema'

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('stableMembers')
      .withIndex('by_creation_time')
      .order('desc')
      .collect()
  },
})

export const add = mutation({
  args: { ...stableMembersFields },
  handler: async (ctx, args) => {
    return await ctx.db.insert('stableMembers', {
      userId: args.userId,
      stables: args.stables,
      role: args.role,
    })
  },
})
