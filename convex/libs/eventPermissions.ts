import type { SharingRule } from '../../shared/sharing/rules'
import { horseEvent } from './horseEventHistory'
import { hasSharedSchedule } from './recordSharing'
import { ConvexError } from 'convex/values'
import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { assertCanViewStable, getCurrentUser } from './stablePermissions'
import { assertCanAddHorseRecord, getHorseAccess } from './horsePermissions'

type Ctx = MutationCtx | QueryCtx
export async function eventInputAccess(
  ctx: Ctx,
  stableId: Id<'stables'> | undefined,
  horseIds: Array<Id<'horses'>>,
  allowEmpty = false,
) {
  if (stableId) return assertCanViewStable(ctx, stableId)
  const user = await getCurrentUser(ctx)
  if (!horseIds.length && !allowEmpty)
    throw new ConvexError('Select a horse for a personal event')
  for (const id of horseIds) {
    const horse = await ctx.db.get(id)
    if (!horse) throw new ConvexError('Horse not found')
    const access = await assertCanAddHorseRecord(ctx, horse, user._id)
    if (!access.canEditPersonalRecords)
      throw new ConvexError(
        'Personal events require owner or editor access to every horse',
      )
  }
  return { userId: user._id, role: 'owner' as const }
}

export async function eventParticipantAccess(ctx: Ctx, event: Doc<'events'>) {
  const user = await getCurrentUser(ctx)
  const rows = await ctx.db
    .query('eventsHorses')
    .withIndex('by_event_id', (q) => q.eq('eventId', event._id))
    .collect()
  const participants = []
  for (const id of new Set([
    ...event.horseIds,
    ...rows.map((row) => row.horseId),
  ])) {
    const horse = await ctx.db.get(id)
    if (!horse) continue
    const access = await getHorseAccess(ctx, horse, user._id)
    const personal =
      access.canRead &&
      (access.isOwner || Boolean(access.carerRole) || access.isCustodian)
    const shared =
      horse.stableId &&
      (await hasSharedSchedule(ctx, event._id, horse, horse.stableId))
    const membership =
      shared && horse.stableId
        ? await ctx.db
            .query('stableMembers')
            .withIndex('by_stable_id_user_id', (q) =>
              q.eq('stableId', horse.stableId!).eq('userId', user._id),
            )
            .unique()
        : null
    const pending = rows.some(
      (row) =>
        row.horseId === horse._id &&
        row.status === 'invited' &&
        !row.participationEndsAt &&
        row.sourcePlacementId === horse.currentPlacementId &&
        horse.stableId === event.stableId &&
        !horse.transitionId,
    )
    const stableMember = Boolean(
      (shared && (access.isAdmin || membership?.role === 'member')) ||
      (pending && access.isAdmin),
    )
    if (personal || stableMember)
      participants.push({
        horse,
        personal,
        stableMember,
        readDetails: personal || Boolean(shared && access.isAdmin),
        edit:
          access.canEditPersonalRecords ||
          Boolean(shared && access.isAdmin && access.canAddRecords),
      })
  }
  return { user, rows, participants }
}

