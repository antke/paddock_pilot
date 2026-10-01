export const comparisonKinds = [
  'weight',
  'condition',
  'training',
  'nutrition',
  'health',
  'medication',
  'care',
  'competition',
] as const
export type ComparisonKind = (typeof comparisonKinds)[number]

/** Numeric measurements, dated events and intervals share dates, not units. */
export type HorseComparisonRecord = {
  id: string
  kind: ComparisonKind
  date: string
  endDate?: string
  endUnknown?: boolean
  value?: number
  originalValue?: number
  originalUnit?: 'kg' | 'lb'
  durationMinutes?: number
  title?: string
  notes?: string
  eventId?: string
  status?: string
  activities?: Array<string>
  details?: Array<{
    label:
      | 'feedingRoutine'
      | 'recommended'
      | 'avoid'
      | 'dosage'
      | 'frequency'
      | 'reason'
      | 'rider'
      | 'focus'
      | 'outcome'
      | 'nextFocus'
    value: string
  }>
}

export type ComparisonRange = { start: string; end: string }
export const dayMilliseconds = 86_400_000
export const dateNumber = (date: string) => Date.parse(`${date}T00:00:00Z`)
export const shiftDate = (date: string, days: number) =>
  new Date(dateNumber(date) + days * dayMilliseconds).toISOString().slice(0, 10)

export function recordOverlapsRange(
  record: HorseComparisonRecord,
  range: ComparisonRange,
) {
  return (
    record.date <= range.end &&
    (record.endUnknown || (record.endDate ?? record.date) >= range.start)
  )
}

/** IANA zones preserve the recorded calendar day across historical DST changes. */
export function dateInTimeZone(timestamp: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(timestamp)
  const part = (type: string) => parts.find((p) => p.type === type)?.value
  return `${part('year')}-${part('month')}-${part('day')}`
}
