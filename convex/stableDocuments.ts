import { ConvexError, v } from 'convex/values'
import { stableDocumentInputSchema } from '../shared/stables/stableDocumentSchema'
import {
  canManageLinkedRecord,
  canRemoveLinkedRecord,
} from '../shared/stables/stableAccess'
import type { Doc, Id } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { isActiveHorse } from './libs/horseState'
import { assertCanViewStable, getCurrentUser } from './libs/stablePermissions'
import {
  assertStorageObjectCanBeClaimed,
  deleteStorageObjectIfUnreferenced,
} from './libs/storageObjects'

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

const canAddDocument = (
  access: Awaited<ReturnType<typeof assertCanViewStable>>,
  horse?: Doc<'horses'> | null,
  event?: Doc<'events'> | null,
) =>
  canManageLinkedRecord({
    role: access.role,
    userId: access.userId,
    horseOwnerId: horse?.ownerId,
    eventCreatedBy: event?.createdBy,
  })

const canRemoveDocument = (
  access: Awaited<ReturnType<typeof assertCanViewStable>>,
  document: Doc<'stableDocuments'>,
  horse?: Doc<'horses'> | null,
  event?: Doc<'events'> | null,
) =>
  canRemoveLinkedRecord({
    role: access.role,
    userId: access.userId,
    createdBy: document.createdBy,
    horseOwnerId: horse?.ownerId,
    eventCreatedBy: event?.createdBy,
  })

const byCreatedAtDesc = (
  a: Doc<'stableDocuments'>,
  b: Doc<'stableDocuments'>,
) => b.createdAt - a.createdAt

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

  if (horseId && !isActiveHorse(horse)) throw new ConvexError('Horse not found')
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
  const rows = await Promise.all(
    documents.sort(byCreatedAtDesc).map(async (document) => {
      const { storageId: _storageId, ...publicDocument } = document
      const [horse, event, fileUrl, access] = await Promise.all([
        document.horseId ? ctx.db.get(document.horseId) : Promise.resolve(null),
        document.eventId ? ctx.db.get(document.eventId) : Promise.resolve(null),
        document.storageId
          ? ctx.storage.getUrl(document.storageId)
          : Promise.resolve(null),
        assertCanViewStable(ctx, document.stableId, userId),
      ])

      if (document.horseId && !isActiveHorse(horse)) return null

      return {
        document: publicDocument,
        horseName: horse?.name,
        eventTitle: event?.title,
        fileUrl,
        fileState: document.storageId
          ? fileUrl
            ? ('available' as const)
            : ('unavailable' as const)
          : ('metadata-only' as const),
        canManage: canRemoveDocument(access, document, horse, event),
      }
    }),
  )

  return rows.filter((row) => row !== null)
}

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await getCurrentUser(ctx)

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
      canManageStableDocuments: access.capabilities.canManageStableDocuments,
      documents: await enrichDocuments(ctx, documents, access.userId),
    }
  },
})

export const listForHorse = query({
  args: { horseId: v.id('horses') },
  handler: async (ctx, args) => {
    const horse = await ctx.db.get(args.horseId)
    if (!isActiveHorse(horse)) {
      return { canManage: false, documents: [] }
    }

    const access = await assertCanViewStable(ctx, horse.stableId)
    const documents = await ctx.db
      .query('stableDocuments')
      .withIndex('by_horse_id', (q) => q.eq('horseId', args.horseId))
      .collect()

    return {
      canManage: canAddDocument(access, horse),
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
    const access = await assertCanViewStable(ctx, args.stableId, user._id)
    const documentInput = validateDocumentInput(args)
    const { horse, event } = await assertLinkedRowsBelongToStable(
      ctx,
      args.stableId,
      args.horseId,
      args.eventId,
    )

    if (!canAddDocument(access, horse, event)) {
      throw new ConvexError('Not authorized to manage documents in this stable')
    }
    if (args.storageId) {
      const metadata = await assertStorageObjectCanBeClaimed(
        ctx,
        args.storageId,
      )
      if (
        documentInput.size !== undefined &&
        metadata.size !== documentInput.size
      ) {
        throw new ConvexError('Uploaded file size does not match')
      }
      if (
        documentInput.contentType &&
        metadata.contentType !== documentInput.contentType
      ) {
        throw new ConvexError('Uploaded file type does not match')
      }
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
    const document = await ctx.db.get(args.id)
    if (!document) throw new ConvexError('Document not found')

    const access = await assertCanViewStable(ctx, document.stableId, user._id)
    const [horse, event] = await Promise.all([
      document.horseId ? ctx.db.get(document.horseId) : Promise.resolve(null),
      document.eventId ? ctx.db.get(document.eventId) : Promise.resolve(null),
    ])

    if (!canRemoveDocument(access, document, horse, event)) {
      throw new ConvexError('Not authorized to remove this document')
    }

    await ctx.db.delete(args.id)
    if (document.storageId) {
      await deleteStorageObjectIfUnreferenced(ctx, document.storageId)
    }
  },
})
