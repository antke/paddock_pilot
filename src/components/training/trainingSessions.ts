import type { TrainingEntry } from './trainingCalendarData'

/** Group only server-authorized entries. Frozen participation stays separate. */
export function groupTrainingSessions(entries: Array<TrainingEntry>) {
  const sessions = new Map<
    string,
    { key: string; entries: Array<TrainingEntry> }
  >()
  for (const entry of entries) {
    const event = entry.occurrence.event as typeof entry.occurrence.event & {
      contextHistorical?: boolean
    }
    const history = event.contextHistorical
      ? event.contextParticipationId
      : undefined
    const key = `${entry.occurrence.eventId}:${entry.occurrence.startDate}:${history ?? ''}`
    const session = sessions.get(key) ?? { key, entries: [] }
    if (!session.entries.some((item) => item.key === entry.key))
      session.entries.push(entry)
    sessions.set(key, session)
  }
  return [...sessions.values()]
}
export type TrainingSession = ReturnType<typeof groupTrainingSessions>[number]
