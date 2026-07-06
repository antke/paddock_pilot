import type {
  ListFilterConfig,
  ListFilterFacet,
  ListFilterOption,
  ListFilterState,
} from '#/components/list-filtering/listFiltering'
import type { Id } from 'convex/_generated/dataModel'
import {
  careReminderCategories,
  careReminderCategoryLabels,
  careReminderStatusLabels,
  careReminderStatuses,
} from 'shared/reminders/careReminderSchema'
import type {
  CareReminderCategory,
  CareReminderStatus,
} from 'shared/reminders/careReminderSchema'

import type { CareReminderListItem } from './CareRemindersCard'
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
): ListFilterConfig<CareReminderListItem, CareReminderListFilterFacetId> {
  return {
    searchLabel: 'Search reminders',
    searchPlaceholder: 'Search title, notes, horse, or category',
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
          careReminderCategoryLabels[item.reminder.category],
          getReminderStateLabel(item),
        ],
      },
    ],
    facets: [
      {
        id: 'horse',
        label: 'Horse',
        allLabel: 'All horses',
        options: getHorseFilterOptions(horseOptions),
        matches: matchesHorseFilter,
      },
      {
        id: 'state',
        label: 'State',
        allLabel: 'All states',
        options: reminderStateFilterOptions,
        matches: matchesStateFilter,
      },
      {
        id: 'category',
        label: 'Category',
        allLabel: 'All categories',
        options: reminderCategoryFilterOptions,
        matches: matchesCategoryFilter,
      },
    ],
  }
}

export function createHorseCareReminderListFilterConfig(): ListFilterConfig<
  CareReminderListItem,
  HorseCareReminderListFilterFacetId
> {
  const config = createCareReminderListFilterConfig([])

  return {
    ...config,
    searchPlaceholder: 'Search title, notes, category, or state',
    facets: config.facets.filter(
      (facet): facet is ListFilterFacet<
        CareReminderListItem,
        HorseCareReminderListFilterFacetId
      > => facet.id !== 'horse',
    ),
  }
}

function getHorseFilterOptions(
  horseOptions: ReadonlyArray<CareReminderFilterHorseOption>,
) {
  return [
    { value: stableWideHorseFilterValue, label: 'Stable-wide' },
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

function matchesHorseFilter(
  item: CareReminderListItem,
  selectedValue: string,
) {
  if (selectedValue === stableWideHorseFilterValue) {
    return !item.reminder.horseId
  }

  if (!selectedValue.startsWith(horseFilterValuePrefix)) return false

  return (
    item.reminder.horseId === selectedValue.slice(horseFilterValuePrefix.length)
  )
}

const reminderStateFilterOptions = [
  { value: 'overdue', label: 'Overdue' },
  ...careReminderStatuses.map((status) => ({
    value: status,
    label: careReminderStatusLabels[status],
  })),
] satisfies ReadonlyArray<ListFilterOption>

function matchesStateFilter(
  item: CareReminderListItem,
  selectedValue: string,
) {
  if (selectedValue === 'overdue') {
    return isCareReminderOverdue(item.reminder)
  }

  if (isCareReminderStatus(selectedValue)) {
    return item.reminder.status === selectedValue
  }

  return false
}

function getReminderStateLabel(item: CareReminderListItem) {
  if (isCareReminderOverdue(item.reminder)) return 'Overdue'

  return careReminderStatusLabels[item.reminder.status]
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

const reminderCategoryFilterOptions = careReminderCategories.map((category) => ({
  value: category,
  label: careReminderCategoryLabels[category],
})) satisfies ReadonlyArray<ListFilterOption>

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
