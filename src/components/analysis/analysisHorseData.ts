import { getHorseDisplayName } from 'shared/horses/horseDisplayName'
import type {
  DashboardLabData,
  DashboardLabEvent,
  DashboardLabHorse,
  DashboardLabReminder,
} from '#/components/dashboard-lab/dashboardLabTypes'
import {
  dateKeyToDate,
  formatDateKey,
  getTodayDateKey,
} from '#/lib/dateDisplay'
import type { api } from 'convex/_generated/api'
import type { FunctionReturnType } from 'convex/server'
import type {
  LabAnalysis,
  LabAttentionHorse,
  LabTimelineSignal,
} from './analysisCentreData'

type StableAnalysis = FunctionReturnType<typeof api.stableAnalysis.getForStable>

export type LabUnlockedStableAnalysis = Extract<
  StableAnalysis,
  { hasAccess: true }
>
export type LabHorseWeightTrend =
  LabUnlockedStableAnalysis['weightTrends'][number]
export type LabHorseHealthFrequency =
  LabUnlockedStableAnalysis['healthIssueFrequency'][number]
export type LabHorseNutritionSignal =
  LabUnlockedStableAnalysis['nutritionSignals'][number]
export type LabHorseCareCadence =
  LabUnlockedStableAnalysis['careCadence'][number]
export type LabHorseOutcomeGap =
  LabUnlockedStableAnalysis['horseOutcomeNotesNeeded'][number]

export type LabHorseDeepDive = {
  attention: LabAttentionHorse | null
  summaryComplete: boolean
  summary: {
    activeIssueCount: number
    highIssueCount: number
    activeMedicationCount: number
    overdueReminderCount: number
    upcomingEventCount: number
    documentationGapCount: number
    signalCount: number
  }
  upcomingEvents: Array<DashboardLabEvent>
  completionNotesNeeded: Array<DashboardLabEvent>
  dueReminders: Array<DashboardLabReminder>
  recentSignals: Array<LabTimelineSignal>
  healthSignals: Array<LabTimelineSignal>
  medicationSignals: Array<LabTimelineSignal>
  nutritionTimelineSignals: Array<LabTimelineSignal>
  weightSignals: Array<LabTimelineSignal>
  reminderSignals: Array<LabTimelineSignal>
  weightTrend: LabHorseWeightTrend | null
  healthFrequency: LabHorseHealthFrequency | null
  nutritionSignals: Array<LabHorseNutritionSignal>
  careCadence: Array<LabHorseCareCadence>
  horseOutcomeNotesNeeded: Array<LabHorseOutcomeGap>
}

export function createHorseAnalysisData({
  horse,
  data,
  analysis,
  stableAnalysis,
  timelineSignals,
}: {
  horse: DashboardLabHorse
  data: DashboardLabData
  analysis: LabAnalysis
  stableAnalysis: LabUnlockedStableAnalysis | null
  timelineSignals: Array<LabTimelineSignal>
}): LabHorseDeepDive {
  const today = stableAnalysis?.today ?? getTodayDateKey()
  const nextThirtyDays = addDaysKey(today, 30)
  const horseEvents = data.events.filter((event) =>
    event.horseIds.includes(horse._id),
  )
  const upcomingEvents = horseEvents
    .filter(
      (event) =>
        isPlannedEvent(event) &&
        event.date >= today &&
        event.date <= nextThirtyDays,
    )
    .sort(compareEventDateAndTimeAscending)
  const completionNotesNeeded = horseEvents
    .filter(
      (event) => event.status === 'completed' && !event.notesAfterCompletion,
    )
    .sort(compareEventDateAndTimeDescending)
  const dueReminders: Array<DashboardLabReminder> = stableAnalysis
    ? timelineSignals
        .filter(
          (record) =>
            record.horseId === horse._id &&
            record.kind === 'reminder' &&
            record.status === 'pending' &&
            record.date <= nextThirtyDays &&
            record.reminderCategory !== undefined,
        )
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((record) => ({
          id: record.id as DashboardLabReminder['id'],
          stableId: data.stable._id,
          stableName: data.stable.name,
          horseId: horse._id,
          horseName: getHorseDisplayName(horse),
          title: record.title,
          dueDate: record.date,
          category: record.reminderCategory!,
          priority: record.priority,
          overdue: record.date < today,
        }))
    : data.dueReminders.filter((reminder) => reminder.horseId === horse._id)
  const horseSignals = timelineSignals
    .filter((signal) => signal.horseId === horse._id)
    .sort(compareTimelineSignalDescending)
  const healthSignals = horseSignals.filter(
    (signal) => signal.kind === 'health',
  )
  const medicationSignals = horseSignals.filter(
    (signal) => signal.kind === 'medication',
  )
  const nutritionTimelineSignals = horseSignals.filter(
    (signal) => signal.kind === 'nutrition',
  )
  const weightSignals = horseSignals.filter(
    (signal) => signal.kind === 'weight',
  )
  const reminderSignals = horseSignals.filter(
    (signal) => signal.kind === 'reminder',
  )
  const attention =
    analysis.horsesNeedingAttention.find(
      (item) => item.horseId === horse._id,
    ) ?? null
  const currentSummary = stableAnalysis?.horseSummaries?.find(
    (item) => item.horseId === horse._id,
  )
  const healthFrequency =
    stableAnalysis?.healthIssueFrequency.find(
      (item) => item.horseId === horse._id,
    ) ?? null
  const horseOutcomeNotesNeeded =
    stableAnalysis?.horseOutcomeNotesNeeded
      .filter((item) => item.horseId === horse._id)
      .sort((a, b) => b.eventDate.localeCompare(a.eventDate)) ?? []

  return {
    attention,
    summaryComplete: Boolean(currentSummary),
    summary: {
      activeIssueCount:
        currentSummary?.activeIssueCount ??
        healthSignals.filter((record) => record.status === 'active').length,
      highIssueCount:
        currentSummary?.highIssueCount ??
        healthSignals.filter(
          (record) => record.status === 'active' && record.severity === 'high',
        ).length,
      activeMedicationCount:
        currentSummary?.activeMedicationCount ??
        medicationSignals.filter((record) => record.status === 'active').length,
      overdueReminderCount:
        currentSummary?.overdueReminderCount ??
        reminderSignals.filter(
          (record) => record.status === 'pending' && record.date < today,
        ).length,
      upcomingEventCount: upcomingEvents.length,
      documentationGapCount:
        completionNotesNeeded.length + horseOutcomeNotesNeeded.length,
      signalCount: horseSignals.length,
    },
    upcomingEvents,
    completionNotesNeeded,
    dueReminders,
    recentSignals: horseSignals.slice(0, 8),
    healthSignals,
    medicationSignals,
    nutritionTimelineSignals,
    weightSignals,
    reminderSignals,
    weightTrend:
      stableAnalysis?.weightTrends.find(
        (trend) => trend.horseId === horse._id,
      ) ?? null,
    healthFrequency,
    nutritionSignals:
      stableAnalysis?.nutritionSignals.filter(
        (signal) => signal.horseId === horse._id,
      ) ?? [],
    careCadence:
      stableAnalysis?.careCadence.filter(
        (item) => item.horseId === horse._id,
      ) ?? [],
    horseOutcomeNotesNeeded,
  }
}

