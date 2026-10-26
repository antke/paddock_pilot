export type SharingRule = {
  occurrenceDate?: string
  throughDate?: string
  enabled: boolean
}
/** Exact date overrides the series. A bounded series needs a date to authorize. */
export function effectiveShare(shares: Array<SharingRule>, date?: string) {
  const exact = date && shares.find((share) => share.occurrenceDate === date)
  const rule =
    exact || shares.find((share) => share.occurrenceDate === undefined)
  return Boolean(
    rule?.enabled && (!rule.throughDate || (date && date <= rule.throughDate)),
  )
}
