import {
  isOnlyOutstandingFilter,
  createCareReminderListFilterConfig,
} from './careReminderListFilters'
import { useT, useLocale } from '#/i18n/LocaleProvider'
import { useMemo } from 'react'
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
  const filtering = useListFiltering({
    items: reminders,
    config: filterConfig,
    initialFacets: { state: 'pending' },
  })

  const View = pageLayout ? StableRemindersPageView : CareRemindersCard

  return (
    <View
      {...cardProps}
      reminders={filtering.items}
      horseOptions={horseOptions}
      emptyMessage={
        isOnlyOutstandingFilter({
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
        <ListFilterControls
          config={filterConfig}
          filtering={filtering}
          sticky={pageLayout}
          hideWhenEmpty={!pageLayout}
        />
      }
    />
  )
}
