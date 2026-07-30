import type {
  DashboardLabData,
  DashboardLabEvent,
  DashboardLabHorse,
  DashboardLabReminder,
} from '#/components/dashboard-lab/dashboardLabTypes'
import {
  dateKeyToDate,
  formatDateKey,
  formatLongDateKey,
  formatShortDateKey,
  getTodayDateKey,
} from '#/lib/dateDisplay'
import { createEventOccurrences } from 'shared/events/eventOccurrences'
import type { EventOccurrence } from 'shared/events/eventOccurrences'

const oneDayInMs = 24 * 60 * 60 * 1000

const careCadenceEntries = [
  ['vet', 365],
  ['training', 30],
  ['dentist', 365],
  ['hoof_trimming', 56],
  ['massage', 90],
  ['other', 90],
] as const satisfies ReadonlyArray<readonly [DashboardLabEvent['type'], number]>

type LabMetricTone = 'default' | 'urgent' | 'steady'

export type LabTimelineSeriesKey =
  | 'all'
  | 'completed'
  | 'planned'
  | 'health'
  | 'urgent'
  | 'medication'
  | 'reminders'
  | 'nutrition'
  | 'weight'

export type LabTimelineSignalKind =
  | 'health'
  | 'medication'
  | 'nutrition'
  | 'weight'
  | 'reminder'

export type LabTimelineSourceSignal = {
  id: string
  kind: LabTimelineSignalKind
  date: string
  title: string
  horseId?: DashboardLabHorse['_id']
  horseName?: string
  detail?: string
  status?: string
  severity?: 'low' | 'medium' | 'high'
  priority?: 'low' | 'medium' | 'high'
  urgent: boolean
}

export type LabTimelineSignal = LabTimelineSourceSignal

export type LabAnalysisMetric = {
  title: string
  value: string
  description: string
  tone: LabMetricTone
}

export type LabAttentionHorse = {
  horseId: DashboardLabHorse['_id']
  horseName: string
  ownerName?: string
  breed?: string
  activeIssueCount: number
  highIssueCount: number
  activeMedicationCount: number
  overdueReminderCount: number
  missingProfileFields: Array<string>
}

export type LabEventTypeCount = {
  type: DashboardLabEvent['type']
  count: number
}

export type LabTimelineOccurrence = EventOccurrence<DashboardLabEvent>

export type LabReminderCategoryCount = {
  category: DashboardLabReminder['category']
  count: number
}

export type LabCareCadenceItem = {
  horseId: DashboardLabHorse['_id']
  horseName: string
  type: DashboardLabEvent['type']
  expectedDays: number
  daysSinceLast?: number
  daysUntilNext?: number
  overdue: boolean
}

export type LabCompletionCoverage = {
  completedEventCount: number
  eventsWithNotesCount: number
  eventNoteCoveragePercent: number
  eventCount: number
  eventsWithProviderCount: number
  providerCoveragePercent: number
}

export type LabHorseProfileItem = {
  horseId: DashboardLabHorse['_id']
  horseName: string
  missingFields: Array<string>
  completedFieldCount: number
  totalFieldCount: number
  coveragePercent: number
}

export type LabTimelineBucket = {
  key: string
  label: string
  shortLabel: string
  allEventCount: number
  completedEventCount: number
  plannedEventCount: number
  healthIssueCount: number
  highHealthIssueCount: number
  urgentSignalCount: number
  medicationCount: number
  reminderCount: number
  nutritionChangeCount: number
  weightRecordCount: number
  signalCount: number
  eventTypeCounts: Array<LabEventTypeCount>
  occurrences: Array<LabTimelineOccurrence>
  events: Array<DashboardLabEvent>
  signals: Array<LabTimelineSignal>
}

export type LabTimeline = {
  buckets: Array<LabTimelineBucket>
  occurrences: Array<LabTimelineOccurrence>
  currentBucket: LabTimelineBucket | null
  busiestBucket: LabTimelineBucket | null
  totalEventCount: number
  completedEventCount: number
  plannedEventCount: number
  totalSignalCount: number
}

export type LabAnalysis = {
  metrics: Array<LabAnalysisMetric>
  summary: {
    urgentCount: number
    profileGapCount: number
    averageProfileCoveragePercent: number
  }
  timeline: LabTimeline
  horsesNeedingAttention: Array<LabAttentionHorse>
  eventTypeCounts: Array<LabEventTypeCount>
  reminderCategoryCounts: Array<LabReminderCategoryCount>
  careCadence: Array<LabCareCadenceItem>
  completionCoverage: LabCompletionCoverage
  profileGaps: Array<LabHorseProfileItem>
  upcomingEvents: Array<DashboardLabEvent>
  completionNotesNeeded: Array<DashboardLabEvent>
  providerDetailsMissing: Array<DashboardLabEvent>
  dueReminders: Array<DashboardLabReminder>
}

