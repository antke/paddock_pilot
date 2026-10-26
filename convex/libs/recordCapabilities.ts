import { ConvexError } from 'convex/values'
import { assertCanViewStable } from './stablePermissions'
import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { getHorseAccess, horseRosterSummary } from './horsePermissions'
import { isRecordShared, writeRecordShare } from './recordSharing'

/** Canonical reference: training results and participation inherit their activity audience. */
export type HorseRecordReference = {
  _id: string
  eventId?: Id<'events'>
  date?: string
  scheduledDate?: string
}

export async function recordCapabilities(
  ctx: MutationCtx | QueryCtx,
  horse: Doc<'horses'>,
  record: HorseRecordReference,
  userId?: Id<'users'>,
) {
  const access = await getHorseAccess(ctx, horse, userId)
  const personal =
    access.isOwner || Boolean(access.carerRole) || access.isCustodian
  const shared = horse.stableId
    ? await isRecordShared(
        ctx,
        ctx.db.normalizeId('trainingRecords', record._id) ||
          ctx.db.normalizeId('eventsHorses', record._id)
          ? (record.eventId ?? record._id)
          : record._id,
        horse,
        horse.stableId,
        record.scheduledDate ?? record.date,
      )
    : false
  const membership =
    horse.stableId && shared && !personal && !access.isAdmin
      ? await ctx.db
          .query('stableMembers')
          .withIndex('by_stable_id_user_id', (q) =>
            q.eq('stableId', horse.stableId!).eq('userId', access.userId),
          )
          .unique()
      : null
  const readDetails = access.canRead && (personal || (access.isAdmin && shared))
  const editContent =
    readDetails &&
    (access.canEditPersonalRecords ||
      (access.isAdmin && shared && access.canAddRecords))
  return {
    readSchedule: readDetails || (shared && membership?.role === 'member'),
    readDetails,
    editContent,
    complete: editContent,
    manageSharing: access.canEditPersonalRecords && !access.isCustodian,
    shared,
  }
}

export async function readableRecords<T extends HorseRecordReference>(
  ctx: MutationCtx | QueryCtx,
  horse: Doc<'horses'>,
  records: Array<T>,
  stableId?: Id<'stables'>,
) {
  const permissions = await Promise.all(
    records.map((record) => recordCapabilities(ctx, horse, record)),
  )
  return records.filter(
    (_, index) =>
      permissions[index].readDetails &&
      (!stableId || (horse.stableId === stableId && permissions[index].shared)),
  )
}

/** Creation defaults are applied once; edits never call this helper. */
export async function initializeRecordSharing(
  ctx: MutationCtx,
  horse: Doc<'horses'>,
  recordId: string,
  shareWithStable = false,
) {
  const access = await getHorseAccess(ctx, horse)
  if (!access.canAddRecords)
    throw new Error('Not authorized to add horse records')
  if (!horse.stableId) return
  // Upgrade legacy placement metadata on a new write, without publishing old records.
  if (!horse.currentPlacementId) {
    const placementId = await ctx.db.insert('horsePlacements', {
      horseId: horse._id,
      stableId: horse.stableId,
      startedAt: Date.now(),
      createdBy: access.userId,
    })
    await ctx.db.patch(horse._id, { currentPlacementId: placementId })
    horse = { ...horse, currentPlacementId: placementId }
  }
  await writeRecordShare(ctx, {
    recordId,
    horseId: horse._id,
    stableId: horse.stableId!,
    placementId: horse.currentPlacementId!,
    enabled:
      access.canEditPersonalRecords && !access.isCustodian
        ? shareWithStable
        : true,
    createdBy: access.userId,
  })
}

/** Roster visibility never implies permission to read the care profile or contacts. */
export async function visibleHorse(
  ctx: MutationCtx | QueryCtx,
  horse: Doc<'horses'>,
  stableContext = false,
): Promise<Doc<'horses'>> {
  const access = await getHorseAccess(ctx, horse)
  if (
    !stableContext &&
    (access.isOwner || access.carerRole || access.isCustodian)
  )
    return horse
  const basic = horseRosterSummary(horse)
  const permissions = await recordCapabilities(ctx, horse, horse)
  if (!permissions.readDetails || (stableContext && !permissions.shared))
    return basic
  return {
    ...basic,
    allergies: horse.allergies,
    emergencyNotes: horse.emergencyNotes,
    nutritionNotes: horse.nutritionNotes,
    nutritionRecommended: horse.nutritionRecommended,
    nutritionAvoid: horse.nutritionAvoid,
    feedingRoutine: horse.feedingRoutine,
  }
}

export async function assertHorseWorkspace(
  ctx: MutationCtx | QueryCtx,
  horse: Doc<'horses'>,
  stableId?: Id<'stables'>,
) {
  if (!stableId) return
  await assertCanViewStable(ctx, stableId)
  if (horse.stableId !== stableId)
    throw new ConvexError('Horse is not in this stable')
}
