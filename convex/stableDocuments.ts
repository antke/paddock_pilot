import {
  assertHorseWorkspace,
  readableRecords,
  initializeRecordSharing,
  recordCapabilities,
} from './libs/recordCapabilities'
import { sharedStableRecords } from './libs/sharedStableRecords'
import { creationReplay, recordCreation } from './libs/creationRequests'
import { getHorseDisplayName } from '../shared/horses/horseDisplayName'
import { ConvexError, v } from 'convex/values'
import { stableDocumentInputSchema } from '../shared/stables/stableDocumentSchema'
import { stableDocumentType } from './schema'
import type { Doc } from './_generated/dataModel'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { mutation, query } from './_generated/server'
import { assertCanViewStable, getCurrentUser } from './libs/stablePermissions'
import {
  assertCanReadHorse,
  assertCanAddHorseRecord,
  assertCanEditHorseRecord,
  getHorseAccess,
} from './libs/horsePermissions'
import {
  eventReadAccess,
  eventParticipantAccess,
} from './libs/eventPermissions'
import {
  assertStorageObjectCanBeClaimed,
  deleteStorageObjectIfUnreferenced,
} from './libs/storageObjects'

type Ctx = MutationCtx | QueryCtx
async function documentAccess(ctx: Ctx, document: Doc<'stableDocuments'>) {
  if (document.horseId) {
    const horse = await ctx.db.get(document.horseId)
    if (!horse) throw new ConvexError('Horse not found')
    const capabilities = await recordCapabilities(ctx, horse, document)
    if (!capabilities.readDetails) throw new ConvexError('Document not found')
    return {
      horse,
      canManage: capabilities.editContent,
    }
  }
  const access = await assertCanViewStable(ctx, document.stableId)
  return { horse: null, canManage: access.role === 'owner' }
}
async function enrich(ctx: Ctx, documents: Array<Doc<'stableDocuments'>>) {
  const result = []
  for (const document of documents) {
    if (document.horseId) {
      const horse = await ctx.db.get(document.horseId)
      if (
        !horse ||
        !(await recordCapabilities(ctx, horse, document)).readDetails
      )
        continue
    }
    const access = await documentAccess(ctx, document)
    const { storageId: _storageId, ...publicDocument } = document
    const event = document.eventId ? await ctx.db.get(document.eventId) : null
    const available =
      document.storageId && (await ctx.db.system.get(document.storageId))
    result.push({
      document: publicDocument,
      horseName: getHorseDisplayName(access.horse),
      eventTitle:
        event && (await eventParticipantAccess(ctx, event)).participants.length
          ? event.title
          : undefined,
      fileUrl: available ? `/api/documents/${document._id}` : null,
      fileState: available
        ? ('available' as const)
        : document.storageId
          ? ('unavailable' as const)
          : ('metadata-only' as const),
      canManage: access.canManage,
    })
  }
  return result.sort((a, b) => b.document.createdAt - a.document.createdAt)
}
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await getCurrentUser(ctx)
    return ctx.storage.generateUploadUrl()
  },
})
export const listForStable = query({
  args: { stableId: v.id('stables') },
  handler: async (ctx, { stableId }) => {
    const access = await assertCanViewStable(ctx, stableId)
    const documents = await ctx.db
      .query('stableDocuments')
      .withIndex('by_stable_id', (q) => q.eq('stableId', stableId))
      .collect()
    return {
      canManageStableDocuments: access.role === 'owner',
      documents: await enrich(ctx, [
        ...documents.filter((document) => !document.horseId),
        ...(await sharedStableRecords(ctx, stableId, 'stableDocuments')),
      ]),
    }
  },
})
export const listForHorse = query({
  args: { horseId: v.id('horses'), stableId: v.optional(v.id('stables')) },
  handler: async (ctx, { horseId, stableId }) => {
    const horse = await ctx.db.get(horseId)
    if (!horse) return { canManage: false, documents: [] }
    const access = await assertCanReadHorse(ctx, horse)
    await assertHorseWorkspace(ctx, horse, stableId)
    const documents = await ctx.db
      .query('stableDocuments')
      .withIndex('by_horse_id', (q) => q.eq('horseId', horseId))
      .collect()
    return {
      canManage: access.canAddRecords,
      documents: await enrich(
        ctx,
        await readableRecords(ctx, horse, documents, stableId),
      ),
    }
  },
})
export const add = mutation({
  args: {
    requestId: v.optional(v.string()),
    stableId: v.optional(v.id('stables')),
    shareWithStable: v.optional(v.boolean()),
    horseId: v.optional(v.id('horses')),
    eventId: v.optional(v.id('events')),
    storageId: v.optional(v.id('_storage')),
    type: stableDocumentType,
    fileName: v.string(),
    contentType: v.optional(v.string()),
    size: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const replay = await creationReplay(
      ctx,
      user._id,
      args.requestId,
      'stableDocuments.add',
    )
    if (replay) return ctx.db.normalizeId('stableDocuments', replay)!
    const parsed = stableDocumentInputSchema.safeParse(args)
    if (!parsed.success)
      throw new ConvexError(
        parsed.error.issues[0]?.message ?? 'Invalid document',
      )
    const horse = args.horseId ? await ctx.db.get(args.horseId) : null
    if (args.horseId && !horse) throw new ConvexError('Horse not found')
    let origin: {
      stableId?: Doc<'stables'>['_id']
      sourcePlacementId?: Doc<'horsePlacements'>['_id']
    } = { stableId: args.stableId }
    if (horse) origin = (await assertCanAddHorseRecord(ctx, horse)).recordOrigin
    else if ((await assertCanViewStable(ctx, args.stableId)).role !== 'owner')
      throw new ConvexError('Only stable admins manage shared documents')
    if (args.eventId) {
      const event = await ctx.db.get(args.eventId)
      if (!event) throw new ConvexError('Event not found')
      await eventReadAccess(ctx, event)
      if (
        (horse && !event.horseIds.includes(horse._id)) ||
        (!horse && event.stableId !== args.stableId)
      )
        throw new ConvexError('Document does not belong to this event')
    }
    if (args.storageId) {
      const metadata = await assertStorageObjectCanBeClaimed(
        ctx,
        args.storageId,
      )
      if (
        metadata.size > 25 * 1024 * 1024 ||
        (args.size !== undefined && metadata.size !== args.size) ||
        (args.contentType && metadata.contentType !== args.contentType)
      )
        throw new ConvexError('Uploaded file does not match the document')
    }
    const { shareWithStable, requestId: _requestId, ...values } = args
    const id = await ctx.db.insert('stableDocuments', {
      ...values,
      ...origin,
      createdBy: user._id,
      createdAt: Date.now(),
    })
    if (horse) await initializeRecordSharing(ctx, horse, id, shareWithStable)
    await recordCreation(
      ctx,
      user._id,
      args.requestId,
      'stableDocuments.add',
      id,
    )
    return id
  },
})
export const remove = mutation({
  args: { id: v.id('stableDocuments') },
  handler: async (ctx, { id }) => {
    const document = await ctx.db.get(id)
    if (!document) throw new ConvexError('Document not found')
    const access = await documentAccess(ctx, document)
    if (access.horse)
      await assertCanEditHorseRecord(ctx, access.horse, document)
    else if (!access.canManage)
      throw new ConvexError('Not authorized to remove this document')
    await ctx.db.delete(id)
    if (document.storageId)
      await deleteStorageObjectIfUnreferenced(ctx, document.storageId)
  },
})
export const authorizeDownload = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const documentId = ctx.db.normalizeId('stableDocuments', id)
    const snapshotId = ctx.db.normalizeId('horseSnapshots', id)
    const document = documentId ? await ctx.db.get(documentId) : null
    if (document) {
      await documentAccess(ctx, document)
      return { storageId: document.storageId, fileName: document.fileName }
    }
    const snapshot = snapshotId ? await ctx.db.get(snapshotId) : null
    const horse = snapshot ? await ctx.db.get(snapshot.horseId) : null
    const access = horse ? await getHorseAccess(ctx, horse) : null
    if (
      !snapshot ||
      !access?.canRead ||
      (!access.isOwner && !access.carerRole && !access.isCustodian)
    )
      throw new ConvexError('Document not found')
    return {
      storageId: snapshot.storageId,
      fileName: String(snapshot.data.fileName ?? 'document'),
    }
  },
})
