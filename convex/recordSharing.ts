import { projectActivityShare } from './libs/activitySharing'
import { recordCapabilities } from './libs/recordCapabilities'
import { createEventOccurrences } from '../shared/events/eventOccurrences'
import { ConvexError, v } from 'convex/values'
import type { Id } from './_generated/dataModel'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { mutation, query } from './_generated/server'
import { getHorseAccess } from './libs/horsePermissions'
import {
  isRecordShared,
  writeRecordShare,
  hasSharedSchedule,
} from './libs/recordSharing'

const recordTables = [
  'events',
  'horseHealthIssues',
  'horseMedicationRecords',
  'horseWeightRecords',
  'horseNutritionLogs',
  'stableDocuments',
  'careReminders',
] as const
async function resolve(
  ctx: MutationCtx | QueryCtx,
  horseId: Id<'horses'>,
  recordId: string,
  readOnly = false,
  occurrenceDate?: string,
) {
  const horse = await ctx.db.get(horseId)
  if (!horse || horse.deletedAt !== undefined)
    throw new ConvexError('Horse not found')
  const access = await getHorseAccess(ctx, horse)
  if (
    !access.isOwner &&
    !access.carerRole &&
    !access.isCustodian &&
    (!readOnly ||
      !(
        await recordCapabilities(ctx, horse, {
          _id: recordId,
          date: occurrenceDate,
        })
      ).readSchedule)
  )
    throw new ConvexError(
      'Only personal horse access permits sharing management',
    )
  if (recordId !== horseId) {
    let found = false
    for (const table of recordTables) {
      const id = ctx.db.normalizeId(table, recordId)
      if (!id) continue
      const record = await ctx.db.get(id)
      if (!record) break
      if ('horseIds' in record) {
        const rows = await ctx.db
          .query('eventsHorses')
          .withIndex('by_event_id', (q) => q.eq('eventId', record._id))
          .collect()
        found =
          record.horseIds.includes(horseId) ||
          rows.some((row) => row.horseId === horseId)
      } else found = record.horseId === horseId
      break
    }
    if (!found) throw new ConvexError('Record does not belong to this horse')
  }
  return { horse, access }
}

export const audience = query({
  args: {
    horseId: v.id('horses'),
    recordId: v.string(),
    occurrenceDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { horse, access } = await resolve(
      ctx,
      args.horseId,
      args.recordId,
      true,
      args.occurrenceDate,
    )
    const eventId = ctx.db.normalizeId('events', args.recordId)
    const activityCalendars = []
    if (eventId) {
      const shares = await ctx.db
        .query('activityCalendarShares')
        .withIndex('by_event', (q) => q.eq('eventId', eventId))
        .collect()
      for (const share of shares) {
        const projected = await projectActivityShare(ctx, share, access.userId)
        if (!projected?.horses.some((item) => item._id === horse._id)) continue
        const stable = await ctx.db.get(share.stableId)
        if (stable)
          activityCalendars.push({ _id: stable._id, name: stable.name })
      }
    }
    return {
      activityCalendars,
      stable: access.stable
        ? { _id: access.stable._id, name: access.stable.name }
        : null,
      shared: horse.stableId
        ? await isRecordShared(
            ctx,
            args.recordId,
            horse,
            horse.stableId,
            args.occurrenceDate,
          )
        : false,
      canManage: access.canEditPersonalRecords && !access.isCustodian,
    }
  },
})

