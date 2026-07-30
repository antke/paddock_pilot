import { filterListItems } from '#/components/list-filtering/listFiltering'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { describe, expect, it } from 'vitest'
import { createHorseListFilterConfig } from './horseListFilters'

const stableId = 'stable-1' as Id<'stables'>
const userId = 'user-1' as Id<'users'>

describe('horse list filters', () => {
  it('searches identifying and profile fields', () => {
    const config = createHorseListFilterConfig()
    const horses = [
      createHorse({ name: 'Mistral', ownerName: 'Mae', breed: 'Arabian' }),
      createHorse({
        name: 'Juniper',
        passportNumber: 'GB-7788',
        discipline: 'Dressage',
      }),
    ]

    expect(searchHorseNames(horses, config, 'mae')).toEqual(['Mistral'])
    expect(searchHorseNames(horses, config, 'gb-7788')).toEqual(['Juniper'])
    expect(searchHorseNames(horses, config, 'dressage')).toEqual(['Juniper'])
  })

  it('filters by sex and shoeing status', () => {
    const config = createHorseListFilterConfig()
    const horses = [
      createHorse({ name: 'Mistral', sex: 'mare', shoeingStatus: 'barefoot' }),
      createHorse({
        name: 'Juniper',
        sex: 'gelding',
        shoeingStatus: 'front_shoes',
      }),
    ]

    expect(
      filterListItems({
        items: horses,
        config,
        state: { query: '', facets: { sex: 'mare' } },
      }).map((horse) => horse.name),
    ).toEqual(['Mistral'])
    expect(
      filterListItems({
        items: horses,
        config,
        state: { query: '', facets: { shoeingStatus: 'front_shoes' } },
      }).map((horse) => horse.name),
    ).toEqual(['Juniper'])
  })
})

function searchHorseNames(
  horses: Array<Doc<'horses'>>,
  config: ReturnType<typeof createHorseListFilterConfig>,
  query: string,
) {
  return filterListItems({
    items: horses,
    config,
    state: { query, facets: {} },
  }).map((horse) => horse.name)
}

function createHorse(overrides: Partial<Doc<'horses'>>): Doc<'horses'> {
  return {
    _id: 'horse-1' as Id<'horses'>,
    _creationTime: 1,
    stableId,
    ownerId: userId,
    name: 'Horse',
    age: 8,
    ...overrides,
  }
}
