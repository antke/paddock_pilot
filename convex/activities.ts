import { attendanceDetail } from './libs/eventAttendees'
import {
  projectActivityShare,
  sharedActivitySource,
} from './libs/activitySharing'
import { createEventOccurrences } from '../shared/events/eventOccurrences'
/** Calendar selection changes discovery only. Every source is authorized before merging. */
import { ConvexError, v } from 'convex/values'
import { query } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'
import type { QueryCtx } from './_generated/server'
import { listPersonalEvents } from './events'
import { listHorseTraining, listStableTraining } from './training'
import { listMyParticipations } from './activityParticipants'
import { accessibleHorses, getHorseAccess } from './libs/horsePermissions'
import { getCurrentUser } from './libs/stablePermissions'
import {
  sharedEventsForStable,
  eventParticipantAccess,
} from './libs/eventPermissions'
import { visibleHorse } from './libs/recordCapabilities'
import { isActiveHorse } from './libs/horseState'
import {
  mergeCalendarEvents,
  mergeTrainingSources,
} from '../shared/events/activitySources'

export async function listActivities(
  ctx: QueryCtx,
  {
    personal,
    stableIds,
    training,
  }: {
    personal: boolean
    stableIds: Id<'stables'>[]
    training: boolean
  },
) {
  const user = await getCurrentUser(ctx)
  const selected = [...new Set(stableIds)]
  if (selected.length > 30) throw new ConvexError('Select up to 30 calendars')
  const sources = []
  if (personal) {
    const roster = await accessibleHorses(ctx, user._id)
    if (training) {
      for (const horse of roster)
        sources.push(await listHorseTraining(ctx, { horseId: horse._id }))
    } else {
      sources.push({
        events: await listPersonalEvents(ctx),
        records: [],
        horses: await Promise.all(
          roster.map(async (horse) => ({
            ...(await visibleHorse(ctx, horse)),
            canRecord: (await getHorseAccess(ctx, horse)).canAddRecords,
          })),
        ),
      })
    }
  }
  // Prefer the richest selected stable projection when the same activity is
  // shared to a stable the viewer manages and another they only belong to.
  const selectedSources = await Promise.all(
    selected.map(async (stableId) => ({
      stableId,
      owner: (await ctx.db.get(stableId))?.ownerId === user._id,
    })),
  )
  selectedSources.sort((a, b) => Number(b.owner) - Number(a.owner))
  for (const { stableId } of selectedSources) {
    const explicit = await sharedActivitySource(ctx, stableId, user._id)
    sources.push({
      ...explicit,
      events: explicit.events.filter(
        (event) => (event.type === 'training') === training,
      ),
      records: training ? explicit.records : [],
    })
    if (training) sources.push(await listStableTraining(ctx, { stableId }))
    else {
      // sharedEventsForStable checks current membership even for an empty calendar.
      const events = (await sharedEventsForStable(ctx, stableId)).filter(
        (event) => event.type !== 'training',
      )
      const horses = (
        await ctx.db
          .query('horses')
          .withIndex('by_stable_id', (q) => q.eq('stableId', stableId))
          .collect()
      ).filter(isActiveHorse)
      sources.push({
        events,
        records: [],
        horses: await Promise.all(
          horses.map(async (horse) => ({
            ...(await visibleHorse(ctx, horse, true)),
            canRecord: false,
          })),
        ),
      })
    }
  }
  if (personal) {
    const attendance = await ctx.db
      .query('eventAttendees')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect()
    for (const row of attendance) {
      const detail = await attendanceDetail(ctx, row.eventId, user._id)
      if (detail && (detail.event.type === 'training') === training)
        sources.push({
          events: [detail.event],
          horses: detail.horses,
          records: detail.records,
        })
    }
  }
  const merged = mergeTrainingSources(sources)
  if (personal) {
    const participations = await listMyParticipations(ctx)
    for (const row of participations) {
      if (row.status !== 'accepted' || (row.type === 'training') !== training)
        continue
      // Existing horse-based access already supplies the richer authorized view.
      if (
        merged.events.some(
          (event) =>
            event._id === row.eventId &&
            event.horseIds.includes(row.horseId) &&
            createEventOccurrences({
              events: [event],
              windowStart: row.date,
              windowEnd: row.date,
            }).some(
              (occurrence) =>
                occurrence.startDate === row.date &&
                occurrence.event.horseIds.includes(row.horseId),
            ),
        )
      )
        continue
      const original = await ctx.db.get(row.eventId)
      const horse = await ctx.db.get(row.horseId)
      if (!original || !horse) continue
      const event: Doc<'events'> & {
        participantOnlyDates: Array<{ horseId: string; date: string }>
        audienceRules: Array<{
          horseId: string
          rules: Array<{ occurrenceDate: string; enabled: boolean }>
        }>
      } = {
        _id: row.eventId,
        _creationTime: original._creationTime,
        createdBy: original.createdBy,
        title: row.title,
        type: row.type,
        training: row.plannedTraining ?? undefined,
        date: row.date,
        time: row.time,
        location: row.location,
        horseIds: [row.horseId],
        participantOnlyDates: [{ horseId: row.horseId, date: row.date }],
        audienceRules: [
          {
            horseId: row.horseId,
            rules: [{ occurrenceDate: row.date, enabled: true }],
          },
        ],
        status: row.resultStatus === 'skipped' ? 'cancelled' : row.resultStatus,
      }
      const sharedSeries = merged.events.findIndex(
        (item) =>
          item._id === row.eventId &&
          !item.contextHistorical &&
          !item.contextHorseId &&
          createEventOccurrences({
            events: [{ ...item, audienceRules: undefined }],
            windowStart: row.date,
            windowEnd: row.date,
          }).some((occurrence) => occurrence.startDate === row.date),
      )
      if (row.report) {
        const report = await ctx.db.get(row.report.id)
        if (report && !merged.records.some((item) => item._id === report._id))
          merged.records.push({
            _id: report._id,
            _creationTime: report._creationTime,
            eventId: report.eventId,
            horseId: report.horseId,
            date: report.date,
            scheduledDate: report.scheduledDate,
            status: report.status,
            details: report.details,
            outcome: report.outcome,
            recordedBy: report.recordedBy,
            createdAt: report.createdAt,
            updatedAt: report.updatedAt,
            canEdit: false,
          })
      }
      if (sharedSeries >= 0) {
        const source = merged.events[sharedSeries]
        merged.events[sharedSeries] = mergeCalendarEvents([
          source,
          {
            ...source,
            horseIds: event.horseIds,
            audienceRules: event.audienceRules,
          },
        ])[0]
        merged.events[sharedSeries].participantOnlyDates = [
          ...(source.participantOnlyDates ?? []),
          ...event.participantOnlyDates,
        ]
      } else merged.events.push(event)
      if (!merged.horses.some((item) => item._id === row.horseId))
        merged.horses.push({
          _id: row.horseId,
          _creationTime: horse._creationTime,
          name: row.horseName,
          canRecord: false,
        })
    }
  }
  return { ...merged, events: mergeCalendarEvents(merged.events) }
}

export const view = query({
  args: {
    personal: v.boolean(),
    stableIds: v.array(v.id('stables')),
    training: v.boolean(),
  },
  handler: listActivities,
})

/** Route accepted participants to their narrow session view, never the full horse detail API. */
export const detailAccess = query({
  args: { eventId: v.id('events') },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId)
    if (!event) return 'missing' as const
    const { user, participants } = await eventParticipantAccess(ctx, event)
    if (
      participants.length ||
      (!event.horseIds.length &&
        event.createdBy === user._id &&
        !event.stableId)
    )
      return 'horse' as const
    if (
      (await listMyParticipations(ctx)).some(
        (row) => row.eventId === eventId && row.status === 'accepted',
      )
    )
      return 'participant' as const
    const shares = await ctx.db
      .query('activityCalendarShares')
      .withIndex('by_event', (q) => q.eq('eventId', eventId))
      .collect()
    for (const share of shares)
      if (await projectActivityShare(ctx, share, user._id))
        return 'shared' as const
    if (await attendanceDetail(ctx, eventId, user._id)) return 'shared' as const
    return 'missing' as const
  },
})
