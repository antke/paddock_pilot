import type {
  ListFilterConfig,
  ListFilterOption,
} from '#/components/list-filtering/listFiltering'
import type { Doc } from 'convex/_generated/dataModel'

export type HorseListFilterFacetId = 'sex' | 'shoeingStatus'

export function createHorseListFilterConfig(): ListFilterConfig<
  Doc<'horses'>,
  HorseListFilterFacetId
> {
  return {
    searchLabel: 'Search horses',
    searchPlaceholder: 'Search name, owner, breed, discipline, or ID',
    searchFields: [
      {
        id: 'name',
        weight: 12,
        getValues: (horse) => [horse.name],
      },
      {
        id: 'owner',
        weight: 7,
        getValues: (horse) => [horse.ownerName],
      },
      {
        id: 'profile',
        weight: 5,
        getValues: (horse) => [horse.breed, horse.color, horse.discipline],
      },
      {
        id: 'identifiers',
        weight: 4,
        getValues: (horse) => [horse.passportNumber, horse.microchipNumber],
      },
    ],
    facets: [
      {
        id: 'sex',
        label: 'Sex',
        allLabel: 'All sexes',
        options: horseSexFilterOptions,
        matches: (horse, selectedValue) => horse.sex === selectedValue,
      },
      {
        id: 'shoeingStatus',
        label: 'Shoeing',
        allLabel: 'All shoeing statuses',
        options: horseShoeingFilterOptions,
        matches: (horse, selectedValue) =>
          horse.shoeingStatus === selectedValue,
      },
    ],
  }
}

const horseSexFilterOptions = [
  { value: 'mare', label: 'Mare' },
  { value: 'gelding', label: 'Gelding' },
  { value: 'stallion', label: 'Stallion' },
] satisfies ReadonlyArray<ListFilterOption>

const horseShoeingFilterOptions = [
  { value: 'barefoot', label: 'Barefoot' },
  { value: 'front_shoes', label: 'Front shoes' },
  { value: 'full_set', label: 'Full set' },
] satisfies ReadonlyArray<ListFilterOption>
