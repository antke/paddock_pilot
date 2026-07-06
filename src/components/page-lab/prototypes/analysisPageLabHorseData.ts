import type {
  DashboardLabData,
  DashboardLabEvent,
  DashboardLabHorse,
  DashboardLabReminder,
} from '#/components/dashboard-lab/dashboardLabTypes'
import { formatDateKey } from '#/components/stables/stableDashboardDates'
import type { api } from 'convex/_generated/api'
import type { FunctionReturnType } from 'convex/server'
import type {
  LabAnalysis,
  LabAttentionHorse,
  LabTimelineSignal,
} from './analysisPageLabData'

type StableAnalysis = FunctionReturnType<typeof api.stableAnalysis.getForStable>

export type LabUnlockedStableAnalysis = Extract<
  StableAnalysis,
  { hasAccess: true }
>
export type LabHorseWeightTrend = LabUnlockedStableAnalysis['weightTrends'][number]
export type LabHorseHealthFrequency =
  LabUnlockedStableAnalysis['healthIssueFrequency'][number]
export type LabHorseNutritionSignal =
  LabUnlockedStableAnalysis['nutritionSignals'][number]
export type LabHorseCareCadence = LabUnlockedStableAnalysis['careCadence'][number]
export type LabHorseOutcomeGap =
  LabUnlockedStableAnalysis['horseOutcomeNotesNeeded'][number]

export type LabHorseDeepDive = {
  attention: LabAttentionHorse | null
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

export function createHorseLabAnalysis({
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
  const today = formatDateKey(new Date())
  const nextThirtyDays = addDaysKey(today, 30)
  const horseEvents = data.events.filter((event) => event.horseIds.includes(horse._id))
  const upcomingEvents = horseEvents
    .filter(
      (event) =>
        isPlannedEvent(event) &&
        event.date >= today &&
        event.date <= nextThirtyDays,
    )
    .sort(compareEventDateAndTimeAscending)
    .slice(0, 6)
  const completionNotesNeeded = horseEvents
    .filter((event) => event.status === 'completed' && !event.notesAfterCompletion)
    .sort(compareEventDateAndTimeDescending)
    .slice(0, 6)
  const dueReminders = data.dueReminders
    .filter((reminder) => reminder.horseId === horse._id)
    .slice(0, 6)
  const horseSignals = timelineSignals
    .filter((signal) => signal.horseId === horse._id)
    .sort(compareTimelineSignalDescending)
  const healthSignals = horseSignals
    .filter((signal) => signal.kind === 'health')
    .slice(0, 6)
  const medicationSignals = horseSignals
    .filter((signal) => signal.kind === 'medication')
    .slice(0, 6)
  const nutritionTimelineSignals = horseSignals
    .filter((signal) => signal.kind === 'nutrition')
    .slice(0, 6)
  const weightSignals = horseSignals
    .filter((signal) => signal.kind === 'weight')
    .slice(0, 6)
  const reminderSignals = horseSignals
    .filter((signal) => signal.kind === 'reminder')
    .slice(0, 6)
  const attention =
    analysis.horsesNeedingAttention.find((item) => item.horseId === horse._id) ??
    null
  const healthFrequency =
    stableAnalysis?.healthIssueFrequency.find(
      (item) => item.horseId === horse._id,
    ) ?? null
  const horseOutcomeNotesNeeded =
    stableAnalysis?.horseOutcomeNotesNeeded
      .filter((item) => item.horseId === horse._id)
      .sort((a, b) => b.eventDate.localeCompare(a.eventDate))
      .slice(0, 6) ?? []

  return {
    attention,
    summary: {
      activeIssueCount:
        attention?.activeIssueCount ?? healthFrequency?.activeCount ?? 0,
      highIssueCount: attention?.highIssueCount ?? 0,
      activeMedicationCount: attention?.activeMedicationCount ?? 0,
      overdueReminderCount: attention?.overdueReminderCount ?? 0,
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
      stableAnalysis?.weightTrends.find((trend) => trend.horseId === horse._id) ??
      null,
    healthFrequency,
    nutritionSignals:
      stableAnalysis?.nutritionSignals
        .filter((signal) => signal.horseId === horse._id)
        .slice(0, 6) ?? [],
    careCadence:
      stableAnalysis?.careCadence
        .filter((item) => item.horseId === horse._id)
        .slice(0, 6) ?? [],
    horseOutcomeNotesNeeded,
  }
}

function addDaysKey(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T00:00:00`)
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
