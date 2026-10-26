import { ConvexError, v } from 'convex/values'
import { query, mutation } from './_generated/server'
import type { Id } from './_generated/dataModel'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { getUserFromIdentity, getInvitationEmails } from './libs/auth'
import { accessibleHorses, getHorseAccess } from './libs/horsePermissions'
import { eventReadAccess, sharedEventsForStable } from './libs/eventPermissions'
import { getHorseDisplayName } from '../shared/horses/horseDisplayName'

type Item = {
  key: string
  kind: string
  name: string
  context?: string
  href?: string
  createdAt: number
  actionRequired: boolean
  eventHorseId?: Id<'eventsHorses'>
  eventDate?: string
  eventTime?: string
}

// One account-wide inbox. Workspace selection must not hide an invitation.
async function inbox(ctx: QueryCtx | MutationCtx) {
  const user = await getUserFromIdentity(ctx)
  if (!user) return []
  const items: Item[] = []
  const emails = await getInvitationEmails(ctx, user)
  for (const email of emails) {
    const horses = await ctx.db
      .query('horseInvitations')
      .withIndex('by_email', (q) => q.eq('email', email))
      .collect()
    for (const invite of horses) {
      if (invite.status !== 'pending' || invite.expiresAt <= Date.now())
        continue
      const horse = await ctx.db.get(invite.horseId)
      if (
        !horse ||
        horse.deletedAt !== undefined ||
        horse.transitionId ||
        horse.ownerId !== invite.expectedOwnerId ||
        horse.currentPlacementId !== invite.expectedPlacementId
      )
        continue
      items.push({
        key: invite._id,
        kind: `horse_${invite.kind}`,
        name: getHorseDisplayName(horse),
        context: invite.role,
        href: `/horse-invitations/${invite.token}`,
        createdAt: invite.createdAt,
        actionRequired: true,
      })
    }
    const stables = await ctx.db
      .query('stableInvitations')
      .withIndex('by_email_status', (q) =>
        q.eq('email', email).eq('status', 'pending'),
      )
      .collect()
    for (const invite of stables) {
      if (invite.role !== 'member' || invite.expiresAt <= Date.now()) continue
      const stable = await ctx.db.get(invite.stableId)
      if (!stable || stable.archivedAt !== undefined) continue
      items.push({
        key: invite._id,
        kind: 'stable_invitation',
        name: stable.name,
        href: `/invitations/${invite.token}`,
        createdAt: invite.createdAt,
        actionRequired: true,
      })
    }
  }
  const ownedStables = await ctx.db
    .query('stables')
    .withIndex('by_owner_id', (q) => q.eq('ownerId', user._id))
    .collect()
  const horses = await accessibleHorses(ctx, user._id)
  for (const stable of ownedStables.filter((s) => s.archivedAt === undefined)) {
    horses.push(
      ...(await ctx.db
        .query('horses')
        .withIndex('by_stable_id', (q) => q.eq('stableId', stable._id))
        .collect()),
    )
  }
  for (const horse of new Map(horses.map((h) => [h._id, h])).values()) {
    if (
      horse.deletedAt !== undefined ||
      horse.transitionId ||
      !(await getHorseAccess(ctx, horse, user._id)).canAddRecords
    )
      continue
    const rows = await ctx.db
      .query('eventsHorses')
      .withIndex('by_horse_id_status', (q) =>
        q.eq('horseId', horse._id).eq('status', 'invited'),
      )
      .collect()
    for (const row of rows) {
      if (
        row.status !== 'invited' ||
        row.participationEndsAt !== undefined ||
        horse.currentPlacementId !== row.sourcePlacementId
      )
        continue
      const event = await ctx.db.get(row.eventId)
      if (!event || event.stableId !== horse.stableId) continue
      items.push({
        key: row._id,
        kind: 'event_invitation',
        eventHorseId: row._id,
        eventDate: event.date,
        eventTime: event.time,
        name: event.title,
        context: getHorseDisplayName(horse),
        href: `/events/${event._id}`,
        createdAt: row._creationTime,
        actionRequired: true,
      })
    }
  }
  const notices = await ctx.db
    .query('notifications')
    .withIndex('by_user', (q) => q.eq('userId', user._id))
    .order('desc')
    .take(100)
  const stableEventIds = new Map<string, Set<string>>()
  for (const notice of notices) {
    let name = notice.stableName ?? ''
    let href: string | undefined
    if (notice.eventId) {
      const event = await ctx.db.get(notice.eventId)
      if (!event) continue
      try {
        await eventReadAccess(ctx, event)
      } catch {
        continue
      }
      name = event.title
      href = `/events/${event._id}`
      if (event.stableId) {
        if (!stableEventIds.has(event.stableId)) {
          let shared = new Set<string>()
          try {
            shared = new Set(
              (await sharedEventsForStable(ctx, event.stableId)).map(
                (entry) => entry._id,
              ),
            )
          } catch {
            // Personal horse access can outlive stable membership.
          }
          stableEventIds.set(event.stableId, shared)
        }
        if (stableEventIds.get(event.stableId)?.has(event._id))
          href = `/stables/${event.stableId}/events/${event._id}`
      }
    } else if (notice.stableId) {
      const stable = await ctx.db.get(notice.stableId)
      const membership = await ctx.db
        .query('stableMembers')
        .withIndex('by_stable_id_user_id', (q) =>
          q.eq('stableId', notice.stableId!).eq('userId', user._id),
        )
        .unique()
      if (
        !stable ||
        stable.archivedAt !== undefined ||
        (stable.ownerId !== user._id && !membership)
      )
        continue
      name = stable.name
      href = `/stables/${stable._id}`
    }
    items.push({
      key: notice._id,
      kind: notice.kind,
      name,
      href,
      createdAt: notice.createdAt,
      actionRequired: false,
    })
  }
  const jobs = await ctx.db
    .query('historySharingJobs')
    .withIndex('by_user', (q) => q.eq('userId', user._id))
    .order('desc')
    .take(30)
  for (const job of jobs) {
    const horse = await ctx.db.get(job.horseId)
    if (
      !horse ||
      horse.deletedAt !== undefined ||
      !(await getHorseAccess(ctx, horse, user._id)).canRead
    )
      continue
    items.push({
      key: `${job._id}:${job.status}`,
      kind: `sharing_${job.status}`,
      name: getHorseDisplayName(horse),
      href: `/horses/${horse._id}/manage`,
      createdAt: job._creationTime,
      actionRequired: job.status === 'failed',
    })
  }
  const transitions = await ctx.db
    .query('horseTransitions')
    .withIndex('by_actor', (q) => q.eq('actorUserId', user._id))
    .order('desc')
    .take(30)
  for (const transition of transitions) {
    const horse = await ctx.db.get(transition.horseId)
    if (
      !horse ||
      horse.deletedAt !== undefined ||
      !(await getHorseAccess(ctx, horse, user._id)).canRead
    )
      continue
    items.push({
      key: `${transition._id}:${transition.status}`,
      kind: `move_${transition.status}`,
      name: getHorseDisplayName(horse),
      href: `/horses/${horse._id}/manage`,
      createdAt: transition.startedAt,
      actionRequired: false,
    })
  }
  return await Promise.all(
    items
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(async (item) => ({
        ...item,
        read: Boolean(
          await ctx.db
            .query('notificationReads')
            .withIndex('by_user_key', (q) =>
              q.eq('userId', user._id).eq('key', item.key),
            )
            .unique(),
        ),
      })),
  )
}

export const list = query({ args: {}, handler: inbox })

export const markRead = mutation({
  args: { keys: v.array(v.string()) },
  handler: async (ctx, { keys }) => {
    const user = await getUserFromIdentity(ctx)
    if (!user) throw new ConvexError('Sign in to read notifications')
    if (keys.length > 500) throw new ConvexError('Too many notifications')
    const visible = new Map((await inbox(ctx)).map((item) => [item.key, item]))
    for (const key of new Set(keys)) {
      const item = visible.get(key)
      if (!item || item.read) continue
      await ctx.db.insert('notificationReads', {
        userId: user._id,
        key,
        readAt: Date.now(),
      })
    }
  },
})
