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
  const dueState = getCareReminderDueState(reminder, today)

  if (dueState === 'today') return t('careLabels.dueToday')

  if (dueState === 'soon') {
    const daysUntilDue = getCareReminderDaysUntilDue(reminder, today)
    const relativeLabel =
      daysUntilDue === 1
        ? t('careLabels.dueTomorrow')
        : t('careLabels.dueDays', { count: daysUntilDue })

    return `${relativeLabel} · ${formatMediumDateKey(reminder.dueDate, locale)}`
  }

  return t('careLabels.dueDate', {
    date: formatMediumDateKey(reminder.dueDate, locale),
  })
}
