import { ConvexError, v } from 'convex/values'
import { stableProviderInputSchema } from '../shared/stables/stableProviderSchema'
import type { Doc } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import {
  assertCanViewStable,
  getCurrentUser,
} from './libs/stablePermissions'

const stableProviderTypeValidator = v.union(
  v.literal('vet'),
  v.literal('farrier'),
  v.literal('dentist'),
  v.literal('physio'),
  v.literal('saddler'),
  v.literal('other'),
)

const validateProviderInput = (args: {
  stableId: string
  type: Doc<'stableProviders'>['type']
  name: string
  phone?: string
  email?: string
  notes?: string
}) => {
  const result = stableProviderInputSchema.safeParse(args)

  if (!result.success) {
    throw new ConvexError(
      result.error.issues[0]?.message ?? 'Invalid provider input',
    )
  }

  return result.data
}

const assertCanManageProviders = async (
  ctx: Parameters<typeof assertCanViewStable>[0],
  stableId: Doc<'stables'>['_id'],
  userId: Doc<'users'>['_id'],
) => {
  const access = await assertCanViewStable(ctx, stableId, userId)

  if (access.role === 'guest') {
    throw new ConvexError('Not authorized to manage stable providers')
  }

  return access
}

const sortProviders = (a: Doc<'stableProviders'>, b: Doc<'stableProviders'>) => {
  const typeSort = a.type.localeCompare(b.type)

  if (typeSort !== 0) return typeSort

  return a.name.localeCompare(b.name)
}

export const listForStable = query({
  args: { stableId: v.id('stables') },
  handler: async (ctx, args) => {
    const access = await assertCanViewStable(ctx, args.stableId)
    const providers = await ctx.db
      .query('stableProviders')
      .withIndex('by_stable_id', (q) => q.eq('stableId', args.stableId))
      .collect()

    return {
      canManage: access.role !== 'guest',
      providers: providers.sort(sortProviders),
    }
  },
})

export const add = mutation({
  args: {
    stableId: v.id('stables'),
    type: stableProviderTypeValidator,
    name: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    await assertCanManageProviders(ctx, args.stableId, user._id)
    const input = validateProviderInput(args)
    const now = Date.now()

    return await ctx.db.insert('stableProviders', {
      ...input,
      stableId: args.stableId,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const update = mutation({
  args: {
    id: v.id('stableProviders'),
    type: stableProviderTypeValidator,
    name: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const provider = await ctx.db.get(args.id)
    if (!provider) throw new ConvexError('Provider not found')

    await assertCanManageProviders(ctx, provider.stableId, user._id)
    const input = validateProviderInput({
      stableId: provider.stableId,
      type: args.type,
      name: args.name,
      phone: args.phone,
      email: args.email,
      notes: args.notes,
    })

    await ctx.db.patch(args.id, {
      type: input.type,
      name: input.name,
      phone: input.phone,
      email: input.email,
      notes: input.notes,
      updatedAt: Date.now(),
    })
  },
})

export const remove = mutation({
  args: { id: v.id('stableProviders') },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const provider = await ctx.db.get(args.id)
    if (!provider) throw new ConvexError('Provider not found')

    await assertCanManageProviders(ctx, provider.stableId, user._id)
    await ctx.db.delete(args.id)
  },
})
