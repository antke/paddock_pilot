import { useEffect, useMemo, useState } from 'react'

import type {
  ListFilterSelectedFacets,
  ListFilterState,
} from './listFiltering'
import {
  getNextSelectedFacets,
  hasActiveListFilterState,
} from './listFiltering'

type UseListQueryStateArgs<TFacetId extends string = string> = {
  initialQuery?: string
  initialFacets?: ListFilterSelectedFacets<TFacetId>
  searchDebounceMs?: number
}

export function useListQueryState<TFacetId extends string = string>({
  initialQuery = '',
  initialFacets,
  searchDebounceMs = 250,
}: UseListQueryStateArgs<TFacetId> = {}) {
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const [selectedFacets, setSelectedFacets] = useState<
    ListFilterSelectedFacets<TFacetId>
  >(() => initialFacets ?? {})

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(query)
    }, searchDebounceMs)

    return () => window.clearTimeout(timeout)
  }, [query, searchDebounceMs])

  const setFacetValue = (facetId: TFacetId, value: string) => {
    setSelectedFacets((currentFacets) =>
      getNextSelectedFacets(currentFacets, facetId, value),
    )
  }

  const resetFilters = () => {
    setQuery('')
    setDebouncedQuery('')
    setSelectedFacets({})
  }

  const isFiltering = hasActiveListFilterState({
    query,
    facets: selectedFacets,
  })

  const queryState = useMemo<ListFilterState<TFacetId>>(
    () => ({ query: debouncedQuery, facets: selectedFacets }),
    [debouncedQuery, selectedFacets],
  )

  return {
    query,
    debouncedQuery,
    setQuery,
    selectedFacets,
    setFacetValue,
    resetFilters,
    isFiltering,
    queryState,
  }
}
