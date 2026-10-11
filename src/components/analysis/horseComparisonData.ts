import type {
  ComparisonKind,
  ComparisonRange,
  HorseComparisonRecord,
} from 'shared/analysis/horseComparison'
import {
  dateNumber,
  dayMilliseconds,
  shiftDate,
  recordOverlapsRange,
} from 'shared/analysis/horseComparison'
import type { Locale } from 'shared/i18n/locale'
import { localeInstances } from '#/i18n/resources'
import { formatMediumDateKey } from '#/lib/dateDisplay'
import { formatDecimal } from '#/lib/numberDisplay'
import type {
  TimeChartPoint,
  TimeChartRow,
} from '#/components/charts/TimeComparisonChart'

export type HorseMeasure =
  'weight' | 'condition' | 'sessions' | 'minutes' | 'nutrition'
export const horseMeasures: Array<HorseMeasure> = [
  'weight',
  'condition',
  'sessions',
  'minutes',
  'nutrition',
]
export const contextKinds: Array<ComparisonKind> = [
  'training',
  'nutrition',
  'condition',
  'weight',
  'health',
  'medication',
  'care',
  'competition',
]
export const horseComparisonPresets = {
  trainingHealth: {
    measure: 'sessions',
    context: 'health',
    extra: 'medication',
  },
  trainingFeeding: { measure: 'sessions', context: 'nutrition', extra: 'none' },
  trainingCare: { measure: 'minutes', context: 'health', extra: 'medication' },
  weightTraining: { measure: 'weight', context: 'training', extra: 'none' },
  feeding: { measure: 'weight', context: 'nutrition', extra: 'none' },
  condition: { measure: 'weight', context: 'condition', extra: 'none' },
} as const
export type HorseComparisonPreset = keyof typeof horseComparisonPresets
export type HorseComparisonSelection = {
  measure: HorseMeasure
  context: ComparisonKind | 'none'
  extra: ComparisonKind | 'none'
}
const colors: Record<ComparisonKind, string> = {
  weight: 'var(--analysis-weight)',
  condition: 'var(--analysis-condition)',
  training: 'var(--analysis-training)',
  nutrition: 'var(--analysis-nutrition)',
  health: 'var(--analysis-health)',
  medication: 'var(--analysis-medication)',
  care: 'var(--analysis-care)',
  competition: 'var(--analysis-competition)',
}

export function comparisonRecordLabel(
  record: HorseComparisonRecord,
  locale: Locale,
) {
  const t = localeInstances[locale].t
  const number = (n: number) => formatDecimal(Math.round(n * 10) / 10, locale)
  const value =
    record.kind === 'weight' && record.value !== undefined
      ? `${number(record.value)} kg`
      : record.kind === 'condition'
        ? `${number(record.value!)} / 9`
        : record.kind === 'training'
          ? [
              record.title,
              record.durationMinutes === undefined
                ? t('horseComparison.unknownDuration')
                : `${record.durationMinutes} ${t('horseComparison.minutes')}`,
              trainingStatusLabel(record.status, locale),
            ]
              .filter(Boolean)
              .join(' · ')
          : (record.title ?? t(`horseComparison.kinds.${record.kind}`))
  return `${formatMediumDateKey(record.date, locale)} · ${value}`
}

export function trainingStatusLabel(
  status: string | undefined,
  locale: Locale,
) {
  const statuses = [
    'planned',
    'completed',
    'cancelled',
    'skipped',
    'unconfirmed',
    'active',
    'resolved',
  ] as const
  const known = statuses.find((s) => s === status)
  return known
    ? localeInstances[locale].t(`horseComparison.statuses.${known}`)
    : ''
}

