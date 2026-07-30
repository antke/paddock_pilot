import type { ComponentProps, ReactNode } from 'react'

import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'

import {
  getListFilterEmptyMessage,
  ListFilterControls,
} from './ListFilterControls'
import type { ListFilterControlsState } from './ListFilterControls'
import type { ListFilterUiConfig } from './listFiltering'

type FilteredDashboardItemListProps<
  TItem,
  TFacetId extends string = string,
> = Omit<ComponentProps<typeof DashboardItemList>, 'children'> & {
  config: ListFilterUiConfig<TFacetId>
  filtering: ListFilterControlsState<TFacetId> & {
    items: ReadonlyArray<TItem>
  }
  emptyMessage: ReactNode
  filteredEmptyMessage: ReactNode
  hideControlsWhenEmpty?: boolean
  renderItem: (item: TItem) => ReactNode
  stickyFilters?: boolean
}

export function FilteredDashboardItemList<
  TItem,
  TFacetId extends string = string,
>({
  config,
  emptyMessage,
  filteredEmptyMessage,
  filtering,
  gap = 'loose',
  hideControlsWhenEmpty = true,
  renderItem,
  stickyFilters = false,
  ...props
}: FilteredDashboardItemListProps<TItem, TFacetId>) {
  return (
    <DashboardItemList gap={gap} {...props}>
      <ListFilterControls
        config={config}
        filtering={filtering}
        hideWhenEmpty={hideControlsWhenEmpty}
        sticky={stickyFilters}
      />

      {filtering.items.length === 0 ? (
        <DashboardEmptyState chrome="soft">
          {getListFilterEmptyMessage({
            filtering,
            emptyMessage,
            filteredEmptyMessage,
          })}
        </DashboardEmptyState>
      ) : (
        filtering.items.map(renderItem)
      )}
    </DashboardItemList>
  )
}
