import { horseEvent } from './horseEventHistory'
import { ConvexError } from 'convex/values'
import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { assertCanViewStable, getCurrentUser } from './stablePermissions'
import { assertCanEditHorseProfile, getHorseAccess } from './horsePermissions'

type Ctx = MutationCtx | QueryCtx
export async function eventInputAccess(
  ctx: Ctx,
  stableId: Id<'stables'> | undefined,
  horseIds: Array<Id<'horses'>>,
) {
  if (stableId) return assertCanViewStable(ctx, stableId)
  const user = await getCurrentUser(ctx)
  if (!horseIds.length)
    throw new ConvexError('Select a horse for a personal event')
  for (const id of horseIds) {
    const horse = await ctx.db.get(id)
    if (!horse) throw new ConvexError('Horse not found')
    await assertCanEditHorseProfile(ctx, horse, user._id)
  }
  return { userId: user._id, role: 'owner' as const }
}

export async function eventReadAccess(ctx: Ctx, event: Doc<'events'>) {
  const user = await getCurrentUser(ctx)
  if (event.stableId) {
    const stable = await ctx.db.get(event.stableId)
    if (stable?.archivedAt === undefined && stable) {
      const membership = await ctx.db
        .query('stableMembers')
        .withIndex('by_stable_id_user_id', (q) =>
          q.eq('stableId', stable._id).eq('userId', user._id),
        )
        .unique()
      if (stable.ownerId === user._id || membership?.role === 'member')
        return {
          userId: user._id,
          role:
            stable.ownerId === user._id
              ? ('owner' as const)
              : ('member' as const),
          full: stable.ownerId === user._id,
          stableMember: true,
        }
    }
  }
  const rows = await ctx.db
    .query('eventsHorses')
    .withIndex('by_event_id', (q) => q.eq('eventId', event._id))
    .collect()
  for (const id of new Set([
    ...event.horseIds,
    ...rows.map((row) => row.horseId),
  ])) {
    const horse = await ctx.db.get(id)
    if (horse && (await getHorseAccess(ctx, horse, user._id)).canRead)
      return {
        userId: user._id,
        role: 'member' as const,
        full: !event.stableId,
        stableMember: false,
      }
  }
  throw new ConvexError('Not authorized to view this event')
}

export function schedulingEvent(event: Doc<'events'>): Doc<'events'> {
  return {
    ...event,
    description: undefined,
    notesAfterCompletion: undefined,
    totalCost: undefined,
    costPerHorse: undefined,
    providerPhone: undefined,
    training: undefined,
  }
}

export async function visibleEvent(
  ctx: Ctx,
  event: Doc<'events'>,
): Promise<Doc<'events'>> {
  const access = await eventReadAccess(ctx, event)
  if (event.stableId && access.stableMember)
    return access.full ? event : schedulingEvent(event)
  const rows = await ctx.db
    .query('eventsHorses')
    .withIndex('by_event_id', (q) => q.eq('eventId', event._id))
    .collect()
  const visible: Array<Doc<'eventsHorses'>> = []
  for (const row of rows) {
    const horse = await ctx.db.get(row.horseId)
    if (horse && (await getHorseAccess(ctx, horse, access.userId)).canRead)
      visible.push(row)
  }
  const ended = visible.find((row) => row.participationEndsAt)
  if (ended && visible.every((row) => row.participationEndsAt))
    return (await horseEvent(ctx, ended))!
  const fullPersonal =
    !event.stableId &&
    event.horseIds.every((id) => visible.some((row) => row.horseId === id))
  return {
    ...(fullPersonal ? event : schedulingEvent(event)),
    horseIds: visible.map((row) => row.horseId),
  }
}

export async function canEditEvent(ctx: Ctx, event: Doc<'events'>) {
  const access = await eventReadAccess(ctx, event)
  if (event.stableId)
    return (
      access.stableMember &&
      (access.role === 'owner' || event.createdBy === access.userId)
    )
  if (!event.horseIds.length) return false
  for (const id of event.horseIds) {
    const horse = await ctx.db.get(id)
    if (
      !horse ||
      !(await getHorseAccess(ctx, horse, access.userId)).canEditPersonalRecords
    )
      return false
  }
  return true
}
