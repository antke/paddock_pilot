import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { createEventOccurrences } from '../../shared/events/eventOccurrences'
/** A horse sees only its participation, including the frozen schedule at departure. */
export async function horseEvent(
  ctx: QueryCtx | MutationCtx,
  row: Doc<'eventsHorses'>,
): Promise<
  | (Doc<'events'> & {
      contextHorseId?: string
      contextParticipationId?: Id<'eventsHorses'>
    })
  | null
> {
  const event = await ctx.db.get(row.eventId)
  if (!event) return null
  // A personal appointment for one horse has no other horse's private data.
  // Preserve its original notes and costs in that horse's history as well.
  const singlePersonal =
    !event.stableId &&
    event.horseIds.length === 1 &&
    event.horseIds[0] === row.horseId
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
    contextHorseId: row.horseId,
    contextParticipationId: row._id,
    ...(row.history ?? {}),
    horseIds:
      row.status === 'withdrawn' || row.status === 'declined'
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
  }
}
