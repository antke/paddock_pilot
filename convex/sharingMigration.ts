import { v } from 'convex/values'
import { internalMutation, internalQuery } from './_generated/server'
import { writeRecordShare } from './libs/recordSharing'

const tables = [
  'eventsHorses',
  'horseHealthIssues',
  'horseMedicationRecords',
  'horseWeightRecords',
  'horseNutritionLogs',
  'stableDocuments',
  'careReminders',
] as const
const tableValidator = v.union(...tables.map((table) => v.literal(table)))

/** Operator-run, resumable pages. Ambiguous provenance is withheld for owner review. */
export const backfillPage = internalMutation({
  args: { table: tableValidator, cursor: v.union(v.string(), v.null()) },
  handler: async (ctx, { table, cursor }) => {
    const page = await ctx.db.query(table).paginate({ cursor, numItems: 50 })
    let granted = 0,
      withheld = 0
    for (const record of page.page) {
      if (!record.horseId) continue
      if (
        table === 'eventsHorses' &&
        'status' in record &&
        record.status !== undefined &&
        record.status !== 'confirmed'
      ) {
        withheld++
        continue
      }
      const horse = await ctx.db.get(record.horseId)
      if (
        !horse ||
        horse.deletedAt !== undefined ||
        horse.transitionId ||
        !horse.stableId ||
        !horse.currentPlacementId ||
        record.sourcePlacementId !== horse.currentPlacementId
      ) {
        withheld++
        continue
      }
      const stable = await ctx.db.get(horse.stableId)
      if (!stable || stable.archivedAt !== undefined) {
        withheld++
        continue
      }
      const eventId =
        table === 'eventsHorses' && 'eventId' in record
          ? record.eventId
          : undefined
      const event = eventId ? await ctx.db.get(eventId) : null
      const originStable = event
        ? event.stableId
        : 'stableId' in record
          ? record.stableId
          : undefined
      if (originStable !== horse.stableId) {
        withheld++
        continue
      }
      const recordId = event?._id ?? record._id
      const existing = await ctx.db
        .query('recordShares')
        .withIndex('by_record_horse', (q) =>
          q.eq('recordId', recordId).eq('horseId', horse._id),
        )
        .collect()
      if (
        existing.some((share) => share.placementId === horse.currentPlacementId)
      )
        continue
      await writeRecordShare(ctx, {
        recordId,
        horseId: horse._id,
        stableId: horse.stableId,
        placementId: horse.currentPlacementId,
        createdBy: stable.ownerId,
        enabled: true,
      })
      granted++
    }
    return {
      cursor: page.continueCursor,
      isDone: page.isDone,
      granted,
      withheld,
    }
  },
})

/** Read-only recovery inventory: no snapshots or blobs are deleted by this migration. */
export const snapshotInventory = internalQuery({
  args: { cursor: v.union(v.string(), v.null()) },
  handler: async (ctx, { cursor }) => {
    const page = await ctx.db
      .query('horseSnapshots')
      .paginate({ cursor, numItems: 50 })
    const rows = []
    for (const snapshot of page.page) {
      let canonicalExists = false
      for (const table of tables) {
        const id = ctx.db.normalizeId(table, snapshot.sourceId)
        if (id && (await ctx.db.get(id))) canonicalExists = true
      }
      rows.push({
        id: snapshot._id,
        horseId: snapshot.horseId,
        sourceId: snapshot.sourceId,
        canonicalExists,
        hasAttachment: Boolean(snapshot.storageId),
        requiresRecovery: !canonicalExists,
      })
    }
    return { rows, cursor: page.continueCursor, isDone: page.isDone }
  },
})

/** Review aid only: similarity is never evidence that two user-created activities are duplicates. */
export const duplicateCandidatesForHorse = internalQuery({
  args: { horseId: v.id('horses') },
  handler: async (ctx, { horseId }) => {
    const rows = await ctx.db
      .query('eventsHorses')
      .withIndex('by_horse_id', (q) => q.eq('horseId', horseId))
      .collect()
    const groups = new Map<string, string[]>()
    for (const eventId of new Set(rows.map((row) => row.eventId))) {
      const event = await ctx.db.get(eventId)
      if (!event) continue
      const key = JSON.stringify([
        event.title,
        event.type,
        event.date,
        event.time,
      ])
      groups.set(key, [...(groups.get(key) ?? []), eventId])
    }
    return [...groups.values()]
      .filter((ids) => ids.length > 1)
      .map((eventIds) => ({ eventIds, action: 'manual-review-only' as const }))
  },
})
