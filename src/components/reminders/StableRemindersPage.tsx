import type { DashboardChrome } from '#/components/dashboard/dashboardChrome'
import { ListFilterBar } from '#/components/list-filtering/ListFilterBar'
import { ListLoadMoreFooter } from '#/components/list-filtering/ListLoadMoreFooter'
import { useListQueryState } from '#/components/list-filtering/useListQueryState'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { buttonVariants } from '#/components/ui/button'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useMutation, usePaginatedQuery } from 'convex/react'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { CareRemindersCard } from './CareRemindersCard'
import type { CareReminderListItem } from './CareRemindersCard'
import type { CareReminderSubmitData } from './CareReminderForm'
import {
  createCareReminderListFilterConfig,
  getCareReminderListQueryArgs,
} from './careReminderListFilters'
import type { CareReminderListFilterFacetId } from './careReminderListFilters'

type StableRemindersPageProps = {
  stableId: string
  chrome?: DashboardChrome
}

const reminderPageSize = 30

export function StableRemindersPage({
  stableId,
  chrome = 'soft',
}: StableRemindersPageProps) {
  const { data: stable } = useSuspenseQuery(
    convexQuery(api.stables.get, { id: stableId as Id<'stables'> }),
  )
  const { data: permissions } = useSuspenseQuery(
    convexQuery(api.careReminders.getStableReminderPermissions, {
      stableId: stableId as Id<'stables'>,
    }),
  )
  const { data: horses } = useSuspenseQuery(
    convexQuery(api.horses.list, { stableId: stableId as Id<'stables'> }),
  )
  const addReminder = useMutation(api.careReminders.add)
  const addReminderForHorses = useMutation(api.careReminders.addForHorses)
  const completeReminder = useMutation(api.careReminders.complete)
  const dismissReminder = useMutation(api.careReminders.dismiss)
  const removeReminder = useMutation(api.careReminders.remove)
  const horseOptions = useMemo(
    () =>
      horses.map((horse) => ({
        id: horse._id,
        name: horse.name,
      })),
    [horses],
  )
  const filterConfig = useMemo(
    () => createCareReminderListFilterConfig(horseOptions),
    [horseOptions],
  )
  const filtering = useListQueryState<CareReminderListFilterFacetId>()
  const reminderQueryArgs = useMemo(
    () => ({
      stableId: stableId as Id<'stables'>,
      ...getCareReminderListQueryArgs(filtering.queryState),
    }),
    [filtering.queryState, stableId],
  )
  const paginatedReminders = usePaginatedQuery(
    api.careReminders.listForStablePaginated,
    stable ? reminderQueryArgs : 'skip',
    { initialNumItems: reminderPageSize },
  )

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
      const reminder = {
        stableId: stable._id,
        title: values.title,
        description: values.description,
        category: values.category,
        dueDate: values.dueDate,
        priority: values.priority,
        status: 'pending',
      } as const

      if (values.targetType === 'horses') {
        await addReminderForHorses({
          ...reminder,
          horseIds: values.horseIds as Array<Id<'horses'>>,
        })

        toast.success('Reminders added', {
          description: (
            <p>
              {values.title} was added for {values.horseIds.length} horses.
            </p>
          ),
          position: 'top-right',
        })

        return
      }

      await addReminder({
        ...reminder,
        horseId:
          values.targetType === 'horse'
            ? (values.horseId as Id<'horses'>)
            : undefined,
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
      throw err
    }
  }

  return (
    <div className="grid gap-6">
      <CareRemindersCard
        title="Care reminders"
        reminders={paginatedReminders.results as Array<CareReminderListItem>}
        canAddReminder={permissions.canManageStableReminders}
        horseOptions={horseOptions}
        chrome={chrome}
        headerAction={
          <Link
            to="/stables/$stableId"
            params={{ stableId }}
            className={buttonVariants({
              variant: chrome === 'soft' ? 'secondary' : 'outline',
            })}
          >
            Back to stable
          </Link>
        }
        emptyMessage={
          paginatedReminders.status === 'LoadingFirstPage'
            ? 'Loading reminders…'
            : filtering.isFiltering
              ? 'No reminders match these filters.'
              : 'No care reminders have been added for this stable yet.'
        }
        listToolbar={
          <ListFilterBar
            config={filterConfig}
            query={filtering.query}
            onQueryChange={filtering.setQuery}
            selectedFacets={filtering.selectedFacets}
            onFacetChange={filtering.setFacetValue}
            onReset={filtering.resetFilters}
            isFiltering={filtering.isFiltering}
          />
        }
        listFooter={
          <ListLoadMoreFooter
            status={paginatedReminders.status}
            onLoadMore={paginatedReminders.loadMore}
            pageSize={reminderPageSize}
            loadMoreLabel="Load more reminders"
            loadingLabel="Loading reminders…"
          />
        }
        onAdd={onAdd}
        onComplete={(reminder) =>
          runReminderActionWithToast(completeReminder, reminder, {
            successTitle: 'Reminder completed',
            successDescription: `${reminder.title} was marked as complete.`,
          })
        }
        onDismiss={(reminder) =>
          runReminderActionWithToast(dismissReminder, reminder, {
            successTitle: 'Reminder dismissed',
            successDescription: `${reminder.title} was dismissed.`,
          })
        }
        onRemove={(reminder) =>
          runReminderActionWithToast(removeReminder, reminder, {
            successTitle: 'Reminder removed',
            successDescription: `${reminder.title} was removed.`,
          })
        }
      />
    </div>
  )
}

const runReminderActionWithToast = async (
  mutateReminder: (args: { id: Id<'careReminders'> }) => Promise<unknown>,
  reminder: Doc<'careReminders'>,
  messages: {
    successTitle: string
    successDescription: string
  },
) => {
  try {
    await mutateReminder({ id: reminder._id })
    toast.success(messages.successTitle, {
      description: <p>{messages.successDescription}</p>,
      position: 'top-right',
    })
  } catch (err) {
    toast.error('Oops! Something went wrong.', {
      description: <p>Please try again.</p>,
      position: 'top-right',
    })
  }
}
