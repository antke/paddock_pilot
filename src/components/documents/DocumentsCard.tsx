import type { DashboardChrome } from '#/components/dashboard/dashboardChrome'
import { DashboardBadgeList } from '#/components/dashboard/DashboardBadgeList'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import {
  DashboardItemList,
  DashboardItemMediaCard,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { Button, ButtonAnchor } from '#/components/ui/button'
import { CreateRecordDialog } from '#/components/list-layout/CreateRecordDialog'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useState } from 'react'
import type { ElementType, ReactNode } from 'react'
import { DocumentMetadataOnlyBadge, DocumentTypeBadge } from './DocumentBadges'
import { DocumentPreview } from './DocumentPreview'
import { DocumentUploadForm } from './DocumentUploadForm'
import type { DocumentUploadValues } from './DocumentUploadForm'
import { formatFileSize } from '#/lib/numberDisplay'

export type DocumentListItem = {
  document: Omit<Doc<'stableDocuments'>, 'storageId'>
  horseName?: string
  eventTitle?: string
  fileUrl?: string | null
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
  rowChrome?: DashboardChrome
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
  rowChrome = chrome,
  onRemove,
}: DocumentsCardProps) {
  const documentList =
    documents.length === 0 ? (
      <DashboardEmptyState chrome={chrome}>{emptyMessage}</DashboardEmptyState>
    ) : (
      <DashboardItemList gap="compact">
        {documents.map((item) => (
          <DocumentRow
            key={item.document._id}
            item={item}
            chrome={rowChrome}
            onRemove={onRemove}
          />
        ))}
      </DashboardItemList>
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
  chrome,
  onRemove,
}: {
  item: DocumentListItem
  chrome: DashboardChrome
  onRemove: (id: Id<'stableDocuments'>) => Promise<void>
}) {
  const { document } = item

  return (
    <DashboardItemMediaCard
      chrome={chrome}
      media={<DocumentPreview document={document} fileUrl={item.fileUrl} />}
      title={document.fileName}
      titleSize="sm"
      titleClassName="line-clamp-2 break-words"
      meta={
        <>
          <span>{getDocumentFormatLabel(document)}</span>
          {document.size !== undefined && (
            <span>{formatFileSize(document.size)}</span>
          )}
          {item.horseName && <span>{item.horseName}</span>}
          {item.eventTitle && <span>Linked to {item.eventTitle}</span>}
        </>
      }
      metaSeparator="dot"
      summary={document.notes ?? ''}
      badges={
        <DashboardBadgeList align="end">
          <DocumentTypeBadge type={document.type} />
          {!item.fileUrl && <DocumentMetadataOnlyBadge />}
        </DashboardBadgeList>
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
            >
              Open
            </ButtonAnchor>
          )}
          {item.canManage && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(document._id)}
            >
              Remove
            </Button>
          )}
        </>
      }
    />
  )
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
  'image/webp': 'WEBP',
  'text/csv': 'CSV',
  'text/plain': 'TXT',
}
