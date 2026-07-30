import type {
  LabEventTypeCount,
  LabTimelineBucket,
  LabTimelineOccurrence,
  LabTimelineSignal,
} from './analysisCentreData'
import {
  dateKeyToDate,
  formatDateKey,
  formatLongDateKey,
  formatMonthYearDateKey,
  formatShortDateKey,
  formatShortMonthYearDateKey,
} from '#/lib/dateDisplay'
import { timelineSignalKindOrder } from './analysisTimelineSignalMeta'

export type StableTimelineScale = 'day' | 'week' | 'month'

export type StableTimelineSignalKindCount = {
  kind: LabTimelineSignal['kind']
  count: number
}

export type StableTimelinePeriod = {
  key: string
  scale: StableTimelineScale
  startKey: string
  endKey: string
  label: string
  shortLabel: string
  buckets: Array<LabTimelineBucket>
  occurrences: Array<LabTimelineOccurrence>
  allEventCount: number
  completedEventCount: number
  plannedEventCount: number
  eventTypeCounts: Array<LabEventTypeCount>
  signals: Array<LabTimelineSignal>
  signalCount: number
  urgentSignalCount: number
  signalKindCounts: Array<StableTimelineSignalKindCount>
}

const oneDayInMs = 24 * 60 * 60 * 1000

export function getTimelinePeriods(
  buckets: Array<LabTimelineBucket>,
  scale: StableTimelineScale,
): Array<StableTimelinePeriod> {
  if (scale === 'day') {
    return buckets.map((bucket) =>
      createTimelinePeriod(scale, bucket.key, bucket.key, [bucket]),
    )
  }

  const bucketsByPeriodKey = new Map<string, Array<LabTimelineBucket>>()

  for (const bucket of buckets) {
    const periodStartKey = getPeriodStartKey(bucket.key, scale)
    const periodBuckets = bucketsByPeriodKey.get(periodStartKey) ?? []
    periodBuckets.push(bucket)
    bucketsByPeriodKey.set(periodStartKey, periodBuckets)
  }

  return [...bucketsByPeriodKey.entries()]
    .map(([periodStartKey, periodBuckets]) =>
      createTimelinePeriod(
        scale,
        periodStartKey,
        getPeriodEndKey(periodStartKey, scale),
        periodBuckets,
      ),
    )
    .sort((a, b) => a.startKey.localeCompare(b.startKey))
}

function createTimelinePeriod(
  scale: StableTimelineScale,
  startKey: string,
  endKey: string,
  buckets: Array<LabTimelineBucket>,
): StableTimelinePeriod {
  const occurrences = getUniquePeriodOccurrences(buckets, scale)
  const signals = getUniquePeriodSignals(buckets)
  const completedEventCount = occurrences.filter(
    (occurrence) => occurrence.event.status === 'completed',
  ).length
  const plannedEventCount = occurrences.filter(
    (occurrence) => (occurrence.event.status ?? 'planned') === 'planned',
  ).length

  return {
    key: `${scale}:${startKey}`,
    scale,
    startKey,
    endKey,
    label: getPeriodLabel(scale, startKey, endKey),
    shortLabel: getPeriodShortLabel(scale, startKey, endKey),
    buckets,
    occurrences,
    allEventCount: occurrences.length,
    completedEventCount,
    plannedEventCount,
    eventTypeCounts: countOccurrencesByType(occurrences),
    signals,
    signalCount: signals.length,
    urgentSignalCount: signals.filter((signal) => signal.urgent).length,
    signalKindCounts: countSignalsByKind(signals),
  }
}

function getUniquePeriodSignals(
  buckets: Array<LabTimelineBucket>,
): Array<LabTimelineSignal> {
  const signalsByKey = new Map<string, LabTimelineSignal>()

  for (const bucket of buckets) {
    for (const signal of bucket.signals) {
      const signalKey = `${signal.kind}:${signal.id}`
      if (!signalsByKey.has(signalKey)) {
        signalsByKey.set(signalKey, signal)
      }
    }
  }

  return [...signalsByKey.values()].sort(compareSignal)
}

