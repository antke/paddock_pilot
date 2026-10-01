import { localeInstances } from '#/i18n/resources'
import type { Locale } from 'shared/i18n/locale'
import type {
  ListFilterConfig,
  ListFilterFacet,
  ListFilterOption,
  ListFilterState,
} from '#/components/list-filtering/listFiltering'
import type { Id } from 'convex/_generated/dataModel'
import {
  careReminderCategories,
  careReminderStatuses,
} from 'shared/reminders/careReminderSchema'
import type {
  CareReminderCategory,
  CareReminderStatus,
} from 'shared/reminders/careReminderSchema'

import type { CareReminderListItem } from './CareRemindersCard'
import { getCareReminderStateLabel } from './careReminderDisplay'
import { isCareReminderOverdue } from './careReminderState'

type CareReminderFilterHorseOption = {
  id: string
  name: string
}

export type CareReminderListFilterFacetId = 'horse' | 'state' | 'category'
export type HorseCareReminderListFilterFacetId = Exclude<
  CareReminderListFilterFacetId,
  'horse'
>
export type CareReminderListStateFilter = 'overdue' | CareReminderStatus

export type CareReminderListQueryArgs = {
  searchQuery?: string
  horseId?: Id<'horses'>
  stableWideOnly?: boolean
  state?: CareReminderListStateFilter
  category?: CareReminderCategory
}

const stableWideHorseFilterValue = 'stable-wide'
const horseFilterValuePrefix = 'horse:'

export function getCareReminderListQueryArgs(
  state: ListFilterState<CareReminderListFilterFacetId>,
): CareReminderListQueryArgs {
  const selectedHorse = state.facets.horse
  const selectedState = state.facets.state
  const selectedCategory = state.facets.category
  const searchQuery = state.query.trim() || undefined

  return {
    searchQuery,
    horseId: getHorseIdFilterArg(selectedHorse),
    stableWideOnly: selectedHorse === stableWideHorseFilterValue || undefined,
    state: getStateFilterArg(selectedState),
    category: getCategoryFilterArg(selectedCategory),
  }
}

export function createCareReminderListFilterConfig(
  horseOptions: ReadonlyArray<CareReminderFilterHorseOption>,
  locale: Locale = 'en',
): ListFilterConfig<CareReminderListItem, CareReminderListFilterFacetId> {
  const t = localeInstances[locale].t
  const reminderStateFilterOptions = [
    { value: 'overdue', label: t('careLabels.overdue') },
    ...careReminderStatuses.map((status) => ({
      value: status,
      label: t(`careLabels.reminderStatus.${status}`),
    })),
  ] satisfies ReadonlyArray<ListFilterOption>

  const reminderCategoryFilterOptions = careReminderCategories.map(
    (category) => ({
      value: category,
      label: t(`careLabels.category.${category}`),
    }),
  ) satisfies ReadonlyArray<ListFilterOption>

  return {
    searchLabel: t('reminders.search'),
    searchPlaceholder: t('reminders.searchPlaceholder'),
    searchFields: [
      {
        id: 'title',
        weight: 12,
        getValues: (item) => [item.reminder.title],
      },
      {
        id: 'description',
        weight: 5,
        getValues: (item) => [item.reminder.description],
      },
      {
        id: 'horse',
        weight: 4,
        getValues: (item) => [item.horseName],
      },
      {
        id: 'labels',
        weight: 2,
        getValues: (item) => [
          t(`careLabels.category.${item.reminder.category}`),
          getCareReminderStateLabel(
            {
              status: item.reminder.status,
              overdue: isCareReminderOverdue(item.reminder),
            },
            locale,
          ),
        ],
      },
    ],
    facets: [
      {
        id: 'horse',
        label: t('reminders.horse'),
        allLabel: t('reminders.allHorses'),
        options: getHorseFilterOptions(horseOptions, locale),
        matches: matchesHorseFilter,
      },
      {
        id: 'state',
        label: t('reminders.state'),
        allLabel: t('reminders.allStates'),
        options: reminderStateFilterOptions,
        matches: matchesStateFilter,
      },
      {
        id: 'category',
        label: t('reminders.category'),
        allLabel: t('reminders.allCategories'),
        options: reminderCategoryFilterOptions,
        matches: matchesCategoryFilter,
      },
    ],
  }
}

export function createHorseCareReminderListFilterConfig(
  locale: Locale = 'en',
): ListFilterConfig<CareReminderListItem, HorseCareReminderListFilterFacetId> {
  const t = localeInstances[locale].t
  const config = createCareReminderListFilterConfig([], locale)

  return {
    ...config,
    searchPlaceholder: t('reminders.horseSearchPlaceholder'),
    facets: config.facets.filter(
      (
        facet,
      ): facet is ListFilterFacet<
        CareReminderListItem,
        HorseCareReminderListFilterFacetId
      > => facet.id !== 'horse',
    ),
  }
}

function getHorseFilterOptions(
  horseOptions: ReadonlyArray<CareReminderFilterHorseOption>,
  locale: Locale = 'en',
) {
  const t = localeInstances[locale].t
  return [
    { value: stableWideHorseFilterValue, label: t('reminders.stableWide') },
    ...horseOptions.map((horse) => ({
      value: getHorseFilterValue(horse.id),
      label: horse.name,
    })),
  ] satisfies ReadonlyArray<ListFilterOption>
}

function getHorseFilterValue(horseId: string) {
  return `${horseFilterValuePrefix}${horseId}`
}

function getHorseIdFilterArg(value: string | undefined) {
  if (!value || value === stableWideHorseFilterValue) return undefined
  if (!value.startsWith(horseFilterValuePrefix)) return undefined

  return value.slice(horseFilterValuePrefix.length) as Id<'horses'>
}

function matchesHorseFilter(item: CareReminderListItem, selectedValue: string) {
  if (selectedValue === stableWideHorseFilterValue) {
    return !item.reminder.horseId
  }

  if (!selectedValue.startsWith(horseFilterValuePrefix)) return false

  return (
    item.reminder.horseId === selectedValue.slice(horseFilterValuePrefix.length)
  )
}

function matchesStateFilter(item: CareReminderListItem, selectedValue: string) {
  if (selectedValue === 'overdue') {
    return isCareReminderOverdue(item.reminder)
  }

  if (isCareReminderStatus(selectedValue)) {
    return item.reminder.status === selectedValue
  }

  return false
}

function isCareReminderStatus(value: string): value is CareReminderStatus {
  return careReminderStatuses.some((status) => status === value)
}

function getStateFilterArg(
  value: string | undefined,
): CareReminderListStateFilter | undefined {
  if (value === 'overdue') return value
  if (value && isCareReminderStatus(value)) return value

  return undefined
}

function matchesCategoryFilter(
  item: CareReminderListItem,
  selectedValue: string,
) {
  if (isCareReminderCategory(selectedValue)) {
    return item.reminder.category === selectedValue
  }

  return false
}

function isCareReminderCategory(value: string): value is CareReminderCategory {
  return careReminderCategories.some((category) => category === value)
}

function getCategoryFilterArg(value: string | undefined) {
  if (value && isCareReminderCategory(value)) return value

  return undefined
}
