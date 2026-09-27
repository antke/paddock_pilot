import type { Id } from 'convex/_generated/dataModel'
import type { FunctionReturnType } from 'convex/server'
import type { api } from 'convex/_generated/api'
import { daysOfWeek } from 'shared/events/eventSchema'
import { createDashboardLabData } from '#/components/dashboard-lab/dashboardLabData'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import type {
  DashboardLabData,
  DashboardLabEvent,
  DashboardLabOverview,
} from '#/components/dashboard-lab/dashboardLabTypes'
import {
  dateKeyToDate,
  dateKeyToTimestamp,
  formatDateKey,
} from '#/lib/dateDisplay'

export type DashboardSampleState =
  'routine' | 'schedule' | 'attention' | 'crowded' | 'empty'
type UnlockedAnalysis = Extract<
  FunctionReturnType<typeof api.stableAnalysis.getForStable>,
  { hasAccess: true }
>

function dateOffset(today: string, offset: number) {
  const date = dateKeyToDate(today)
  date.setDate(date.getDate() + offset)
  return formatDateKey(date)
}

/** Explicit illustrative records, never a substitute for authenticated query evidence. */
export function createDashboardAuditSample(
  base: DashboardLabData,
  state: DashboardSampleState,
  today: string,
): DashboardLabData {
  if (state === 'routine')
    return createDashboardLabData({ ...base, todayKey: today })
  const template = createDashboardLabFixtureData()
  const count =
    state === 'empty'
      ? 0
      : state === 'crowded'
        ? 50
        : state === 'attention'
          ? 9
          : 3
  const horses = Array.from({ length: count }, (_, index) => ({
    ...template.horses[index % template.horses.length],
    _id: `sample-dashboard-horse-${index}` as Id<'horses'>,
    stableId: base.stable._id,
    name:
      state === 'crowded'
        ? `Sample horse ${index + 1} — Cedar Ridge long registered name`
        : index === 5
          ? 'Sample urgent horse outside first five'
          : `Sample horse ${index + 1}`,
  }))
  const event = (
    id: string,
    title: string,
    offset: number,
    extra: Partial<DashboardLabEvent> = {},
  ): DashboardLabEvent => ({
    ...template.events[0],
    _id: `sample-dashboard-${id}` as Id<'events'>,
    stableId: base.stable._id,
    title,
    date: dateOffset(today, offset),
    time: '09:00',
    horseIds: horses.slice(0, 2).map((horse) => horse._id),
    type: 'training',
    status: 'planned',
    endDate: undefined,
    recurrence: undefined,
    description: 'Fictional event for interface review.',
    ...extra,
  })
  const events =
    state === 'empty' || state === 'attention'
      ? []
      : [
          event('weekly', 'Sample weekly schooling', -7, {
            recurrence: {
              frequency: 'weekly',
              interval: 1,
              daysOfWeek: [daysOfWeek[dateKeyToDate(today).getDay()]],
            },
          }),
          event('multiday', 'Sample clinic spanning today', -1, {
            endDate: dateOffset(today, 1),
          }),
          event('completed', 'Sample completed visit', 0, {
            status: 'completed',
            type: 'vet',
          }),
          event('cancelled', 'Sample cancelled lesson', 0, {
            status: 'cancelled',
          }),
          event('next', 'Sample dental check', 2, {
            type: 'dentist',
            time: '11:30',
          }),
          ...(state === 'crowded'
            ? Array.from({ length: 24 }, (_, i) =>
                event(
                  `dense-${i}`,
                  `Sample appointment ${i + 1} — long provider and follow-up title`,
                  (i % 8) - 4,
                  {
                    time: `${String(8 + (i % 10)).padStart(2, '0')}:30`,
                    type: i % 2 ? 'hoof_trimming' : 'massage',
                    status: i % 3 ? 'planned' : 'completed',
                  },
                ),
              )
            : []),
        ]
  const attentionHorses: DashboardLabOverview['attentionHorses'] = (
    state === 'attention'
      ? [horses[5], horses[8]]
      : state === 'crowded'
        ? horses.slice(0, 10)
        : []
  ).map((horse) => ({
    horseId: horse._id,
    horseName: horse.name,
    ownerName: horse.ownerName,
    breed: horse.breed,
    profileImageUrl: horse.profileImageUrl,
    stableId: base.stable._id,
    stableName: base.stable.name,
    activeIssueCount: 1,
    highIssueCount: 1,
    activeMedicationCount: 0,
    overdueReminderCount: 0,
  }))
  const dueReminders: DashboardLabOverview['dueReminders'] =
    state === 'crowded'
      ? Array.from({ length: 8 }, (_, i) => ({
          id: `sample-dashboard-reminder-${i}` as Id<'careReminders'>,
          stableId: base.stable._id,
          stableName: base.stable.name,
          horseId: horses[i]._id,
          horseName: horses[i].name,
          title: `Sample overdue follow-up ${i + 1}`,
          dueDate: dateOffset(today, -1),
          category: 'vet',
          priority: 'medium',
          overdue: true,
        }))
      : []
  const upcomingEvents = events
    .filter((item) => item.status === 'planned' && item.date >= today)
    .map((item) => ({
      id: item._id,
      stableId: item.stableId,
      stableName: base.stable.name,
      title: item.title,
      date: item.date,
      time: item.time,
      type: item.type,
      horseCount: item.horseIds.length,
    }))
  const summary = {
    stableCount: 1,
    horseCount: horses.length,
    upcomingEventCount: upcomingEvents.length,
    dueReminderCount: state === 'crowded' ? 12 : 0,
    overdueReminderCount: state === 'crowded' ? 12 : 0,
    highSeverityIssueCount: attentionHorses.length,
    activeMedicationCount: 0,
  }
  const overview: DashboardLabOverview = {
    summary,
    dueReminders,
    upcomingEvents,
    attentionHorses,
    stableSummaries: [
      {
        ...summary,
        stableId: base.stable._id,
        stableName: base.stable.name,
        location: base.stable.location,
      },
    ],
  }
  return createDashboardLabData({
    stable: base.stable,
    stables: [base.stable],
    horses,
    events,
    overview,
    todayKey: today,
  })
}

