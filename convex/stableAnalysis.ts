import { v } from 'convex/values'
import type { Doc, Id } from './_generated/dataModel'
import { query } from './_generated/server'
import { hasPersonalPro } from './libs/entitlements'
import { assertCanViewStable } from './libs/stablePermissions'
import {
  addDaysToDateKey,
  resolveTodayDateKey,
  timestampToDateKey,
} from './libs/dateKeys'
import {
  hasActiveHorse,
  isActiveHorse,
  withActiveEventHorseIds,
} from './libs/horseState'

const fourteenDaysInMs = 14 * 24 * 60 * 60 * 1000
const oneDayInMs = 24 * 60 * 60 * 1000

const careCadenceDays: Record<Doc<'events'>['type'], number> = {
  vet: 365,
  training: 30,
  dentist: 365,
  hoof_trimming: 56,
  massage: 90,
  other: 90,
}

const compareEventDateAndTime = (a: Doc<'events'>, b: Doc<'events'>) => {
  const dateSort = a.date.localeCompare(b.date)

  if (dateSort !== 0) return dateSort

  return a.time.localeCompare(b.time)
}

const hasNutritionDetails = (horse: Doc<'horses'>) => {
  return Boolean(
    horse.feedingRoutine ||
    horse.nutritionNotes ||
    horse.nutritionRecommended?.length ||
    horse.nutritionAvoid?.length,
  )
}

const getMissingProfileFields = (horse: Doc<'horses'>) => {
  const missingFields: Array<string> = []

  if (!horse.dateOfBirth) missingFields.push('date of birth')
  if (!horse.passportNumber) missingFields.push('passport number')
  if (!horse.microchipNumber) missingFields.push('microchip number')
  if (!horse.insuranceProvider || !horse.insurancePolicyNumber) {
    missingFields.push('insurance details')
  }
  if (!horse.vetName && !horse.vetPhone) missingFields.push('vet contact')
  if (!horse.farrierName && !horse.farrierPhone)
    missingFields.push('farrier contact')
  if (!horse.emergencyNotes) missingFields.push('emergency notes')
  if (!hasNutritionDetails(horse)) missingFields.push('nutrition notes')

  return missingFields
}

