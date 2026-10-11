import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getCurrentUser } from './libs/stablePermissions'

const providerType = v.union(
  v.literal('vet'),
  v.literal('farrier'),
  v.literal('dentist'),
  v.literal('trainer'),
  v.literal('physio'),
  v.literal('saddler'),
  v.literal('other'),
)
export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx)
    return (
      await ctx.db
        .query('personalProviders')
        .withIndex('by_user_id', (q) => q.eq('userId', user._id))
        .collect()
    ).sort((a, b) => a.name.localeCompare(b.name))
  },
})
export const save = mutation({
  args: {
    id: v.optional(v.id('personalProviders')),
    name: v.string(),
    phone: v.optional(v.string()),
    type: providerType,
  },
  handler: async (ctx, { id, ...input }) => {
    const user = await getCurrentUser(ctx)
    if (
      !input.name.trim() ||
      input.name.length > 120 ||
      (input.phone?.length ?? 0) > 50
    )
      throw new ConvexError('Enter a valid contact')
    const values = {
      ...input,
      name: input.name.trim(),
      phone: input.phone?.trim() || undefined,
    }
    if (id) {
      const provider = await ctx.db.get(id)
      if (provider?.userId !== user._id)
        throw new ConvexError('Contact not found')
      await ctx.db.patch(id, values)
      return id
    }
    return ctx.db.insert('personalProviders', {
      ...values,
      userId: user._id,
      createdAt: Date.now(),
    })
  },
})
export const remove = mutation({
  args: { id: v.id('personalProviders') },
  handler: async (ctx, { id }) => {
    const user = await getCurrentUser(ctx)
    if ((await ctx.db.get(id))?.userId !== user._id)
      throw new ConvexError('Contact not found')
    await ctx.db.delete(id)
  },
})
