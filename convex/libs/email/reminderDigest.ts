import { sharedStableRecords } from '../sharedStableRecords'
import { recordCapabilities } from '../recordCapabilities'
import { accessibleHorses } from '../horsePermissions'
import type { Doc } from '../../_generated/dataModel'
import type { MutationCtx } from '../../_generated/server'
import { isActiveHorse } from '../horseState'

// Date-only reminders follow the recipient's local calendar, as in the app.
export const getDigestClock = (timestamp: number, timezone: string) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(timestamp)
  const part = (type: string) =>
    parts.find((value) => value.type === type)!.value
  return {
    date: `${part('year')}-${part('month')}-${part('day')}`,
    hour: Number(part('hour')),
  }
}

export const getReminderDigestStables = async (
  ctx: MutationCtx,
  user: Doc<'users'>,
  date: string,
) => {
  const [owned, memberships] = await Promise.all([
    ctx.db
      .query('stables')
      .withIndex('by_owner_id', (q) => q.eq('ownerId', user._id))
      .collect(),
    ctx.db
      .query('stableMembers')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .collect(),
  ])
  const joined = await Promise.all(
    memberships
      .filter((m) => m.role === 'member')
      .map((m) => ctx.db.get(m.stableId)),
  )
  const stables = new Map(
    [...owned, ...joined].flatMap((stable) =>
      stable && stable.archivedAt === undefined
        ? [[stable._id, stable] as const]
        : [],
    ),
  )
  const counted = new Set<string>()
  const summaries = await Promise.all(
    [...stables.values()].map(async (stable) => {
      const originReminders = await ctx.db
        .query('careReminders')
        .withIndex('by_stable_id_status_due_date', (q) =>
          q
            .eq('stableId', stable._id)
            .eq('status', 'pending')
            .lte('dueDate', date),
        )
        .collect()
      const reminders = [...originReminders.filter(r => !r.horseId), ...(await sharedStableRecords(ctx, stable._id, 'careReminders')).filter(r => r.status === 'pending' && r.dueDate <= date)]
      const visible = await Promise.all(
        reminders.map(async (reminder) => {
          if (!reminder.horseId) { counted.add(reminder._id); return true }
          const horse = await ctx.db.get(reminder.horseId)
          const allowed = (
            isActiveHorse(horse) &&
            horse.stableId === stable._id &&
            (await recordCapabilities(ctx, horse, reminder, user._id))
              .readSchedule
          )
          if (allowed) counted.add(reminder._id)
          return allowed
        }),
      )
      return {
        stableId: stable._id,
        stableName: stable.name,
        count: visible.filter(Boolean).length,
      }
    }),
  )
  let personalCount = 0
  for (const horse of await accessibleHorses(ctx, user._id)) {
    const rows = await ctx.db
      .query('careReminders')
      .withIndex('by_horse_id_due_date', (q) => q.eq('horseId', horse._id))
      .collect()
    personalCount += rows.filter(
      (r) =>
        r.status === 'pending' &&
        r.dueDate <= date &&
        !counted.has(r._id),
    ).length
  }
  return [
    ...summaries,
    ...(personalCount
      ? [
          {
            stableId: undefined,
            stableName: user.locale === 'pl' ? 'Moje konie' : 'My horses',
            count: personalCount,
          },
        ]
      : []),
  ].filter((stable) => stable.count > 0)
}
