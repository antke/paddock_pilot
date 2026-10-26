import { isDateKey } from '../../shared/training/trainingSchema'
import { ConvexError } from 'convex/values'
import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { effectiveShare } from '../../shared/sharing/rules'

type Ctx = MutationCtx | QueryCtx

export { effectiveShare } from '../../shared/sharing/rules'

export async function isRecordShared(
  ctx: Ctx,
  recordId: string,
  horse: Doc<'horses'>,
  stableId: Id<'stables'>,
  date?: string,
) {
  if (
    horse.deletedAt !== undefined ||
    horse.transitionId ||
    horse.stableId !== stableId ||
    !horse.currentPlacementId
  )
    return false
  const [stable, placement, shares] = await Promise.all([
    ctx.db.get(stableId),
    ctx.db.get(horse.currentPlacementId),
    ctx.db
      .query('recordShares')
      .withIndex('by_record_horse', (q) =>
        q.eq('recordId', recordId).eq('horseId', horse._id),
      )
      .collect(),
  ])
  if (
    !stable ||
    stable.archivedAt !== undefined ||
    !placement ||
    placement.endedAt !== undefined ||
    placement.stableId !== stableId ||
    placement.horseId !== horse._id
  )
    return false
  return effectiveShare(
    shares.filter(
      (share) =>
        share.stableId === stableId && share.placementId === placement._id,
    ),
    date,
  )
}

/** Transactional upsert makes retries harmless without merging distinct records. */
export async function writeRecordShare(
  ctx: MutationCtx,
  input: Omit<Doc<'recordShares'>, '_id' | '_creationTime' | 'updatedAt'>,
) {
  if (input.occurrenceDate && !isDateKey(input.occurrenceDate))
    throw new ConvexError('Invalid occurrence date')
  const horse = await ctx.db.get(input.horseId)
  const placement = await ctx.db.get(input.placementId)
  if (
    !horse ||
    horse.deletedAt !== undefined ||
    horse.transitionId ||
    horse.currentPlacementId !== input.placementId ||
    horse.stableId !== input.stableId ||
    !placement ||
    placement.endedAt !== undefined ||
    placement.horseId !== horse._id ||
    placement.stableId !== input.stableId
  )
    throw new ConvexError('Horse placement changed; review sharing again')
  const rows = await ctx.db
    .query('recordShares')
    .withIndex('by_record_horse', (q) =>
      q.eq('recordId', input.recordId).eq('horseId', input.horseId),
    )
    .collect()
  const existing = rows.find(
    (row) =>
      row.placementId === input.placementId &&
      row.stableId === input.stableId &&
      row.occurrenceDate === input.occurrenceDate,
  )
  const values = { ...input, updatedAt: Date.now() }
  if (existing) {
    await ctx.db.patch(existing._id, values)
    return existing._id
  }
  return ctx.db.insert('recordShares', values)
}

/** Listing a series may discover only a grant with at least one visible date. */
export async function hasSharedSchedule(
  ctx: Ctx,
  recordId: string,
  horse: Doc<'horses'>,
  stableId: Id<'stables'>,
) {
  const shares = await ctx.db
    .query('recordShares')
    .withIndex('by_record_horse', (q) =>
      q.eq('recordId', recordId).eq('horseId', horse._id),
    )
    .collect()
  for (const share of shares) {
    if (
      !share.enabled ||
      share.placementId !== horse.currentPlacementId ||
      share.stableId !== stableId
    )
      continue
    if (
      await isRecordShared(
        ctx,
        recordId,
        horse,
        stableId,
        share.occurrenceDate ?? share.throughDate,
      )
    )
      return true
  }
  return false
}
