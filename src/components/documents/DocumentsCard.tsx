import type { DashboardChrome } from '#/components/dashboard/dashboardChrome'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import {
  DashboardItemList,
  DashboardItemMediaCard,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { ButtonAnchor } from '#/components/ui/button'
import { CreateRecordDialog } from '#/components/list-layout/CreateRecordDialog'
import { RecordRemoveAction } from '#/components/list-layout/RecordRemoveAction'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useState } from 'react'
import type { ElementType, ReactNode } from 'react'
import { DocumentFileStateBadge } from './DocumentBadges'
import { DocumentDownloadAction } from './DocumentDownloadAction'
import { DocumentPreview } from './DocumentPreview'
import { DocumentUploadForm } from './DocumentUploadForm'
import type { DocumentUploadValues } from './DocumentUploadForm'
import { formatCountLabel, formatFileSize } from '#/lib/numberDisplay'
import { formatMediumTimestampDate } from '#/lib/dateDisplay'
import { formatConjunctionList } from '#/lib/textDisplay'
import { stableDocumentTypeLabels } from 'shared/stables/stableDocumentSchema'
import type { StableDocumentFileState } from 'shared/stables/stableDocumentSchema'

export type DocumentListItem = {
  document: Omit<Doc<'stableDocuments'>, 'storageId'>
  horseName?: string
  eventTitle?: string
  fileUrl?: string | null
  fileState: StableDocumentFileState
  canManage: boolean
}

export type DocumentHorseOption = {
  _id: Id<'horses'>
  name: string
}

type DocumentsCardProps = {
  title?: string
  actions?: ReactNode
  as?: ElementType
  description?: string
  documents: Array<DocumentListItem>
  emptyMessage: ReactNode
  listToolbar?: ReactNode
  chrome?: DashboardChrome
  onRemove: (id: Id<'stableDocuments'>) => Promise<void>
}

type DocumentUploadDialogProps = {
  canAddDocument: boolean
  horseOptions?: Array<DocumentHorseOption>
  fixedHorseId?: Id<'horses'>
  onAdd: (values: DocumentUploadValues) => Promise<void>
}

export function DocumentUploadDialog({
  canAddDocument,
  horseOptions,
  fixedHorseId,
  onAdd,
}: DocumentUploadDialogProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  if (!canAddDocument) return null

  const onAddFromDialog = async (values: DocumentUploadValues) => {
    await onAdd(values)
    setIsCreateOpen(false)
  }

  return (
    <CreateRecordDialog
      open={isCreateOpen}
      onOpenChange={setIsCreateOpen}
      triggerLabel="Add document"
      title="Add document"
      description="Upload paperwork without losing your place in the document list."
    >
      <DocumentUploadForm
        horseOptions={horseOptions}
        fixedHorseId={fixedHorseId}
        onSubmit={onAddFromDialog}
      />
    </CreateRecordDialog>
  )
}

export function DocumentsCard({
  title,
  actions,
  as,
  description,
  documents,
  emptyMessage,
  listToolbar,
  chrome = 'cards',
  onRemove,
}: DocumentsCardProps) {
  const documentList = (
    <>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic>
        {formatCountLabel(documents.length, 'document')}
      </p>

      {documents.length === 0 ? (
        <DashboardEmptyState chrome={chrome}>
          {emptyMessage}
        </DashboardEmptyState>
      ) : (
        <DashboardItemList gap="compact" role="list">
          {documents.map((item) => (
            <div key={item.document._id} role="listitem" className="min-w-0">
              <DocumentRow
                item={item}
                headingLevel={title ? 3 : 2}
                onRemove={onRemove}
              />
            </div>
          ))}
        </DashboardItemList>
      )}
    </>
  )

  if (chrome === 'soft') {
    return (
      <DashboardSection
        chrome="soft"
        as={as}
        title={title}
        description={description}
        actions={actions}
      >
        {listToolbar}
        {documentList}
      </DashboardSection>
    )
  }

  return (
    <DashboardSectionCard
      as={as}
      title={title}
      description={description}
      actions={actions}
      contentGap="comfortable"
    >
      {listToolbar}

      {documentList}
    </DashboardSectionCard>
  )
}

