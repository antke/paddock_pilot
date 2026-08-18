import { v } from 'convex/values'
import type { Doc, Id } from './_generated/dataModel'
import { query } from './_generated/server'
import { addDaysToDateKey, resolveTodayDateKey } from './libs/dateKeys'
import { assertCanViewStable } from './libs/stablePermissions'
import {
  hasActiveHorse,
  isActiveHorse,
  withActiveEventHorseIds,
} from './libs/horseState'

const reminderDueSoonDays = 7

const byEventDateAndTime = (a: Doc<'events'>, b: Doc<'events'>) => {
  const dateSort = a.date.localeCompare(b.date)

  if (dateSort !== 0) return dateSort

  return a.time.localeCompare(b.time)
}

const getHorseName = (
  horsesById: Map<Id<'horses'>, Doc<'horses'>>,
  horseId: Id<'horses'>,
) => {
  return horsesById.get(horseId)?.name ?? 'Unknown horse'
}

const hasNutrition = (horse: Doc<'horses'>) => {
  return Boolean(
    horse.feedingRoutine ||
    horse.nutritionNotes ||
    horse.nutritionRecommended?.length ||
    horse.nutritionAvoid?.length,
  )
}

const missingProfileFields = (horse: Doc<'horses'>) => {
  return [
    ['Sex', horse.sex],
    ['Color', horse.color],
    ['Date of birth', horse.dateOfBirth],
    ['Passport number', horse.passportNumber],
    ['Microchip number', horse.microchipNumber],
    [
      'Insurance details',
      horse.insuranceProvider && horse.insurancePolicyNumber,
    ],
    ['Vet contact', horse.vetName && horse.vetPhone],
    ['Farrier contact', horse.farrierName && horse.farrierPhone],
    ['Nutrition', hasNutrition(horse)],
  ]
    .filter(([, value]) => !value)
    .map(([label]) => label as string)
}

