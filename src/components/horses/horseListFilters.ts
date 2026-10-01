import { localeInstances } from '#/i18n/resources'
import type { Locale } from 'shared/i18n/locale'
import { getHorseBreedLabel } from 'shared/i18n/horseBreedLabels'
import type {
  ListFilterConfig,
  ListFilterOption,
} from '#/components/list-filtering/listFiltering'
import type { Doc } from 'convex/_generated/dataModel'

export type HorseListFilterFacetId = 'sex' | 'shoeingStatus'

export function createHorseListFilterConfig(
  locale: Locale = 'en',
): ListFilterConfig<Doc<'horses'>, HorseListFilterFacetId> {
  const t = localeInstances[locale].t
  const horseSexFilterOptions = ['mare', 'gelding', 'stallion'].map(
    (value) => ({
      value,
      label: t(`horseList.${value as 'mare' | 'gelding' | 'stallion'}`),
    }),
  ) satisfies ReadonlyArray<ListFilterOption>
  const horseShoeingFilterOptions = ['barefoot', 'front_shoes', 'full_set'].map(
    (value) => ({
      value,
      label: t(`horseList.${value as 'barefoot' | 'front_shoes' | 'full_set'}`),
    }),
  ) satisfies ReadonlyArray<ListFilterOption>
  return {
    searchLabel: t('horseList.search'),
    searchPlaceholder: t('horseList.searchHelp'),
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
        getValues: (horse) => [
          horse.breed,
          horse.breed ? getHorseBreedLabel(horse.breed, 'pl') : undefined,
          horse.color,
          horse.discipline,
        ],
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
        label: t('horseList.sex'),
        allLabel: t('horseList.allSexes'),
        options: horseSexFilterOptions,
        matches: (horse, selectedValue) => horse.sex === selectedValue,
      },
      {
        id: 'shoeingStatus',
        label: t('horseList.shoeing'),
        allLabel: t('horseList.allShoeing'),
        options: horseShoeingFilterOptions,
        matches: (horse, selectedValue) =>
          horse.shoeingStatus === selectedValue,
      },
    ],
  }
}
