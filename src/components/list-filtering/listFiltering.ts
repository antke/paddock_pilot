export type ListSearchField<TItem> = {
  id: string
  weight: number
  getValues: (item: TItem) => ReadonlyArray<string | null | undefined>
}

export type ListFilterOption = {
  value: string
  label: string
}

export type ListFilterUiFacet<TFacetId extends string = string> = {
  id: TFacetId
  label: string
  allLabel: string
  options: ReadonlyArray<ListFilterOption>
}

export type ListFilterUiConfig<TFacetId extends string = string> = {
  searchLabel?: string
  searchPlaceholder: string
  facets: ReadonlyArray<ListFilterUiFacet<TFacetId>>
}

export type ListFilterFacet<TItem, TFacetId extends string = string> =
  ListFilterUiFacet<TFacetId> & {
    matches: (item: TItem, selectedValue: string) => boolean
  }

export type ListFilterConfig<TItem, TFacetId extends string = string> = Omit<
  ListFilterUiConfig<TFacetId>,
  'facets'
> & {
  searchFields: ReadonlyArray<ListSearchField<TItem>>
  facets: ReadonlyArray<ListFilterFacet<TItem, TFacetId>>
}

export type ListFilterSelectedFacets<TFacetId extends string = string> =
  Partial<Record<TFacetId, string>>

export type ListFilterState<TFacetId extends string = string> = {
  query: string
  facets: Readonly<ListFilterSelectedFacets<TFacetId>>
}

export function getNextSelectedFacets<TFacetId extends string>(
  currentFacets: ListFilterSelectedFacets<TFacetId>,
  facetId: TFacetId,
  value: string,
): ListFilterSelectedFacets<TFacetId> {
  const currentValue = currentFacets[facetId]

  if (currentValue === value || (!currentValue && !value)) {
    return currentFacets
  }

  const nextFacets = { ...currentFacets }

  if (value) {
    nextFacets[facetId] = value
  } else {
    delete nextFacets[facetId]
  }

  return nextFacets
}

export function hasActiveListFilterState<TFacetId extends string>({
  query,
  facets,
}: ListFilterState<TFacetId>) {
  return query.trim().length > 0 || Object.values(facets).some(Boolean)
}

type FilterListItemsArgs<TItem, TFacetId extends string = string> = {
  items: ReadonlyArray<TItem>
  config: ListFilterConfig<TItem, TFacetId>
  state: ListFilterState<TFacetId>
}

type ScoredItem<TItem> = {
  item: TItem
  score: number
  index: number
}

export function filterListItems<TItem, TFacetId extends string = string>({
  items,
  config,
  state,
}: FilterListItemsArgs<TItem, TFacetId>): Array<TItem> {
  const activeFacets = getActiveFacets(config.facets, state.facets)
  const queryText = normalizeListSearchText(state.query)
  const queryTerms = getSearchTerms(queryText)
  const scoredItems: Array<ScoredItem<TItem>> = []

  items.forEach((item, index) => {
    if (!matchesActiveFacets(item, activeFacets)) return

    const score = getSearchScore(
      item,
      config.searchFields,
      queryText,
      queryTerms,
    )

    if (score === undefined) return

    scoredItems.push({ item, score, index })
  })

  return scoredItems
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map(({ item }) => item)
}

export function normalizeListSearchText(value: string) {
  return value.trim().toLowerCase()
}

function getSearchTerms(queryText: string) {
  if (!queryText) return []

  return queryText.split(/\s+/).filter(Boolean)
}

function getActiveFacets<TItem, TFacetId extends string>(
  facets: ReadonlyArray<ListFilterFacet<TItem, TFacetId>>,
  selectedFacets: Readonly<ListFilterSelectedFacets<TFacetId>>,
) {
  const activeFacets: Array<{
    facet: ListFilterFacet<TItem, TFacetId>
    selectedValue: string
  }> = []

  facets.forEach((facet) => {
    const selectedValue = selectedFacets[facet.id]

    if (selectedValue) {
      activeFacets.push({ facet, selectedValue })
    }
  })

  return activeFacets
}

function matchesActiveFacets<TItem, TFacetId extends string>(
  item: TItem,
  activeFacets: ReadonlyArray<{
    facet: ListFilterFacet<TItem, TFacetId>
    selectedValue: string
  }>,
) {
  return activeFacets.every(({ facet, selectedValue }) =>
    facet.matches(item, selectedValue),
  )
}

function getSearchScore<TItem>(
  item: TItem,
  searchFields: ReadonlyArray<ListSearchField<TItem>>,
  queryText: string,
  queryTerms: ReadonlyArray<string>,
) {
  if (queryTerms.length === 0) return 0

  const fieldTexts = searchFields.map((field) => ({
    field,
    values: getSearchFieldTexts(item, field),
  }))

  const matchesEveryTerm = queryTerms.every((term) =>
    fieldTexts.some(({ values }) =>
      values.some((fieldText) => fieldText.includes(term)),
    ),
  )

  if (!matchesEveryTerm) return undefined

  const score = fieldTexts.reduce((totalScore, { field, values }) => {
    const fieldScore = values.reduce((currentScore, fieldText) => {
      const phraseScore = fieldText.includes(queryText)
        ? field.weight * (queryTerms.length + 1)
        : 0
      const termScore = queryTerms.reduce(
        (sum, term) => sum + (fieldText.includes(term) ? field.weight : 0),
        0,
      )

      return currentScore + phraseScore + termScore
    }, 0)

    return totalScore + fieldScore
  }, 0)

  return score > 0 ? score : undefined
}

function getSearchFieldTexts<TItem>(
  item: TItem,
  field: ListSearchField<TItem>,
) {
  return field
    .getValues(item)
    .map((value) => (value ? normalizeListSearchText(value) : ''))
    .filter(Boolean)
}
