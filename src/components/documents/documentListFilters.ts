import { localeInstances } from '#/i18n/resources'
import type { Locale } from 'shared/i18n/locale'
import type {
  ListFilterConfig,
  ListFilterOption,
} from '#/components/list-filtering/listFiltering'
import { stableDocumentTypes } from 'shared/stables/stableDocumentSchema'
import type { StableDocumentType } from 'shared/stables/stableDocumentSchema'

import type { DocumentHorseOption, DocumentListItem } from './DocumentsCard'

export type DocumentListFilterFacetId = 'scope' | 'type' | 'fileState'

export function createDocumentListFilterConfig({
  horseOptions = [],
  locale = 'en',
}: {
  locale?: Locale
  horseOptions?: ReadonlyArray<DocumentHorseOption>
} = {}): ListFilterConfig<DocumentListItem, DocumentListFilterFacetId> {
  const t = localeInstances[locale].t
  const documentTypeFilterOptions = stableDocumentTypes.map((type) => ({
    value: type,
    label: t(`documents.types.${type}`),
  })) satisfies ReadonlyArray<ListFilterOption>

  const fileStateFilterOptions = [
    { value: 'uploaded-file', label: t('documents.attached') },
    { value: 'unavailable', label: t('documents.unavailable') },
    { value: 'metadata-only', label: t('documents.noFile') },
  ] satisfies ReadonlyArray<ListFilterOption>

  return {
    searchLabel: t('documents.search'),
    searchPlaceholder: t('documents.searchPlaceholder'),
    searchFields: [
      {
        id: 'fileName',
        weight: 12,
        getValues: (item) => [item.document.fileName],
      },
      {
        id: 'notes',
        weight: 5,
        getValues: (item) => [item.document.notes],
      },
      {
        id: 'labels',
        weight: 3,
        getValues: (item) => [t(`documents.types.${item.document.type}`)],
      },
      {
        id: 'links',
        weight: 2,
        getValues: (item) => [item.horseName, item.eventTitle],
      },
    ],
    facets: [
      ...(horseOptions.length > 0
        ? [
            {
              id: 'scope' as const,
              label: t('documents.scope'),
              allLabel: t('documents.allDocuments'),
              options: [
                { value: 'stable-wide', label: t('documents.stableWide') },
                ...horseOptions.map((horse) => ({
                  value: horse._id,
                  label: horse.name,
                })),
              ],
              matches: (item: DocumentListItem, selectedValue: string) =>
                selectedValue === 'stable-wide'
                  ? !item.document.horseId
                  : item.document.horseId === selectedValue,
            },
          ]
        : []),
      {
        id: 'type',
        label: t('documents.type'),
        allLabel: t('documents.allTypes'),
        options: documentTypeFilterOptions,
        matches: (item, selectedValue) =>
          isStableDocumentType(selectedValue) &&
          item.document.type === selectedValue,
      },
      {
        id: 'fileState',
        label: t('documents.file'),
        allLabel: t('documents.allFiles'),
        options: fileStateFilterOptions,
        matches: matchesFileStateFilter,
      },
    ],
  }
}

function isStableDocumentType(value: string): value is StableDocumentType {
  return stableDocumentTypes.some((type) => type === value)
}

function matchesFileStateFilter(item: DocumentListItem, selectedValue: string) {
  if (selectedValue === 'uploaded-file') return item.fileState === 'available'
  if (selectedValue === 'unavailable') return item.fileState === 'unavailable'
  if (selectedValue === 'metadata-only') {
    return item.fileState === 'metadata-only'
  }

  return false
}
