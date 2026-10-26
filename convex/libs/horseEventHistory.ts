import { hasSharedSchedule } from './recordSharing'
import { getHorseAccess } from './horsePermissions'
import type { SharingRule } from '../../shared/sharing/rules'
import { recordCapabilities } from './recordCapabilities'
import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { createEventOccurrences } from '../../shared/events/eventOccurrences'
/** A horse sees only its participation, including the frozen schedule at departure. */
export async function horseEvent(
  ctx: QueryCtx | MutationCtx,
  row: Doc<'eventsHorses'>,
  stableId?: Id<'stables'>,
): Promise<
  | (Doc<'events'> & {
      audienceRules?: Array<{ horseId: string; rules: Array<SharingRule> }>
      contextHistorical?: boolean
      contextHorseId?: string
      contextParticipationId?: Id<'eventsHorses'>
    })
  | null
> {
  const event = await ctx.db.get(row.eventId)
  if (!event) return null
  const horse = await ctx.db.get(row.horseId)
  if (!horse) return null
  if (stableId && !(await hasSharedSchedule(ctx, event._id, horse, stableId)))
    return null
  const broad = await recordCapabilities(ctx, horse, { _id: event._id })
  const shares = await ctx.db
    .query('recordShares')
    .withIndex('by_record_horse', (q) =>
      q.eq('recordId', event._id).eq('horseId', horse._id),
    )
    .collect()
  const current = shares.filter(
    (rule) =>
      rule.placementId === horse.currentPlacementId &&
      rule.stableId === horse.stableId,
  )
  let allowed = broad.readSchedule
  let details = broad.readDetails
  if (!allowed) {
    for (const rule of current) {
      if (!rule.enabled) continue
      const capability = await recordCapabilities(ctx, horse, {
        _id: event._id,
        date: rule.occurrenceDate ?? rule.throughDate ?? event.date,
      })
      allowed ||= capability.readSchedule
      details ||= capability.readDetails
    }
  }
  if (!allowed) return null
  const access = await getHorseAccess(ctx, horse)
  const personal = access.isOwner || access.carerRole || access.isCustodian
  const audienceRules = [
    {
      horseId: horse._id,
      rules:
        personal && !stableId
          ? [{ enabled: true }]
          : current.map(({ enabled, occurrenceDate, throughDate }) => ({
              enabled,
              occurrenceDate,
              throughDate,
            })),
    },
  ]
  // A personal appointment for one horse has no other horse's private data.
  // Preserve its original notes and costs in that horse's history as well.
  const singlePersonal =
    event.horseIds.length === 1 && event.horseIds[0] === row.horseId
  let recurrence = row.history ? row.history.recurrence : event.recurrence
  if (row.participationEndsAt && recurrence) {
    let cutoff = row.participationEndsAt
    if (
      recurrence.end?.type === 'on_date' &&
      recurrence.end.date &&
      recurrence.end.date < cutoff
    )
      cutoff = recurrence.end.date
    if (recurrence.end?.type === 'after_occurrences') {
      const occurrences = createEventOccurrences({
        events: [{ ...event, ...(row.history ?? {}), recurrence }],
        windowStart: row.history?.date ?? event.date,
        windowEnd: cutoff,
      })
      cutoff = occurrences.at(-1)?.startDate ?? cutoff
    }
    recurrence = { ...recurrence, end: { type: 'on_date', date: cutoff } }
  }
  return {
    ...event,
    audienceRules,
    contextHistorical: Boolean(row.participationEndsAt || row.history),
    contextHorseId: row.horseId,
    contextParticipationId: row._id,
    ...(row.history ?? {}),
    horseIds:
      !row.participationEndsAt &&
      (row.status === 'withdrawn' || row.status === 'declined')
        ? []
        : [row.horseId],
    // Shared event notes can describe other horses. Clinical notes live on participation.
    description:
      row.requestedServiceNotes ??
      (singlePersonal ? event.description : undefined),
    notesAfterCompletion:
      row.completionNotes ??
      (singlePersonal ? event.notesAfterCompletion : undefined),
    providerPhone: singlePersonal ? event.providerPhone : undefined,
    totalCost: singlePersonal ? event.totalCost : undefined,
    costPerHorse:
      row.costShare ?? (singlePersonal ? event.costPerHorse : undefined),
    recurrence,
    ...(!details
      ? {
          training: undefined,
          description: undefined,
          notesAfterCompletion: undefined,
          providerPhone: undefined,
          totalCost: undefined,
          costPerHorse: undefined,
        }
      : {}),
  }
}
