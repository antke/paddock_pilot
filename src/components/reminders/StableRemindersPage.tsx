import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { buttonVariants } from '#/components/ui/button'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { toast } from 'sonner'
import { CareRemindersCard  } from './CareRemindersCard'
import type {CareReminderListItem} from './CareRemindersCard';
import type { CareReminderSubmitData } from './CareReminderForm'

type StableRemindersPageProps = {
  stableId: string
}

export function StableRemindersPage({ stableId }: StableRemindersPageProps) {
  const { data: stable } = useSuspenseQuery(
    convexQuery(api.stables.get, { id: stableId as Id<'stables'> }),
  )
  const { data } = useSuspenseQuery(
    convexQuery(api.careReminders.listForStable, {
      stableId: stableId as Id<'stables'>,
    }),
  )
  const { data: horses } = useSuspenseQuery(
    convexQuery(api.horses.list, { stableId: stableId as Id<'stables'> }),
  )
  const addReminder = useMutation(api.careReminders.add)
  const completeReminder = useMutation(api.careReminders.complete)
  const dismissReminder = useMutation(api.careReminders.dismiss)
  const removeReminder = useMutation(api.careReminders.remove)

  if (!stable) {
    return (
      <Alert>
        <AlertTitle>Stable not found</AlertTitle>
        <AlertDescription>
          This stable does not exist or is no longer available.
        </AlertDescription>
      </Alert>
    )
  }

  const onAdd = async (values: CareReminderSubmitData) => {
    try {
      await addReminder({
        stableId: stable._id,
        horseId: values.horseId as Id<'horses'> | undefined,
        title: values.title,
        description: values.description,
        category: values.category,
        dueDate: values.dueDate,
        priority: values.priority,
        status: 'pending',
      })

      toast.success('Reminder added', {
        description: <p>{values.title} is now on the care reminders list.</p>,
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
    <div className="grid gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-2">
          <h1 className="text-2xl font-semibold">Care reminders</h1>
          <p className="text-sm text-muted-foreground">
            Due tasks and follow-ups for {stable.name}.
          </p>
        </div>
        <Link
          to="/stables/$stableId"
          params={{ stableId }}
          className={buttonVariants({ variant: 'outline' })}
        >
          Back to stable
        </Link>
      </header>

      <CareRemindersCard
        title="Stable care reminders"
        description="Track due checks, booking tasks, medication reviews, and admin follow-ups."
        reminders={data.reminders as Array<CareReminderListItem>}
        canAddReminder={data.canManageStableReminders}
        horseOptions={horses.map((horse) => ({ id: horse._id, name: horse.name }))}
        emptyMessage="No care reminders have been added for this stable yet."
        onAdd={onAdd}
        onComplete={(reminder) => completeReminderWithToast(completeReminder, reminder)}
        onDismiss={(reminder) => dismissReminderWithToast(dismissReminder, reminder)}
        onRemove={(reminder) => removeReminderWithToast(removeReminder, reminder)}
      />
    </div>
  )
}

const completeReminderWithToast = async (
  completeReminder: (args: { id: Id<'careReminders'> }) => Promise<unknown>,
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

const dismissReminderWithToast = async (
  dismissReminder: (args: { id: Id<'careReminders'> }) => Promise<unknown>,
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

const removeReminderWithToast = async (
  removeReminder: (args: { id: Id<'careReminders'> }) => Promise<unknown>,
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
