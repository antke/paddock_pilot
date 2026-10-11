import {
  isOnlyOutstandingFilter,
  createHorseCareReminderListFilterConfig,
} from './careReminderListFilters'
import { useT, useLocale } from '#/i18n/LocaleProvider'
import {
  getListFilterEmptyMessage,
  ListFilterControls,
} from '#/components/list-filtering/ListFilterControls'
import { useListFiltering } from '#/components/list-filtering/useListFiltering'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useMutation, useQuery } from 'convex/react'
import { useCallback, useMemo } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { useCareReminderActions } from './useCareReminderActions'
import { CareRemindersCard } from './CareRemindersCard'
import type { CareReminderListItem } from './CareRemindersCard'
import type { CareReminderSubmitData } from './CareReminderForm'

type HorseCareRemindersCardProps = {
  horse: Doc<'horses'>
  onCreateActionChange?: (action: ReactNode | null) => void
}

export function HorseCareRemindersCard({
  horse,
  onCreateActionChange,
}: HorseCareRemindersCardProps) {
  const t = useT()
  const { data } = useSuspenseQuery(
    convexQuery(api.careReminders.listForHorse, { horseId: horse._id }),
  )
  const addReminder = useMutation(api.careReminders.add)
  const actions = useCareReminderActions()
  const assigneeOptions = useQuery(api.careReminders.assigneeOptions, {
    stableId: horse.stableId,
    horseId: horse._id,
  })
  const onAdd = useCallback(
    async (values: CareReminderSubmitData) => {
      try {
        await addReminder({
          stableId: horse.stableId,
          horseId: horse._id,
          title: values.title,
          description: values.description,
          category: values.category,
          dueDate: values.dueDate,
          priority: values.priority,
          assignedTo: (values.assignedTo || undefined) as
            Id<'users'> | undefined,
          status: 'pending',
        })

        showAppSuccessToast({
          title: t('reminders.added'),
          description: (
            <p>
              {t('reminders.linked', { title: values.title, name: horse.name })}
            </p>
          ),
        })
      } catch (err) {
        showAppErrorToast()
        throw err
      }
    },
    [addReminder, horse._id, horse.name, horse.stableId, t],
  )

  return (
    <HorseCareRemindersView
      horse={horse}
      records={data.reminders}
      canManage={data.canManage}
      onAdd={onAdd}
      {...actions}
      items={data.items}
      assigneeOptions={assigneeOptions}
      onCreateActionChange={onCreateActionChange}
    />
  )
}

type HorseCareRemindersViewProps = HorseCareRemindersCardProps & {
  items?: Array<CareReminderListItem>
  assigneeOptions?: Array<{ id: string; name: string }>
  records: Array<Doc<'careReminders'>>
  canManage: boolean
  onAdd: (values: CareReminderSubmitData) => Promise<void>
  onComplete: ComponentProps<typeof CareRemindersCard>['onComplete']
  onReopen?: ComponentProps<typeof CareRemindersCard>['onReopen']
  onEdit?: ComponentProps<typeof CareRemindersCard>['onEdit']
  onDismiss: (record: Doc<'careReminders'>) => Promise<void>
  onRemove: (record: Doc<'careReminders'>) => Promise<void>
}

export function HorseCareRemindersView({
  horse,
  records,
  items,
  assigneeOptions,
  onReopen,
  onEdit,
  canManage,
  onAdd,
  onComplete,
  onDismiss,
  onRemove,
  onCreateActionChange,
}: HorseCareRemindersViewProps) {
  const t = useT()
  const { locale } = useLocale()
  const reminders: Array<CareReminderListItem> =
    items ??
    records.map((reminder) => ({
      reminder,
      horseName: horse.name,
      canManage: canManage,
    }))
  const filterConfig = useMemo(
    () => createHorseCareReminderListFilterConfig(locale),
    [locale],
  )
  const filtering = useListFiltering({
    items: reminders,
    config: filterConfig,
    initialFacets: { state: 'pending' },
  })

  return (
    <CareRemindersCard
      title={t('reminders.careReminders')}
      description={t('reminders.horseHelp')}
      reminders={filtering.items}
      canAddReminder={canManage}
      fixedHorseId={horse._id}
      emptyMessage={
        isOnlyOutstandingFilter({
          query: filtering.query,
          facets: filtering.selectedFacets,
        })
          ? t('reminders.outstandingEmpty')
          : getListFilterEmptyMessage({
              filtering,
              emptyMessage: t('reminders.horseEmpty'),
              filteredEmptyMessage: t('reminders.filteredEmpty'),
            })
      }
      listToolbar={
        <ListFilterControls
          config={filterConfig}
          filtering={filtering}
          hideWhenEmpty
        />
      }
      onAdd={onAdd}
      assigneeOptions={assigneeOptions}
      onEdit={onEdit}
      onReopen={onReopen}
      onComplete={onComplete}
      onDismiss={onDismiss}
      onRemove={onRemove}
      chrome="flat"
      showHeader={false}
      recordHeadingLevel={3}
      onCreateActionChange={onCreateActionChange}
    />
  )
}
