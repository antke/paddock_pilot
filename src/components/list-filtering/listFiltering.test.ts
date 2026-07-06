import { describe, expect, it } from 'vitest'

import {
  filterListItems,
  getNextSelectedFacets,
  hasActiveListFilterState,
} from './listFiltering'
import type { ListFilterConfig, ListFilterSelectedFacets } from './listFiltering'

type TestItem = {
  title: string
  notes: string
  category: 'admin' | 'vet'
  state: 'open' | 'done'
}

const items: ReadonlyArray<TestItem> = [
  {
    title: 'Book farrier visit',
    notes: 'Add vaccination certificate note before the appointment.',
    category: 'admin',
    state: 'open',
  },
  {
    title: 'Vaccination certificate upload',
    notes: 'Store completed paperwork.',
    category: 'vet',
    state: 'done',
  },
  {
    title: 'Feed room inventory',
    notes: 'Order salt blocks.',
    category: 'admin',
    state: 'done',
  },
]

const config = {
  searchPlaceholder: 'Search items',
  searchFields: [
    {
      id: 'title',
      weight: 10,
      getValues: (item) => [item.title],
    },
    {
      id: 'notes',
      weight: 4,
      getValues: (item) => [item.notes],
    },
  ],
  facets: [
    {
      id: 'category',
      label: 'Category',
      allLabel: 'All categories',
      options: [
        { value: 'admin', label: 'Admin' },
        { value: 'vet', label: 'Vet' },
      ],
      matches: (item, selectedValue) => item.category === selectedValue,
    },
    {
      id: 'state',
      label: 'State',
      allLabel: 'All states',
      options: [
        { value: 'open', label: 'Open' },
        { value: 'done', label: 'Done' },
      ],
      matches: (item, selectedValue) => item.state === selectedValue,
    },
  ],
} satisfies ListFilterConfig<TestItem, 'category' | 'state'>

describe('filterListItems', () => {
  it('ranks title matches above lower-weight field matches', () => {
    const result = filterListItems({
      items,
      config,
      state: { query: 'vaccination', facets: {} },
    })

    expect(result.map((item) => item.title)).toEqual([
      'Vaccination certificate upload',
      'Book farrier visit',
    ])
  })

  it('combines facets with search terms', () => {
    const result = filterListItems({
      items,
      config,
      state: {
        query: 'certificate',
        facets: { category: 'vet', state: 'done' },
      },
    })

    expect(result.map((item) => item.title)).toEqual([
      'Vaccination certificate upload',
    ])
  })

  it('preserves incoming order when search is empty', () => {
    const result = filterListItems({
      items,
      config,
      state: { query: '', facets: { category: 'admin' } },
    })

    expect(result.map((item) => item.title)).toEqual([
      'Book farrier visit',
      'Feed room inventory',
    ])
  })
})

describe('list filter state helpers', () => {
  it('updates, removes, and preserves facet state identity on no-op changes', () => {
    const current: ListFilterSelectedFacets<'category' | 'state'> = {
      category: 'admin',
    }

    expect(getNextSelectedFacets(current, 'category', 'admin')).toBe(current)
    expect(getNextSelectedFacets(current, 'category', '')).toEqual({})
    expect(getNextSelectedFacets(current, 'state', 'done')).toEqual({
      category: 'admin',
      state: 'done',
    })
  })

  it('detects active query or facet filters', () => {
    expect(hasActiveListFilterState({ query: '  ', facets: {} })).toBe(false)
    expect(hasActiveListFilterState({ query: 'feed', facets: {} })).toBe(true)
    expect(
      hasActiveListFilterState({ query: '', facets: { category: 'vet' } }),
    ).toBe(true)
  })
})
