import { ConvexError, v } from 'convex/values'
import { paginationOptsValidator } from 'convex/server'
import { mutation, query } from './_generated/server'
import { assertCanViewStable } from './libs/stablePermissions'
import { resolveTodayDateKey } from './libs/dateKeys'

const updateValues = { body: v.string(), expiresOn: v.optional(v.string()) }
const validate = (body: string, expiresOn?: string) => {
  const trimmed = body.trim()
  if (!trimmed || trimmed.length > 2000)
    throw new ConvexError('Write an update between 1 and 2000 characters')
  if (
    expiresOn &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(expiresOn) ||
      !Number.isFinite(Date.parse(`${expiresOn}T00:00:00Z`)) ||
      new Date(`${expiresOn}T00:00:00Z`).toISOString().slice(0, 10) !==
        expiresOn)
  )
    throw new ConvexError('Choose a valid expiry date')
  return { body: trimmed, expiresOn: expiresOn || undefined }
}

export const list = query({
  args: {
    stableId: v.id('stables'),
    today: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const access = await assertCanViewStable(ctx, args.stableId)
    const today = resolveTodayDateKey(args.today)
    const page = await ctx.db
      .query('stableUpdates')
      .withIndex('by_stable_created_at', (q) => q.eq('stableId', args.stableId))
      .order('desc')
      .filter((q) =>
        q.or(
          q.eq(q.field('expiresOn'), undefined),
          q.gte(q.field('expiresOn'), today),
        ),
      )
      .paginate(args.paginationOpts)
    return {
      ...page,
      page: await Promise.all(
        page.page.map(async (update) => {
          const author = await ctx.db.get(update.authorId)
          return {
            ...update,
            authorName:
              author && author.deletedAt === undefined
                ? author.preferredName ||
                  [author.firstName, author.lastName].filter(Boolean).join(' ')
                : undefined,
            canManage:
              access.role === 'owner' || access.userId === update.authorId,
          }
        }),
      ),
    }
  },
})

export const add = mutation({
  args: { stableId: v.id('stables'), ...updateValues },
  handler: async (ctx, args) => {
    const access = await assertCanViewStable(ctx, args.stableId)
    const now = Date.now()
    return await ctx.db.insert('stableUpdates', {
      stableId: args.stableId,
      ...validate(args.body, args.expiresOn),
      authorId: access.userId,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const update = mutation({
  args: { id: v.id('stableUpdates'), ...updateValues },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.id)
    if (!record) throw new ConvexError('Update not found')
    const access = await assertCanViewStable(ctx, record.stableId)
    if (access.role !== 'owner' && access.userId !== record.authorId)
      throw new ConvexError(
        'Only the author or stable owner can change this update',
      )
    await ctx.db.patch(args.id, {
      ...validate(args.body, args.expiresOn),
      updatedAt: Date.now(),
    })
  },
})

export const remove = mutation({
  args: { id: v.id('stableUpdates') },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.id)
    if (!record) throw new ConvexError('Update not found')
    const access = await assertCanViewStable(ctx, record.stableId)
    if (access.role !== 'owner' && access.userId !== record.authorId)
      throw new ConvexError(
        'Only the author or stable owner can remove this update',
      )
    await ctx.db.delete(args.id)
  },
})
