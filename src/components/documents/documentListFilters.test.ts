import { describe, expect, it } from 'vitest'

import { filterListItems } from '#/components/list-filtering/listFiltering'
import type { Doc, Id } from 'convex/_generated/dataModel'

import { createDocumentListFilterConfig } from './documentListFilters'
import type { DocumentListItem } from './DocumentsCard'

const stableId = 'stable-1' as Id<'stables'>
const userId = 'user-1' as Id<'users'>
const juniperId = 'horse-juniper' as Id<'horses'>
const mapleId = 'horse-maple' as Id<'horses'>

describe('document list filters', () => {
  it('filters documents by type and file state', () => {
    const config = createDocumentListFilterConfig()
    const documents = [
      createDocumentItem({
        type: 'passport',
        fileUrl: 'https://example.com/passport.pdf',
      }),
      createDocumentItem({
        fileName: 'Insurance note',
        type: 'insurance',
        fileUrl: null,
      }),
    ]

    expect(
      filterListItems({
        items: documents,
        config,
        state: { query: '', facets: { type: 'passport' } },
      }).map((item) => item.document.fileName),
    ).toEqual(['Document'])
    expect(
      filterListItems({
        items: documents,
        config,
        state: { query: '', facets: { fileState: 'metadata-only' } },
      }).map((item) => item.document.fileName),
    ).toEqual(['Insurance note'])
  })

  it('searches document names, notes, and linked labels', () => {
    const config = createDocumentListFilterConfig()
    const documents = [
      createDocumentItem({
        fileName: 'Vaccination proof',
        notes: 'Spring booster',
      }),
      createDocumentItem({ fileName: 'Farrier invoice', horseName: 'Juniper' }),
    ]

    expect(
      filterListItems({
        items: documents,
        config,
        state: { query: 'booster', facets: {} },
      }).map((item) => item.document.fileName),
    ).toEqual(['Vaccination proof'])
    expect(
      filterListItems({
        items: documents,
        config,
        state: { query: 'juniper', facets: {} },
      }).map((item) => item.document.fileName),
    ).toEqual(['Farrier invoice'])
  })

  it('adds a horse facet for stable-level document lists', () => {
    const config = createDocumentListFilterConfig({
      horseOptions: [
        { _id: juniperId, name: 'Juniper' },
        { _id: mapleId, name: 'Maple' },
      ],
    })
    const documents = [
      createDocumentItem({ fileName: 'Juniper passport', horseId: juniperId }),
      createDocumentItem({ fileName: 'Maple passport', horseId: mapleId }),
      createDocumentItem({ fileName: 'Stable insurance' }),
    ]

    expect(
      filterListItems({
        items: documents,
        config,
        state: { query: '', facets: { horse: mapleId } },
      }).map((item) => item.document.fileName),
    ).toEqual(['Maple passport'])
  })
})

function createDocumentItem({
  fileUrl = 'https://example.com/document.pdf',
  horseName,
  eventTitle,
  ...documentOverrides
}: Partial<Doc<'stableDocuments'>> &
  Pick<
    Partial<DocumentListItem>,
    'fileUrl' | 'horseName' | 'eventTitle'
  >): DocumentListItem {
  return {
    document: {
      _id: 'document-1' as Id<'stableDocuments'>,
      _creationTime: 1,
      stableId,
      type: 'other',
      fileName: 'Document',
      createdBy: userId,
      createdAt: 1,
      ...documentOverrides,
    },
    fileUrl,
    horseName,
    eventTitle,
    canManage: true,
  }
}
