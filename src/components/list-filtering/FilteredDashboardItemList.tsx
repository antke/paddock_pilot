import { MotionList } from '#/components/motion/MotionList'
import { useT } from '#/i18n/LocaleProvider'
import type { ComponentProps, Key, ReactNode } from 'react'

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
  listActions?: ReactNode
  getItemKey: (item: TItem) => Key
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
  listActions,
  renderItem,
  getItemKey,
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

      {listActions}

      <p
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {t('listControls.results', { count: filtering.items.length })}
      </p>

      <MotionList
        items={filtering.items}
        getKey={getItemKey}
        renderItem={renderItem}
        className={cn('gap-2', usesGrid && 'lg:grid-cols-2')}
        empty={
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
        }
      />
    </DashboardItemList>
  )
}
