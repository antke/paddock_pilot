import { useMemo } from 'react'
import type { ComponentProps } from 'react'

import {
  getListFilterEmptyMessage,
  ListFilterControls,
} from '#/components/list-filtering/ListFilterControls'
import { useListFiltering } from '#/components/list-filtering/useListFiltering'

import { CareRemindersCard } from './CareRemindersCard'
import { StableRemindersPageView } from './StableRemindersPage'
import { createCareReminderListFilterConfig } from './careReminderListFilters'

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
  const filterConfig = useMemo(
    () => createCareReminderListFilterConfig(horseOptions ?? []),
    [horseOptions],
  )
  const filtering = useListFiltering({
    items: reminders,
    config: filterConfig,
  })

  const View = pageLayout ? StableRemindersPageView : CareRemindersCard

  return (
    <View
      {...cardProps}
      reminders={filtering.items}
      horseOptions={horseOptions}
      emptyMessage={getListFilterEmptyMessage({
        filtering,
        emptyMessage,
        filteredEmptyMessage: 'No reminders match these filters.',
      })}
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
