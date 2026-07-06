import { useMemo, useState } from 'react'

import {
  filterListItems,
  getNextSelectedFacets,
  hasActiveListFilterState,
} from './listFiltering'
import type {
  ListFilterConfig,
  ListFilterSelectedFacets,
} from './listFiltering'

type UseListFilteringArgs<TItem, TFacetId extends string = string> = {
  items: ReadonlyArray<TItem>
  config: ListFilterConfig<TItem, TFacetId>
  initialQuery?: string
  initialFacets?: ListFilterSelectedFacets<TFacetId>
}

export function useListFiltering<TItem, TFacetId extends string = string>({
  items,
  config,
  initialQuery = '',
  initialFacets,
}: UseListFilteringArgs<TItem, TFacetId>) {
  const [query, setQuery] = useState(initialQuery)
  const [selectedFacets, setSelectedFacets] = useState<
    ListFilterSelectedFacets<TFacetId>
  >(() => initialFacets ?? {})

  const filteredItems = useMemo(
    () =>
      filterListItems({
        items,
        config,
        state: { query, facets: selectedFacets },
      }),
    [config, items, query, selectedFacets],
  )

  const setFacetValue = (facetId: TFacetId, value: string) => {
    setSelectedFacets((currentFacets) =>
      getNextSelectedFacets(currentFacets, facetId, value),
    )
  }

  const resetFilters = () => {
    setQuery('')
    setSelectedFacets({})
  }

  const isFiltering = hasActiveListFilterState({
    query,
    facets: selectedFacets,
  })

  return {
    items: filteredItems,
    query,
    setQuery,
    selectedFacets,
    setFacetValue,
    resetFilters,
    isFiltering,
    resultCount: filteredItems.length,
    totalCount: items.length,
  }
}
