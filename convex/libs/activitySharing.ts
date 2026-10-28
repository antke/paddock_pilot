import { ConvexError } from 'convex/values'
import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { getHorseAccess } from './horsePermissions'
import { assertCanViewStable } from './stablePermissions'
import { isActiveHorse } from './horseState'

type Ctx = QueryCtx | MutationCtx

/** Explicit activity grants never grant access to a horse's other records. */
export async function writeActivityCalendars(
  ctx: MutationCtx,
  event: Doc<'events'>,
  stableIds: Id<'stables'>[],
  userId: Id<'users'>,
) {
  const ids = [...new Set(stableIds)]
  if (ids.length > 30) throw new ConvexError('Select up to 30 calendars')
  for (const id of ids) await assertCanViewStable(ctx, id, userId)
  for (const id of event.horseIds) {
    const horse = await ctx.db.get(id)
    const access = horse ? await getHorseAccess(ctx, horse, userId) : null
    if (!access?.canEditPersonalRecords || access.isCustodian)
      throw new ConvexError(
        'Only a horse owner or editor can share its activity with other stables',
      )
  }
  if (event.createdBy !== userId && !event.horseIds.length)
    throw new ConvexError('Not authorized to share this activity')
  const previous = await ctx.db
    .query('activityCalendarShares')
    .withIndex('by_event', (q) => q.eq('eventId', event._id))
    .collect()
  for (const row of previous) await ctx.db.delete(row._id)
  for (const stableId of ids)
    await ctx.db.insert('activityCalendarShares', {
      eventId: event._id,
      stableId,
      sharedBy: userId,
      horseIds: event.horseIds,
    })
}

export async function calendarMember(
  ctx: Ctx,
  stableId: Id<'stables'>,
  userId: Id<'users'>,
) {
  const stable = await ctx.db.get(stableId)
  if (!stable || stable.archivedAt !== undefined) return null
  if (stable.ownerId === userId) return 'owner' as const
  const membership = await ctx.db
    .query('stableMembers')
    .withIndex('by_stable_id_user_id', (q) =>
      q.eq('stableId', stableId).eq('userId', userId),
    )
    .unique()
  return membership?.role === 'member' ? ('member' as const) : null
}

export async function projectActivityShare(
  ctx: Ctx,
  share: Doc<'activityCalendarShares'>,
  userId: Id<'users'>,
) {
  const role = await calendarMember(ctx, share.stableId, userId)
  if (!role || !(await calendarMember(ctx, share.stableId, share.sharedBy)))
    return null
  const event = await ctx.db.get(share.eventId)
  if (!event) return null
  const horses: Array<
    Pick<Doc<'horses'>, '_id' | '_creationTime' | 'name'> & {
      canRecord: boolean
    }
  > = []
  for (const id of share.horseIds) {
    if (!event.horseIds.includes(id)) continue
    const horse = await ctx.db.get(id)
    if (!isActiveHorse(horse) || horse.transitionId) continue
    const access = await getHorseAccess(ctx, horse, share.sharedBy)
    if (!access.canEditPersonalRecords || access.isCustodian) continue
    horses.push({
      _id: horse._id,
      _creationTime: horse._creationTime,
      name: horse.name,
      canRecord: false,
    })
  }
  if (!horses.length) return null
  const full = role === 'owner' && horses.length === event.horseIds.length
  // Allowlist scheduling data: never send horse profiles, other records or
  // private descriptions/notes to ordinary stable members.
  const projected: Doc<'events'> = {
    _id: event._id,
    _creationTime: event._creationTime,
    createdBy: event.createdBy,
    horseIds: horses.map((horse) => horse._id),
    title: event.title,
    type: event.type,
    date: event.date,
    endDate: event.endDate,
    time: event.time,
    location: event.location,
    status: event.status,
    recurrence: event.recurrence,
    training: event.training
      ? {
          activities: event.training.activities,
          format: event.training.format,
          durationMinutes: event.training.durationMinutes,
        }
      : undefined,
    ...(full
      ? { description: event.description, training: event.training }
      : {}),
  }
  const records = (
    await ctx.db
      .query('trainingRecords')
      .withIndex('by_event_id', (q) => q.eq('eventId', event._id))
      .collect()
  )
    .filter((record) => horses.some((horse) => horse._id === record.horseId))
    .map((record) => ({
      _id: record._id,
      _creationTime: record._creationTime,
      eventId: record.eventId,
      horseId: record.horseId,
      date: record.date,
      scheduledDate: record.scheduledDate,
      status: record.status,
      recordedBy: record.recordedBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      details: full
        ? record.details
        : {
            activities: record.details.activities,
            format: record.details.format,
            durationMinutes: record.details.durationMinutes,
          },
      outcome: full ? record.outcome : undefined,
      canEdit: false,
    }))
  return { event: projected, horses, records, readDetails: full }
}

export async function sharedActivitySource(
  ctx: Ctx,
  stableId: Id<'stables'>,
  userId: Id<'users'>,
) {
  await assertCanViewStable(ctx, stableId, userId)
  const shares = await ctx.db
    .query('activityCalendarShares')
    .withIndex('by_stable', (q) => q.eq('stableId', stableId))
    .collect()
  const rows = (
    await Promise.all(
      shares.map((share) => projectActivityShare(ctx, share, userId)),
    )
  ).filter((row) => row !== null)
  return {
    events: rows.map((row) => row.event),
    horses: rows.flatMap((row) => row.horses),
    records: rows.flatMap((row) => row.records),
  }
}
