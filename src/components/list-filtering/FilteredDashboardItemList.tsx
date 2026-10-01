import { useT } from '#/i18n/LocaleProvider'
import { isValidElement } from 'react'
import type { ComponentProps, ReactNode } from 'react'

import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'
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
  /** Complete unfiltered empty state; replaces, rather than nests, the default surface. */
  emptyState?: ReactNode
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
  emptyState,
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
  const t = useT()

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
        {t('listControls.results', { count: filtering.items.length })}
      </p>

      {filtering.items.length === 0 ? (
        !filtering.isFiltering && emptyState !== undefined ? (
          emptyState
        ) : (
          <DashboardEmptyState chrome="soft">
            {getListFilterEmptyMessage({
              filtering,
              emptyMessage,
              filteredEmptyMessage,
            })}
          </DashboardEmptyState>
        )
      ) : (
        <DashboardItemList
          role="list"
          gap="comfortable"
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