export const getForStable = query({
  args: {
    stableId: v.id('stables'),
    today: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const access = await assertCanViewStable(ctx, args.stableId)

    const [horses, events, healthIssues, stableInvitations, careReminders] =
      await Promise.all([
        ctx.db
          .query('horses')
          .withIndex('by_stable_id', (q) => q.eq('stableId', args.stableId))
          .collect(),
        ctx.db
          .query('events')
          .withIndex('by_stable_id_date', (q) =>
            q.eq('stableId', args.stableId),
          )
          .collect(),
        ctx.db
          .query('horseHealthIssues')
          .withIndex('by_stable_id', (q) => q.eq('stableId', args.stableId))
          .collect(),
        access.role === 'owner'
          ? ctx.db
              .query('stableInvitations')
              .withIndex('by_stable_id', (q) => q.eq('stableId', args.stableId))
              .collect()
          : Promise.resolve([]),
        ctx.db
          .query('careReminders')
          .withIndex('by_stable_id_status_due_date', (q) =>
            q.eq('stableId', args.stableId).eq('status', 'pending'),
          )
          .collect(),
      ])
    const activeHorses = horses.filter(isActiveHorse)
    const activeHorseIds = new Set(activeHorses.map((horse) => horse._id))
    const visibleEvents = events
      .filter((event) => hasActiveHorse(event, activeHorseIds))
      .map((event) => withActiveEventHorseIds(event, activeHorseIds))
    const visibleHealthIssues = healthIssues.filter((issue) =>
      activeHorseIds.has(issue.horseId),
    )
    const visibleCareReminders = careReminders.filter(
      (reminder) => !reminder.horseId || activeHorseIds.has(reminder.horseId),
    )
    const horsesById = new Map(activeHorses.map((horse) => [horse._id, horse]))
    const eventHorseRows = await Promise.all(
      visibleEvents.map((event) =>
        ctx.db
          .query('eventsHorses')
          .withIndex('by_event_id', (q) => q.eq('eventId', event._id))
          .collect(),
      ),
    )
    const visibleEventHorseRows = eventHorseRows.map((rows) =>
      rows.filter((row) => activeHorseIds.has(row.horseId)),
    )
    const eventsById = new Map(visibleEvents.map((event) => [event._id, event]))
    const startKey = resolveTodayDateKey(args.today)
    const endKey = addDaysToDateKey(startKey, 30)
    const reminderDueSoonKey = addDaysToDateKey(startKey, reminderDueSoonDays)

    const highSeverityIssues = visibleHealthIssues
      .filter((issue) => issue.status === 'active' && issue.severity === 'high')
      .sort((a, b) => b.notedAt - a.notedAt)
      .map((issue) => ({
        id: issue._id,
        horseId: issue.horseId,
        horseName: getHorseName(horsesById, issue.horseId),
        title: issue.title,
        notedAt: issue.notedAt,
      }))

    const upcomingEvents = visibleEvents
      .filter((event) => {
        const status = event.status ?? 'planned'

        return (
          status === 'planned' && event.date >= startKey && event.date <= endKey
        )
      })
      .sort(byEventDateAndTime)
      .map((event) => ({
        id: event._id,
        title: event.title,
        type: event.type,
        date: event.date,
        time: event.time,
        horseCount: event.horseIds.length,
      }))

    const profileGaps = activeHorses
      .map((horse) => ({
        horseId: horse._id,
        horseName: horse.name,
        missingFields: missingProfileFields(horse),
      }))
      .filter((horse) => horse.missingFields.length > 0)

    const providerGaps = visibleEvents
      .filter((event) => !event.providerName || !event.providerPhone)
      .sort(byEventDateAndTime)
      .map((event) => ({
        id: event._id,
        title: event.title,
        date: event.date,
        missingProviderName: !event.providerName,
        missingProviderPhone: !event.providerPhone,
      }))

    const completionNoteGaps = visibleEvents
      .filter(
        (event) => event.status === 'completed' && !event.notesAfterCompletion,
      )
      .sort(byEventDateAndTime)
      .map((event) => ({
        id: event._id,
        title: event.title,
        date: event.date,
      }))

    const serviceOutcomeGaps = visibleEventHorseRows
      .flat()
      .filter((row) => {
        const event = eventsById.get(row.eventId)

        return (
          event?.status === 'completed' &&
          (row.status === undefined || row.status === 'confirmed') &&
          !row.completionNotes
        )
      })
      .map((row) => {
        const event = eventsById.get(row.eventId)

        return {
          id: row._id,
          eventId: row.eventId,
          horseId: row.horseId,
          eventTitle: event?.title ?? 'Unknown event',
          eventDate: event?.date ?? '',
          horseName: getHorseName(horsesById, row.horseId),
        }
      })
      .sort((a, b) => a.eventDate.localeCompare(b.eventDate))

    const pendingStableInvitations = stableInvitations
      .filter(
        (invitation) =>
          invitation.status === 'pending' ||
          invitation.status === 'accepted_pending_subscription',
      )
      .map((invitation) => ({
        id: invitation._id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
      }))

    const pendingHorseInvitations = visibleEventHorseRows
      .flat()
      .filter((row) => row.status === 'invited')
      .map((row) => {
        const event = eventsById.get(row.eventId)

        return {
          id: row._id,
          eventId: row.eventId,
          horseId: row.horseId,
          eventTitle: event?.title ?? 'Unknown event',
          horseName: getHorseName(horsesById, row.horseId),
        }
      })

    const dueReminders = visibleCareReminders
      .filter((reminder) => reminder.dueDate <= reminderDueSoonKey)
      .map((reminder) => ({
        id: reminder._id,
        horseId: reminder.horseId,
        horseName: reminder.horseId
          ? getHorseName(horsesById, reminder.horseId)
          : undefined,
        title: reminder.title,
        category: reminder.category,
        dueDate: reminder.dueDate,
        overdue: reminder.dueDate < startKey,
      }))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))

    return {
      highSeverityIssues,
      dueReminders,
      upcomingEvents,
      profileGaps,
      providerGaps,
      completionNoteGaps,
      serviceOutcomeGaps,
      pendingStableInvitations,
      pendingHorseInvitations,
      summary: {
        highSeverityIssueCount: highSeverityIssues.length,
        dueReminderCount: dueReminders.length,
        overdueReminderCount: dueReminders.filter(
          (reminder) => reminder.overdue,
        ).length,
        upcomingEventCount: upcomingEvents.length,
        profileGapCount: profileGaps.length,
        providerGapCount: providerGaps.length,
        completionNoteGapCount: completionNoteGaps.length,
        serviceOutcomeGapCount: serviceOutcomeGaps.length,
        pendingInvitationCount:
          pendingStableInvitations.length + pendingHorseInvitations.length,
      },
    }
  },
})
