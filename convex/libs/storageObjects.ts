import { ConvexError } from 'convex/values'
import type { Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'

type Ctx = MutationCtx | QueryCtx

export async function getStorageObjectReferences(
  ctx: Ctx,
  storageId: Id<'_storage'>,
) {
  const [user, horse, document, ownership] = await Promise.all([
    ctx.db
      .query('users')
      .withIndex('by_profile_image_id', (q) => q.eq('profileImageId', storageId))
      .first(),
    ctx.db
      .query('horses')
      .withIndex('by_profile_image_id', (q) => q.eq('profileImageId', storageId))
      .first(),
    ctx.db
      .query('stableDocuments')
      .withIndex('by_storage_id', (q) => q.eq('storageId', storageId))
      .first(),
    ctx.db
      .query('userStorageObjects')
      .withIndex('by_storage_id', (q) => q.eq('storageId', storageId))
      .first(),
  ])

  return { user, horse, document, ownership }
}

export async function assertStorageObjectCanBeClaimed(
  ctx: Ctx,
  storageId: Id<'_storage'>,
) {
  const [metadata, references] = await Promise.all([
    ctx.db.system.get('_storage', storageId),
    getStorageObjectReferences(ctx, storageId),
  ])

  if (!metadata) throw new ConvexError('Uploaded file not found')
  if (Object.values(references).some(Boolean)) {
    throw new ConvexError('Uploaded file is already in use')
  }

  return metadata
}

export async function deleteStorageObjectIfUnreferenced(
  ctx: MutationCtx,
  storageId: Id<'_storage'>,
) {
  const references = await getStorageObjectReferences(ctx, storageId)

  if (Object.values(references).some(Boolean)) return false
  if (!(await ctx.db.system.get('_storage', storageId))) return false

  await ctx.storage.delete(storageId)
  return true
}
