import type { Doc, Id } from './_generated/dataModel'
import { query } from './_generated/server'
import type { QueryCtx } from './_generated/server'
import { v } from 'convex/values'
import { getCurrentUser } from './libs/stablePermissions'

const upcomingWindowDays = 14

const todayKey = () => new Date().toISOString().slice(0, 10)

const addDaysKey = (dateKey: string, days: number) => {
  const date = new Date(`${dateKey}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

const byEventDateAndTime = (a: Doc<'events'>, b: Doc<'events'>) => {
  const dateSort = a.date.localeCompare(b.date)
  if (dateSort !== 0) return dateSort
  return a.time.localeCompare(b.time)
}

const byReminderDueDate = (a: Doc<'careReminders'>, b: Doc<'careReminders'>) => {
  const dateSort = a.dueDate.localeCompare(b.dueDate)
  if (dateSort !== 0) return dateSort
  return b.createdAt - a.createdAt
}

const isStable = (stable: Doc<'stables'> | null): stable is Doc<'stables'> => {
  return stable !== null
}

const getAccessibleStables = async (ctx: QueryCtx, userId: Id<'users'>) => {
  const ownedStables = await ctx.db
    .query('stables')
    .withIndex('by_owner_id', (q) => q.eq('ownerId', userId))
    .collect()
  const memberships = await ctx.db
    .query('stableMembers')
    .withIndex('by_user_id', (q) => q.eq('userId', userId))
    .collect()
  const memberStables = await Promise.all(
    memberships.map((membership) => ctx.db.get(membership.stableId)),
  )

  return [...new Map([...ownedStables, ...memberStables.filter(isStable)].map((stable) => [stable._id, stable])).values()]
}

type HorseMetrics = {
  activeIssueCount?: number
  highIssueCount?: number
  activeMedicationCount?: number
  overdueReminderCount?: number
}

const incrementHorseMetric = (
  map: Map<Id<'horses'>, HorseMetrics>,
  horseId: Id<'horses'>,
  key: keyof HorseMetrics,
) => {
  const current = map.get(horseId) ?? {}
  current[key] = (current[key] ?? 0) + 1
  map.set(horseId, current)
}

export const getForCurrentUser = query({
  args: { stableId: v.optional(v.id('stables')) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const today = todayKey()
    const upcomingEnd = addDaysKey(today, upcomingWindowDays)
    const accessibleStables = await getAccessibleStables(ctx, user._id)
    const stables = args.stableId
      ? accessibleStables.filter((stable) => stable._id === args.stableId)
      : accessibleStables

    const stableRows = await Promise.all(
      stables.map(async (stable) => {
        const [horses, events, reminders, healthIssues, medicationRecords] =
          await Promise.all([
            ctx.db
              .query('horses')
              .withIndex('by_stable_id', (q) => q.eq('stableId', stable._id))
              .collect(),
            ctx.db
              .query('events')
              .withIndex('by_stable_id_date', (q) => q.eq('stableId', stable._id))
              .collect(),
            ctx.db
              .query('careReminders')
              .withIndex('by_stable_id_status_due_date', (q) =>
                q.eq('stableId', stable._id).eq('status', 'pending'),
              )
              .collect(),
            ctx.db
              .query('horseHealthIssues')
              .withIndex('by_stable_id', (q) => q.eq('stableId', stable._id))
              .collect(),
            ctx.db
              .query('horseMedicationRecords')
              .withIndex('by_stable_id', (q) => q.eq('stableId', stable._id))
              .collect(),
          ])

        return { stable, horses, events, reminders, healthIssues, medicationRecords }
      }),
    )

    const horses = stableRows.flatMap((row) => row.horses)
    const horseById = new Map(horses.map((horse) => [horse._id, horse]))
    const stableById = new Map(stables.map((stable) => [stable._id, stable]))
    const horseMetrics = new Map<Id<'horses'>, HorseMetrics>()

    const upcomingEvents = stableRows
      .flatMap((row) => row.events)
      .filter(
        (event) =>
          (event.status ?? 'planned') === 'planned' &&
          event.date >= today &&
          event.date <= upcomingEnd,
      )
      .sort(byEventDateAndTime)
    const pendingReminders = stableRows.flatMap((row) => row.reminders)
    const dueReminders = pendingReminders
      .filter((reminder) => reminder.dueDate <= upcomingEnd)
      .sort(byReminderDueDate)
    const overdueReminders = pendingReminders.filter(
      (reminder) => reminder.dueDate < today,
    )
    const activeHealthIssues = stableRows
      .flatMap((row) => row.healthIssues)
      .filter((issue) => issue.status === 'active')
    const highSeverityIssues = activeHealthIssues.filter(
      (issue) => issue.severity === 'high',
    )
    const activeMedicationRecords = stableRows
      .flatMap((row) => row.medicationRecords)
      .filter((record) => record.status === 'active')

    for (const issue of activeHealthIssues) {
      incrementHorseMetric(horseMetrics, issue.horseId, 'activeIssueCount')
      if (issue.severity === 'high') {
        incrementHorseMetric(horseMetrics, issue.horseId, 'highIssueCount')
      }
    }

    for (const record of activeMedicationRecords) {
      incrementHorseMetric(horseMetrics, record.horseId, 'activeMedicationCount')
    }

    for (const reminder of overdueReminders) {
      if (reminder.horseId) {
        incrementHorseMetric(horseMetrics, reminder.horseId, 'overdueReminderCount')
      }
    }

    return {
      summary: {
        stableCount: stables.length,
        horseCount: horses.length,
        upcomingEventCount: upcomingEvents.length,
        dueReminderCount: dueReminders.length,
        overdueReminderCount: overdueReminders.length,
        highSeverityIssueCount: highSeverityIssues.length,
        activeMedicationCount: activeMedicationRecords.length,
      },
      stableSummaries: stableRows
        .map(({ stable, horses: stableHorses, events, reminders, healthIssues, medicationRecords }) => {
          const stableUpcomingEvents = events.filter(
            (event) =>
              (event.status ?? 'planned') === 'planned' &&
              event.date >= today &&
              event.date <= upcomingEnd,
          )
          const stableDueReminders = reminders.filter(
            (reminder) => reminder.dueDate <= upcomingEnd,
          )
          const stableOverdueReminders = stableDueReminders.filter(
            (reminder) => reminder.dueDate < today,
          )
          const stableHighIssues = healthIssues.filter(
            (issue) => issue.status === 'active' && issue.severity === 'high',
          )
          const stableActiveMedications = medicationRecords.filter(
            (record) => record.status === 'active',
          )

          return {
            stableId: stable._id,
            stableName: stable.name,
            location: stable.location,
            horseCount: stableHorses.length,
            upcomingEventCount: stableUpcomingEvents.length,
            dueReminderCount: stableDueReminders.length,
            overdueReminderCount: stableOverdueReminders.length,
            highSeverityIssueCount: stableHighIssues.length,
            activeMedicationCount: stableActiveMedications.length,
          }
        })
        .sort((a, b) => {
          const alertSort =
            b.overdueReminderCount + b.highSeverityIssueCount -
            (a.overdueReminderCount + a.highSeverityIssueCount)
          if (alertSort !== 0) return alertSort
          return a.stableName.localeCompare(b.stableName)
        }),
      dueReminders: dueReminders.slice(0, 8).map((reminder) => {
        const horse = reminder.horseId ? horseById.get(reminder.horseId) : undefined
        const stable = stableById.get(reminder.stableId)

        return {
          id: reminder._id,
          stableId: reminder.stableId,
          stableName: stable?.name ?? 'Stable',
          horseId: reminder.horseId,
          horseName: horse?.name,
          title: reminder.title,
          dueDate: reminder.dueDate,
          category: reminder.category,
          priority: reminder.priority,
          overdue: reminder.dueDate < today,
        }
      }),
      upcomingEvents: upcomingEvents.slice(0, 8).map((event) => ({
        id: event._id,
        stableId: event.stableId,
        stableName: stableById.get(event.stableId)?.name ?? 'Stable',
        title: event.title,
        date: event.date,
        time: event.time,
        type: event.type,
        horseCount: event.horseIds.length,
      })),
      attentionHorses: [...horseMetrics.entries()]
        .map(([horseId, metrics]) => {
          const horse = horseById.get(horseId)
          if (!horse) return null

          return {
            horseId,
            horseName: horse.name,
            stableId: horse.stableId,
            stableName: stableById.get(horse.stableId)?.name ?? 'Stable',
            activeIssueCount: metrics.activeIssueCount ?? 0,
            highIssueCount: metrics.highIssueCount ?? 0,
            activeMedicationCount: metrics.activeMedicationCount ?? 0,
            overdueReminderCount: metrics.overdueReminderCount ?? 0,
          }
        })
        .filter((horse) => horse !== null)
        .sort((a, b) => {
          const alertSort =
            b.highIssueCount + b.overdueReminderCount -
            (a.highIssueCount + a.overdueReminderCount)
          if (alertSort !== 0) return alertSort
          return b.activeIssueCount + b.activeMedicationCount -
            (a.activeIssueCount + a.activeMedicationCount)
        })
        .slice(0, 8),
    }
  },
})
