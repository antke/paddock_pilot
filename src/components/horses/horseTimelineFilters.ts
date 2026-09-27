import type { ListFilterConfig } from '#/components/list-filtering/listFiltering'
import type { TimelineEntry } from './HorseTimelinePage'

export const horseTimelineFilterConfig: ListFilterConfig<
  TimelineEntry,
  'kind'
> = {
  searchLabel: 'Search care history',
  searchPlaceholder: 'Search records, providers or notes',
  searchFields: [
    {
      id: 'record',
      weight: 1,
      getValues: (entry) => {
        switch (entry.kind) {
          case 'event':
            return [
              entry.title,
              entry.providerName,
              entry.description,
              entry.notesAfterCompletion,
              entry.requestedServiceNotes,
              entry.horseCompletionNotes,
            ]
          case 'healthIssue':
            return [entry.title, entry.description]
          case 'medicationRecord':
            return [
              entry.medicationName,
              entry.dosage,
              entry.frequency,
              entry.prescribedBy,
              entry.reason,
              entry.notes,
            ]
          case 'nutritionLog':
            return [
              entry.summary,
              entry.notes,
              entry.feedingRoutineSnapshot,
              ...(entry.recommendedSnapshot ?? []),
              ...(entry.avoidSnapshot ?? []),
            ]
          case 'weightRecord':
            return [String(entry.weight), entry.unit, entry.notes]
        }
      },
    },
  ],
  facets: [
    {
      id: 'kind',
      label: 'Record type',
      allLabel: 'All record types',
      options: [
        { value: 'event', label: 'Events' },
        { value: 'healthIssue', label: 'Health issues' },
        { value: 'medicationRecord', label: 'Medication' },
        { value: 'nutritionLog', label: 'Nutrition' },
        { value: 'weightRecord', label: 'Weight' },
      ],
      matches: (entry, value) => entry.kind === value,
    },
  ],
}
