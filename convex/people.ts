import { v } from 'convex/values'
import type { Doc, Id } from './_generated/dataModel'
import { query } from './_generated/server'
import { getCurrentUser } from './libs/stablePermissions'
import { getHorseAccess } from './libs/horsePermissions'

/** Display-name suggestions only; choosing a name never grants account access. */
export const suggestNames = query({
  args: {
    stableId: v.optional(v.id('stables')),
    horseIds: v.optional(v.array(v.id('horses'))),
  },
  handler: async (ctx, { stableId, horseIds = [] }) => {
    const actor = await getCurrentUser(ctx)
    const people = new Map<
      Id<'users'>,
      { name: string; isCurrentUser: boolean }
    >()
    const add = (user: Doc<'users'> | null, displayName?: string) => {
      if (!user || user.deletedAt !== undefined || people.has(user._id)) return
      const name =
        displayName?.trim() ||
        user.preferredName?.trim() ||
        [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
      if (name)
        people.set(user._id, { name, isCurrentUser: user._id === actor._id })
    }
    add(
      actor,
      [actor.firstName, actor.lastName].filter(Boolean).join(' ').trim(),
    )

    const [owned, memberships] = await Promise.all([
      ctx.db
        .query('stables')
        .withIndex('by_owner_id', (q) => q.eq('ownerId', actor._id))
        .collect(),
      ctx.db
        .query('stableMembers')
        .withIndex('by_user_id', (q) => q.eq('userId', actor._id))
        .collect(),
    ])
    const stableIds = new Set([
      ...owned.map((stable) => stable._id),
      ...memberships
        .filter((member) => member.role === 'member')
        .map((member) => member.stableId),
    ])
    for (const id of stableId ? [stableId] : stableIds) {
      if (!stableIds.has(id)) continue
      const stable = await ctx.db.get(id)
      if (!stable || stable.archivedAt !== undefined) continue
      add(await ctx.db.get(stable.ownerId))
      const members = await ctx.db
        .query('stableMembers')
        .withIndex('by_stable_id', (q) => q.eq('stableId', id))
        .collect()
      for (const member of members) {
        if (member.role === 'member')
          add(await ctx.db.get(member.userId), member.displayNameOverride)
      }
    }

    for (const id of new Set(horseIds)) {
      const horse = await ctx.db.get(id)
      if (!horse || !(await getHorseAccess(ctx, horse, actor._id)).canRead)
        continue
      if (horse.ownerId) add(await ctx.db.get(horse.ownerId))
      const carers = await ctx.db
        .query('horseCarers')
        .withIndex('by_horse_id', (q) => q.eq('horseId', id))
        .collect()
      for (const carer of carers) add(await ctx.db.get(carer.userId))
    }

    return [...people.values()]
  },
})
