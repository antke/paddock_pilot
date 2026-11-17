import { recordCapabilities, visibleHorse } from './libs/recordCapabilities'
import { getHorseDisplayName } from '../shared/horses/horseDisplayName'
import { ConvexError, v } from 'convex/values'
import { eventHorseDetailsInputSchema } from '../shared/events/eventHorseDetailsSchema'
import { mutation, query } from './_generated/server'
import {
  assertCanEditHorseRecord,
  auditHorse,
  getHorseAccess,
} from './libs/horsePermissions'
import {
  eventReadAccess,
  isEventOrganizer,
  visibleEvent,
} from './libs/eventPermissions'
import { getCurrentUser } from './libs/stablePermissions'

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
      const capabilities = await recordCapabilities(
        ctx,
        horse,
        { _id: event._id },
        access.userId,
      )
      const organizes = access.organizer && !row.participationEndsAt
      if (!capabilities.readDetails && !organizes) continue
      const horseAccess = await getHorseAccess(ctx, horse, access.userId)
      result.push({
        horse: await visibleHorse(ctx, horse),
        eventHorse: row,
        canManage: capabilities.editContent || organizes,
        // Mirrors withdrawHorseFromEvent: the horse's owner/editor or its current stable admin.
        canWithdraw:
          !row.participationEndsAt &&
          !horse.transitionId &&
          (row.status === undefined || row.status === 'confirmed') &&
          (horseAccess.canEditPersonalRecords ||
            (horseAccess.isAdmin &&
              horse.currentPlacementId === row.sourcePlacementId)),
      })
    }
    return {
      event: await visibleEvent(ctx, event),
      rows: result.sort((a, b) =>
        getHorseDisplayName(a.horse).localeCompare(
          getHorseDisplayName(b.horse),
        ),
      ),
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
    const horse = await ctx.db.get(row.horseId)
    if (!horse) throw new ConvexError('Horse not found')
    const user = await getCurrentUser(ctx)
    if (
      !(
        !row.participationEndsAt &&
        (await isEventOrganizer(ctx, event, user._id))
      )
    )
      await assertCanEditHorseRecord(ctx, horse, {
        _id: event._id,
        stableId: event.stableId,
        sourcePlacementId: row.sourcePlacementId,
      })
    await auditHorse(
      ctx,
      row.horseId,
      user._id,
      'event.details.updated',
      JSON.stringify(row),
    )
    await ctx.db.patch(id, {
      requestedServiceNotes: input.data.requestedServiceNotes,
      completionNotes: input.data.completionNotes,
      costShare: input.data.costShare,
      updatedAt: Date.now(),
    })
  },
})
