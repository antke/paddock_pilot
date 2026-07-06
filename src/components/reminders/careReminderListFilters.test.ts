import { describe, expect, it } from 'vitest'

import {
  createCareReminderListFilterConfig,
  getCareReminderListQueryArgs,
} from './careReminderListFilters'

describe('care reminder list query filters', () => {
  it('maps UI filter state to Convex query args', () => {
    const config = createCareReminderListFilterConfig([
      { id: 'horse-1', name: 'Juniper' },
    ])
    const horseFacet = config.facets.find((facet) => facet.id === 'horse')
    const horseValue = horseFacet?.options.find(
      (option) => option.label === 'Juniper',
    )?.value
    if (!horseValue) throw new Error('Missing horse filter option')

    expect(
      getCareReminderListQueryArgs({
        query: '  vaccine  ',
        facets: {
          horse: horseValue,
          state: 'completed',
          category: 'vet',
        },
      }),
    ).toEqual({
      searchQuery: 'vaccine',
      horseId: 'horse-1',
      stableWideOnly: undefined,
      state: 'completed',
      category: 'vet',
    })
  })

  it('maps stable-wide and overdue filters', () => {
    const config = createCareReminderListFilterConfig([])
    const stableWideValue = config.facets.find((facet) => facet.id === 'horse')
      ?.options[0]?.value
    if (!stableWideValue) throw new Error('Missing stable-wide filter option')

    expect(
      getCareReminderListQueryArgs({
        query: '',
        facets: {
          horse: stableWideValue,
          state: 'overdue',
        },
      }),
    ).toEqual({
      searchQuery: undefined,
      horseId: undefined,
      stableWideOnly: true,
      state: 'overdue',
      category: undefined,
    })
  })
})
