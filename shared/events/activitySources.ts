import type { Doc } from '../../convex/_generated/dataModel'
import type { SharingRule } from '../sharing/rules'
import { effectiveShare } from '../sharing/rules'

type Event = Doc<'events'> & {
  participantOnlyDates?: Array<{ horseId: string; date: string }>
  contextParticipationId?: string
  contextHorseId?: string
  contextHistorical?: boolean
  audienceRules?: Array<{ horseId: string; rules: Array<SharingRule> }>
}
type Source = {
  events: Array<Event>
  horses: Array<
    Pick<
      Doc<'horses'>,
      | '_id'
      | '_creationTime'
      | 'name'
      | 'nickname'
      | 'useNickname'
      | 'calendarColourId'
    > & { canRecord: boolean }
  >
  records: Array<
    Doc<'trainingRecords'> & {
      canEdit?: boolean
      createdByName?: string | null
    }
  >
}

/** OR authorized sources; a denial in one calendar never revokes another grant. */
function unionRules(sources: Array<Array<SharingRule>>): Array<SharingRule> {
  const bases = sources.flatMap((rules) =>
    rules.filter((rule) => !rule.occurrenceDate && rule.enabled),
  )
  const unbounded = bases.some((rule) => !rule.throughDate)
  const cutoff = bases
    .map((rule) => rule.throughDate)
    .filter((date): date is string => Boolean(date))
    .sort()
    .at(-1)
  const result: Array<SharingRule> = bases.length
    ? [{ enabled: true, throughDate: unbounded ? undefined : cutoff }]
    : []
  for (const date of new Set(
    sources.flatMap((rules) =>
      rules.flatMap((rule) =>
        rule.occurrenceDate ? [rule.occurrenceDate] : [],
      ),
    ),
  )) {
    result.push({
      occurrenceDate: date,
      enabled: sources.some((rules) => effectiveShare(rules, date)),
    })
  }
  return result
}

/** Keep historical and horse-specific projections intact; union only identical views. */
export function mergeCalendarEvents(events: Array<Event>) {
  const result = new Map<string, Event>()
  for (const event of events) {
    const key = `${event._id}:${event.contextParticipationId ?? ''}:${event.contextHorseId ?? ''}:${event.date}`
    const existing = result.get(key)
    if (!existing) {
      result.set(key, event)
      continue
    }
    const horseIds = [...new Set([...existing.horseIds, ...event.horseIds])]
    result.set(key, {
      ...existing,
      horseIds,
      participantOnlyDates: [
        ...(existing.participantOnlyDates ?? []),
        ...(event.participantOnlyDates ?? []),
      ],
      audienceRules: horseIds.map((horseId) => ({
        horseId,
        rules: unionRules(
          [existing, event]
            .filter((source) => source.horseIds.includes(horseId))
            .map((source) =>
              source.audienceRules
                ? (source.audienceRules.find((item) => item.horseId === horseId)
                    ?.rules ?? [])
                : [{ enabled: true }],
            ),
        ),
      })),
    })
  }
  return [...result.values()]
}

export function mergeTrainingSources(sources: Array<Source>) {
  const horses = new Map<string, Source['horses'][number]>()
  const records = new Map<string, Source['records'][number]>()
  const events: Array<Event> = []
  // Personal sources come first: their authorized horse history is more specific.
  for (const source of sources) {
    for (const horse of source.horses) {
      const existing = horses.get(horse._id)
      horses.set(
        horse._id,
        existing
          ? { ...existing, canRecord: existing.canRecord || horse.canRecord }
          : horse,
      )
    }
    for (const record of source.records)
      if (!records.has(record._id)) records.set(record._id, record)
  }
  // Combine grants for the same view before suppressing duplicate horse projections.
  for (const event of mergeCalendarEvents(
    sources.flatMap((source) => source.events),
  )) {
    // A current per-horse projection and the stable event must not render the same ride twice.
    const covered = new Set(
      events
        .filter((item) => item._id === event._id && !item.contextHistorical)
        .flatMap((item) => item.horseIds),
    )
    const horseIds = event.contextHistorical
      ? event.horseIds
      : event.horseIds.filter((id) => !covered.has(id))
    if (horseIds.length || !event.horseIds.length)
      events.push({
        ...event,
        horseIds,
        audienceRules: event.audienceRules?.filter((rule) =>
          horseIds.includes(rule.horseId as Doc<'horses'>['_id']),
        ),
      })
  }
  return {
    events: mergeCalendarEvents(events),
    horses: [...horses.values()],
    records: [...records.values()],
  }
}
