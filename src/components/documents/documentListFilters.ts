import type {
  ListFilterConfig,
  ListFilterOption,
} from '#/components/list-filtering/listFiltering'
import {
  stableDocumentTypeLabels,
  stableDocumentTypes,
} from 'shared/stables/stableDocumentSchema'
import type { StableDocumentType } from 'shared/stables/stableDocumentSchema'

import type { DocumentListItem } from './DocumentsCard'

export type DocumentListFilterFacetId = 'type' | 'fileState'

export function createDocumentListFilterConfig(): ListFilterConfig<
  DocumentListItem,
  DocumentListFilterFacetId
> {
  return {
    searchLabel: 'Search documents',
    searchPlaceholder: 'Search file name, notes, type, or linked records',
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
        getValues: (item) => [stableDocumentTypeLabels[item.document.type]],
      },
      {
        id: 'links',
        weight: 2,
        getValues: (item) => [item.horseName, item.eventTitle],
      },
    ],
    facets: [
      {
        id: 'type',
        label: 'Type',
        allLabel: 'All types',
        options: documentTypeFilterOptions,
        matches: (item, selectedValue) =>
          isStableDocumentType(selectedValue) &&
          item.document.type === selectedValue,
      },
      {
        id: 'fileState',
        label: 'File',
        allLabel: 'All files',
        options: fileStateFilterOptions,
        matches: matchesFileStateFilter,
      },
    ],
  }
}

const documentTypeFilterOptions = stableDocumentTypes.map((type) => ({
  value: type,
  label: stableDocumentTypeLabels[type],
})) satisfies ReadonlyArray<ListFilterOption>

const fileStateFilterOptions = [
  { value: 'uploaded-file', label: 'Uploaded file' },
  { value: 'metadata-only', label: 'Metadata only' },
] satisfies ReadonlyArray<ListFilterOption>

function isStableDocumentType(value: string): value is StableDocumentType {
  return stableDocumentTypes.some((type) => type === value)
}

function matchesFileStateFilter(
  item: DocumentListItem,
  selectedValue: string,
) {
  if (selectedValue === 'uploaded-file') return Boolean(item.fileUrl)
  if (selectedValue === 'metadata-only') return !item.fileUrl

  return false
}
