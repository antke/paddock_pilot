import { ConvexError, v } from 'convex/values'
import { eventHorseDetailsInputSchema } from '../shared/events/eventHorseDetailsSchema'
import { mutation, query } from './_generated/server'
import {
  getHorseAccess,
  assertCanEditHorseRecord,
  auditHorse,
} from './libs/horsePermissions'
import { eventReadAccess, visibleEvent } from './libs/eventPermissions'

export const listForEvent = query({
  args: { eventId: v.id('events') },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId)
    if (!event) return { event: null, rows: [] }
    const access = await eventReadAccess(ctx, event)
    const rows = await ctx.db
      .query('eventsHorses')
      .withIndex('by_event_id', (q) => q.eq('eventId', eventId))
      .collect()
    const result = []
    for (const row of rows) {
      const horse = await ctx.db.get(row.horseId)
      if (!horse) continue
      const horseAccess = await getHorseAccess(ctx, horse, access.userId)
      if (!horseAccess.canRead) continue
      const editable =
        !horse.transitionId &&
        (horseAccess.canEditPersonalRecords ||
          (horseAccess.isAdmin &&
            event.stableId === horse.stableId &&
            row.sourcePlacementId === horse.currentPlacementId))
      result.push({
        horse,
        eventHorse: row,
        canManage:
          editable && row.status !== 'declined' && row.status !== 'withdrawn',
        canWithdraw:
          editable &&
          !row.participationEndsAt &&
          (row.status === undefined || row.status === 'confirmed'),
      })
    }
    return {
      event: await visibleEvent(ctx, event),
      rows: result.sort((a, b) => a.horse.name.localeCompare(b.horse.name)),
    }
  },
})
export const update = mutation({
  args: {
    id: v.id('eventsHorses'),
    requestedServiceNotes: v.optional(v.string()),
    completionNotes: v.optional(v.string()),
    costShare: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...details }) => {
    const input = eventHorseDetailsInputSchema.safeParse(details)
    if (!input.success)
      throw new ConvexError(input.error.issues[0]?.message ?? 'Invalid details')
    const row = await ctx.db.get(id)
    if (!row) throw new ConvexError('Participation not found')
    const event = await ctx.db.get(row.eventId)
    if (!event) throw new ConvexError('Event not found')
    if (row.status === 'declined' || row.status === 'withdrawn')
      throw new ConvexError('Inactive horse participation cannot be updated')
    const horse = await ctx.db.get(row.horseId)
    if (!horse) throw new ConvexError('Horse not found')
    const access = await assertCanEditHorseRecord(ctx, horse, {
      stableId: event.stableId,
      sourcePlacementId: row.sourcePlacementId,
    })
    await auditHorse(
      ctx,
      row.horseId,
      access.userId,
      'event.details.updated',
      JSON.stringify(row),
    )
    await ctx.db.patch(id, { ...input.data, updatedAt: Date.now() })
  },
})
