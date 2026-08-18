import { v } from 'convex/values'
import { internal } from './_generated/api'
import { internalMutation } from './_generated/server'
import { deleteStorageObjectIfUnreferenced } from './libs/storageObjects'

const orphanUploadRetentionMs = 24 * 60 * 60 * 1000

export const purgeOrphanedUploads = internalMutation({
  args: { cursor: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - orphanUploadRetentionMs
    const expiredTokens = args.cursor
      ? []
      : await ctx.db
          .query('pendingProfileUploads')
          .withIndex('by_created_at', (q) => q.lte('createdAt', cutoff))
          .take(100)
    const oldStorageObjects = await ctx.db.system
      .query('_storage')
      .filter((q) => q.lte(q.field('_creationTime'), cutoff))
      .paginate({ cursor: args.cursor ?? null, numItems: 100 })

    for (const token of expiredTokens) await ctx.db.delete(token._id)

    let deletedObjects = 0
    for (const storageObject of oldStorageObjects.page) {
      if (await deleteStorageObjectIfUnreferenced(ctx, storageObject._id)) {
        deletedObjects += 1
      }
    }

    if (!oldStorageObjects.isDone) {
      await ctx.scheduler.runAfter(
        0,
        internal.storageMaintenance.purgeOrphanedUploads,
        { cursor: oldStorageObjects.continueCursor },
      )
    }

    return {
      deletedObjects,
      deletedTokens: expiredTokens.length,
    }
  },
})
