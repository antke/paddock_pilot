import type { ReactNode } from 'react'

import type {
  ListFilterSelectedFacets,
  ListFilterUiConfig,
} from './listFiltering'
import { ListFilterBar } from './ListFilterBar'

export type ListFilterControlsState<TFacetId extends string = string> = {
  query: string
  setQuery: (query: string) => void
  selectedFacets: Readonly<ListFilterSelectedFacets<TFacetId>>
  setFacetValue: (facetId: TFacetId, value: string) => void
  resetFilters: () => void
  isFiltering: boolean
  totalCount?: number
}

type ListFilterControlsProps<TFacetId extends string = string> = {
  config: ListFilterUiConfig<TFacetId>
  filtering: ListFilterControlsState<TFacetId>
  className?: string
  hideWhenEmpty?: boolean
  sticky?: boolean
}

export function ListFilterControls<TFacetId extends string = string>({
  config,
  filtering,
  className,
  hideWhenEmpty = false,
  sticky = false,
}: ListFilterControlsProps<TFacetId>) {
  if (hideWhenEmpty && filtering.totalCount === 0) {
    return null
  }

  return (
    <ListFilterBar
      config={config}
      query={filtering.query}
      onQueryChange={filtering.setQuery}
      selectedFacets={filtering.selectedFacets}
      onFacetChange={filtering.setFacetValue}
      onReset={filtering.resetFilters}
      isFiltering={filtering.isFiltering}
      className={className}
      sticky={sticky}
    />
  )
}

export function getListFilterEmptyMessage({
  emptyMessage,
  filteredEmptyMessage,
  filtering,
}: {
  emptyMessage: ReactNode
  filteredEmptyMessage: ReactNode
  filtering: Pick<ListFilterControlsState, 'isFiltering'>
}) {
  return filtering.isFiltering ? filteredEmptyMessage : emptyMessage
}