export const set = mutation({
  args: {
    horseId: v.id('horses'),
    recordId: v.string(),
    enabled: v.boolean(),
    occurrenceDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { horse, access } = await resolve(ctx, args.horseId, args.recordId)
    if (!access.canEditPersonalRecords || access.isCustodian)
      throw new ConvexError('Not authorized to change sharing')
    if (!horse.stableId || !horse.currentPlacementId)
      throw new ConvexError('Horse has no current stable placement')
    if (args.occurrenceDate) {
      const eventId = ctx.db.normalizeId('events', args.recordId)
      const event = eventId ? await ctx.db.get(eventId) : null
      if (
        !event ||
        !createEventOccurrences({
          events: [event],
          windowStart: args.occurrenceDate,
          windowEnd: args.occurrenceDate,
        }).some((item) => item.startDate === args.occurrenceDate)
      )
        throw new ConvexError('Choose an occurrence of this activity')
    }
    if (!args.enabled && !args.occurrenceDate) {
      const rules = await ctx.db
        .query('recordShares')
        .withIndex('by_record_horse', (q) =>
          q.eq('recordId', args.recordId).eq('horseId', horse._id),
        )
        .collect()
      for (const rule of rules) {
        if (
          rule.placementId === horse.currentPlacementId &&
          rule.occurrenceDate
        )
          await ctx.db.patch(rule._id, {
            enabled: false,
            updatedAt: Date.now(),
          })
      }
    }
    await writeRecordShare(ctx, {
      recordId: args.recordId,
      horseId: horse._id,
      stableId: horse.stableId,
      placementId: horse.currentPlacementId,
      enabled: args.enabled,
      occurrenceDate: args.occurrenceDate,
      createdBy: access.userId,
    })
  },
})

export const creationAudience = query({
  args: { horseIds: v.array(v.id('horses')) },
  handler: async (ctx, { horseIds }) => {
    const result = []
    for (const id of new Set(horseIds)) {
      const horse = await ctx.db.get(id)
      if (!horse) continue
      const access = await getHorseAccess(ctx, horse)
      if (!access.canAddRecords) continue
      if (access.stable)
        result.push({
          horseId: id,
          stableId: access.stable._id,
          stableName: access.stable.name,
          fixed: !access.canEditPersonalRecords || access.isCustodian,
        })
    }
    return result
  },
})

export const listForHorse = query({
  args: { horseId: v.id('horses') },
  handler: async (ctx, { horseId }) => {
    const horse = await ctx.db.get(horseId)
    if (!horse) return null
    const access = await getHorseAccess(ctx, horse)
    if (!access.isOwner && !access.carerRole) return null
    const records: Array<{
      id: string
      title: string
      kind: string
      shared: boolean
      recurring: boolean
      group: boolean
    }> = []
    const seen = new Set<string>()
    for (const table of recordTables) {
      if (table === 'events') {
        const rows = await ctx.db
          .query('eventsHorses')
          .withIndex('by_horse_id', (q) => q.eq('horseId', horseId))
          .collect()
        for (const row of rows) {
          if (seen.has(row.eventId)) continue
          seen.add(row.eventId)
          const event = await ctx.db.get(row.eventId)
          if (!event) continue
          records.push({
            id: event._id,
            title: event.title,
            kind: event.type === 'training' ? 'training' : 'events',
            recurring: Boolean(event.recurrence),
            group: event.horseIds.length > 1,
            shared: horse.stableId
              ? await hasSharedSchedule(ctx, event._id, horse, horse.stableId)
              : false,
          })
        }
        continue
      }
      const rows =
        table === 'careReminders'
          ? await ctx.db
              .query(table)
              .withIndex('by_horse_id_due_date', (q) =>
                q.eq('horseId', horseId),
              )
              .collect()
          : await ctx.db
              .query(table)
              .withIndex('by_horse_id', (q) => q.eq('horseId', horseId))
              .collect()
      for (const row of rows)
        records.push({
          id: row._id,
          title:
            'title' in row
              ? row.title
              : 'fileName' in row
                ? row.fileName
                : 'medicationName' in row
                  ? row.medicationName
                  : 'summary' in row
                    ? row.summary
                    : `${'weight' in row ? row.weight : ''} ${'unit' in row ? row.unit : ''}`,
          kind: table,
          recurring: false,
          group: false,
          shared: horse.stableId
            ? await isRecordShared(ctx, row._id, horse, horse.stableId)
            : false,
        })
    }
    records.unshift({
      id: horse._id,
      title: horse.name,
      kind: 'profile',
      recurring: false,
      group: false,
      shared: horse.stableId
        ? await isRecordShared(ctx, horse._id, horse, horse.stableId)
        : false,
    })
    return {
      stable: access.stable,
      canManage: access.canEditPersonalRecords,
      records,
    }
  },
})
