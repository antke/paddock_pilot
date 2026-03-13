import { query } from './_generated/server';

export const getCurrentIdentity = query({
  args: {},
  handler: async (ctx) => {
    const userData = await ctx.auth.getUserIdentity();

    return userData;
  },
});
