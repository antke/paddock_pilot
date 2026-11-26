import type { Doc } from '../../convex/_generated/dataModel'

/** An event still open for invitations: not cancelled/completed and with a date on or after `today`. */
export function isEventOpen(
  event: Pick<Doc<'events'>, 'status' | 'date' | 'endDate' | 'recurrence'>,
  today: string,
) {
  if (event.status === 'cancelled' || event.status === 'completed') return false
  if (!event.recurrence) return (event.endDate ?? event.date) >= today
  const end = event.recurrence.end
  return end?.type !== 'on_date' || end.date >= today
}

/** Withdrawal ends participation from today, so a one-off event must not have started and nothing can leave a completed one. */
export function canWithdrawFromEvent(
  event: Pick<Doc<'events'>, 'status' | 'date' | 'recurrence'>,
  today: string,
) {
  return (
    event.status !== 'completed' && (!!event.recurrence || event.date >= today)
  )
}
