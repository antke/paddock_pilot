import type { Locale } from 'shared/i18n/locale'
import { localeInstances } from '#/i18n/resources'
import { formatMediumDateKey } from '#/lib/dateDisplay'
import type { CareReminderStatus } from 'shared/reminders/careReminderSchema'
import {
  getCareReminderDaysUntilDue,
  getCareReminderDueState,
} from './careReminderState'
import type { Doc } from 'convex/_generated/dataModel'

export const careReminderOverdueLabel = 'Overdue'

export function getCareReminderStateLabel(
  {
    status,
    overdue,
  }: {
    status: CareReminderStatus
    overdue: boolean
  },
  locale: Locale = 'en',
) {
  return localeInstances[locale].t(
    overdue ? 'careLabels.overdue' : `careLabels.reminderStatus.${status}`,
  )
}

export function getCareReminderDueLabel(
  reminder: Pick<Doc<'careReminders'>, 'dueDate' | 'status'>,
  today?: string,
  locale: Locale = 'en',
) {
  const t = localeInstances[locale].t
  const relative = getCareReminderRelativeDueLabel(reminder, today, locale)
  const date = formatMediumDateKey(reminder.dueDate, locale)

  if (getCareReminderDueState(reminder, today) === 'today') return relative
  return relative ? `${relative} · ${date}` : t('careLabels.dueDate', { date })
}

/** Only the relative part (Overdue, Due today, Due in 4 days), for rows whose date tile shows the date. */
export function getCareReminderRelativeDueLabel(
  reminder: Pick<Doc<'careReminders'>, 'dueDate' | 'status'>,
  today?: string,
  locale: Locale = 'en',
) {
  const t = localeInstances[locale].t
  const dueState = getCareReminderDueState(reminder, today)

  if (dueState === 'overdue') return t('careLabels.overdue')
  if (dueState === 'today') return t('careLabels.dueToday')
  if (dueState !== 'soon') return null

  const daysUntilDue = getCareReminderDaysUntilDue(reminder, today)
  return daysUntilDue === 1
    ? t('careLabels.dueTomorrow')
    : t('careLabels.dueDays', { count: daysUntilDue })
}