export async function eventReadAccess(ctx: Ctx, event: Doc<'events'>) {
  const { user, participants } = await eventParticipantAccess(ctx, event)
  if (participants.length)
    return {
      userId: user._id,
      role: participants.every((p) => p.edit)
        ? ('owner' as const)
        : ('member' as const),
      full: event.horseIds.every((id) =>
        participants.some((p) => p.horse._id === id && p.readDetails),
      ),
      stableMember: participants.some((p) => p.stableMember),
    }
  if (!event.horseIds.length && event.createdBy === user._id && !event.stableId)
    return {
      userId: user._id,
      role: 'owner' as const,
      full: true,
      stableMember: false,
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

export type VisibleEvent = Doc<'events'> & {
  audienceRules?: Array<{ horseId: string; rules: Array<SharingRule> }>
}

export async function visibleEvent(
  ctx: Ctx,
  event: Doc<'events'>,
): Promise<VisibleEvent> {
  const access = await eventReadAccess(ctx, event)
  const { rows, participants } = await eventParticipantAccess(ctx, event)
  const visible = rows.filter((row) =>
    participants.some((p) => p.horse._id === row.horseId),
  )
  const ended = visible.find((row) => row.participationEndsAt)
  if (ended && visible.every((row) => row.participationEndsAt))
    return (await horseEvent(ctx, ended))!
  const audienceRules = await Promise.all(
    participants.map(async (participant) => ({
      horseId: participant.horse._id,
      rules: participant.personal
        ? [{ enabled: true }]
        : (
            await ctx.db
              .query('recordShares')
              .withIndex('by_record_horse', (q) =>
                q
                  .eq('recordId', event._id)
                  .eq('horseId', participant.horse._id),
              )
              .collect()
          )
            .filter(
              (share) =>
                share.placementId === participant.horse.currentPlacementId &&
                share.stableId === participant.horse.stableId,
            )
            .map(({ enabled, occurrenceDate, throughDate }) => ({
              enabled,
              occurrenceDate,
              throughDate,
            })),
    })),
  )
  return {
    ...(access.full ? event : schedulingEvent(event)),
    audienceRules,
    horseIds: event.horseIds.filter((id) =>
      participants.some((p) => p.horse._id === id),
    ),
  }
}

export async function canEditEvent(ctx: Ctx, event: Doc<'events'>) {
  const { user, participants } = await eventParticipantAccess(ctx, event)
  if (!event.horseIds.length)
    return (
      participants.some((p) => p.personal && p.edit) ||
      (!participants.length && event.createdBy === user._id && !event.stableId)
    )
  // A participant may manage their own sharing/result, never the whole group.
  for (const id of event.horseIds) {
    const participant = participants.find((p) => p.horse._id === id && p.edit)
    if (!participant) return false
    if (!participant.personal) {
      const rules = await ctx.db
        .query('recordShares')
        .withIndex('by_record_horse', (q) =>
          q.eq('recordId', event._id).eq('horseId', id),
        )
        .collect()
      const current = rules.filter(
        (rule) => rule.placementId === participant.horse.currentPlacementId,
      )
      if (
        !current.some(
          (rule) => rule.enabled && !rule.occurrenceDate && !rule.throughDate,
        ) ||
        current.some((rule) => !rule.enabled && rule.occurrenceDate)
      )
        return false
    }
  }
  return true
}

export async function sharedEventsForStable(ctx: Ctx, stableId: Id<'stables'>) {
  await assertCanViewStable(ctx, stableId)
  const shares = await ctx.db
    .query('recordShares')
    .withIndex('by_stable', (q) => q.eq('stableId', stableId))
    .collect()
  const events = new Map<
    string,
    { event: Doc<'events'>; horses: Set<Id<'horses'>> }
  >()
  for (const share of shares) {
    if (!share.enabled) continue
    const id = ctx.db.normalizeId('events', share.recordId)
    if (!id) continue
    const horse = await ctx.db.get(share.horseId)
    if (!horse || !(await hasSharedSchedule(ctx, id, horse, stableId))) continue
    let event = await ctx.db.get(id)
    if (!event) continue
    let key: string = id
    if (!event.horseIds.includes(horse._id)) {
      const rows = await ctx.db
        .query('eventsHorses')
        .withIndex('by_horse_id_event_id', (q) =>
          q.eq('horseId', horse._id).eq('eventId', id),
        )
        .collect()
      const history = rows.find((row) => row.participationEndsAt && row.history)
      if (!history) continue
      event = await horseEvent(ctx, history)
      if (!event) continue
      key = id + ':' + history._id
    }
    const entry = events.get(key) ?? { event, horses: new Set<Id<'horses'>>() }
    entry.horses.add(horse._id)
    events.set(key, entry)
  }
  return Promise.all(
    [...events.values()].map(async ({ event, horses }) => {
      const projected = await visibleEvent(ctx, event)
      const audienceRules = await Promise.all(
        [...horses].map(async (horseId) => {
          const horse = await ctx.db.get(horseId)
          return {
            horseId,
            rules: shares
              .filter(
                (share) =>
                  share.recordId === event._id &&
                  share.horseId === horseId &&
                  share.placementId === horse?.currentPlacementId,
              )
              .map(({ enabled, occurrenceDate, throughDate }) => ({
                enabled,
                occurrenceDate,
                throughDate,
              })),
          }
        }),
      )
      return {
        ...(event.horseIds.every((id) => horses.has(id))
          ? projected
          : schedulingEvent(projected)),
        audienceRules,
        horseIds: projected.horseIds.filter((id) => horses.has(id)),
      }
    }),
  )
}
