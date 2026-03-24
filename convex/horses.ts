import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getUserFromIdentity } from './libs/auth'
import { horsesFields } from './schema'
import { horseInputSchema } from '../shared/horses/horseSchema'
import { omit } from 'lodash'

const validateHorseInput = (args: {
  name: string
  age: number
  breed?: string
}) => {
  const result = horseInputSchema.safeParse(args)

  if (!result.success) {
    throw new ConvexError(
      result.error.issues[0]?.message ?? 'Invalid horse info input',
    )
  }

  return result.data
}

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
  args: { ...omit(horsesFields, 'ownerId'), stableId: v.id('stables') },
  handler: async (ctx, args) => {
    const user = await getUserFromIdentity(ctx)
    if (!user) throw new ConvexError('User not found')

    const horseInput = validateHorseInput(args)

    return await ctx.db.insert('horses', {
      ...horseInput,
      ownerId: user?._id,
      stableId: args.stableId,
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