function getUniquePeriodOccurrences(
  buckets: Array<LabTimelineBucket>,
  scale: StableTimelineScale,
): Array<LabTimelineOccurrence> {
  const occurrencesByKey = new Map<string, LabTimelineOccurrence>()

  for (const bucket of buckets) {
    for (const occurrence of bucket.occurrences) {
      const occurrenceKey =
        scale === 'day' ? occurrence.occurrenceKey : String(occurrence.eventId)
      if (!occurrencesByKey.has(occurrenceKey)) {
        occurrencesByKey.set(occurrenceKey, occurrence)
      }
    }
  }

  return [...occurrencesByKey.values()].sort(compareOccurrence)
}

function countOccurrencesByType(
  occurrences: Array<LabTimelineOccurrence>,
): Array<LabEventTypeCount> {
  const counts = new Map<LabEventTypeCount['type'], number>()

  for (const occurrence of occurrences) {
    counts.set(
      occurrence.event.type,
      (counts.get(occurrence.event.type) ?? 0) + 1,
    )
  }

  return [...counts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
}

function countSignalsByKind(
  signals: Array<LabTimelineSignal>,
): Array<StableTimelineSignalKindCount> {
  const counts = new Map<LabTimelineSignal['kind'], number>()

  for (const signal of signals) {
    counts.set(signal.kind, (counts.get(signal.kind) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([kind, count]) => ({ kind, count }))
    .sort((a, b) => {
      const countSort = b.count - a.count
      if (countSort !== 0) return countSort

      return getSignalKindOrderIndex(a.kind) - getSignalKindOrderIndex(b.kind)
    })
}

function compareOccurrence(a: LabTimelineOccurrence, b: LabTimelineOccurrence) {
  const dateSort = a.startDate.localeCompare(b.startDate)

  if (dateSort !== 0) return dateSort

  const timeSort = a.event.time.localeCompare(b.event.time)

  if (timeSort !== 0) return timeSort

  return a.event.title.localeCompare(b.event.title)
}

function compareSignal(a: LabTimelineSignal, b: LabTimelineSignal) {
  const dateSort = a.date.localeCompare(b.date)

  if (dateSort !== 0) return dateSort

  if (a.urgent !== b.urgent) return a.urgent ? -1 : 1

  const kindSort =
    getSignalKindOrderIndex(a.kind) - getSignalKindOrderIndex(b.kind)

  if (kindSort !== 0) return kindSort

  return a.title.localeCompare(b.title)
}

function getSignalKindOrderIndex(kind: LabTimelineSignal['kind']) {
  return timelineSignalKindOrder.indexOf(kind)
}

function getPeriodStartKey(dayKey: string, scale: StableTimelineScale) {
  if (scale === 'week') return getWeekStartKey(dayKey)
  if (scale === 'month') return `${dayKey.slice(0, 7)}-01`
  return dayKey
}

function getPeriodEndKey(startKey: string, scale: StableTimelineScale) {
  if (scale === 'week') return addDaysKey(startKey, 6)
  if (scale === 'month') return getMonthEndKey(startKey)
  return startKey
}

function getWeekStartKey(dayKey: string) {
  const date = parseDayKey(dayKey)
  const mondayOffset = (date.getDay() + 6) % 7
  date.setDate(date.getDate() - mondayOffset)
  return formatDateKey(date)
}

function getMonthEndKey(monthStartKey: string) {
  const year = Number(monthStartKey.slice(0, 4))
  const month = Number(monthStartKey.slice(5, 7))
  return formatDateKey(new Date(year, month, 0))
}

function getPeriodLabel(
  scale: StableTimelineScale,
  startKey: string,
  _endKey: string,
) {
  if (scale === 'week') return `Week of ${formatLongDateKey(startKey)}`
  if (scale === 'month') return formatMonthYearDateKey(startKey)
  return formatLongDateKey(startKey)
}

function getPeriodShortLabel(
  scale: StableTimelineScale,
  startKey: string,
  endKey: string,
) {
  if (scale === 'month') return formatShortMonthYearDateKey(startKey)
  if (startKey === endKey) return formatShortDateKey(startKey)
  return `${formatShortDateKey(startKey)}–${formatShortDateKey(endKey)}`
}

function parseDayKey(dayKey: string) {
  return dateKeyToDate(dayKey)
}

function addDaysKey(dayKey: string, days: number) {
  return formatDateKey(
    new Date(parseDayKey(dayKey).getTime() + days * oneDayInMs),
  )
}
