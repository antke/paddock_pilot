import { compareEventTimes } from '../shared/events/eventTime'
import { query } from './_generated/server'
import { v } from 'convex/values'
import { listActivities } from './activities'
import { getCareOverview } from './userCareOverview'
import { accessibleHorses, getHorseAccess } from './libs/horsePermissions'
import { assertCanViewStable, getCurrentUser } from './libs/stablePermissions'
import { isActiveHorse } from './libs/horseState'
import { createEventOccurrences } from '../shared/events/eventOccurrences'
import { addDaysToDateKey, resolveTodayDateKey } from './libs/dateKeys'
import type { Doc } from './_generated/dataModel'

/** All cards share one authorized snapshot; source selection never creates grants. */
export const view = query({
  args: { stableIds: v.array(v.id('stables')), today: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const today = resolveTodayDateKey(args.today)
    const stableIds = [...new Set(args.stableIds)]
    const overview = await getCareOverview(ctx, { stableIds, today })
    const events = await listActivities(ctx, {
      personal: true,
      stableIds,
      training: false,
    })
    const training = await listActivities(ctx, {
      personal: true,
      stableIds,
      training: true,
    })
    const personalRoster = await accessibleHorses(ctx, user._id)
    const roster = new Map<string, { horse: Doc<'horses'>; personal: boolean }>(
      personalRoster.map((horse) => [horse._id, { horse, personal: true }]),
    )
    for (const stableId of stableIds) {
      await assertCanViewStable(ctx, stableId, user._id)
      const horses = await ctx.db
        .query('horses')
        .withIndex('by_stable_id', (q) => q.eq('stableId', stableId))
        .collect()
      for (const horse of horses.filter(
        (candidate) => isActiveHorse(candidate) && !candidate.transitionId,
      ))
        if (!roster.has(horse._id))
          roster.set(horse._id, { horse, personal: false })
    }
    const horses = await Promise.all(
      [...roster.values()].map(async ({ horse, personal }) => {
        const access = await getHorseAccess(ctx, horse, user._id)
        // A roster identity is not a horse profile or a grant to private records.
        return {
          _id: horse._id,
          name: horse.name,
          nickname: horse.nickname,
          useNickname: horse.useNickname,
          stableId: horse.stableId,
          stableName: access.stable?.name,
          profileImageUrl: horse.profileImageId
            ? await ctx.storage.getUrl(horse.profileImageId)
            : null,
          personal,
          isOwner: access.isOwner,
          canRead: access.canRead,
          canRecord: access.canAddRecords,
        }
      }),
    )
    const upcoming = createEventOccurrences({
      events: events.events,
      windowStart: today,
      windowEnd: addDaysToDateKey(today, 14),
    })
      .filter(
        (occurrence) => (occurrence.event.status ?? 'planned') === 'planned',
      )
      .sort(
        (a, b) =>
          a.startDate.localeCompare(b.startDate) ||
          compareEventTimes(a.event.time, b.event.time),
      )
    const seen = new Set<string>()
    const uniqueUpcoming = upcoming.filter((occurrence) => {
      if (seen.has(occurrence.eventId)) return false
      seen.add(occurrence.eventId)
      return true
    })
    return {
      stableIds,
      horses,
      events: events.events,
      training,
      overview: {
        ...overview,
        summary: {
          ...overview.summary,
          horseCount: horses.length,
          upcomingEventCount: uniqueUpcoming.length,
        },
        dueReminders: overview.dueReminders.map((reminder) => {
          const horse = horses.find(
            (candidate) => candidate._id === reminder.horseId,
          )
          return {
            ...reminder,
            stableId:
              reminder.stableId ??
              (horse && !horse.canRead ? horse.stableId : undefined),
            stableName: reminder.stableId
              ? reminder.stableName
              : (horse?.stableName ?? reminder.stableName),
            canReadHorse: horse?.canRead,
          }
        }),
        upcomingEvents: uniqueUpcoming
          .slice(0, 8)
          .map(({ event, startDate }) => ({
            id: event._id,
            stableId: event.stableId,
            stableName: 'Stable',
            title: event.title,
            date: startDate,
            time: event.time,
            type: event.type,
            horseCount: event.horseIds.length,
          })),
      },
    }
  },
})
