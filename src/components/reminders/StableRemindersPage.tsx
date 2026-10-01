import { useT, useLocale } from '#/i18n/LocaleProvider'
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
import type { ComponentProps, ReactNode } from 'react'
import { useLocalDateContext } from '#/lib/useLocalDateContext'
import { CareRemindersCard } from './CareRemindersCard'
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
  const t = useT()
  const { locale } = useLocale()

  const { today } = useLocalDateContext()
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
    () => createCareReminderListFilterConfig(horseOptions, locale),
    [horseOptions, locale],
  )
  const filtering = useListQueryState<CareReminderListFilterFacetId>()
  const reminderQueryArgs = useMemo(
    () => ({
      stableId: stableId as Id<'stables'>,
      today,
      ...getCareReminderListQueryArgs(filtering.queryState),
    }),
    [filtering.queryState, stableId, today],
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
            title: t('reminders.addedMany'),
            description: (
              <p>
                {t('reminders.addedFor', {
                  title: values.title,
                  count: values.horseIds.length,
                })}
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
          title: t('reminders.added'),
          description: <p>{t('reminders.onList', { name: values.title })}</p>,
        })
      } catch (err) {
        showAppErrorToast()
        throw err
      }
    },
    [addReminder, addReminderForHorses, stable, t],
  )

  if (!stable) {
    return <RouteEntityNotFoundAlert entity="stable" />
  }

  return (
    <StableRemindersPageView
      reminders={paginatedReminders.results}
      canAddReminder={permissions.canManageStableReminders}
      horseOptions={horseOptions}
      chrome={chrome}
      showHeader={false}
      emptyMessage={getListFilterEmptyMessage({
        filtering,
        emptyMessage: t('reminders.stableEmpty'),
        filteredEmptyMessage: t('reminders.filteredEmpty'),
      })}
      isLoading={paginatedReminders.status === 'LoadingFirstPage'}
      loadingLabel={t('reminders.loading')}
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
          loadMoreLabel={t('reminders.loadMore')}
          loadingLabel={t('reminders.loading')}
        />
      }
      onAdd={onAdd}
      onComplete={(reminder) =>
        runReminderActionWithToast(completeReminder, reminder, {
          successTitle: t('reminders.completed'),
          successDescription: t('reminders.markedComplete', {
            name: reminder.title,
          }),
        })
      }
      onDismiss={(reminder) =>
        runReminderActionWithToast(dismissReminder, reminder, {
          successTitle: t('reminders.dismissed'),
          successDescription: t('reminders.markedDismissed', {
            name: reminder.title,
          }),
        })
      }
      onRemove={(reminder) =>
        runReminderActionWithToast(removeReminder, reminder, {
          successTitle: t('reminders.removed'),
          successDescription: t('reminders.markedRemoved', {
            name: reminder.title,
          }),
        })
      }
    />
  )
}

/** Shared page renderer: data/mutations stay in the connected route or local lab. */
export function StableRemindersPageView(
  props: ComponentProps<typeof CareRemindersCard>,
) {
  const t = useT()
  const [createAction, setCreateAction] = useState<ReactNode | null>(null)
  return (
    <DashboardPage>
      <DashboardPageHeader
        title={t('reminders.careReminders')}
        actions={createAction}
      />
      <DashboardSectionCard contentGap="loose">
        <CareRemindersCard
          {...props}
          showHeader={false}
          onCreateActionChange={setCreateAction}
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
    throw err
  }
}
