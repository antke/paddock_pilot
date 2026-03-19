import { ConvexError, v } from 'convex/values'
import { stableInputSchema } from '../shared/stables/stableSchema'
import { mutation, query } from './_generated/server'
import { stableFields } from './schema'
import { getUserFromIdentity, requireAuth } from './libs/auth'
import type { Id } from './_generated/dataModel'
import { omit } from 'lodash'

function validateStableInput(args: {
  name: string
  location: string
  description?: string
}) {
  const result = stableInputSchema.safeParse(args)

  if (!result.success) {
    throw new ConvexError(
      result.error.issues[0]?.message ?? 'Invalid stable input',
    )
  }

  return result.data
}

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

    const stableInput = validateStableInput(args)

    return await ctx.db.insert('stables', {
      ...stableInput,
      ownerId: user._id,
    })
  },
})

export const update = mutation({
  args: { ...omit(stableFields, 'ownerId'), id: v.id('stables') },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const stable = await ctx.db.get(args.id)
    if (!stable) throw new ConvexError('Stable not found')

    // TODO : this could be more elegant with a helper
    const user = await getUserFromIdentity(ctx)
    if (!user || stable.ownerId !== user._id) {
      throw new ConvexError('Not authorized to update this stable')
    }

    const stableInput = validateStableInput(args)

    await ctx.db.replace(args.id, {
      ...stableInput,
      ownerId: stable.ownerId,
    })
  },
})

export const remove = mutation({
  args: { id: v.id('stables') },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const stable = await ctx.db.get(args.id)
    if (!stable) throw new ConvexError('Stable not found')

    const user = await getUserFromIdentity(ctx)
    if (!user || stable.ownerId !== user._id) {
      throw new ConvexError('Not authorized to remove this stable')
    }

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
