import { localeInstances } from '#/i18n/resources'
import type { Locale } from 'shared/i18n/locale'
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
import type { Doc } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
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
  const t = useT()
  const { locale } = useLocale()

  const { data } = useSuspenseQuery(
    convexQuery(api.careReminders.listForHorse, { horseId: horse._id }),
  )
  const addReminder = useMutation(api.careReminders.add)
  const completeReminder = useMutation(api.careReminders.complete)
  const dismissReminder = useMutation(api.careReminders.dismiss)
  const removeReminder = useMutation(api.careReminders.remove)
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
      onComplete={(reminder) =>
        completeWithToast(completeReminder, reminder, locale)
      }
      onDismiss={(reminder) =>
        dismissWithToast(dismissReminder, reminder, locale)
      }
      onRemove={(reminder) => removeWithToast(removeReminder, reminder, locale)}
      onCreateActionChange={onCreateActionChange}
    />
  )
}

type HorseCareRemindersViewProps = HorseCareRemindersCardProps & {
  records: Array<Doc<'careReminders'>>
  canManage: boolean
  onAdd: (values: CareReminderSubmitData) => Promise<void>
  onComplete: (record: Doc<'careReminders'>) => Promise<void>
  onDismiss: (record: Doc<'careReminders'>) => Promise<void>
  onRemove: (record: Doc<'careReminders'>) => Promise<void>
}

export function HorseCareRemindersView({
  horse,
  records,
  canManage,
  onAdd,
  onComplete,
  onDismiss,
  onRemove,
  onCreateActionChange,
}: HorseCareRemindersViewProps) {
  const t = useT()
  const { locale } = useLocale()
  const reminders: Array<CareReminderListItem> = records.map((reminder) => ({
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
  })

  return (
    <CareRemindersCard
      title={t('reminders.careReminders')}
      description={t('reminders.horseHelp')}
      reminders={filtering.items}
      canAddReminder={canManage}
      fixedHorseId={horse._id}
      emptyMessage={getListFilterEmptyMessage({
        filtering,
        emptyMessage: t('reminders.horseEmpty'),
        filteredEmptyMessage: t('reminders.filteredEmpty'),
      })}
      listToolbar={
        <ListFilterControls
          config={filterConfig}
          filtering={filtering}
          hideWhenEmpty
        />
      }
      onAdd={onAdd}
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

const completeWithToast = async (
  completeReminder: (args: {
    id: Doc<'careReminders'>['_id']
  }) => Promise<unknown>,
  reminder: Doc<'careReminders'>,
  locale: Locale,
) => {
  const t = localeInstances[locale].t
  try {
    await completeReminder({ id: reminder._id })
    showAppSuccessToast({
      title: t('reminders.completed'),
      description: (
        <p>{t('reminders.markedComplete', { name: reminder.title })}</p>
      ),
    })
  } catch (err) {
    showAppErrorToast()
    throw err
  }
}

const dismissWithToast = async (
  dismissReminder: (args: {
    id: Doc<'careReminders'>['_id']
  }) => Promise<unknown>,
  reminder: Doc<'careReminders'>,
  locale: Locale,
) => {
  const t = localeInstances[locale].t
  try {
    await dismissReminder({ id: reminder._id })
    showAppSuccessToast({
      title: t('reminders.dismissed'),
      description: (
        <p>{t('reminders.markedDismissed', { name: reminder.title })}</p>
      ),
    })
  } catch (err) {
    showAppErrorToast()
    throw err
  }
}

const removeWithToast = async (
  removeReminder: (args: {
    id: Doc<'careReminders'>['_id']
  }) => Promise<unknown>,
  reminder: Doc<'careReminders'>,
  locale: Locale,
) => {
  const t = localeInstances[locale].t
  try {
    await removeReminder({ id: reminder._id })
    showAppSuccessToast({
      title: t('reminders.removed'),
      description: (
        <p>{t('reminders.markedRemoved', { name: reminder.title })}</p>
      ),
    })
  } catch (err) {
    showAppErrorToast()
    throw err
  }
}