const countEventsByType = (events: Array<Doc<'events'>>) => {
  const counts = new Map<Doc<'events'>['type'], number>()

  for (const event of events) {
    counts.set(event.type, (counts.get(event.type) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
}

const sortByDateDesc = (a: string, b: string) => b.localeCompare(a)

type StableTimelineSignalKind =
  | 'health'
  | 'medication'
  | 'nutrition'
  | 'weight'
  | 'reminder'

type StableTimelineSignal = {
  id: string
  kind: StableTimelineSignalKind
  date: string
  title: string
  horseId?: Id<'horses'>
  horseName?: string
  detail?: string
  status?: string
  severity?: Doc<'horseHealthIssues'>['severity']
  priority?: Doc<'careReminders'>['priority']
  urgent: boolean
}

const joinDetails = (details: Array<string | undefined>) => {
  return details
    .filter((detail): detail is string => Boolean(detail))
    .join(' · ')
}

const compareStableTimelineSignals = (
  a: StableTimelineSignal,
  b: StableTimelineSignal,
) => {
  const dateSort = a.date.localeCompare(b.date)

  if (dateSort !== 0) return dateSort

  return a.title.localeCompare(b.title)
}

const isConfirmedEventHorse = (row: Doc<'eventsHorses'>) => {
  return row.status === undefined || row.status === 'confirmed'
}

const getStableTimelineSignals = ({
  horses,
  healthIssues,
  medicationRecords,
  nutritionLogs,
  weightRecords,
  careReminders,
  today,
  timezoneOffsetMinutes,
}: {
  horses: Array<Doc<'horses'>>
  healthIssues: Array<Doc<'horseHealthIssues'>>
  medicationRecords: Array<Doc<'horseMedicationRecords'>>
  nutritionLogs: Array<Doc<'horseNutritionLogs'>>
  weightRecords: Array<Doc<'horseWeightRecords'>>
  careReminders: Array<Doc<'careReminders'>>
  today: string
  timezoneOffsetMinutes: number
}): Array<StableTimelineSignal> => {
  const horsesById = new Map(horses.map((horse) => [horse._id, horse]))

  return [
    ...healthIssues.map((issue): StableTimelineSignal => {
      const horse = horsesById.get(issue.horseId)
      const severity = issue.severity ?? 'medium'

      return {
        id: issue._id,
        kind: 'health',
        date: timestampToDateKey(issue.notedAt, timezoneOffsetMinutes),
        title: issue.title,
        horseId: issue.horseId,
        horseName: horse?.name,
        detail: joinDetails([`${severity} severity`, issue.status]),
        status: issue.status,
        severity,
        urgent: issue.status === 'active' && severity === 'high',
      }
    }),
    ...medicationRecords.map((record): StableTimelineSignal => {
      const horse = horsesById.get(record.horseId)

      return {
        id: record._id,
        kind: 'medication',
        date: record.startDate,
        title: record.medicationName,
        horseId: record.horseId,
        horseName: horse?.name,
        detail: joinDetails([record.status, record.dosage, record.frequency]),
        status: record.status,
        urgent: false,
      }
    }),
    ...nutritionLogs.map((log): StableTimelineSignal => {
      const horse = horsesById.get(log.horseId)

      return {
        id: log._id,
        kind: 'nutrition',
        date: timestampToDateKey(log.changedAt, timezoneOffsetMinutes),
        title: log.summary,
        horseId: log.horseId,
        horseName: horse?.name,
        detail: 'Nutrition change',
        urgent: false,
      }
    }),
    ...weightRecords.map((record): StableTimelineSignal => {
      const horse = horsesById.get(record.horseId)
      const bodyCondition =
        record.bodyConditionScore !== undefined
          ? `BCS ${record.bodyConditionScore}`
          : undefined

      return {
        id: record._id,
        kind: 'weight',
        date: timestampToDateKey(record.measuredAt, timezoneOffsetMinutes),
        title: `${record.weight} ${record.unit}`,
        horseId: record.horseId,
        horseName: horse?.name,
        detail: joinDetails(['Weight record', bodyCondition]),
        urgent: false,
      }
    }),
    ...careReminders.map((reminder): StableTimelineSignal => {
      const horse = reminder.horseId
        ? horsesById.get(reminder.horseId)
        : undefined
      const priority = reminder.priority ?? 'medium'

      return {
        id: reminder._id,
        kind: 'reminder',
        date: reminder.dueDate,
        title: reminder.title,
        horseId: reminder.horseId,
        horseName: horse?.name,
        detail: joinDetails([`${priority} priority`, reminder.status]),
        status: reminder.status,
        priority,
        urgent:
          reminder.status === 'pending' &&
          (priority === 'high' || reminder.dueDate < today),
      }
    }),
  ].sort(compareStableTimelineSignals)
}

const getWeightTrends = (
  horses: Array<Doc<'horses'>>,
  weightRecords: Array<Doc<'horseWeightRecords'>>,
) => {
  return horses
    .map((horse) => {
      const records = weightRecords
        .filter((record) => record.horseId === horse._id)
        .sort((a, b) => b.measuredAt - a.measuredAt)
      const latest = records[0]

      if (!latest) return null

      const previous = records.find(
        (record) => record.unit === latest.unit && record._id !== latest._id,
      )

      return {
        horseId: horse._id,
        horseName: horse.name,
        latestWeight: latest.weight,
        previousWeight: previous?.weight,
        unit: latest.unit,
        measuredAt: latest.measuredAt,
        weightChange: previous ? latest.weight - previous.weight : undefined,
        latestBodyConditionScore: latest.bodyConditionScore,
        previousBodyConditionScore: previous?.bodyConditionScore,
        bodyConditionChange:
          latest.bodyConditionScore !== undefined &&
          previous?.bodyConditionScore !== undefined
            ? latest.bodyConditionScore - previous.bodyConditionScore
            : undefined,
      }
    })
    .filter((trend): trend is NonNullable<typeof trend> => trend !== null)
    .sort((a, b) => b.measuredAt - a.measuredAt)
}

const getHealthIssueFrequency = (
  horses: Array<Doc<'horses'>>,
  healthIssues: Array<Doc<'horseHealthIssues'>>,
) => {
  return horses
    .map((horse) => {
      const horseIssues = healthIssues.filter(
        (issue) => issue.horseId === horse._id,
      )
      const activeCount = horseIssues.filter(
        (issue) => issue.status === 'active',
      ).length
      const resolvedCount = horseIssues.filter(
        (issue) => issue.status === 'resolved',
      ).length
      const latestIssue = horseIssues.sort((a, b) => b.notedAt - a.notedAt)[0]

      return {
        horseId: horse._id,
        horseName: horse.name,
        totalCount: horseIssues.length,
        activeCount,
        resolvedCount,
        latestIssueTitle: latestIssue?.title,
        latestNotedAt: latestIssue?.notedAt,
      }
    })
    .filter((item) => item.totalCount > 0)
    .sort((a, b) => {
      if (a.totalCount !== b.totalCount) return b.totalCount - a.totalCount
      return (b.latestNotedAt ?? 0) - (a.latestNotedAt ?? 0)
    })
}

const getCareCadence = (
  horses: Array<Doc<'horses'>>,
  events: Array<Doc<'events'>>,
  eventHorseRows: Array<Doc<'eventsHorses'>>,
  today: string,
) => {
  const eventById = new Map(events.map((event) => [event._id, event]))
  const horseEvents = new Map<string, Array<Doc<'events'>>>()

  for (const row of eventHorseRows) {
    if (!isConfirmedEventHorse(row)) continue

    const event = eventById.get(row.eventId)

    if (!event) continue

    const existing = horseEvents.get(row.horseId) ?? []
    existing.push(event)
    horseEvents.set(row.horseId, existing)
  }

  return horses
    .flatMap((horse) => {
      const eventsForHorse = horseEvents.get(horse._id) ?? []

      return Object.entries(careCadenceDays).map(([type, expectedDays]) => {
        const typedEvents = eventsForHorse.filter(
          (event) => event.type === type,
        )
        const lastCompleted = typedEvents
          .filter(
            (event) => event.status === 'completed' && event.date <= today,
          )
          .sort((a, b) => sortByDateDesc(a.date, b.date))[0]
        const nextPlanned = typedEvents
          .filter(
            (event) =>
              (event.status ?? 'planned') === 'planned' && event.date >= today,
          )
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
        const overdue =
          daysSinceLast !== undefined &&
          daysSinceLast > expectedDays &&
          !nextPlanned

        return {
          horseId: horse._id,
          horseName: horse.name,
          type: type as Doc<'events'>['type'],
          expectedDays,
          lastCompletedDate: lastCompleted?.date,
          nextPlannedDate: nextPlanned?.date,
          daysSinceLast,
          daysUntilNext,
          overdue,
        }
      })
    })
    .filter(
      (item) =>
        item.overdue ||
        item.nextPlannedDate !== undefined ||
        item.lastCompletedDate !== undefined,
    )
    .sort((a, b) => {
      if (a.overdue !== b.overdue) return a.overdue ? -1 : 1
      return (b.daysSinceLast ?? -1) - (a.daysSinceLast ?? -1)
    })
}

const getNutritionSignals = (
  horses: Array<Doc<'horses'>>,
  nutritionLogs: Array<Doc<'horseNutritionLogs'>>,
  weightRecords: Array<Doc<'horseWeightRecords'>>,
  healthIssues: Array<Doc<'horseHealthIssues'>>,
) => {
  const horsesById = new Map(horses.map((horse) => [horse._id, horse]))

  return nutritionLogs
    .flatMap((log) => {
      const horse = horsesById.get(log.horseId)
      const nearbyWeights = weightRecords.filter(
        (record) =>
          record.horseId === log.horseId &&
          Math.abs(record.measuredAt - log.changedAt) <= fourteenDaysInMs,
      )
      const nearbyIssues = healthIssues.filter(
        (issue) =>
          issue.horseId === log.horseId &&
          Math.abs(issue.notedAt - log.changedAt) <= fourteenDaysInMs,
      )

      if (!horse || (nearbyWeights.length === 0 && nearbyIssues.length === 0))
        return []

      return [
        {
          id: log._id,
          horseId: horse._id,
          horseName: horse.name,
          changedAt: log.changedAt,
          summary: log.summary,
          nearbyWeightCount: nearbyWeights.length,
          nearbyHealthIssueCount: nearbyIssues.length,
        },
      ]
    })
    .sort((a, b) => b.changedAt - a.changedAt)
}

const getCompletionCoverage = (
  completedEvents: Array<Doc<'events'>>,
  eventHorseRows: Array<Doc<'eventsHorses'>>,
) => {
  const completedEventIds = new Set(completedEvents.map((event) => event._id))
  const completedHorseRows = eventHorseRows.filter(
    (row) => completedEventIds.has(row.eventId) && isConfirmedEventHorse(row),
  )
  const eventsWithNotes = completedEvents.filter(
    (event) => event.notesAfterCompletion,
  ).length
  const horseRowsWithNotes = completedHorseRows.filter(
    (row) => row.completionNotes,
  ).length

  return {
    completedEventCount: completedEvents.length,
    eventsWithNotesCount: eventsWithNotes,
    eventNoteCoveragePercent:
      completedEvents.length > 0
        ? Math.round((eventsWithNotes / completedEvents.length) * 100)
        : 100,
    completedHorseOutcomeCount: completedHorseRows.length,
    horseOutcomesWithNotesCount: horseRowsWithNotes,
    horseOutcomeCoveragePercent:
      completedHorseRows.length > 0
        ? Math.round((horseRowsWithNotes / completedHorseRows.length) * 100)
        : 100,
  }
}

const countRemindersByCategory = (reminders: Array<Doc<'careReminders'>>) => {
  const counts = new Map<Doc<'careReminders'>['category'], number>()

  for (const reminder of reminders) {
    counts.set(reminder.category, (counts.get(reminder.category) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
}

const countHealthIssuesByHorse = (
  horses: Array<Doc<'horses'>>,
  issues: Array<Doc<'horseHealthIssues'>>,
  medicationRecords: Array<Doc<'horseMedicationRecords'>>,
  profileImageUrls: Map<Id<'horses'>, string | undefined>,
) => {
  const activeIssueCounts = new Map<string, number>()
  const activeMedicationCounts = new Map<string, number>()

  for (const issue of issues) {
    if (issue.status !== 'active') continue

    activeIssueCounts.set(
      issue.horseId,
      (activeIssueCounts.get(issue.horseId) ?? 0) + 1,
    )
  }

  for (const record of medicationRecords) {
    if (record.status !== 'active') continue

    activeMedicationCounts.set(
      record.horseId,
      (activeMedicationCounts.get(record.horseId) ?? 0) + 1,
    )
  }

  return horses
    .map((horse) => ({
      horseId: horse._id,
      horseName: horse.name,
      ownerName: horse.ownerName,
      breed: horse.breed,
      profileImageUrl: profileImageUrls.get(horse._id),
      activeIssueCount: activeIssueCounts.get(horse._id) ?? 0,
      activeMedicationCount: activeMedicationCounts.get(horse._id) ?? 0,
      missingProfileFields: getMissingProfileFields(horse),
    }))
    .filter(
      (horse) =>
        horse.activeIssueCount > 0 ||
        horse.activeMedicationCount > 0 ||
        horse.missingProfileFields.length > 0,
    )
    .sort((a, b) => {
      if (a.activeIssueCount !== b.activeIssueCount) {
        return b.activeIssueCount - a.activeIssueCount
      }

      if (a.activeMedicationCount !== b.activeMedicationCount) {
        return b.activeMedicationCount - a.activeMedicationCount
      }

      return b.missingProfileFields.length - a.missingProfileFields.length
    })
}

export const getForStable = query({
  args: {
    stableId: v.id('stables'),
    today: v.optional(v.string()),
    timezoneOffsetMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const access = await assertCanViewStable(ctx, args.stableId)
    const hasAccess = await hasPersonalPro(ctx, access.userId)

    if (!hasAccess) {
      return {
        hasAccess: false as const,
        requiredPlan: 'personal_pro' as const,
        stable: access.stable,
      }
    }

    const [
      allHorses,
      allEvents,
      allHealthIssues,
      allMedicationRecords,
      allNutritionLogs,
      allWeightRecords,
      allCareReminders,
    ] = await Promise.all([
      ctx.db
        .query('horses')
        .withIndex('by_stable_id', (q) => q.eq('stableId', args.stableId))
        .collect(),
      ctx.db
        .query('events')
        .withIndex('by_stable_id_date', (q) => q.eq('stableId', args.stableId))
        .collect(),
      ctx.db
        .query('horseHealthIssues')
        .withIndex('by_stable_id', (q) => q.eq('stableId', args.stableId))
        .collect(),
      ctx.db
        .query('horseMedicationRecords')
        .withIndex('by_stable_id', (q) => q.eq('stableId', args.stableId))
        .collect(),
      ctx.db
        .query('horseNutritionLogs')
        .withIndex('by_stable_id', (q) => q.eq('stableId', args.stableId))
        .collect(),
      ctx.db
        .query('horseWeightRecords')
        .withIndex('by_stable_id', (q) => q.eq('stableId', args.stableId))
        .collect(),
      ctx.db
        .query('careReminders')
        .withIndex('by_stable_id_due_date', (q) =>
          q.eq('stableId', args.stableId),
        )
        .collect(),
    ])
    const horses = allHorses.filter(isActiveHorse)
    const activeHorseIds = new Set(horses.map((horse) => horse._id))
    const events = allEvents
      .filter((event) => hasActiveHorse(event, activeHorseIds))
      .map((event) => withActiveEventHorseIds(event, activeHorseIds))
    const healthIssues = allHealthIssues.filter((issue) =>
      activeHorseIds.has(issue.horseId),
    )
    const medicationRecords = allMedicationRecords.filter((record) =>
      activeHorseIds.has(record.horseId),
    )
    const nutritionLogs = allNutritionLogs.filter((log) =>
      activeHorseIds.has(log.horseId),
    )
    const weightRecords = allWeightRecords.filter((record) =>
      activeHorseIds.has(record.horseId),
    )
    const careReminders = allCareReminders.filter(
      (reminder) => !reminder.horseId || activeHorseIds.has(reminder.horseId),
    )
    const eventHorseRows = await Promise.all(
      events.map((event) =>
        ctx.db
          .query('eventsHorses')
          .withIndex('by_event_id', (q) => q.eq('eventId', event._id))
          .collect()
          .then((rows) =>
            rows.filter((row) => activeHorseIds.has(row.horseId)),
          ),
      ),
    )
    const eventsById = new Map(events.map((event) => [event._id, event]))
    const horsesById = new Map(horses.map((horse) => [horse._id, horse]))
    const horseProfileImageUrls = new Map(
      await Promise.all(
        horses.map(
          async (horse) =>
            [
              horse._id,
              horse.profileImageId
                ? ((await ctx.storage.getUrl(horse.profileImageId)) ??
                  undefined)
                : undefined,
            ] as const,
        ),
      ),
    )

    const today = resolveTodayDateKey(args.today)
    const nextThirtyDays = addDaysToDateKey(today, 30)
    const currentMonth = today.slice(0, 7)
    const activeHealthIssues = healthIssues.filter(
      (issue) => issue.status === 'active',
    )
    const resolvedHealthIssues = healthIssues.filter(
      (issue) => issue.status === 'resolved',
    )
    const plannedEvents = events.filter(
      (event) => (event.status ?? 'planned') === 'planned',
    )
    const completedEvents = events.filter(
      (event) => event.status === 'completed',
    )
    const cancelledEvents = events.filter(
      (event) => event.status === 'cancelled',
    )
    const upcomingEvents = plannedEvents
      .filter((event) => event.date >= today && event.date <= nextThirtyDays)
      .sort(compareEventDateAndTime)
      .slice(0, 8)
    const completedThisMonth = completedEvents.filter((event) =>
      event.date.startsWith(currentMonth),
    )
    const completionNotesNeeded = completedEvents.filter(
      (event) => !event.notesAfterCompletion,
    )
    const horseOutcomeNotesNeeded = eventHorseRows
      .flat()
      .filter((row) => {
        const event = eventsById.get(row.eventId)

        return (
          event?.status === 'completed' &&
          (row.status === undefined || row.status === 'confirmed') &&
          !row.completionNotes
        )
      })
      .map((row) => {
        const event = eventsById.get(row.eventId)
        const horse = horsesById.get(row.horseId)

        return {
          id: row._id,
          eventId: row.eventId,
          eventTitle: event?.title ?? 'Unknown event',
          eventDate: event?.date ?? '',
          horseId: row.horseId,
          horseName: horse?.name ?? 'Unknown horse',
        }
      })
    const providerDetailsMissing = events.filter(
      (event) => !event.providerName && !event.providerPhone,
    )
    const activeMedicationRecords = medicationRecords.filter(
      (record) => record.status === 'active',
    )
    const completedMedicationRecords = medicationRecords.filter(
      (record) => record.status === 'completed',
    )
    const horsesWithNutrition = horses.filter(hasNutritionDetails)
    const horsesNeedingAttention = countHealthIssuesByHorse(
      horses,
      healthIssues,
      medicationRecords,
      horseProfileImageUrls,
    )
    const flattenedEventHorseRows = eventHorseRows.flat()
    const weightTrends = getWeightTrends(horses, weightRecords)
    const healthIssueFrequency = getHealthIssueFrequency(horses, healthIssues)
    const careCadence = getCareCadence(
      horses,
      events,
      flattenedEventHorseRows,
      today,
    )
    const nutritionSignals = getNutritionSignals(
      horses,
      nutritionLogs,
      weightRecords,
      healthIssues,
    )
    const completionCoverage = getCompletionCoverage(
      completedEvents,
      flattenedEventHorseRows,
    )
    const pendingReminders = careReminders.filter(
      (reminder) => reminder.status === 'pending',
    )
    const timelineSignals = getStableTimelineSignals({
      horses,
      healthIssues,
      medicationRecords,
      nutritionLogs,
      weightRecords,
      careReminders,
      today,
      timezoneOffsetMinutes: args.timezoneOffsetMinutes ?? 0,
    })
    const overdueReminders = pendingReminders.filter(
      (reminder) => reminder.dueDate < today,
    )
    const upcomingReminders = pendingReminders
      .filter((reminder) => reminder.dueDate >= today)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 8)

    return {
      hasAccess: true as const,
      stable: access.stable,
      summary: {
        horseCount: horses.length,
        activeHealthIssueCount: activeHealthIssues.length,
        resolvedHealthIssueCount: resolvedHealthIssues.length,
        activeMedicationCount: activeMedicationRecords.length,
        completedMedicationCount: completedMedicationRecords.length,
        nutritionLogCount: nutritionLogs.length,
        plannedEventCount: plannedEvents.length,
        completedEventCount: completedEvents.length,
        cancelledEventCount: cancelledEvents.length,
        completedThisMonthCount: completedThisMonth.length,
        horsesWithNutritionCount: horsesWithNutrition.length,
        profileGapCount: horsesNeedingAttention.reduce(
          (count, horse) => count + horse.missingProfileFields.length,
          0,
        ),
        completionNotesNeededCount: completionNotesNeeded.length,
        horseOutcomeNotesNeededCount: horseOutcomeNotesNeeded.length,
        providerDetailsMissingCount: providerDetailsMissing.length,
        weightRecordCount: weightRecords.length,
        horsesWithWeightRecordsCount: weightTrends.length,
        overdueCareCadenceCount: careCadence.filter((item) => item.overdue)
          .length,
        nutritionSignalCount: nutritionSignals.length,
        eventNoteCoveragePercent: completionCoverage.eventNoteCoveragePercent,
        horseOutcomeCoveragePercent:
          completionCoverage.horseOutcomeCoveragePercent,
        pendingReminderCount: pendingReminders.length,
        overdueReminderCount: overdueReminders.length,
      },
      timelineSignals,
      eventTypeCounts: countEventsByType(events),
      reminderCategoryCounts: countRemindersByCategory(pendingReminders),
      upcomingReminders: upcomingReminders.map((reminder) => ({
        id: reminder._id,
        horseId: reminder.horseId,
        horseName: reminder.horseId
          ? horsesById.get(reminder.horseId)?.name
          : undefined,
        title: reminder.title,
        dueDate: reminder.dueDate,
        category: reminder.category,
        priority: reminder.priority,
      })),
      weightTrends: weightTrends.slice(0, 8),
      healthIssueFrequency: healthIssueFrequency.slice(0, 8),
      careCadence: careCadence.slice(0, 10),
      nutritionSignals: nutritionSignals.slice(0, 8),
      completionCoverage,
      horsesNeedingAttention: horsesNeedingAttention.slice(0, 8),
      upcomingEvents,
      completionNotesNeeded: completionNotesNeeded
        .sort(compareEventDateAndTime)
        .slice(0, 8),
      horseOutcomeNotesNeeded: horseOutcomeNotesNeeded
        .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
        .slice(0, 8),
      providerDetailsMissing: providerDetailsMissing
        .sort(compareEventDateAndTime)
        .slice(0, 8),
    }
  },
})