/** Keep the historical observations and today's care status explicitly separate. */
export function createStableHorseOverview({
  horses,
  stableAnalysis,
  timelineSignals,
  range,
}: {
  horses: Array<DashboardLabHorse>
  stableAnalysis: LabUnlockedStableAnalysis | null
  timelineSignals: Array<LabTimelineSignal>
  range: { start: string; end: string }
}) {
  return horses.map((horse) => {
    const current = stableAnalysis?.horseSummaries?.find(
      (row) => row.horseId === horse._id,
    )
    const observations = timelineSignals
      .filter(
        (record) =>
          record.horseId === horse._id &&
          record.kind === 'weight' &&
          record.date >= range.start &&
          record.date <= range.end &&
          record.displayData?.weight !== undefined &&
          record.displayData.unit !== undefined,
      )
      .sort(
        (a, b) =>
          a.date.localeCompare(b.date) ||
          (a.observationOrder ?? 0) - (b.observationOrder ?? 0),
      )
    const latest = observations.at(-1)
    const first = observations[0]
    // Match horse comparisons: retain every real observation and compare in kg,
    // even when the first and last records were entered in different units.
    const kilograms = (record: LabTimelineSignal) =>
      record.displayData!.weight! *
      (record.displayData!.unit === 'lb' ? 0.45359237 : 1)
    const completed = (stableAnalysis?.trainingOutcomes ?? []).filter(
      (record) =>
        record.horseId === horse._id &&
        record.date >= range.start &&
        record.date <= range.end &&
        record.status === 'completed',
    )
    const withDuration = completed.filter(
      (record) => record.details.durationMinutes !== undefined,
    )
    return {
      horseId: horse._id,
      horseName: getHorseDisplayName(horse),
      summaryComplete: Boolean(current),
      latestWeight:
        current?.latestWeight ??
        stableAnalysis?.weightTrends.find((row) => row.horseId === horse._id) ??
        null,
      periodWeight:
        latest && first
          ? {
              firstDate: first.date,
              lastDate: latest.date,
              firstWeight: kilograms(first),
              lastWeight: kilograms(latest),
              unit: 'kg' as const,
              change:
                observations.length > 1
                  ? kilograms(latest) - kilograms(first)
                  : null,
              recordIds: observations.map((record) => record.id),
            }
          : null,
      training: {
        completedCount: completed.length,
        withDurationCount: withDuration.length,
        missingDurationCount: completed.length - withDuration.length,
        recordedMinutes: withDuration.length
          ? withDuration.reduce(
              (total, record) => total + record.details.durationMinutes!,
              0,
            )
          : null,
        recordIds: completed.map((record) => record._id),
      },
      currentCare: current
        ? {
            activeIssueCount: current.activeIssueCount,
            highIssueCount: current.highIssueCount,
            activeMedicationCount: current.activeMedicationCount,
            overdueReminderCount: current.overdueReminderCount,
          }
        : null,
    }
  })
}

function addDaysKey(dateKey: string, days: number) {
  const date = dateKeyToDate(dateKey)
  date.setDate(date.getDate() + days)

  return formatDateKey(date)
}

function isPlannedEvent(event: DashboardLabEvent) {
  return (event.status ?? 'planned') === 'planned'
}

function compareEventDateAndTimeAscending(
  a: DashboardLabEvent,
  b: DashboardLabEvent,
) {
  const dateSort = a.date.localeCompare(b.date)

  if (dateSort !== 0) return dateSort

  return a.time.localeCompare(b.time)
}

function compareEventDateAndTimeDescending(
  a: DashboardLabEvent,
  b: DashboardLabEvent,
) {
  const dateSort = b.date.localeCompare(a.date)

  if (dateSort !== 0) return dateSort

  return b.time.localeCompare(a.time)
}

function compareTimelineSignalDescending(
  a: LabTimelineSignal,
  b: LabTimelineSignal,
) {
  const dateSort = b.date.localeCompare(a.date)

  if (dateSort !== 0) return dateSort

  return a.title.localeCompare(b.title)
}
