import {
  isOnlyOutstandingFilter,
  createCareReminderListFilterConfig,
  matchesStatusView,
} from './careReminderListFilters'
import type { CareReminderStatusView } from './careReminderListFilters'
import { CareReminderStatusToggle } from './CareReminderStatusToggle'
import { useT, useLocale } from '#/i18n/LocaleProvider'
import { useMemo, useState } from 'react'
import type { ComponentProps } from 'react'

import {
  getListFilterEmptyMessage,
  ListFilterControls,
} from '#/components/list-filtering/ListFilterControls'
import { useListFiltering } from '#/components/list-filtering/useListFiltering'

import { CareRemindersCard } from './CareRemindersCard'
import { StableRemindersPageView } from './StableRemindersPage'

type FilterableCareRemindersCardProps = ComponentProps<
  typeof CareRemindersCard
> & { pageLayout?: boolean }

export function FilterableCareRemindersCard({
  reminders,
  horseOptions,
  emptyMessage,
  pageLayout = false,
  ...cardProps
}: FilterableCareRemindersCardProps) {
  const t = useT()
  const { locale } = useLocale()

  const filterConfig = useMemo(
    () => createCareReminderListFilterConfig(horseOptions ?? [], locale),
    [horseOptions, locale],
  )
  const [view, setView] = useState<CareReminderStatusView>('pending')
  const filtering = useListFiltering({
    items: reminders.filter((item) => matchesStatusView(item, view)),
    config: filterConfig,
  })

  const View = pageLayout ? StableRemindersPageView : CareRemindersCard

  return (
    <View
      {...cardProps}
      outstandingCount={
        reminders.filter((item) => item.reminder.status === 'pending').length
      }
      reminders={filtering.items}
      horseOptions={horseOptions}
      emptyMessage={
        isOnlyOutstandingFilter(view, {
          query: filtering.query,
          facets: filtering.selectedFacets,
        })
          ? t('reminders.outstandingEmpty')
          : getListFilterEmptyMessage({
              filtering,
              emptyMessage,
              filteredEmptyMessage: t('reminders.filteredEmpty'),
            })
      }
      listToolbar={
        <>
          <ListFilterControls
            config={filterConfig}
            filtering={filtering}
            sticky={pageLayout}
            hideWhenEmpty={!pageLayout}
          />
          {(pageLayout || reminders.length > 0) && (
            <CareReminderStatusToggle value={view} onChange={setView} />
          )}
        </>
      }
    />
  )
}
