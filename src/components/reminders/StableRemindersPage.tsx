import type { DashboardChrome } from '#/components/dashboard/dashboardChrome'
import { RouteEntityNotFoundAlert } from '#/components/layout/RouteStatusAlert'
import {
  getListFilterEmptyMessage,
  ListFilterControls,
} from '#/components/list-filtering/ListFilterControls'
import { ListLoadMoreFooter } from '#/components/list-filtering/ListLoadMoreFooter'
import { useListQueryState } from '#/components/list-filtering/useListQueryState'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useMutation, usePaginatedQuery } from 'convex/react'
import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { formatCountLabel } from '#/lib/numberDisplay'
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
const reminderLoadingLabel = 'Loading reminders...'

export function StableRemindersPage({
  stableId,
  chrome = 'cards',
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
  const [createAction, setCreateAction] = useState<ReactNode | null>(null)
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

  const onAdd = useCallback(
    async (values: CareReminderSubmitData) => {
      if (!stable) return

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

          showAppSuccessToast({
            title: 'Reminders added',
            description: (
              <p>
                {values.title} was added for{' '}
                {formatCountLabel(values.horseIds.length, 'horse')}.
              </p>
            ),
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

        showAppSuccessToast({
          title: 'Reminder added',
          description: <p>{values.title} is now on the care reminders list.</p>,
        })
      } catch (err) {
        showAppErrorToast()
        throw err
      }
    },
    [addReminder, addReminderForHorses, stable],
  )

  if (!stable) {
    return <RouteEntityNotFoundAlert entity="stable" />
  }

  return (
    <DashboardPage>
      <DashboardPageHeader title="Care reminders" actions={createAction} />

      <DashboardSectionCard contentGap="loose">
        <CareRemindersCard
          reminders={paginatedReminders.results as Array<CareReminderListItem>}
          canAddReminder={permissions.canManageStableReminders}
          horseOptions={horseOptions}
          chrome={chrome}
          showHeader={false}
          emptyMessage={getListFilterEmptyMessage({
            filtering,
            emptyMessage:
              'No care reminders have been added for this stable yet.',
            filteredEmptyMessage: 'No reminders match these filters.',
          })}
          isLoading={paginatedReminders.status === 'LoadingFirstPage'}
          loadingLabel={reminderLoadingLabel}
          onCreateActionChange={setCreateAction}
          listToolbar={
            <ListFilterControls
              config={filterConfig}
              filtering={filtering}
              sticky
            />
          }
          listFooter={
            <ListLoadMoreFooter
              status={paginatedReminders.status}
              onLoadMore={paginatedReminders.loadMore}
              pageSize={reminderPageSize}
              loadMoreLabel="Load more reminders"
              loadingLabel={reminderLoadingLabel}
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
      </DashboardSectionCard>
    </DashboardPage>
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
    showAppSuccessToast({
      title: messages.successTitle,
      description: <p>{messages.successDescription}</p>,
    })
  } catch (err) {
    showAppErrorToast()
  }
}
