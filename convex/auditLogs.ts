import { recordCapabilities } from './libs/recordCapabilities'
import { v } from 'convex/values'

import { query } from './_generated/server'
import { assertCanManageStable } from './libs/stablePermissions'

export const listForStable = query({
  args: { stableId: v.id('stables') },
  handler: async (ctx, args) => {
    await assertCanManageStable(ctx, args.stableId)

    const entries = await ctx.db
      .query('stableAuditLogs')
      .withIndex('by_stable_id_created_at', (q) =>
        q.eq('stableId', args.stableId),
      )
      .order('desc')
      .take(100)

    const allowed = []
    for (const entry of entries) {
      const eventId = ctx.db.normalizeId('events', entry.entityId)
      const participationId = ctx.db.normalizeId('eventsHorses', entry.entityId)
      const participation = participationId
        ? await ctx.db.get(participationId)
        : null
      const event = eventId
        ? await ctx.db.get(eventId)
        : participation
          ? await ctx.db.get(participation.eventId)
          : null
      if (eventId || participationId) {
        if (!event) continue
        const rows = await ctx.db
          .query('eventsHorses')
          .withIndex('by_event_id', (q) => q.eq('eventId', event._id))
          .collect()
        let visible = rows.length > 0
        for (const row of rows) {
          const horse = await ctx.db.get(row.horseId)
          if (
            !horse ||
            !(
              await recordCapabilities(ctx, horse, {
                _id: event._id,
                date: event.date,
              })
            ).readDetails
          )
            visible = false
        }
        if (!visible) continue
      }
      allowed.push(entry)
    }
    return await Promise.all(
      allowed.map(async (entry) => {
        const actor = await ctx.db.get(entry.actorUserId)

        return {
          ...entry,
          actor: actor
            ? {
                _id: actor._id,
                firstName: actor.firstName,
                lastName: actor.lastName,
                preferredName: actor.preferredName,
              }
            : null,
        }
      }),
    )
  },
})
