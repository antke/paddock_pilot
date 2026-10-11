import { ConvexError, v } from 'convex/values'
import { stableProviderInputSchema } from '../shared/stables/stableProviderSchema'
import type { Doc } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import type { MutationCtx } from './_generated/server'
import {
  assertCanManageProviders,
  assertCanViewStable,
  getCurrentUser,
} from './libs/stablePermissions'

const stableProviderTypeValidator = v.union(
  v.literal('trainer'),
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

// Put everyday care contacts first instead of sorting English role names.
const providerOrder: Record<Doc<'stableProviders'>['type'], number> = {
  vet: 0,
  farrier: 1,
  dentist: 2,
  physio: 3,
  saddler: 4,
  trainer: 5,
  other: 6,
}

const sortProviders = (
  a: Doc<'stableProviders'>,
  b: Doc<'stableProviders'>,
) => {
  const typeSort = providerOrder[a.type] - providerOrder[b.type]

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
      canManage: access.capabilities.canManageProviders,
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

    if (provider.type !== input.type) await detachHorseReferences(ctx, provider)

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
    await detachHorseReferences(ctx, provider)
    await ctx.db.delete(args.id)
  },
})

// Preserve the last current details when a provider is removed or changes role.
// Event records keep their independent historical snapshots.
async function detachHorseReferences(
  ctx: MutationCtx,
  provider: Doc<'stableProviders'>,
) {
  const horses = await ctx.db
    .query('horses')
    .withIndex('by_stable_id', (q) => q.eq('stableId', provider.stableId))
    .collect()
  for (const horse of horses) {
    for (const kind of ['vet', 'farrier'] as const) {
      if (horse[`${kind}ProviderId`] === provider._id) {
        await ctx.db.patch(horse._id, {
          [`${kind}ProviderId`]: undefined,
          [`${kind}Name`]: provider.name,
          [`${kind}Phone`]: provider.phone,
        })
      }
    }
  }
}
