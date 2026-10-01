/** Optional query metadata; legacy prose stays available to older clients. */
export type AnalysisSignalDisplayData = {
  weight?: number
  unit?: string
  bodyConditionScore?: number
  dosage?: string
  frequency?: string
}