export function createAnalysisCentreData(
  data: DashboardLabData,
  timelineSignals: Array<LabTimelineSourceSignal> = [],
): LabAnalysis {
  const today = getTodayDateKey()
  const nextThirtyDays = addDaysKey(today, 30)
  const timeline = getTimeline(data.events, timelineSignals, today)
  const plannedEvents = data.events.filter(isPlannedEvent)
  const completedEvents = data.events.filter(
    (event) => event.status === 'completed',
  )
  const upcomingEvents = plannedEvents
    .filter((event) => event.date >= today && event.date <= nextThirtyDays)
    .sort(compareEventDateAndTime)
    .slice(0, 8)
  const completionNotesNeeded = completedEvents
    .filter((event) => !event.notesAfterCompletion)
    .sort(compareEventDateAndTime)
    .slice(0, 8)
  const providerDetailsMissing = data.events
    .filter((event) => !hasProviderDetails(event))
    .sort(compareEventDateAndTime)
    .slice(0, 8)
  const horseProfileItems = getHorseProfileItems(data.horses)
  const profileGapCount = horseProfileItems.reduce(
    (count, horse) => count + horse.missingFields.length,
    0,
  )
  const averageProfileCoveragePercent =
    horseProfileItems.length > 0
      ? Math.round(
          horseProfileItems.reduce(
            (total, horse) => total + horse.coveragePercent,
            0,
          ) / horseProfileItems.length,
        )
      : 100
  const horsesNeedingAttention = getAttentionHorses(data, horseProfileItems)
  const completionCoverage = getCompletionCoverage(data.events, completedEvents)
  const urgentCount =
    data.overview.summary.overdueReminderCount +
    data.overview.summary.highSeverityIssueCount

  return {
    metrics: [
      {
        title: 'Horses flagged',
        value: `${horsesNeedingAttention.length}`,
        description: `${data.overview.summary.highSeverityIssueCount} high-severity issues · ${profileGapCount} profile gaps`,
        tone: urgentCount > 0 ? 'urgent' : 'steady',
      },
      {
        title: 'Active medication',
        value: `${data.overview.summary.activeMedicationCount}`,
        description: 'Medication records currently in progress.',
        tone:
          data.overview.summary.activeMedicationCount > 0
            ? 'urgent'
            : 'default',
      },
      {
        title: 'Upcoming care',
        value: `${data.overview.summary.upcomingEventCount}`,
        description: 'Planned events in the next two weeks.',
        tone: 'default',
      },
      {
        title: 'Reminder load',
        value: `${data.overview.summary.dueReminderCount}`,
        description: `${data.overview.summary.overdueReminderCount} overdue reminders`,
        tone:
          data.overview.summary.overdueReminderCount > 0 ? 'urgent' : 'default',
      },
      {
        title: 'Completion notes',
        value: `${completionCoverage.eventNoteCoveragePercent}%`,
        description: `${completionCoverage.eventsWithNotesCount}/${completionCoverage.completedEventCount} completed events documented`,
        tone:
          completionCoverage.eventNoteCoveragePercent < 75
            ? 'urgent'
            : 'steady',
      },
    ],
    summary: {
      urgentCount,
      profileGapCount,
      averageProfileCoveragePercent,
    },
    timeline,
    horsesNeedingAttention,
    eventTypeCounts: countEventsByType(data.events),
    reminderCategoryCounts: countRemindersByCategory(data.dueReminders),
    careCadence: getCareCadence(data.horses, data.events, today).slice(0, 10),
    completionCoverage,
    profileGaps: horseProfileItems
      .filter((horse) => horse.missingFields.length > 0)
      .sort((a, b) => b.missingFields.length - a.missingFields.length)
      .slice(0, 8),
    upcomingEvents,
    completionNotesNeeded,
    providerDetailsMissing,
    dueReminders: data.dueReminders,
  }
}

function addDaysKey(dateKey: string, days: number) {
  const date = dateKeyToDate(dateKey)
  date.setDate(date.getDate() + days)

  return formatDateKey(date)
}

function compareEventDateAndTime(a: DashboardLabEvent, b: DashboardLabEvent) {
  const dateSort = a.date.localeCompare(b.date)

  if (dateSort !== 0) return dateSort

  return a.time.localeCompare(b.time)
}

