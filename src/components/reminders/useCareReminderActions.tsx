import { useMutation } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useT } from '#/i18n/LocaleProvider'
import {
  showAppErrorToast,
  showAppPromiseToast,
  showAppSuccessToast,
} from '#/components/ui/sonner'
import type { CareReminderSubmitData } from './CareReminderForm'

/** Shared mutation feedback for stable and horse reminder lists. */
export function useCareReminderActions() {
  const t = useT()
  const complete = useMutation(api.careReminders.complete)
  const dismiss = useMutation(api.careReminders.dismiss)
  const remove = useMutation(api.careReminders.remove)
  const reopen = useMutation(api.careReminders.reopen)
  const update = useMutation(api.careReminders.update)
  const run = async (
    operation: () => Promise<unknown>,
    title: string,
    record?: Doc<'careReminders'>,
    description?: string,
  ) => {
    try {
      await operation()
      let undoPending = false
      const undo = () => {
        if (!record || undoPending) return
        undoPending = true
        const request = reopen({ id: record._id })
        showAppPromiseToast(request, {
          loading: t('reminders.reopening'),
          success: t('reminders.reopened'),
          description: record.title,
          error: () => ({
            message: t('reminders.undoFailed'),
            description: record.title,
            action: { label: t('common.retry'), onClick: undo },
          }),
          finally: () => {
            undoPending = false
          },
        })
      }
      showAppSuccessToast({
        title,
        description:
          [record?.title, description].filter(Boolean).join(' · ') || undefined,
        ...(record
          ? {
              action: {
                label: t('reminders.undo'),
                onClick: undo,
              },
            }
          : {}),
      })
    } catch (error) {
      showAppErrorToast()
      throw error
    }
  }
  return {
    onComplete: (reminder: Doc<'careReminders'>, nextDueDate?: string) =>
      run(
        () => complete({ id: reminder._id, nextDueDate }),
        t(
          nextDueDate
            ? 'reminders.completedAndScheduled'
            : 'reminders.completed',
        ),
        reminder,
        nextDueDate ? t('reminders.undoKeepsFollowUp') : undefined,
      ),
    onDismiss: (reminder: Doc<'careReminders'>) =>
      run(
        () => dismiss({ id: reminder._id }),
        t('reminders.dismissed'),
        reminder,
      ),
    onRemove: (reminder: Doc<'careReminders'>) =>
      run(() => remove({ id: reminder._id }), t('reminders.removed')),
    onReopen: (reminder: Doc<'careReminders'>) =>
      run(() => reopen({ id: reminder._id }), t('reminders.reopened')),
    onEdit: (reminder: Doc<'careReminders'>, values: CareReminderSubmitData) =>
      run(
        () =>
          update({
            id: reminder._id,
            horseId: reminder.horseId,
            eventId: reminder.eventId,
            title: values.title,
            description: values.description,
            category: values.category,
            priority: values.priority,
            dueDate: values.dueDate,
            assignedTo: (values.assignedTo || undefined) as
              Id<'users'> | undefined,
          }),
        t('reminders.saved'),
      ),
  }
}
