import { attendanceDetail } from './libs/eventAttendees'
import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getCurrentUser } from './libs/stablePermissions'
import {
  projectActivityShare,
  writeActivityCalendars,
} from './libs/activitySharing'
import { hasSharedSchedule } from './libs/recordSharing'
import { getHorseAccess } from './libs/horsePermissions'

export const detail = query({
  args: { eventId: v.id('events'), stableId: v.optional(v.id('stables')) },
  handler: async (ctx, { eventId, stableId }) => {
    const user = await getCurrentUser(ctx)
    const shares = await ctx.db
      .query('activityCalendarShares')
      .withIndex('by_event', (q) => q.eq('eventId', eventId))
      .collect()
    let result = null
    for (const share of shares) {
      if (stableId && share.stableId !== stableId) continue
      const projected = await projectActivityShare(ctx, share, user._id)
      if (projected?.readDetails) return projected
      if (projected) result = projected
    }
    return (
      result ??
      (!stableId ? await attendanceDetail(ctx, eventId, user._id) : null)
    )
  },
})

export const choices = query({
  args: { eventId: v.id('events') },
  handler: async (ctx, { eventId }) => {
    const user = await getCurrentUser(ctx)
    const event = await ctx.db.get(eventId)
    if (!event || !event.horseIds.length) return null
    for (const id of event.horseIds) {
      const horse = await ctx.db.get(id)
      const access = horse ? await getHorseAccess(ctx, horse, user._id) : null
      if (!access?.canEditPersonalRecords || access.isCustodian) return null
    }
    const rows = await ctx.db
      .query('activityCalendarShares')
      .withIndex('by_event', (q) => q.eq('eventId', eventId))
      .collect()
    // Legacy origin sharing is managed by the existing per-horse controls.
    return {
      stableIds: rows.map((row) => row.stableId),
      originStableId: event.stableId,
      originShared: event.stableId
        ? (
            await Promise.all(
              event.horseIds.map(async (id) => {
                const horse = await ctx.db.get(id)
                return Boolean(
                  horse &&
                  (await hasSharedSchedule(
                    ctx,
                    eventId,
                    horse,
                    event.stableId!,
                  )),
                )
              }),
            )
          ).every(Boolean)
        : false,
    }
  },
})

export const setCalendars = mutation({
  args: { eventId: v.id('events'), stableIds: v.array(v.id('stables')) },
  handler: async (ctx, { eventId, stableIds }) => {
    const user = await getCurrentUser(ctx)
    const event = await ctx.db.get(eventId)
    if (!event) throw new ConvexError('Activity not found')
    await writeActivityCalendars(ctx, event, stableIds, user._id)
  },
})
