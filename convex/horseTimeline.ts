import { v } from 'convex/values'
import type { Doc } from './_generated/dataModel'
import { query } from './_generated/server'
import { assertCanViewStable } from './libs/stablePermissions'

const isEvent = (event: Doc<'events'> | null): event is Doc<'events'> => event !== null

const isConfirmedEventHorse = (eventHorse: Doc<'eventsHorses'>) => {
  return eventHorse.status === undefined || eventHorse.status === 'confirmed'
}

const eventTimestamp = (event: Doc<'events'>) => {
  const timestamp = new Date(`${event.date}T${event.time || '00:00'}`).getTime()

  return Number.isNaN(timestamp)
    ? new Date(`${event.date}T00:00:00`).getTime()
    : timestamp
}

export const listForHorse = query({
  args: { horseId: v.id('horses') },
  handler: async (ctx, args) => {
    const horse = await ctx.db.get(args.horseId)
    if (!horse) return { horse: null, entries: [] }

    await assertCanViewStable(ctx, horse.stableId)

    const [
      eventHorses,
      healthIssues,
      weightRecords,
      medicationRecords,
      nutritionLogs,
    ] = await Promise.all([
      ctx.db
        .query('eventsHorses')
        .withIndex('by_horse_id', (q) => q.eq('horseId', args.horseId))
        .take(250),
      ctx.db
        .query('horseHealthIssues')
        .withIndex('by_horse_id', (q) => q.eq('horseId', args.horseId))
        .collect(),
      ctx.db
        .query('horseWeightRecords')
        .withIndex('by_horse_id', (q) => q.eq('horseId', args.horseId))
        .collect(),
      ctx.db
        .query('horseMedicationRecords')
        .withIndex('by_horse_id', (q) => q.eq('horseId', args.horseId))
        .collect(),
      ctx.db
        .query('horseNutritionLogs')
        .withIndex('by_horse_id', (q) => q.eq('horseId', args.horseId))
        .collect(),
    ])

    const confirmedEventHorses = eventHorses.filter(isConfirmedEventHorse)
    const events = await Promise.all(
      confirmedEventHorses.map((eventHorse) => ctx.db.get(eventHorse.eventId)),
    )

    const eventEntries = confirmedEventHorses
      .map((eventHorse, index) => {
        const event = events[index]
        if (!isEvent(event)) return null

        return {
          id: event._id,
          kind: 'event' as const,
          occurredAt: eventTimestamp(event),
          title: event.title,
          eventType: event.type,
          status: event.status ?? 'planned',
          description: event.description,
          providerName: event.providerName,
          notesAfterCompletion: event.notesAfterCompletion,
          requestedServiceNotes: eventHorse.requestedServiceNotes,
          horseCompletionNotes: eventHorse.completionNotes,
          costShare: eventHorse.costShare,
          date: event.date,
          time: event.time,
        }
      })
      .filter((entry) => entry !== null)

    const healthIssueEntries = healthIssues.map((issue) => ({
      id: issue._id,
      kind: 'healthIssue' as const,
      occurredAt: issue.notedAt,
      title: issue.title,
      status: issue.status,
      severity: issue.severity,
      description: issue.description,
      resolvedAt: issue.resolvedAt,
    }))

    const weightEntries = weightRecords.map((record) => ({
      id: record._id,
      kind: 'weightRecord' as const,
      occurredAt: record.measuredAt,
      weight: record.weight,
      unit: record.unit,
      bodyConditionScore: record.bodyConditionScore,
      notes: record.notes,
    }))

    const medicationEntries = medicationRecords.map((record) => ({
      id: record._id,
      kind: 'medicationRecord' as const,
      occurredAt: new Date(`${record.startDate}T00:00:00`).getTime(),
      medicationName: record.medicationName,
      dosage: record.dosage,
      frequency: record.frequency,
      startDate: record.startDate,
      endDate: record.endDate,
      prescribedBy: record.prescribedBy,
      reason: record.reason,
      notes: record.notes,
      status: record.status,
    }))

    const nutritionEntries = nutritionLogs.map((log) => ({
      id: log._id,
      kind: 'nutritionLog' as const,
      occurredAt: log.changedAt,
      summary: log.summary,
      feedingRoutineSnapshot: log.feedingRoutineSnapshot,
      recommendedSnapshot: log.recommendedSnapshot,
      avoidSnapshot: log.avoidSnapshot,
      notes: log.notes,
    }))

    const entries = [
      ...eventEntries,
      ...healthIssueEntries,
      ...weightEntries,
      ...medicationEntries,
      ...nutritionEntries,
    ].sort((a, b) => b.occurredAt - a.occurredAt)

    return { horse, entries }
  },
})
