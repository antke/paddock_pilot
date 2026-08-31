import { ListFilterControls } from '#/components/list-filtering/ListFilterControls'
import { useListFiltering } from '#/components/list-filtering/useListFiltering'
import { createDocumentListFilterConfig } from '#/components/documents/documentListFilters'
import {
  DocumentsCard,
  DocumentUploadDialog,
} from '#/components/documents/DocumentsCard'
import type { DocumentListItem } from '#/components/documents/DocumentsCard'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import type { Doc, Id } from 'convex/_generated/dataModel'
import type { StableDocumentFileState } from 'shared/stables/stableDocumentSchema'
import { useMemo } from 'react'

type LabHorseOption = {
  _id: Id<'horses'>
  name: string
}

type LabDocumentInput = {
  id: string
  type: Doc<'stableDocuments'>['type']
  fileName: string
  contentType?: string
  size?: number
  notes?: string
  horse?: LabHorseOption
  event?: Doc<'events'>
  fileUrl?: string
  fileState?: StableDocumentFileState
  canManage?: boolean
}

export function DocumentsPageLab({ data }: { data: DashboardLabData }) {
  const horseOptions = getLabHorseOptions(data)
  const documents = createLabDocuments(data, horseOptions)
  const filterConfig = useMemo(
    () => createDocumentListFilterConfig({ horseOptions }),
    [horseOptions],
  )
  const filtering = useListFiltering({ items: documents, config: filterConfig })
  const listToolbar =
    documents.length > 0 ? (
      <ListFilterControls config={filterConfig} filtering={filtering} sticky />
    ) : undefined

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Documents"
        actions={
          <DocumentUploadDialog
            canAddDocument
            horseOptions={horseOptions}
            onAdd={async () => undefined}
          />
        }
      />

      <DocumentsCard
        documents={filtering.items}
        emptyMessage={
          filtering.isFiltering
            ? 'No documents match these filters.'
            : 'No fixture documents are available.'
        }
        listToolbar={listToolbar}
        chrome="cards"
        onRemove={async () => undefined}
      />
    </DashboardPage>
  )
}

function getLabHorseOptions(data: DashboardLabData): Array<LabHorseOption> {
  if (data.horses.length > 0) return data.horses

  return [{ _id: 'lab-horse-juniper' as Id<'horses'>, name: 'Juniper' }]
}

function createLabDocuments(
  data: DashboardLabData,
  horseOptions: Array<LabHorseOption>,
): Array<DocumentListItem> {
  const primaryHorse = horseOptions[0]
  const secondaryHorse = horseOptions[1]
  const nextEvent = data.events[0]
  const createdBy = data.stable.ownerId
  const createdAt = Date.now()
  const inputs: Array<LabDocumentInput> = [
    {
      id: 'passport-scan',
      type: 'passport',
      fileName: `${primaryHorse.name} passport scan.pdf`,
      contentType: 'application/pdf',
      size: 1_480_000,
      notes: 'Passport identity pages and markings, checked at intake.',
      horse: primaryHorse,
      fileUrl: '#document-passport',
    },
    {
      id: 'vaccination-proof',
      type: 'vaccination',
      fileName: 'Spring vaccination certificate.pdf',
      contentType: 'application/pdf',
      size: 820_000,
      notes:
        'Annual boosters complete. Attach to competition entries as needed.',
      horse: primaryHorse,
      event: nextEvent,
      fileUrl: '#document-vaccination',
    },
    {
      id: 'insurance-summary',
      type: 'insurance',
      fileName: `${data.stable.name} insurance summary`,
      notes:
        'Metadata-only reminder to upload the renewed cover note before the policy review.',
      fileState: 'metadata-only',
    },
    {
      id: 'farrier-note',
      type: 'farrier',
      fileName: `${secondaryHorse?.name ?? primaryHorse.name} shoeing notes.txt`,
      contentType: 'text/plain',
      size: 24_000,
      notes:
        'Shoeing notes from the latest reset, including next-cycle recommendations.',
      horse: secondaryHorse ?? primaryHorse,
      fileUrl: '#document-farrier',
    },
    {
      id: 'image-reference',
      type: 'other',
      fileName: 'Paddock Pilot reference mark.svg',
      contentType: 'image/svg+xml',
      size: 18_000,
      notes: 'Image-file specimen for the canonical document preview path.',
      fileUrl: '/paddock-pilot-mark.svg',
    },
    {
      id: 'unavailable-scan',
      type: 'vet_report',
      fileName: 'Juniper.follow-up.scan.FINAL.PNG',
      contentType: 'image/png',
      size: 3_240_000,
      notes:
        'The record remains visible while the uploaded file is unavailable.',
      horse: primaryHorse,
      fileState: 'unavailable',
    },
    {
      id: 'long-file-name',
      type: 'dental',
      fileName:
        'Annual dental examination and follow-up recommendations for the next routine visit.pdf',
      contentType: 'application/pdf',
      size: 640_000,
      horse: primaryHorse,
      fileUrl: '#document-dental',
      canManage: false,
    },
  ]

  return inputs.map((input, index) => ({
    document: createLabDocument(
      data,
      input,
      createdBy,
      createdAt - index * 86_400_000,
    ),
    horseName: input.horse?.name,
    eventTitle: input.event?.title,
    fileUrl: input.fileUrl,
    fileState:
      input.fileState ?? (input.fileUrl ? 'available' : 'metadata-only'),
    canManage: input.canManage ?? true,
  }))
}

function createLabDocument(
  data: DashboardLabData,
  input: LabDocumentInput,
  createdBy: Id<'users'>,
  createdAt: number,
): Doc<'stableDocuments'> {
  return {
    _id: `lab-document-${input.id}` as Id<'stableDocuments'>,
    _creationTime: createdAt,
    stableId: data.stable._id,
    horseId: input.horse?._id,
    eventId: input.event?._id,
    storageId: input.fileUrl
      ? (`lab-storage-${input.id}` as Id<'_storage'>)
      : undefined,
    type: input.type,
    fileName: input.fileName,
    contentType: input.contentType,
    size: input.size,
    notes: input.notes,
    createdBy,
    createdAt,
  }
}
