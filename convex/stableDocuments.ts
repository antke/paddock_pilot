import { ConvexError, v } from 'convex/values'
import { stableDocumentInputSchema } from '../shared/stables/stableDocumentSchema'
import type { Doc, Id } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { assertHasPersonalPro, hasPersonalPro } from './libs/entitlements'
import { assertCanViewStable, getCurrentUser } from './libs/stablePermissions'

type Ctx = QueryCtx | MutationCtx

const stableDocumentTypeValidator = v.union(
  v.literal('passport'),
  v.literal('vaccination'),
  v.literal('insurance'),
  v.literal('vet_report'),
  v.literal('farrier'),
  v.literal('dental'),
  v.literal('other'),
)

const validateDocumentInput = (args: {
  stableId: Id<'stables'>
  horseId?: Id<'horses'>
  eventId?: Id<'events'>
  storageId?: Id<'_storage'>
  type: Doc<'stableDocuments'>['type']
  fileName: string
  contentType?: string
  size?: number
  notes?: string
}) => {
  const result = stableDocumentInputSchema.safeParse(args)

  if (!result.success) {
    throw new ConvexError(
      result.error.issues[0]?.message ?? 'Invalid document input',
    )
  }

  return result.data
}

const canManageStableDocuments = (role: 'owner' | 'member' | 'guest' | undefined) =>
  role === 'owner' || role === 'member'

const canManageDocument = (
  access: Awaited<ReturnType<typeof assertCanViewStable>>,
  horse?: Doc<'horses'> | null,
) => {
  return canManageStableDocuments(access.role) || horse?.ownerId === access.userId
}

const byCreatedAtDesc = (a: Doc<'stableDocuments'>, b: Doc<'stableDocuments'>) =>
  b.createdAt - a.createdAt

const assertLinkedRowsBelongToStable = async (
  ctx: Ctx,
  stableId: Id<'stables'>,
  horseId?: Id<'horses'>,
  eventId?: Id<'events'>,
) => {
  const [horse, event] = await Promise.all([
    horseId ? ctx.db.get(horseId) : Promise.resolve(null),
    eventId ? ctx.db.get(eventId) : Promise.resolve(null),
  ])

  if (horseId && !horse) throw new ConvexError('Horse not found')
  if (eventId && !event) throw new ConvexError('Event not found')
  if (horse && horse.stableId !== stableId) {
    throw new ConvexError('Horse must belong to the document stable')
  }
  if (event && event.stableId !== stableId) {
    throw new ConvexError('Event must belong to the document stable')
  }

  return { horse, event }
}

const enrichDocuments = async (
  ctx: QueryCtx,
  documents: Array<Doc<'stableDocuments'>>,
  userId?: Id<'users'>,
) => {
  const userHasPersonalPro = userId ? await hasPersonalPro(ctx, userId) : false
  const rows = await Promise.all(
    documents.sort(byCreatedAtDesc).map(async (document) => {
      const [horse, event, fileUrl, access] = await Promise.all([
        document.horseId ? ctx.db.get(document.horseId) : Promise.resolve(null),
        document.eventId ? ctx.db.get(document.eventId) : Promise.resolve(null),
        document.storageId
          ? ctx.storage.getUrl(document.storageId)
          : Promise.resolve(null),
        assertCanViewStable(ctx, document.stableId, userId),
      ])

      return {
        document,
        horseName: horse?.name,
        eventTitle: event?.title,
        fileUrl,
        canManage: userHasPersonalPro && canManageDocument(access, horse),
      }
    }),
  )

  return rows
}

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx)
    await assertHasPersonalPro(ctx, user._id)

    return await ctx.storage.generateUploadUrl()
  },
})

export const listForStable = query({
  args: { stableId: v.id('stables') },
  handler: async (ctx, args) => {
    const access = await assertCanViewStable(ctx, args.stableId)
    const documents = await ctx.db
      .query('stableDocuments')
      .withIndex('by_stable_id', (q) => q.eq('stableId', args.stableId))
      .collect()

    return {
      canManageStableDocuments:
        canManageStableDocuments(access.role) &&
        (await hasPersonalPro(ctx, access.userId)),
      documents: await enrichDocuments(ctx, documents, access.userId),
    }
  },
})

export const listForHorse = query({
  args: { horseId: v.id('horses') },
  handler: async (ctx, args) => {
    const horse = await ctx.db.get(args.horseId)
    if (!horse) return { canManage: false, documents: [] }

    const access = await assertCanViewStable(ctx, horse.stableId)
    const documents = await ctx.db
      .query('stableDocuments')
      .withIndex('by_horse_id', (q) => q.eq('horseId', args.horseId))
      .collect()

    return {
      canManage:
        canManageDocument(access, horse) &&
        (await hasPersonalPro(ctx, access.userId)),
      documents: await enrichDocuments(ctx, documents, access.userId),
    }
  },
})

export const add = mutation({
  args: {
    stableId: v.id('stables'),
    horseId: v.optional(v.id('horses')),
    eventId: v.optional(v.id('events')),
    storageId: v.optional(v.id('_storage')),
    type: stableDocumentTypeValidator,
    fileName: v.string(),
    contentType: v.optional(v.string()),
    size: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    await assertHasPersonalPro(ctx, user._id)
    const access = await assertCanViewStable(ctx, args.stableId, user._id)
    const documentInput = validateDocumentInput(args)
    const { horse } = await assertLinkedRowsBelongToStable(
      ctx,
      args.stableId,
      args.horseId,
      args.eventId,
    )

    if (!canManageDocument(access, horse)) {
      throw new ConvexError('Not authorized to manage documents in this stable')
    }

    return await ctx.db.insert('stableDocuments', {
      stableId: args.stableId,
      horseId: args.horseId,
      eventId: args.eventId,
      storageId: args.storageId,
      type: documentInput.type,
      fileName: documentInput.fileName,
      contentType: documentInput.contentType,
      size: documentInput.size,
      notes: documentInput.notes,
      createdBy: user._id,
      createdAt: Date.now(),
    })
  },
})

export const remove = mutation({
  args: { id: v.id('stableDocuments') },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    await assertHasPersonalPro(ctx, user._id)
    const document = await ctx.db.get(args.id)
    if (!document) throw new ConvexError('Document not found')

    const access = await assertCanViewStable(ctx, document.stableId, user._id)
    const horse = document.horseId ? await ctx.db.get(document.horseId) : null

    if (!canManageDocument(access, horse)) {
      throw new ConvexError('Not authorized to remove this document')
    }

    await ctx.db.delete(args.id)
    if (document.storageId) await ctx.storage.delete(document.storageId)
  },
})
