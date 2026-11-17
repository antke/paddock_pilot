import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import { getHorseAccess } from './horsePermissions'

/** In-app only. Event notices resolve the current title at read time; `title` is kept for deleted events. */
export async function notifyUsers(
  ctx: MutationCtx,
  userIds: Iterable<Id<'users'> | undefined>,
  notice: {
    kind: string
    eventId?: Id<'events'>
    stableId?: Id<'stables'>
    title?: string
    detail?: string
  },
  except: Iterable<Id<'users'>> = [],
) {
  const skip = new Set<string>(except)
  for (const userId of new Set(userIds)) {
    if (!userId || skip.has(userId)) continue
    const user = await ctx.db.get(userId)
    if (!user || user.deletedAt !== undefined) continue
    await ctx.db.insert('notifications', {
      userId,
      ...notice,
      createdAt: Date.now(),
    })
  }
}

/** People who follow an event without owning one of its horses: organizer, attendees, accepted riders. */
export async function eventFollowers(ctx: MutationCtx, event: Doc<'events'>) {
  const riders = await ctx.db
    .query('activityParticipants')
    .withIndex('by_event', (q) => q.eq('eventId', event._id))
    .collect()
  return [
    event.createdBy,
    ...(event.peopleIds ?? []),
    ...riders.flatMap((row) =>
      row.status === 'accepted' && row.userId ? [row.userId] : [],
    ),
  ]
}

/** Owners and editor carers of every horse still taking part or invited. */
export async function eventHorseKeepers(
  ctx: MutationCtx,
  event: Doc<'events'>,
  statuses: Array<Doc<'eventsHorses'>['status']> = [
    undefined,
    'confirmed',
    'invited',
  ],
) {
  const rows = await ctx.db
    .query('eventsHorses')
    .withIndex('by_event_id', (q) => q.eq('eventId', event._id))
    .collect()
  const ids: Array<Id<'users'>> = []
  for (const row of rows) {
    if (row.participationEndsAt || !statuses.includes(row.status)) continue
    ids.push(...(await horseKeepers(ctx, row.horseId)))
  }
  return ids
}

export async function horseKeepers(ctx: MutationCtx, horseId: Id<'horses'>) {
  const horse = await ctx.db.get(horseId)
  if (!horse || horse.deletedAt !== undefined) return []
  const carers = await ctx.db
    .query('horseCarers')
    .withIndex('by_horse_id', (q) => q.eq('horseId', horseId))
    .collect()
  const ids = [horse.ownerId, ...carers.map((c) => c.userId)]
  const keepers: Array<Id<'users'>> = []
  for (const id of ids)
    if (id && (await getHorseAccess(ctx, horse, id)).canEditPersonalRecords)
      keepers.push(id)
  return keepers
}
