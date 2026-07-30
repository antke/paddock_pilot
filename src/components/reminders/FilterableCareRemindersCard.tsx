import { useMemo } from 'react'
import type { ComponentProps } from 'react'

import {
  getListFilterEmptyMessage,
  ListFilterControls,
} from '#/components/list-filtering/ListFilterControls'
import { useListFiltering } from '#/components/list-filtering/useListFiltering'

import { CareRemindersCard } from './CareRemindersCard'
import { createCareReminderListFilterConfig } from './careReminderListFilters'

type FilterableCareRemindersCardProps = ComponentProps<typeof CareRemindersCard>

export function FilterableCareRemindersCard({
  reminders,
  horseOptions,
  emptyMessage,
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

  return (
    <CareRemindersCard
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
          hideWhenEmpty
        />
      }
    />
  )
}
