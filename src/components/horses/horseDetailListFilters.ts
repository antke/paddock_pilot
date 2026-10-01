import { localeInstances } from '#/i18n/resources'
import type { Locale } from 'shared/i18n/locale'
import { formatDecimal } from '#/lib/numberDisplay'
import type {
  ListFilterConfig,
  ListFilterOption,
} from '#/components/list-filtering/listFiltering'
import type { Doc } from 'convex/_generated/dataModel'
import { eventStatuses, eventTypes } from 'shared/events/eventSchema'
import type { EventStatus, EventType } from 'shared/events/eventSchema'
import {
  healthIssueSeverities,
  healthIssueStatuses,
} from 'shared/horses/healthIssueSchema'
import type {
  HealthIssueSeverity,
  HealthIssueStatus,
} from 'shared/horses/healthIssueSchema'
import { medicationRecordStatuses } from 'shared/horses/medicationRecordSchema'
import type { MedicationRecordStatus } from 'shared/horses/medicationRecordSchema'

export type HorseActivityFilterFacetId = 'type' | 'status'
export type HorseHealthIssueFilterFacetId = 'status' | 'severity'
export type HorseMedicationRecordFilterFacetId = 'status'
export type HorseWeightRecordFilterFacetId = 'unit' | 'bodyCondition'

export function createHorseActivityListFilterConfig(
  locale: Locale = 'en',
): ListFilterConfig<Doc<'events'>, HorseActivityFilterFacetId> {
  const t = localeInstances[locale].t
  const eventTypeFilterOptions = eventTypes
    .filter((type) => type !== 'training')
    .map((type) => ({
      value: type,
      label: t(`events.types.${type}`),
    })) satisfies ReadonlyArray<ListFilterOption>
  const eventStatusFilterOptions = eventStatuses.map((status) => ({
    value: status,
    label: t(`calendar.${status}`),
  })) satisfies ReadonlyArray<ListFilterOption>
  return {
    searchLabel: t('careFilters.activitySearch'),
    searchPlaceholder: t('careFilters.activityPlaceholder'),
    searchFields: [
      {
        id: 'title',
        weight: 12,
        getValues: (event) => [event.title],
      },
      {
        id: 'details',
        weight: 5,
        getValues: (event) => [
          event.description,
          event.location,
          event.providerName,
          event.notesAfterCompletion,
        ],
      },
      {
        id: 'labels',
        weight: 2,
        getValues: (event) => [
          t(`events.types.${event.type}`),
          event.status ? t(`calendar.${event.status}`) : undefined,
        ],
      },
    ],
    facets: [
      {
        id: 'type',
        label: t('careFilters.type'),
        allLabel: t('careFilters.allTypes'),
        options: eventTypeFilterOptions,
        matches: (event, selectedValue) =>
          isEventType(selectedValue) && event.type === selectedValue,
      },
      {
        id: 'status',
        label: t('careFilters.status'),
        allLabel: t('careFilters.allStatuses'),
        options: eventStatusFilterOptions,
        matches: (event, selectedValue) =>
          isEventStatus(selectedValue) && event.status === selectedValue,
      },
    ],
  }
}

export function createHorseHealthIssueListFilterConfig(
  locale: Locale = 'en',
): ListFilterConfig<Doc<'horseHealthIssues'>, HorseHealthIssueFilterFacetId> {
  const t = localeInstances[locale].t
  const healthIssueStatusFilterOptions = healthIssueStatuses.map((status) => ({
    value: status,
    label: t(`careLabels.healthStatus.${status}`),
  })) satisfies ReadonlyArray<ListFilterOption>
  const healthIssueSeverityFilterOptions = healthIssueSeverities.map(
    (severity) => ({
      value: severity,
      label: t(`careLabels.severity.${severity}`),
    }),
  ) satisfies ReadonlyArray<ListFilterOption>
  return {
    searchLabel: t('careFilters.healthSearch'),
    searchPlaceholder: t('careFilters.healthPlaceholder'),
    searchFields: [
      {
        id: 'title',
        weight: 12,
        getValues: (issue) => [issue.title],
      },
      {
        id: 'description',
        weight: 5,
        getValues: (issue) => [issue.description],
      },
      {
        id: 'labels',
        weight: 2,
        getValues: (issue) => [
          t(`careLabels.healthStatus.${issue.status}`),
          issue.severity
            ? t(`careLabels.severity.${issue.severity}`)
            : undefined,
        ],
      },
    ],
    facets: [
      {
        id: 'status',
        label: t('careFilters.status'),
        allLabel: t('careFilters.allStatuses'),
        options: healthIssueStatusFilterOptions,
        matches: (issue, selectedValue) =>
          isHealthIssueStatus(selectedValue) && issue.status === selectedValue,
      },
      {
        id: 'severity',
        label: t('careFilters.severity'),
        allLabel: t('careFilters.allSeverities'),
        options: healthIssueSeverityFilterOptions,
        matches: (issue, selectedValue) =>
          isHealthIssueSeverity(selectedValue) &&
          issue.severity === selectedValue,
      },
    ],
  }
}

