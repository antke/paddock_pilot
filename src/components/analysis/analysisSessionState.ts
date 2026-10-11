import { contextKinds, horseMeasures } from './horseComparisonData'
import type { HorseComparisonSelection } from './horseComparisonData'
import type { TimeChartPoint } from '#/components/charts/TimeComparisonChart'
import { dateNumber, dayMilliseconds } from 'shared/analysis/horseComparison'
import type { ComparisonRange } from 'shared/analysis/horseComparison'
import { isDateKey } from 'shared/training/trainingSchema'

export function analysisSessionKey(stableId: string, horseId?: string) {
  return `paddock:analysis:v1:${stableId}${horseId ? `:horse:${horseId}` : ':stable'}`
}

export function validAnalysisRange(value: unknown): value is ComparisonRange {
  if (!value || typeof value !== 'object') return false
  const range = value as ComparisonRange
  return (
    isDateKey(range.start) &&
    isDateKey(range.end) &&
    range.start <= range.end &&
    dateNumber(range.end) - dateNumber(range.start) <= 3660 * dayMilliseconds
  )
}
export const decodeAnalysisRange = (value: unknown) =>
  validAnalysisRange(value) ? { start: value.start, end: value.end } : undefined
export const decodeBoolean = (value: unknown) =>
  typeof value === 'boolean' ? value : undefined
export const decodeId = (value: unknown) =>
  typeof value === 'string' && value.length > 0 && value.length <= 250
    ? value
    : undefined
export const decodeDate = (value: unknown) =>
  value === null || (typeof value === 'string' && isDateKey(value))
    ? value
    : undefined
export function decodeChoice<T extends string>(choices: readonly T[]) {
  return (value: unknown): T | undefined =>
    choices.includes(value as T) ? (value as T) : undefined
}
export function decodeChoices<T extends string>(choices: readonly T[]) {
  return (value: unknown): T[] | undefined =>
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= choices.length &&
    value.every((item) => choices.includes(item))
      ? [...new Set(value as T[])]
      : undefined
}
export const analysisPeriods = ['30', '90', '180', '365', 'custom'] as const
export const decodePeriod = decodeChoice(analysisPeriods)

export { useSessionState as useAnalysisSessionState } from '#/lib/useSessionState'

// These codecs deliberately discard all display text and numeric record values.
export function decodeSelectedPoint(
  value: unknown,
): TimeChartPoint | null | undefined {
  if (value === null) return null
  if (!value || typeof value !== 'object') return undefined
  const point = value as Record<string, unknown>
  if (
    !decodeId(point.id) ||
    typeof point.date !== 'string' ||
    !isDateKey(point.date) ||
    !Array.isArray(point.recordIds) ||
    point.recordIds.length > 5000 ||
    !point.recordIds.every((id) => decodeId(id))
  )
    return undefined
  return {
    id: point.id as string,
    date: point.date,
    recordIds: [...new Set(point.recordIds as string[])],
    label: '',
  }
}
export const encodeSelectedPoint = (value: TimeChartPoint | null) =>
  value ? { id: value.id, date: value.date, recordIds: value.recordIds } : null

export function decodePreviousRange(
  value: unknown,
): { range: ComparisonRange; period: string } | null | undefined {
  if (value === null) return null
  if (!value || typeof value !== 'object') return undefined
  const previous = value as Record<string, unknown>
  const range = decodeAnalysisRange(previous.range)
  const period = decodePeriod(previous.period)
  return range && period ? { range, period } : undefined
}
export function decodePeriodChoice(
  value: unknown,
): { value: string; rangeKey: string } | undefined {
  if (!value || typeof value !== 'object') return undefined
  const choice = value as Record<string, unknown>
  if (!decodePeriod(choice.value) || typeof choice.rangeKey !== 'string')
    return undefined
  const [start, end, extra] = choice.rangeKey.split(':')
  return extra === undefined && validAnalysisRange({ start, end })
    ? { value: choice.value as string, rangeKey: choice.rangeKey }
    : undefined
}

export function decodeComparisonSelection(
  value: unknown,
): HorseComparisonSelection | undefined {
  if (!value || typeof value !== 'object') return undefined
  const selection = value as HorseComparisonSelection
  return horseMeasures.includes(selection.measure) &&
    (selection.context === 'none' ||
      contextKinds.includes(selection.context)) &&
    (selection.extra === 'none' || contextKinds.includes(selection.extra))
    ? {
        measure: selection.measure,
        context: selection.context,
        extra: selection.extra,
      }
    : undefined
}
