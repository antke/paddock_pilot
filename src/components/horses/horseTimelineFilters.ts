import { localeInstances } from '#/i18n/resources'
import type { Locale } from 'shared/i18n/locale'
import { formatDecimal } from '#/lib/numberDisplay'
import type { ListFilterConfig } from '#/components/list-filtering/listFiltering'
import type { TimelineEntry } from './HorseTimelinePage'

export function createHorseTimelineFilterConfig(
  locale: Locale = 'en',
): ListFilterConfig<TimelineEntry, 'kind'> {
  const t = localeInstances[locale].t
  return {
    searchLabel: t('horseHistory.search'),
    searchPlaceholder: t('horseHistory.searchPlaceholder'),
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
                'trainingRecord' in entry && entry.trainingRecord
                  ? t(`training.status.${entry.trainingRecord.status}`)
                  : undefined,
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
              return [
                formatDecimal(entry.weight, locale),
                entry.unit,
                entry.notes,
              ]
          }
        },
      },
    ],
    facets: [
      {
        id: 'kind',
        label: t('horseHistory.recordType'),
        allLabel: t('horseHistory.allTypes'),
        options: [
          { value: 'event', label: t('horseHistory.events') },
          { value: 'healthIssue', label: t('horseHistory.health') },
          { value: 'medicationRecord', label: t('horseHistory.medication') },
          { value: 'nutritionLog', label: t('horseHistory.nutrition') },
          { value: 'weightRecord', label: t('horseHistory.weight') },
        ],
        matches: (entry, value) => entry.kind === value,
      },
    ],
  }
}
export const horseTimelineFilterConfig = createHorseTimelineFilterConfig()
