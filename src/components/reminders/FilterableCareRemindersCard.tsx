import { useMemo } from 'react'
import type { ComponentProps } from 'react'

import { ListFilterBar } from '#/components/list-filtering/ListFilterBar'
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
  const listToolbar =
    reminders.length > 0 ? (
      <ListFilterBar
        config={filterConfig}
        query={filtering.query}
        onQueryChange={filtering.setQuery}
        selectedFacets={filtering.selectedFacets}
        onFacetChange={filtering.setFacetValue}
        onReset={filtering.resetFilters}
        isFiltering={filtering.isFiltering}
      />
    ) : undefined

  return (
    <CareRemindersCard
      {...cardProps}
      reminders={filtering.items}
      horseOptions={horseOptions}
      emptyMessage={
        filtering.isFiltering ? 'No reminders match these filters.' : emptyMessage
      }
      listToolbar={listToolbar}
    />
  )
}
