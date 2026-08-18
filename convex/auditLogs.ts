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

    return await Promise.all(
      entries.map(async (entry) => {
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
