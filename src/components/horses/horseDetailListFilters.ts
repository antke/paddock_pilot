import type {
  ListFilterConfig,
  ListFilterOption,
} from '#/components/list-filtering/listFiltering'
import type { Doc } from 'convex/_generated/dataModel'
import {
  eventStatuses,
  eventStatusLabels,
  eventTypes,
  eventTypeLabels,
} from 'shared/events/eventSchema'
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

export const horseHealthIssueSeverityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
} satisfies Record<HealthIssueSeverity, string>

export const horseHealthIssueStatusLabels = {
  active: 'Active',
  resolved: 'Resolved',
} satisfies Record<HealthIssueStatus, string>

export const horseMedicationStatusLabels = {
  active: 'Active',
  completed: 'Completed',
} satisfies Record<MedicationRecordStatus, string>

const weightUnitLabels = {
  kg: 'Kilograms',
  lb: 'Pounds',
} satisfies Record<Doc<'horseWeightRecords'>['unit'], string>

export function createHorseActivityListFilterConfig(): ListFilterConfig<
  Doc<'events'>,
  HorseActivityFilterFacetId
> {
  return {
    searchLabel: 'Search activity',
    searchPlaceholder: 'Search title, location, provider, or notes',
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
          eventTypeLabels[event.type],
          event.status ? eventStatusLabels[event.status] : undefined,
        ],
      },
    ],
    facets: [
      {
        id: 'type',
        label: 'Type',
        allLabel: 'All types',
        options: eventTypeFilterOptions,
        matches: (event, selectedValue) =>
          isEventType(selectedValue) && event.type === selectedValue,
      },
      {
        id: 'status',
        label: 'Status',
        allLabel: 'All statuses',
        options: eventStatusFilterOptions,
        matches: (event, selectedValue) =>
          isEventStatus(selectedValue) && event.status === selectedValue,
      },
    ],
  }
}

export function createHorseHealthIssueListFilterConfig(): ListFilterConfig<
  Doc<'horseHealthIssues'>,
  HorseHealthIssueFilterFacetId
> {
  return {
    searchLabel: 'Search health issues',
    searchPlaceholder: 'Search title, description, status, or severity',
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
          horseHealthIssueStatusLabels[issue.status],
          issue.severity
            ? horseHealthIssueSeverityLabels[issue.severity]
            : undefined,
        ],
      },
    ],
    facets: [
      {
        id: 'status',
        label: 'Status',
        allLabel: 'All statuses',
        options: healthIssueStatusFilterOptions,
        matches: (issue, selectedValue) =>
          isHealthIssueStatus(selectedValue) && issue.status === selectedValue,
      },
      {
        id: 'severity',
        label: 'Severity',
        allLabel: 'All severities',
        options: healthIssueSeverityFilterOptions,
        matches: (issue, selectedValue) =>
          isHealthIssueSeverity(selectedValue) &&
          issue.severity === selectedValue,
      },
    ],
  }
}

export function createHorseMedicationRecordListFilterConfig(): ListFilterConfig<
  Doc<'horseMedicationRecords'>,
  HorseMedicationRecordFilterFacetId
> {
  return {
    searchLabel: 'Search medication',
    searchPlaceholder: 'Search medication, dosage, provider, or notes',
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
        getValues: (record) => [horseMedicationStatusLabels[record.status]],
      },
    ],
    facets: [
      {
        id: 'status',
        label: 'Status',
        allLabel: 'All statuses',
        options: medicationStatusFilterOptions,
        matches: (record, selectedValue) =>
          isMedicationRecordStatus(selectedValue) &&
          record.status === selectedValue,
      },
    ],
  }
}

export function createHorseNutritionLogListFilterConfig(): ListFilterConfig<
  Doc<'horseNutritionLogs'>
> {
  return {
    searchLabel: 'Search nutrition logs',
    searchPlaceholder: 'Search summary, routine, recommendations, or notes',
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

export function createHorseWeightRecordListFilterConfig(): ListFilterConfig<
  Doc<'horseWeightRecords'>,
  HorseWeightRecordFilterFacetId
> {
  return {
    searchLabel: 'Search weight records',
    searchPlaceholder: 'Search weight, notes, unit, or body condition',
    searchFields: [
      {
        id: 'weight',
        weight: 12,
        getValues: (record) => [`${record.weight} ${record.unit}`],
      },
      {
        id: 'details',
        weight: 5,
        getValues: (record) => [
          record.notes,
          weightUnitLabels[record.unit],
          record.bodyConditionScore !== undefined
            ? `BCS ${record.bodyConditionScore}`
            : undefined,
        ],
      },
    ],
    facets: [
      {
        id: 'unit',
        label: 'Unit',
        allLabel: 'All units',
        options: weightUnitFilterOptions,
        matches: (record, selectedValue) => record.unit === selectedValue,
      },
      {
        id: 'bodyCondition',
        label: 'Body condition',
        allLabel: 'All records',
        options: bodyConditionFilterOptions,
        matches: matchesBodyConditionFilter,
      },
    ],
  }
}

const eventTypeFilterOptions = eventTypes.map((type) => ({
  value: type,
  label: eventTypeLabels[type],
})) satisfies ReadonlyArray<ListFilterOption>

const eventStatusFilterOptions = eventStatuses.map((status) => ({
  value: status,
  label: eventStatusLabels[status],
})) satisfies ReadonlyArray<ListFilterOption>

const healthIssueStatusFilterOptions = healthIssueStatuses.map((status) => ({
  value: status,
  label: horseHealthIssueStatusLabels[status],
})) satisfies ReadonlyArray<ListFilterOption>

const healthIssueSeverityFilterOptions = healthIssueSeverities.map(
  (severity) => ({
    value: severity,
    label: horseHealthIssueSeverityLabels[severity],
  }),
) satisfies ReadonlyArray<ListFilterOption>

const medicationStatusFilterOptions = medicationRecordStatuses.map((status) => ({
  value: status,
  label: horseMedicationStatusLabels[status],
})) satisfies ReadonlyArray<ListFilterOption>

const weightUnitFilterOptions = [
  { value: 'kg', label: weightUnitLabels.kg },
  { value: 'lb', label: weightUnitLabels.lb },
] satisfies ReadonlyArray<ListFilterOption>

const bodyConditionFilterOptions = [
  { value: 'with-body-condition', label: 'Has body condition' },
  { value: 'without-body-condition', label: 'No body condition' },
] satisfies ReadonlyArray<ListFilterOption>

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
