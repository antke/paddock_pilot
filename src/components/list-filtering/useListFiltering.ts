import { useMemo } from 'react'
import { useSessionState } from '#/lib/useSessionState'

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
  storageKey?: string
}

export function useListFiltering<TItem, TFacetId extends string = string>({
  items,
  config,
  initialQuery = '',
  initialFacets,
  storageKey,
}: UseListFilteringArgs<TItem, TFacetId>) {
  const [query, setQuery] = useSessionState(
    storageKey ? `${storageKey}:query` : undefined,
    initialQuery,
    (value) =>
      typeof value === 'string' && value.length < 1000 ? value : undefined,
  )
  const [selectedFacets, setSelectedFacets] = useSessionState<
    ListFilterSelectedFacets<TFacetId>
  >(
    storageKey ? `${storageKey}:facets` : undefined,
    () => initialFacets ?? {},
    (value) => {
      if (!value || typeof value !== 'object' || Array.isArray(value))
        return undefined
      const result: ListFilterSelectedFacets<TFacetId> = {}
      for (const facet of config.facets) {
        const selected = (value as Record<string, unknown>)[facet.id]
        if (
          typeof selected === 'string' &&
          facet.options.some((option) => option.value === selected)
        )
          result[facet.id] = selected
      }
      return result
    },
  )

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
