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
/**
 * Who leads the session as it stands now. Editing from a horse's record updates
 * that record, not the event, so the entries are the source; the event's own
 * value is only for a session without entries. Different leaders per horse have
 * no single answer, and each horse's card shows its own.
 */
export function getSessionLeader(
  entries: ReadonlyArray<TrainingEntry>,
  event?: { training?: { rider?: string } },
): string | undefined {
  if (!entries.length) return event?.training?.rider || undefined
  const first = entries[0].details.rider
  return first && entries.every((entry) => entry.details.rider === first)
    ? first
    : undefined
}

export type TrainingSession = ReturnType<typeof groupTrainingSessions>[number]
