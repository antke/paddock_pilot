import { v } from 'convex/values'
import type { Doc } from './_generated/dataModel'
import { query } from './_generated/server'
import { hasPersonalPro } from './libs/entitlements'
import { assertCanViewStable } from './libs/stablePermissions'

const isEvent = (event: Doc<'events'> | null): event is Doc<'events'> => event !== null

const isConfirmedEventHorse = (row: Doc<'eventsHorses'>) =>
  row.status === undefined || row.status === 'confirmed'

const byEventDateDesc = (a: Doc<'events'>, b: Doc<'events'>) => {
  const dateSort = b.date.localeCompare(a.date)

  if (dateSort !== 0) return dateSort

  return b.time.localeCompare(a.time)
}

export const getForHorse = query({
  args: { horseId: v.id('horses') },
  handler: async (ctx, args) => {
    const horse = await ctx.db.get(args.horseId)
    if (!horse) return { horse: null, hasAccess: true as const }

    const access = await assertCanViewStable(ctx, horse.stableId)
    const hasAccess = await hasPersonalPro(ctx, access.userId)

    if (!hasAccess) {
      return {
        hasAccess: false as const,
        requiredPlan: 'personal_pro' as const,
        stable: access.stable,
        horse,
      }
    }

    const [
      healthIssues,
      medicationRecords,
      weightRecords,
      nutritionLogs,
      documents,
      eventRows,
    ] = await Promise.all([
        ctx.db
          .query('horseHealthIssues')
          .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
          .collect(),
        ctx.db
          .query('horseMedicationRecords')
          .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
          .collect(),
        ctx.db
          .query('horseWeightRecords')
          .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
          .collect(),
        ctx.db
          .query('horseNutritionLogs')
          .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
          .collect(),
        ctx.db
          .query('stableDocuments')
          .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
          .collect(),
        ctx.db
          .query('eventsHorses')
          .withIndex('by_horse_id', (q) => q.eq('horseId', horse._id))
          .collect(),
      ])
    const confirmedEventRows = eventRows.filter(isConfirmedEventHorse)
    const events = await Promise.all(
      confirmedEventRows.map((row) => ctx.db.get(row.eventId)),
    )
    const recentEvents = events
      .filter(isEvent)
      .sort(byEventDateDesc)
      .slice(0, 12)
      .map((event) => ({
        event,
        eventHorse:
          confirmedEventRows.find((row) => row.eventId === event._id) ?? null,
      }))

    return {
      hasAccess: true as const,
      stable: access.stable,
      horse,
      activeHealthIssues: healthIssues
        .filter((issue) => issue.status === 'active')
        .sort((a, b) => b.notedAt - a.notedAt),
      activeMedicationRecords: medicationRecords
        .filter((record) => record.status === 'active')
        .sort((a, b) => b.startDate.localeCompare(a.startDate)),
      recentWeightRecords: weightRecords
        .sort((a, b) => b.measuredAt - a.measuredAt)
        .slice(0, 6),
      recentNutritionLogs: nutritionLogs
        .sort((a, b) => b.changedAt - a.changedAt)
        .slice(0, 6),
      documents: documents.sort((a, b) => b.createdAt - a.createdAt),
      recentEvents,
    }
  },
})
