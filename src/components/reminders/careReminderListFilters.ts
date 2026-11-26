import { getHorseDisplayName } from 'shared/horses/horseDisplayName'
import { localeInstances } from '#/i18n/resources'
import type { Locale } from 'shared/i18n/locale'
import type {
  ListFilterConfig,
  ListFilterFacet,
  ListFilterOption,
  ListFilterState,
} from '#/components/list-filtering/listFiltering'
import type { Id } from 'convex/_generated/dataModel'
import { careReminderCategories } from 'shared/reminders/careReminderSchema'
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

export type CareReminderListFilterFacetId = 'horse' | 'category'
/** To do, Done or All: a quiet toggle beside the list, outside Filters. */
export type CareReminderStatusView = 'pending' | 'completed' | 'all'
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
  view: CareReminderStatusView = 'all',
): CareReminderListQueryArgs {
  const selectedHorse = state.facets.horse
  const selectedCategory = state.facets.category
  const searchQuery = state.query.trim() || undefined

  return {
    searchQuery,
    horseId: getHorseIdFilterArg(selectedHorse),
    stableWideOnly: selectedHorse === stableWideHorseFilterValue || undefined,
    state: view === 'all' ? undefined : view,
    category: getCategoryFilterArg(selectedCategory),
  }
}

export function createCareReminderListFilterConfig(
  horseOptions: ReadonlyArray<CareReminderFilterHorseOption>,
  locale: Locale = 'en',
): ListFilterConfig<CareReminderListItem, CareReminderListFilterFacetId> {
  const t = localeInstances[locale].t
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
      label: getHorseDisplayName(horse),
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

export function matchesStatusView(
  item: CareReminderListItem,
  view: CareReminderStatusView,
) {
  return view === 'all' || item.reminder.status === view
}

/** The default work view is not a user search with zero matches. */
export function isOnlyOutstandingFilter(
  view: CareReminderStatusView,
  state: ListFilterState<CareReminderListFilterFacetId>,
) {
  return (
    view === 'pending' &&
    !state.query.trim() &&
    Object.values(state.facets).every((value) => !value)
  )
}
