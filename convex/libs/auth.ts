import { ConvexError } from 'convex/values';
import { MutationCtx, QueryCtx } from '../_generated/server';

export const requireAuth = async (ctx: MutationCtx | QueryCtx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) throw new ConvexError('User not authenticated');

  return identity;
};
