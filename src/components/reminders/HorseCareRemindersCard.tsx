import { ListFilterBar } from '#/components/list-filtering/ListFilterBar'
import { useListFiltering } from '#/components/list-filtering/useListFiltering'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { CareRemindersCard } from './CareRemindersCard'
import type { CareReminderListItem } from './CareRemindersCard'
import type { CareReminderSubmitData } from './CareReminderForm'
import { createHorseCareReminderListFilterConfig } from './careReminderListFilters'

type HorseCareRemindersCardProps = {
  horse: Doc<'horses'>
  onCreateActionChange?: (action: ReactNode | null) => void
}

export function HorseCareRemindersCard({
  horse,
  onCreateActionChange,
}: HorseCareRemindersCardProps) {
  const { data } = useSuspenseQuery(
    convexQuery(api.careReminders.listForHorse, { horseId: horse._id }),
  )
  const addReminder = useMutation(api.careReminders.add)
  const completeReminder = useMutation(api.careReminders.complete)
  const dismissReminder = useMutation(api.careReminders.dismiss)
  const removeReminder = useMutation(api.careReminders.remove)
  const reminders: Array<CareReminderListItem> = data.reminders.map(
    (reminder) => ({
      reminder,
      horseName: horse.name,
      canManage: data.canManage,
    }),
  )
  const filterConfig = useMemo(createHorseCareReminderListFilterConfig, [])
  const filtering = useListFiltering({
    items: reminders,
    config: filterConfig,
  })
  const listToolbar =
    reminders.length > 0 ? (
      <ListFilterBar
        config={filterConfig}
        query={filtering.query}
        onQueryChange={filtering.setQuery}
        selectedFacets={filtering.selectedFacets}
        onFacetChange={filtering.setFacetValue}
        onReset={filtering.resetFilters}
        isFiltering={filtering.isFiltering}
      />
    ) : undefined

  const onAdd = useCallback(async (values: CareReminderSubmitData) => {
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
        description: (
          <p>
            {values.title} is now linked to {horse.name}.
          </p>
        ),
        position: 'top-right',
      })
    } catch (err) {
      toast.error('Oops! Something went wrong.', {
        description: <p>Please try again.</p>,
        position: 'top-right',
      })
      throw err
    }
  }, [addReminder, horse._id, horse.name, horse.stableId])

  return (
    <CareRemindersCard
      title="Care reminders"
      description="Track due checks, reviews, and follow-ups for this horse."
      reminders={filtering.items}
      canAddReminder={data.canManage}
      fixedHorseId={horse._id}
      emptyMessage={
        filtering.isFiltering
          ? 'No reminders match these filters.'
          : 'No reminders have been added for this horse yet.'
      }
      listToolbar={listToolbar}
      onAdd={onAdd}
      onComplete={(reminder) => completeWithToast(completeReminder, reminder)}
      onDismiss={(reminder) => dismissWithToast(dismissReminder, reminder)}
      onRemove={(reminder) => removeWithToast(removeReminder, reminder)}
      chrome="soft"
      showHeader={false}
      onCreateActionChange={onCreateActionChange}
    />
  )
}

const completeWithToast = async (
  completeReminder: (args: {
    id: Doc<'careReminders'>['_id']
  }) => Promise<unknown>,
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
  dismissReminder: (args: {
    id: Doc<'careReminders'>['_id']
  }) => Promise<unknown>,
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
  removeReminder: (args: {
    id: Doc<'careReminders'>['_id']
  }) => Promise<unknown>,
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
