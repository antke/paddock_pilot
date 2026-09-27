import type { Id } from 'convex/_generated/dataModel'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import type { HorseCareSummaryData } from '#/components/horses/HorseCareSummaryPage'
import type {
  HorseTimeline,
  TimelineEntry,
} from '#/components/horses/HorseTimelinePage'

export type HorseHistoryScenario = 'standard' | 'empty' | 'long' | 'missing'

export function createHorseHistorySummary(
  data: DashboardLabData,
  scenario: HorseHistoryScenario,
): HorseCareSummaryData {
  const originalHorse = data.horses[0]
  if (!originalHorse || scenario === 'missing')
    return { horse: null, hasAccess: true }
  const timestamp = Date.UTC(2026, 8, 18, 12)
  const horse =
    scenario === 'empty'
      ? {
          _id: originalHorse._id,
          _creationTime: originalHorse._creationTime,
          stableId: originalHorse.stableId,
          ownerId: originalHorse.ownerId,
          name: originalHorse.name,
          age: originalHorse.age,
        }
      : {
          ...originalHorse,
          name:
            scenario === 'long'
              ? 'Cedar Ridge Juniper with a Long Registered Competition Name'
              : originalHorse.name,
          passportNumber:
            scenario === 'long' ? 'GB1234567890'.repeat(8) : 'GB1234567890',
          emergencyNotes:
            scenario === 'long'
              ? 'Sample handover note: contact the named veterinarian before changing care. '.repeat(
                  12,
                )
              : 'Sample handover note: contact the named veterinarian before changing care.',
          allergies: ['Dusty hay'],
        }
  const common = {
    _creationTime: timestamp,
    horseId: horse._id,
    stableId: data.stable._id,
    createdBy: horse.ownerId,
    createdAt: timestamp,
  }
  const empty = scenario === 'empty'
  return {
    hasAccess: true,
    horse,
    stable: data.stable,
    activeHealthIssues: empty
      ? []
      : [
          {
            ...common,
            _id: 'lab-history-health' as Id<'horseHealthIssues'>,
            title: 'Right fore lameness',
            description:
              'Sample record: reassess with the provider after turnout.',
            status: 'active',
            severity: 'medium',
            notedAt: timestamp,
            updatedAt: timestamp,
          },
        ],
    activeMedicationRecords: empty
      ? []
      : [
          {
            ...common,
            _id: 'lab-history-medication' as Id<'horseMedicationRecords'>,
            medicationName: 'Sample prescribed medication',
            dosage: 'As recorded by the veterinarian',
            frequency: 'See prescription',
            startDate: '2026-09-17',
            prescribedBy: 'Dr. Halley Morse',
            reason: 'Sample follow-up record',
            notes: 'Illustrative data only; not treatment instructions.',
            status: 'active',
            updatedAt: timestamp,
          },
        ],
    recentWeightRecords: empty
      ? []
      : [
          {
            ...common,
            _id: 'lab-history-weight' as Id<'horseWeightRecords'>,
            weight: 548,
            unit: 'kg',
            measuredAt: timestamp - 2 * 86_400_000,
            bodyConditionScore: 5,
            notes: 'Weight recorded before the autumn feed review.',
          },
        ],
    recentNutritionLogs: empty
      ? []
      : [
          {
            ...common,
            _id: 'lab-history-nutrition' as Id<'horseNutritionLogs'>,
            changedAt: timestamp - 3 * 86_400_000,
            summary: 'Autumn feed review',
            feedingRoutineSnapshot:
              'Morning and evening feeds, according to the recorded plan.',
            recommendedSnapshot: ['Low-dust forage'],
            avoidSnapshot: ['Dusty hay'],
            notes: 'Sample nutrition handover.',
          },
        ],
    documents: empty
      ? []
      : [
          {
            ...common,
            _id: 'lab-history-document' as Id<'stableDocuments'>,
            type: 'passport',
            fileName:
              scenario === 'long'
                ? 'Juniper-passport-and-identification-records-'.repeat(6) +
                  '.pdf'
                : 'Juniper passport.pdf',
            contentType: 'application/pdf',
            size: 820000,
            notes: 'Sample document metadata; no file is downloaded here.',
          },
        ],
    recentEvents: empty
      ? []
      : data.events.slice(0, 3).map((event) => ({
          event,
          eventHorse: {
            _id: `lab-history-${event._id}` as Id<'eventsHorses'>,
            _creationTime: timestamp,
            eventId: event._id,
            horseId: horse._id,
            requestedServiceNotes: 'Check comfort after turnout.',
            completionNotes: 'Shared sample visit recorded.',
            costShare: 85.5,
          },
        })),
  }
}

export function createHorseHistoryTimeline(
  summary: HorseCareSummaryData,
  scenario: HorseHistoryScenario,
): HorseTimeline {
  if (!summary.horse) return { horse: null, entries: [] }
  const entries: Array<TimelineEntry> = [
    ...summary.recentEvents.map(({ event, eventHorse }) => ({
      id: event._id,
      kind: 'event' as const,
      occurredAt: new Date(`${event.date}T${event.time || '00:00'}`).getTime(),
      title: event.title,
      eventType: event.type,
      status: event.status ?? 'planned',
      description: event.description,
      providerName: event.providerName,
      notesAfterCompletion: event.notesAfterCompletion,
      requestedServiceNotes: eventHorse?.requestedServiceNotes,
      horseCompletionNotes: eventHorse?.completionNotes,
      costShare: eventHorse?.costShare,
      date: event.date,
      endDate: event.endDate,
      time: event.time,
    })),
    ...summary.activeHealthIssues.map((record) => ({
      id: record._id,
      kind: 'healthIssue' as const,
      occurredAt: record.notedAt,
      title: record.title,
      status: record.status,
      severity: record.severity,
      description: record.description,
      resolvedAt: record.resolvedAt,
    })),
    ...summary.activeMedicationRecords.map((record) => ({
      ...record,
      id: record._id,
      kind: 'medicationRecord' as const,
      frequency: record.frequency,
      endDate: record.endDate,
      prescribedBy: record.prescribedBy,
      reason: record.reason,
      notes: record.notes,
      occurredAt: new Date(record.startDate).getTime(),
    })),
    ...summary.recentNutritionLogs.map((record) => ({
      ...record,
      id: record._id,
      kind: 'nutritionLog' as const,
      feedingRoutineSnapshot: record.feedingRoutineSnapshot,
      recommendedSnapshot: record.recommendedSnapshot,
      avoidSnapshot: record.avoidSnapshot,
      notes: record.notes,
      occurredAt: record.changedAt,
    })),
    ...summary.recentWeightRecords.map((record) => ({
      ...record,
      id: record._id,
      kind: 'weightRecord' as const,
      bodyConditionScore: record.bodyConditionScore,
      notes: record.notes,
      occurredAt: record.measuredAt,
    })),
  ]
  const records =
    scenario === 'long'
      ? Array.from({ length: 80 }, (_, index) => {
          const entry = entries[index % entries.length]
          return duplicateEntry(entry, index)
        })
      : entries
  return {
    horse: summary.horse,
    entries: records.sort((a, b) => b.occurredAt - a.occurredAt),
  }
}

function duplicateEntry<T extends TimelineEntry>(entry: T, index: number): T {
  return {
    ...entry,
    id: `${entry.id}-${index}` as T['id'],
    occurredAt: entry.occurredAt - index * 86_400_000,
  }
}
