import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { toast } from 'sonner'
import { CareRemindersCard  } from './CareRemindersCard'
import type {CareReminderListItem} from './CareRemindersCard';
import type { CareReminderSubmitData } from './CareReminderForm'

type HorseCareRemindersCardProps = {
  horse: Doc<'horses'>
}

export function HorseCareRemindersCard({ horse }: HorseCareRemindersCardProps) {
  const { data } = useSuspenseQuery(
    convexQuery(api.careReminders.listForHorse, { horseId: horse._id }),
  )
  const addReminder = useMutation(api.careReminders.add)
  const completeReminder = useMutation(api.careReminders.complete)
  const dismissReminder = useMutation(api.careReminders.dismiss)
  const removeReminder = useMutation(api.careReminders.remove)
  const reminders: Array<CareReminderListItem> = data.reminders.map((reminder) => ({
    reminder,
    horseName: horse.name,
    canManage: data.canManage,
  }))

  const onAdd = async (values: CareReminderSubmitData) => {
    try {
      await addReminder({
        stableId: horse.stableId,
        horseId: horse._id,
        title: values.title,
        description: values.description,
        category: values.category,
        dueDate: values.dueDate,
        priority: values.priority,
        status: 'pending',
      })

      toast.success('Reminder added', {
        description: <p>{values.title} is now linked to {horse.name}.</p>,
        position: 'top-right',
      })
    } catch (err) {
      toast.error('Oops! Something went wrong.', {
        description: <p>Please try again.</p>,
        position: 'top-right',
      })
    }
  }

  return (
    <CareRemindersCard
      title="Care reminders"
      description="Track due checks, reviews, and follow-ups for this horse."
      reminders={reminders}
      canAddReminder={data.canManage}
      fixedHorseId={horse._id}
      emptyMessage="No reminders have been added for this horse yet."
      onAdd={onAdd}
      onComplete={(reminder) => completeWithToast(completeReminder, reminder)}
      onDismiss={(reminder) => dismissWithToast(dismissReminder, reminder)}
      onRemove={(reminder) => removeWithToast(removeReminder, reminder)}
    />
  )
}

const completeWithToast = async (
  completeReminder: (args: { id: Doc<'careReminders'>['_id'] }) => Promise<unknown>,
  reminder: Doc<'careReminders'>,
) => {
  try {
    await completeReminder({ id: reminder._id })
    toast.success('Reminder completed', {
      description: <p>{reminder.title} was marked as complete.</p>,
      position: 'top-right',
    })
  } catch (err) {
    toast.error('Oops! Something went wrong.', {
      description: <p>Please try again.</p>,
      position: 'top-right',
    })
  }
}

const dismissWithToast = async (
  dismissReminder: (args: { id: Doc<'careReminders'>['_id'] }) => Promise<unknown>,
  reminder: Doc<'careReminders'>,
) => {
  try {
    await dismissReminder({ id: reminder._id })
    toast.success('Reminder dismissed', {
      description: <p>{reminder.title} was dismissed.</p>,
      position: 'top-right',
    })
  } catch (err) {
    toast.error('Oops! Something went wrong.', {
      description: <p>Please try again.</p>,
      position: 'top-right',
    })
  }
}

const removeWithToast = async (
  removeReminder: (args: { id: Doc<'careReminders'>['_id'] }) => Promise<unknown>,
  reminder: Doc<'careReminders'>,
) => {
  try {
    await removeReminder({ id: reminder._id })
    toast.success('Reminder removed', {
      description: <p>{reminder.title} was removed.</p>,
      position: 'top-right',
    })
  } catch (err) {
    toast.error('Oops! Something went wrong.', {
      description: <p>Please try again.</p>,
      position: 'top-right',
    })
  }
}
