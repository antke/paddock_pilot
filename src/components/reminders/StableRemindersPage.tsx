import { getHorseDisplayName } from 'shared/horses/horseDisplayName'
import {
  isOnlyOutstandingFilter,
  createCareReminderListFilterConfig,
  getCareReminderListQueryArgs,
} from './careReminderListFilters'
import { Link } from '@tanstack/react-router'
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
import type { Id } from 'convex/_generated/dataModel'
import { useMutation, usePaginatedQuery, useQuery } from 'convex/react'
import { useCallback, useMemo, useState } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { useLocalDateContext } from '#/lib/useLocalDateContext'
import { useCareReminderActions } from './useCareReminderActions'
import { Button } from '#/components/ui/button'
import { CareRemindersCard } from './CareRemindersCard'
import type { CareReminderSubmitData } from './CareReminderForm'
import type { CareReminderListFilterFacetId } from './careReminderListFilters'

type StableRemindersPageProps = {
  stableId: string
  reminderId?: string
  onClearSelection?: () => void
  chrome?: DashboardChrome
}

const reminderPageSize = 30

export function StableRemindersPage({
  stableId,
  reminderId,
  onClearSelection,
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
  const actions = useCareReminderActions()
  const assigneeOptions = useQuery(api.careReminders.assigneeOptions, {
    stableId: stableId as Id<'stables'>,
  })
  const selectedReminder = useQuery(
    api.careReminders.get,
    reminderId
      ? { stableId: stableId as Id<'stables'>, id: reminderId }
      : 'skip',
  )
  const horseOptions = useMemo(
    () =>
      horses.map((horse) => ({
        id: horse._id,
        name: getHorseDisplayName(horse),
      })),
    [horses],
  )
  const filterConfig = useMemo(
    () => createCareReminderListFilterConfig(horseOptions, locale),
    [horseOptions, locale],
  )
  const filtering = useListQueryState<CareReminderListFilterFacetId>({
    initialFacets: { state: 'pending' },
  })
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
          assignedTo: (values.assignedTo || undefined) as
            Id<'users'> | undefined,
          status: 'pending',
        } as const

        if (values.targetType === 'horses') {
          await addReminderForHorses({
            requestId: values.requestId,
            sharing: values.sharing,
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
          requestId: values.requestId,
          shareWithStable: values.shareWithStable,
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
      reminders={
        selectedReminder
          ? [
              selectedReminder,
              ...paginatedReminders.results.filter(
                (item) => item.reminder._id !== selectedReminder.reminder._id,
              ),
            ]
          : paginatedReminders.results
      }
      assigneeOptions={assigneeOptions}
      canAddReminder={permissions.canManageStableReminders}
      horseOptions={horseOptions}
      chrome={chrome}
      showHeader={false}
      emptyMessage={
        isOnlyOutstandingFilter({
          query: filtering.query,
          facets: filtering.selectedFacets,
        })
          ? t('reminders.outstandingEmpty')
          : getListFilterEmptyMessage({
              filtering,
              emptyMessage: t('reminders.stableEmpty'),
              filteredEmptyMessage: t('reminders.filteredEmpty'),
            })
      }
      isLoading={paginatedReminders.status === 'LoadingFirstPage'}
      loadingLabel={t('reminders.loading')}
      listToolbar={
        <>
          {reminderId && (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm">
                {selectedReminder === null
                  ? t('reminders.notFound')
                  : t('reminders.showingSelected')}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
              >
                {t('reminders.clearSelection')}
              </Button>
            </div>
          )}
          <ListFilterControls
            config={filterConfig}
            filtering={filtering}
            sticky
          />
        </>
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
      {...actions}
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
        description={
          <Link to="/profile" className="underline underline-offset-4">
            {t('reminders.emailSettings')}
          </Link>
        }
        actions={createAction}
      />
      <DashboardSectionCard contentGap="loose">
        <CareRemindersCard
          enableSharing
          {...props}
          showHeader={false}
          onCreateActionChange={setCreateAction}
        />
      </DashboardSectionCard>
    </DashboardPage>
  )
}