function DocumentRow({
  item,
  headingLevel,
  onRemove,
}: {
  item: DocumentListItem
  headingLevel: 2 | 3
  onRemove: (id: Id<'stableDocuments'>) => Promise<void>
}) {
  const { document } = item
  const RowHeading = headingLevel === 2 ? 'h2' : 'h3'

  return (
    <DashboardItemMediaCard
      chrome="cards"
      interactive={false}
      className="border-border"
      media={
        <DocumentPreview
          document={document}
          fileUrl={item.fileUrl}
          fileState={item.fileState}
        />
      }
      title={<RowHeading>{document.fileName}</RowHeading>}
      titleClassName="line-clamp-none break-words [overflow-wrap:anywhere]"
      meta={
        <>
          <span>{stableDocumentTypeLabels[document.type]}</span>
          <span>{getDocumentFormatLabel(document)}</span>
          {document.size !== undefined && (
            <span>{formatFileSize(document.size)}</span>
          )}
          {item.horseName && <span>{item.horseName}</span>}
          {item.eventTitle && <span>Linked to {item.eventTitle}</span>}
          <span>Added {formatMediumTimestampDate(document.createdAt)}</span>
        </>
      }
      metaSeparator="dot"
      summary={document.notes || undefined}
      badges={
        item.fileState !== 'available' ? (
          <DocumentFileStateBadge fileState={item.fileState} />
        ) : undefined
      }
      badgesClassName="ml-auto shrink-0"
      actions={
        <>
          {item.fileUrl && (
            <ButtonAnchor
              href={item.fileUrl}
              target="_blank"
              rel="noreferrer"
              variant="ghost"
              size="sm"
              aria-label={`Open ${document.fileName} in a new tab`}
            >
              Open file
            </ButtonAnchor>
          )}
          <DocumentDownloadAction
            fileName={document.fileName}
            fileUrl={item.fileUrl}
            fileState={item.fileState}
          />
          {item.canManage && (
            <RecordRemoveAction
              title={`Remove “${document.fileName}”?`}
              description={getRemoveDescription(item)}
              confirmLabel="Remove document"
              onConfirm={() => onRemove(document._id)}
            />
          )}
        </>
      }
    />
  )
}

function getRemoveDescription(item: DocumentListItem) {
  const consequences = [
    item.fileState !== 'metadata-only' ? 'the uploaded file' : undefined,
    item.horseName ? `the link to ${item.horseName}` : undefined,
    item.eventTitle ? `the link to ${item.eventTitle}` : undefined,
  ]
  const consequenceCopy = formatConjunctionList(consequences)

  if (!consequenceCopy) {
    return 'This document record will be removed permanently. This cannot be undone.'
  }

  return `Removing this document also removes ${consequenceCopy} permanently. This cannot be undone.`
}

function getDocumentFormatLabel(document: Doc<'stableDocuments'>) {
  const extension = document.fileName.split('.').pop()?.toLowerCase()
  const extensionLabel = extension
    ? documentExtensionLabels[extension]
    : undefined

  if (extensionLabel) return extensionLabel

  const mimeTypeLabel = document.contentType
    ? documentMimeTypeLabels[document.contentType]
    : undefined

  if (mimeTypeLabel) return mimeTypeLabel

  return 'File'
}

const documentExtensionLabels: Record<string, string> = {
  avif: 'AVIF',
  csv: 'CSV',
  doc: 'DOC',
  docx: 'DOCX',
  gif: 'GIF',
  jpeg: 'JPEG',
  jpg: 'JPG',
  pdf: 'PDF',
  png: 'PNG',
  svg: 'SVG',
  txt: 'TXT',
  webp: 'WEBP',
  xls: 'XLS',
  xlsx: 'XLSX',
}

const documentMimeTypeLabels: Record<string, string> = {
  'application/msword': 'DOC',
  'application/pdf': 'PDF',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'DOCX',
  'image/avif': 'AVIF',
  'image/gif': 'GIF',
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
  'image/svg+xml': 'SVG',
  'image/webp': 'WEBP',
  'text/csv': 'CSV',
  'text/plain': 'TXT',
}