export function createHorseMedicationRecordListFilterConfig(
  locale: Locale = 'en',
): ListFilterConfig<
  Doc<'horseMedicationRecords'>,
  HorseMedicationRecordFilterFacetId
> {
  const t = localeInstances[locale].t
  const medicationStatusFilterOptions = medicationRecordStatuses.map(
    (status) => ({
      value: status,
      label: t(`careLabels.medicationStatus.${status}`),
    }),
  ) satisfies ReadonlyArray<ListFilterOption>
  return {
    searchLabel: t('careFilters.medicationSearch'),
    searchPlaceholder: t('careFilters.medicationPlaceholder'),
    searchFields: [
      {
        id: 'medication',
        weight: 12,
        getValues: (record) => [record.medicationName],
      },
      {
        id: 'details',
        weight: 5,
        getValues: (record) => [
          record.dosage,
          record.frequency,
          record.prescribedBy,
          record.reason,
          record.notes,
        ],
      },
      {
        id: 'status',
        weight: 2,
        getValues: (record) => [
          t(`careLabels.medicationStatus.${record.status}`),
        ],
      },
    ],
    facets: [
      {
        id: 'status',
        label: t('careFilters.status'),
        allLabel: t('careFilters.allStatuses'),
        options: medicationStatusFilterOptions,
        matches: (record, selectedValue) =>
          isMedicationRecordStatus(selectedValue) &&
          record.status === selectedValue,
      },
    ],
  }
}

export function createHorseNutritionLogListFilterConfig(
  locale: Locale = 'en',
): ListFilterConfig<Doc<'horseNutritionLogs'>> {
  const t = localeInstances[locale].t
  return {
    searchLabel: t('careFilters.nutritionSearch'),
    searchPlaceholder: t('careFilters.nutritionPlaceholder'),
    searchFields: [
      {
        id: 'summary',
        weight: 12,
        getValues: (log) => [log.summary],
      },
      {
        id: 'details',
        weight: 5,
        getValues: (log) => [
          log.feedingRoutineSnapshot,
          ...(log.recommendedSnapshot ?? []),
          ...(log.avoidSnapshot ?? []),
          log.notes,
        ],
      },
    ],
    facets: [],
  }
}

export function createHorseWeightRecordListFilterConfig(
  locale: Locale = 'en',
): ListFilterConfig<Doc<'horseWeightRecords'>, HorseWeightRecordFilterFacetId> {
  const t = localeInstances[locale].t
  const weightUnitFilterOptions = [
    { value: 'kg', label: t('careFilters.kg') },
    { value: 'lb', label: t('careFilters.lb') },
  ] satisfies ReadonlyArray<ListFilterOption>
  const bodyConditionFilterOptions = [
    { value: 'with-body-condition', label: t('careFilters.withBcs') },
    { value: 'without-body-condition', label: t('careFilters.withoutBcs') },
  ] satisfies ReadonlyArray<ListFilterOption>
  return {
    searchLabel: t('careFilters.weightSearch'),
    searchPlaceholder: t('careFilters.weightPlaceholder'),
    searchFields: [
      {
        id: 'weight',
        weight: 12,
        getValues: (record) => [
          `${formatDecimal(record.weight, locale)} ${record.unit}`,
        ],
      },
      {
        id: 'details',
        weight: 5,
        getValues: (record) => [
          record.notes,
          t(`careFilters.${record.unit}`),
          record.bodyConditionScore !== undefined
            ? `BCS ${record.bodyConditionScore}`
            : undefined,
        ],
      },
    ],
    facets: [
      {
        id: 'unit',
        label: t('careFilters.unit'),
        allLabel: t('careFilters.allUnits'),
        options: weightUnitFilterOptions,
        matches: (record, selectedValue) => record.unit === selectedValue,
      },
      {
        id: 'bodyCondition',
        label: t('careFilters.bodyCondition'),
        allLabel: t('careFilters.allRecords'),
        options: bodyConditionFilterOptions,
        matches: matchesBodyConditionFilter,
      },
    ],
  }
}

function isEventType(value: string): value is EventType {
  return eventTypes.some((type) => type === value)
}

function isEventStatus(value: string): value is EventStatus {
  return eventStatuses.some((status) => status === value)
}

function isHealthIssueStatus(value: string): value is HealthIssueStatus {
  return healthIssueStatuses.some((status) => status === value)
}

function isHealthIssueSeverity(value: string): value is HealthIssueSeverity {
  return healthIssueSeverities.some((severity) => severity === value)
}

function isMedicationRecordStatus(
  value: string,
): value is MedicationRecordStatus {
  return medicationRecordStatuses.some((status) => status === value)
}

function matchesBodyConditionFilter(
  record: Doc<'horseWeightRecords'>,
  selectedValue: string,
) {
  if (selectedValue === 'with-body-condition') {
    return record.bodyConditionScore !== undefined
  }

  if (selectedValue === 'without-body-condition') {
    return record.bodyConditionScore === undefined
  }

  return false
}
