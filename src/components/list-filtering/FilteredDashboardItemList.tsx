import { isValidElement } from 'react'
import type { ComponentProps, ReactNode } from 'react'

import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'
import { formatCountLabel } from '#/lib/numberDisplay'
import { cn } from '#/lib/utils'

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
  itemLayout?: 'grid' | 'list'
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
  itemLayout = 'list',
  renderItem,
  stickyFilters = false,
  className,
  ...props
}: FilteredDashboardItemListProps<TItem, TFacetId>) {
  const usesGrid = itemLayout === 'grid'

  return (
    <DashboardItemList gap={gap} className={className} {...props}>
      <ListFilterControls
        config={config}
        filtering={filtering}
        hideWhenEmpty={hideControlsWhenEmpty}
        sticky={stickyFilters}
      />

      <p
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {formatCountLabel(filtering.items.length, 'result')}
      </p>

      {filtering.items.length === 0 ? (
        <DashboardEmptyState chrome="soft">
          {getListFilterEmptyMessage({
            filtering,
            emptyMessage,
            filteredEmptyMessage,
          })}
        </DashboardEmptyState>
      ) : (
        <DashboardItemList
          role="list"
          gap={gap}
          className={cn(usesGrid && 'lg:grid-cols-2')}
        >
          {filtering.items.map((item, index) => {
            const renderedItem = renderItem(item)
            const key =
              isValidElement(renderedItem) && renderedItem.key !== null
                ? renderedItem.key
                : index

            return (
              <div key={key} role="listitem" className="min-w-0">
                {renderedItem}
              </div>
            )
          })}
        </DashboardItemList>
      )}
    </DashboardItemList>
  )
}