export function createAnalysisAuditSample(
  data: DashboardLabData,
  today: string,
  empty = false,
): UnlockedAnalysis {
  const horse = data.horses[0]
  const timestamp = dateKeyToTimestamp(today)
  const timelineSignals: UnlockedAnalysis['timelineSignals'] =
    empty || !horse
      ? []
      : Array.from({ length: 15 }, (_, i) => {
          const kind = (
            ['health', 'medication', 'nutrition', 'weight', 'reminder'] as const
          )[i % 5]
          return {
            id: `sample-analysis-signal-${i}`,
            kind,
            date: i < 10 ? today : dateOffset(today, -3),
            title: `Sample ${kind} record ${i + 1}`,
            horseId: horse._id,
            horseName: horse.name,
            detail:
              'Illustrative record for interface review, not care advice.',
            urgent: kind === 'health' || kind === 'reminder',
            severity: kind === 'health' ? 'high' : undefined,
            priority: kind === 'reminder' ? 'high' : undefined,
            status: kind === 'reminder' ? 'pending' : 'active',
          }
        })
  const completed = data.events.filter((event) => event.status === 'completed')
  const planned = data.events.filter((event) => event.status === 'planned')
  const notesNeeded = completed.filter((event) => !event.notesAfterCompletion)
  const completionCoverage = {
    completedEventCount: completed.length,
    eventsWithNotesCount: completed.length - notesNeeded.length,
    eventNoteCoveragePercent: completed.length
      ? Math.round(
          ((completed.length - notesNeeded.length) / completed.length) * 100,
        )
      : 100,
    completedHorseOutcomeCount: 0,
    horseOutcomesWithNotesCount: 0,
    horseOutcomeCoveragePercent: 100,
  }
  const healthCount = timelineSignals.filter(
    (signal) => signal.kind === 'health',
  ).length
  return {
    hasAccess: true,
    stable: data.stable,
    today,
    summary: {
      horseCount: data.horses.length,
      activeHealthIssueCount: healthCount,
      resolvedHealthIssueCount: 0,
      activeMedicationCount: timelineSignals.filter(
        (signal) => signal.kind === 'medication',
      ).length,
      completedMedicationCount: 0,
      nutritionLogCount: timelineSignals.filter(
        (signal) => signal.kind === 'nutrition',
      ).length,
      plannedEventCount: planned.length,
      completedEventCount: completed.length,
      cancelledEventCount: data.events.filter(
        (event) => event.status === 'cancelled',
      ).length,
      completedThisMonthCount: completed.filter((event) =>
        event.date.startsWith(today.slice(0, 7)),
      ).length,
      horsesWithNutritionCount: horse ? 1 : 0,
      profileGapCount: 0,
      completionNotesNeededCount: notesNeeded.length,
      horseOutcomeNotesNeededCount: 0,
      providerDetailsMissingCount: 0,
      weightRecordCount: timelineSignals.filter(
        (signal) => signal.kind === 'weight',
      ).length,
      horsesWithWeightRecordsCount: horse ? 1 : 0,
      overdueCareCadenceCount: horse ? 1 : 0,
      nutritionSignalCount: horse ? 1 : 0,
      eventNoteCoveragePercent: completionCoverage.eventNoteCoveragePercent,
      horseOutcomeCoveragePercent: 100,
      pendingReminderCount: timelineSignals.filter(
        (signal) => signal.kind === 'reminder',
      ).length,
      overdueReminderCount: 0,
    },
    timelineSignals,
    completionCoverage,
    eventTypeCounts: [...new Set(data.events.map((event) => event.type))].map(
      (type) => ({
        type,
        count: data.events.filter((event) => event.type === type).length,
      }),
    ),
    reminderCategoryCounts: [],
    upcomingReminders: [],
    weightTrends:
      horse && !empty
        ? [
            {
              horseId: horse._id,
              horseName: horse.name,
              latestWeight: 510,
              previousWeight: 505,
              unit: 'kg',
              measuredAt: timestamp,
              weightChange: 5,
              latestBodyConditionScore: 5,
              previousBodyConditionScore: 5,
              bodyConditionChange: 0,
            },
          ]
        : [],
    healthIssueFrequency:
      horse && !empty
        ? [
            {
              horseId: horse._id,
              horseName: horse.name,
              totalCount: healthCount,
              activeCount: healthCount,
              resolvedCount: 0,
              latestIssueTitle: 'Sample health record',
              latestNotedAt: timestamp,
            },
          ]
        : [],
    careCadence:
      horse && !empty
        ? [
            {
              horseId: horse._id,
              horseName: horse.name,
              type: 'hoof_trimming',
              expectedDays: 56,
              lastCompletedDate: dateOffset(today, -60),
              nextPlannedDate: undefined,
              daysSinceLast: 60,
              daysUntilNext: undefined,
              overdue: true,
            },
          ]
        : [],
    nutritionSignals:
      horse && !empty
        ? [
            {
              id: 'sample-nutrition-correlation' as Id<'horseNutritionLogs'>,
              horseId: horse._id,
              horseName: horse.name,
              changedAt: timestamp,
              summary: 'Sample nutrition review',
              nearbyWeightCount: 2,
              nearbyHealthIssueCount: 1,
            },
          ]
        : [],
    horsesNeedingAttention:
      horse && !empty
        ? [
            {
              horseId: horse._id,
              horseName: horse.name,
              ownerName: horse.ownerName,
              breed: horse.breed,
              profileImageUrl: horse.profileImageUrl,
              activeIssueCount: healthCount,
              activeMedicationCount: 3,
              missingProfileFields: [],
            },
          ]
        : [],
    upcomingEvents: planned.filter((event) => event.date >= today).slice(0, 8),
    completionNotesNeeded: notesNeeded.slice(0, 8),
    horseOutcomeNotesNeeded: [],
    providerDetailsMissing: [],
  }
}
