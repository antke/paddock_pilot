import type { Id } from '../_generated/dataModel'
import type { QueryCtx, MutationCtx } from '../_generated/server'
import { isRecordShared } from './recordSharing'

export async function sharedStableRecords<
  T extends 'careReminders' | 'stableDocuments',
>(ctx: QueryCtx | MutationCtx, stableId: Id<'stables'>, table: T) {
  const grants = await ctx.db
    .query('recordShares')
    .withIndex('by_stable', (q) => q.eq('stableId', stableId))
    .collect()
  const ids = new Set<Id<T>>()
  for (const grant of grants) {
    const id = ctx.db.normalizeId(table, grant.recordId)
    if (!id || !grant.enabled) continue
    const horse = await ctx.db.get(grant.horseId)
    if (horse && (await isRecordShared(ctx, id, horse, stableId))) ids.add(id)
  }
  const rows = await Promise.all([...ids].map((id) => ctx.db.get(id)))
  return rows.filter((row) => row !== null)
}