export function createComparisonRows(
  records: Array<HorseComparisonRecord>,
  selection: HorseComparisonSelection,
  range: ComparisonRange,
  locale: Locale,
  showOtherTraining = false,
) {
  const t = localeInstances[locale].t
  const days =
    (dateNumber(range.end) - dateNumber(range.start)) / dayMilliseconds + 1
  const aggregation = days > 180 ? 'monthly' : days > 45 ? 'weekly' : 'daily'
  const bucket = (date: string) => {
    if (aggregation === 'monthly') return date.slice(0, 7) + '-01'
    if (aggregation === 'weekly')
      return shiftDate(
        date,
        -((new Date(date + 'T00:00:00Z').getUTCDay() + 6) % 7),
      )
    return date
  }
  const bucketEnd = (date: string) =>
    aggregation === 'monthly'
      ? shiftDate(
          new Date(
            Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)), 1),
          )
            .toISOString()
            .slice(0, 10),
          -1,
        )
      : shiftDate(date, aggregation === 'weekly' ? 6 : 0)
  const inRange = records
    .filter((record) => recordOverlapsRange(record, range))
    .sort((a, b) => a.date.localeCompare(b.date))
  const completed = inRange.filter(
    (record) => record.kind === 'training' && record.status === 'completed',
  )
  const measureKind =
    selection.measure === 'sessions' || selection.measure === 'minutes'
      ? 'training'
      : selection.measure
  const kinds = [
    ...new Set([measureKind, selection.context, selection.extra]),
  ].filter((kind): kind is ComparisonKind => kind !== 'none')
  const asPoint = (record: HorseComparisonRecord): TimeChartPoint => ({
    id: record.id,
    recordIds: [record.id],
    date: record.date,
    value: record.value,
    endDate: record.endDate,
    openEnd: record.endUnknown,
    label: comparisonRecordLabel(record, locale),
  })
  const rows: Array<TimeChartRow> = kinds.map((kind) => {
    const items = inRange.filter((record) => record.kind === kind)
    const base = {
      id: kind,
      label: t(`horseComparison.kinds.${kind}`),
      color: colors[kind],
    }
    if (kind === 'weight' || kind === 'condition')
      return {
        ...base,
        type: 'line',
        unit: t(
          kind === 'weight' ? 'horseComparison.kg' : 'horseComparison.score',
        ),
        domain: kind === 'condition' ? ([1, 9] as const) : undefined,
        points: items.map(asPoint),
      }
    if (kind === 'training') {
      const counting = selection.measure === 'sessions'
      const byDate = new Map<string, Array<HorseComparisonRecord>>()
      for (const record of completed) {
        if (!counting && record.durationMinutes === undefined) continue
        const date = bucket(record.date)
        byDate.set(date, [...(byDate.get(date) ?? []), record])
      }
      return {
        ...base,
        label: `${t(counting ? 'horseComparison.measures.sessions' : 'horseComparison.measures.minutes')} · ${t(`horseComparison.aggregation.${aggregation}`)}`,
        unit: t(
          counting ? 'horseComparison.sessions' : 'horseComparison.minutes',
        ),
        type: 'bar',
        points: [...byDate].map(([date, group]) => {
          const value = counting
            ? group.length
            : group.reduce(
                (sum, record) => sum + (record.durationMinutes ?? 0),
                0,
              )
          return {
            id: `training:${date}`,
            date: date < range.start ? range.start : date,
            endDate: bucketEnd(date) > range.end ? range.end : bucketEnd(date),
            value,
            recordIds: group.map((record) => record.id),
            label: `${formatMediumDateKey(date < range.start ? range.start : date, locale)}${aggregation === 'daily' ? '' : ` – ${formatMediumDateKey(bucketEnd(date) > range.end ? range.end : bucketEnd(date), locale)}`} · ${value} ${t(counting ? 'horseComparison.sessions' : 'horseComparison.minutes')} · ${t('horseComparison.recordCount', { count: group.length })}`,
          }
        }),
      }
    }
    return {
      ...base,
      type: kind === 'health' || kind === 'medication' ? 'intervals' : 'events',
      points: items.map(asPoint),
    }
  })
  if (kinds.includes('training')) {
    const missing = completed.filter(
      (record) => record.durationMinutes === undefined,
    )
    if (selection.measure !== 'sessions' && missing.length)
      rows.push({
        id: 'missingDuration',
        label: t('horseComparison.missingDuration'),
        color: colors.training,
        type: 'events',
        points: missing.map(asPoint),
      })
    const others = inRange.filter(
      (record) => record.kind === 'training' && record.status !== 'completed',
    )
    if (showOtherTraining && others.length)
      rows.push({
        id: 'otherTraining',
        label: t('horseComparison.otherTraining'),
        color: 'var(--muted-foreground)',
        type: 'events',
        points: others.map(asPoint),
      })
  }
  const visibleIds = new Set(
    rows.flatMap((row) => row.points.flatMap((point) => point.recordIds)),
  )
  return {
    rows,
    records: inRange.filter((record) => visibleIds.has(record.id)),
    completed,
    hasTraining: kinds.includes('training'),
    aggregation,
  }
}