function compareTimelineSignal(a: LabTimelineSignal, b: LabTimelineSignal) {
  const dateSort = a.date.localeCompare(b.date)

  if (dateSort !== 0) return dateSort

  return a.title.localeCompare(b.title)
}

function compareTimelineOccurrence(
  a: LabTimelineOccurrence,
  b: LabTimelineOccurrence,
) {
  const dateSort = a.startDate.localeCompare(b.startDate)

  if (dateSort !== 0) return dateSort

  return compareEventDateAndTime(a.event, b.event)
}

function getBucketActivityCount(bucket: LabTimelineBucket) {
  return bucket.allEventCount + bucket.signalCount
}

function isPlannedEvent(event: DashboardLabEvent) {
  return (event.status ?? 'planned') === 'planned'
}

function hasProviderDetails(event: DashboardLabEvent) {
  return Boolean(event.providerName || event.providerPhone)
}

function countEventsByType(
  events: Array<DashboardLabEvent>,
): Array<LabEventTypeCount> {
  const counts = new Map<DashboardLabEvent['type'], number>()

  for (const event of events) {
    counts.set(event.type, (counts.get(event.type) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
}

function countRemindersByCategory(
  reminders: Array<DashboardLabReminder>,
): Array<LabReminderCategoryCount> {
  const counts = new Map<DashboardLabReminder['category'], number>()

  for (const reminder of reminders) {
    counts.set(reminder.category, (counts.get(reminder.category) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
}

function getTimeline(
  events: Array<DashboardLabEvent>,
  signals: Array<LabTimelineSourceSignal>,
  today: string,
): LabTimeline {
  const dayKeys = getTimelineDayKeys(events, signals, today)
  const windowStart = dayKeys[0] ?? today
  const windowEnd = dayKeys[dayKeys.length - 1] ?? today
  const occurrences = createEventOccurrences({
    events,
    windowStart,
    windowEnd,
  }).sort(compareTimelineOccurrence)
  const occurrencesByDay = new Map<string, Array<LabTimelineOccurrence>>()
  const signalsByDay = new Map<string, Array<LabTimelineSignal>>()

  for (const occurrence of occurrences) {
    let dayKey =
      occurrence.startDate < windowStart ? windowStart : occurrence.startDate
    const finalDayKey =
      occurrence.endDate > windowEnd ? windowEnd : occurrence.endDate

    while (dayKey <= finalDayKey) {
      const bucketOccurrences = occurrencesByDay.get(dayKey) ?? []
      bucketOccurrences.push(occurrence)
      occurrencesByDay.set(dayKey, bucketOccurrences)
      dayKey = addDaysKey(dayKey, 1)
    }
  }

  for (const signal of signals) {
    const bucketSignals = signalsByDay.get(signal.date) ?? []
    bucketSignals.push(signal)
    signalsByDay.set(signal.date, bucketSignals)
  }

  const buckets = dayKeys.map((dayKey) => {
    const bucketOccurrences = [...(occurrencesByDay.get(dayKey) ?? [])].sort(
      compareTimelineOccurrence,
    )
    const bucketEvents = getUniqueOccurrenceEvents(bucketOccurrences).sort(
      compareEventDateAndTime,
    )
    const bucketSignals = [...(signalsByDay.get(dayKey) ?? [])].sort(
      compareTimelineSignal,
    )
    const completedEventCount = bucketOccurrences.filter(
      (occurrence) => occurrence.event.status === 'completed',
    ).length
    const plannedEventCount = bucketOccurrences.filter((occurrence) =>
      isPlannedEvent(occurrence.event),
    ).length
    const healthSignals = bucketSignals.filter(
      (signal) => signal.kind === 'health',
    )

    return {
      key: dayKey,
      label: formatDayLabel(dayKey),
      shortLabel: formatShortDayLabel(dayKey),
      allEventCount: bucketOccurrences.length,
      completedEventCount,
      plannedEventCount,
      healthIssueCount: healthSignals.length,
      highHealthIssueCount: healthSignals.filter(
        (signal) => signal.severity === 'high' && signal.status !== 'resolved',
      ).length,
      urgentSignalCount: bucketSignals.filter((signal) => signal.urgent).length,
      medicationCount: bucketSignals.filter(
        (signal) => signal.kind === 'medication',
      ).length,
      reminderCount: bucketSignals.filter(
        (signal) => signal.kind === 'reminder',
      ).length,
      nutritionChangeCount: bucketSignals.filter(
        (signal) => signal.kind === 'nutrition',
      ).length,
      weightRecordCount: bucketSignals.filter(
        (signal) => signal.kind === 'weight',
      ).length,
      signalCount: bucketSignals.length,
      eventTypeCounts: countOccurrencesByType(bucketOccurrences),
      occurrences: bucketOccurrences,
      events: bucketEvents,
      signals: bucketSignals,
    }
  })
  const currentBucket = buckets.find((bucket) => bucket.key === today) ?? null
  const busiestBucket = buckets.reduce<LabTimelineBucket | null>(
    (busiest, bucket) => {
      if (
        !busiest ||
        getBucketActivityCount(bucket) > getBucketActivityCount(busiest)
      ) {
        return bucket
      }

      return busiest
    },
    null,
  )

  return {
    buckets,
    occurrences,
    currentBucket,
    busiestBucket,
    totalEventCount: occurrences.length,
    completedEventCount: occurrences.filter(
      (occurrence) => occurrence.event.status === 'completed',
    ).length,
    plannedEventCount: occurrences.filter((occurrence) =>
      isPlannedEvent(occurrence.event),
    ).length,
    totalSignalCount: signals.length,
  }
}

function getUniqueOccurrenceEvents(occurrences: Array<LabTimelineOccurrence>) {
  const eventsById = new Map<DashboardLabEvent['_id'], DashboardLabEvent>()

  for (const occurrence of occurrences) {
    eventsById.set(occurrence.event._id, occurrence.event)
  }

  return [...eventsById.values()]
}

function countOccurrencesByType(
  occurrences: Array<LabTimelineOccurrence>,
): Array<LabEventTypeCount> {
  const counts = new Map<DashboardLabEvent['type'], number>()

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

function getTimelineDayKeys(
  events: Array<DashboardLabEvent>,
  signals: Array<LabTimelineSourceSignal>,
  today: string,
) {
  const hasRecurringEvents = events.some((event) => event.recurrence)
  const dayKeys = [
    ...events.flatMap((event) => [event.date, event.endDate ?? event.date]),
    ...signals.map((signal) => signal.date),
    today,
    hasRecurringEvents ? addDaysKey(today, 90) : today,
  ]
  const startKey = dayKeys.reduce((earliest, dayKey) =>
    dayKey.localeCompare(earliest) < 0 ? dayKey : earliest,
  )
  const endKey = dayKeys.reduce((latest, dayKey) =>
    dayKey.localeCompare(latest) > 0 ? dayKey : latest,
  )
  const keys: Array<string> = []
  let dayKey = startKey

  while (dayKey.localeCompare(endKey) <= 0) {
    keys.push(dayKey)
    dayKey = addDaysKey(dayKey, 1)
  }

  return keys
}

function formatDayLabel(dayKey: string) {
  return formatLongDateKey(dayKey)
}

function formatShortDayLabel(dayKey: string) {
  return formatShortDateKey(dayKey)
}

function getAttentionHorses(
  data: DashboardLabData,
  horseProfileItems: Array<LabHorseProfileItem>,
): Array<LabAttentionHorse> {
  const attentionByHorseId = new Map(
    data.attentionHorses.map((horse) => [horse.horseId, horse]),
  )
  const horseById = new Map(data.horses.map((horse) => [horse._id, horse]))

  return horseProfileItems
    .map((profile) => {
      const attention = attentionByHorseId.get(profile.horseId)
      const horse = horseById.get(profile.horseId)

      return {
        horseId: profile.horseId,
        horseName: profile.horseName,
        ownerName: horse?.ownerName,
        breed: horse?.breed,
        activeIssueCount: attention?.activeIssueCount ?? 0,
        highIssueCount: attention?.highIssueCount ?? 0,
        activeMedicationCount: attention?.activeMedicationCount ?? 0,
        overdueReminderCount: attention?.overdueReminderCount ?? 0,
        missingProfileFields: profile.missingFields,
      }
    })
    .filter(hasAttentionSignal)
    .sort(compareAttentionHorse)
    .slice(0, 8)
}

function hasAttentionSignal(horse: LabAttentionHorse) {
  return (
    horse.activeIssueCount > 0 ||
    horse.activeMedicationCount > 0 ||
    horse.overdueReminderCount > 0
  )
}

function compareAttentionHorse(a: LabAttentionHorse, b: LabAttentionHorse) {
  const urgentSort =
    b.highIssueCount +
    b.overdueReminderCount -
    (a.highIssueCount + a.overdueReminderCount)

  if (urgentSort !== 0) return urgentSort

  const activeSort =
    b.activeIssueCount +
    b.activeMedicationCount -
    (a.activeIssueCount + a.activeMedicationCount)

  if (activeSort !== 0) return activeSort

  return b.missingProfileFields.length - a.missingProfileFields.length
}

function getHorseProfileItems(
  horses: Array<DashboardLabHorse>,
): Array<LabHorseProfileItem> {
  return horses.map((horse) => {
    const missingFields = getMissingProfileFields(horse)
    const completedFieldCount = profileFieldCount - missingFields.length

    return {
      horseId: horse._id,
      horseName: horse.name,
      missingFields,
      completedFieldCount,
      totalFieldCount: profileFieldCount,
      coveragePercent: Math.round(
        (completedFieldCount / profileFieldCount) * 100,
      ),
    }
  })
}

const profileFieldCount = 8

function getMissingProfileFields(horse: DashboardLabHorse) {
  const missingFields: Array<string> = []

  if (!horse.dateOfBirth) missingFields.push('date of birth')
  if (!horse.passportNumber) missingFields.push('passport number')
  if (!horse.microchipNumber) missingFields.push('microchip number')
  if (!horse.insuranceProvider || !horse.insurancePolicyNumber) {
    missingFields.push('insurance details')
  }
  if (!horse.vetName && !horse.vetPhone) missingFields.push('vet contact')
  if (!horse.farrierName && !horse.farrierPhone) {
    missingFields.push('farrier contact')
  }
  if (!horse.emergencyNotes) missingFields.push('emergency notes')
  if (!hasNutritionDetails(horse)) missingFields.push('nutrition notes')

  return missingFields
}

function hasNutritionDetails(horse: DashboardLabHorse) {
  return Boolean(
    horse.feedingRoutine ||
    horse.nutritionNotes ||
    horse.nutritionRecommended?.length ||
    horse.nutritionAvoid?.length,
  )
}

function getCareCadence(
  horses: Array<DashboardLabHorse>,
  events: Array<DashboardLabEvent>,
  today: string,
): Array<LabCareCadenceItem> {
  return horses
    .flatMap((horse) => {
      const eventsForHorse = events.filter((event) =>
        event.horseIds.includes(horse._id),
      )

      return careCadenceEntries.map(([type, expectedDays]) => {
        const typedEvents = eventsForHorse.filter(
          (event) => event.type === type,
        )
        const lastCompleted = typedEvents
          .filter(
            (event) => event.status === 'completed' && event.date <= today,
          )
          .sort((a, b) => b.date.localeCompare(a.date))[0]
        const nextPlanned = typedEvents
          .filter((event) => isPlannedEvent(event) && event.date >= today)
          .sort(compareEventDateAndTime)[0]
        const daysSinceLast = lastCompleted
          ? Math.floor(
              (Date.parse(today) - Date.parse(lastCompleted.date)) / oneDayInMs,
            )
          : undefined
        const daysUntilNext = nextPlanned
          ? Math.ceil(
              (Date.parse(nextPlanned.date) - Date.parse(today)) / oneDayInMs,
            )
          : undefined

        return {
          horseId: horse._id,
          horseName: horse.name,
          type,
          expectedDays,
          daysSinceLast,
          daysUntilNext,
          overdue:
            daysSinceLast !== undefined &&
            daysSinceLast > expectedDays &&
            !nextPlanned,
        }
      })
    })
    .filter(
      (item) =>
        item.overdue ||
        item.daysUntilNext !== undefined ||
        item.daysSinceLast !== undefined,
    )
    .sort((a, b) => {
      if (a.overdue !== b.overdue) return a.overdue ? -1 : 1

      return (b.daysSinceLast ?? -1) - (a.daysSinceLast ?? -1)
    })
}

function getCompletionCoverage(
  events: Array<DashboardLabEvent>,
  completedEvents: Array<DashboardLabEvent>,
): LabCompletionCoverage {
  const eventsWithNotesCount = completedEvents.filter(
    (event) => event.notesAfterCompletion,
  ).length
  const eventsWithProviderCount = events.filter(hasProviderDetails).length

  return {
    completedEventCount: completedEvents.length,
    eventsWithNotesCount,
    eventNoteCoveragePercent:
      completedEvents.length > 0
        ? Math.round((eventsWithNotesCount / completedEvents.length) * 100)
        : 100,
    eventCount: events.length,
    eventsWithProviderCount,
    providerCoveragePercent:
      events.length > 0
        ? Math.round((eventsWithProviderCount / events.length) * 100)
        : 100,
  }
}
