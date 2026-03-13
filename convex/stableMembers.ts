import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { stableMembersFields } from './schema';

export const listByStable = query({
  args: { stableId: v.id('stables') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('stableMembers')
      .withIndex('by_stable_id', (q) => q.eq('stableId', args.stableId))
      .order('desc')
      .collect();
  },
});

export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('stableMembers')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .order('desc')
      .collect();
  },
});

export const add = mutation({
  args: { ...stableMembersFields },
  handler: async (ctx, args) => {
    return await ctx.db.insert('stableMembers', {
      stableId: args.stableId,
      userId: args.userId,
      role: args.role,
    });
  },
});

export const remove = mutation({
  args: { id: v.id('stableMembers') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
