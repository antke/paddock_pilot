import type { Doc } from 'convex/_generated/dataModel'

/** Legacy events without a status follow the existing planned-event contract. */
export function groupHorseActivityEvents(
  events: ReadonlyArray<Doc<'events'>>,
  today: string,
) {
  const upcoming: Array<Doc<'events'>> = []
  const history: Array<Doc<'events'>> = []
  for (const original of events) {
    const event = original.status
      ? original
      : { ...original, status: 'planned' as const }
    if (event.status === 'planned' && event.date >= today) upcoming.push(event)
    else history.push(event)
  }
  return {
    upcoming: upcoming.sort(compareActivityDates),
    history: history.sort((a, b) => compareActivityDates(b, a)),
  }
}

export function compareActivityDates(a: Doc<'events'>, b: Doc<'events'>) {
  return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
}
