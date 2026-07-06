import {
  dashboardEmptyClassName,
  dashboardSectionClassName,
} from '#/components/dashboard/dashboardChrome'
import type { DashboardChrome } from '#/components/dashboard/dashboardChrome'
import { dashboardItemCardClassName } from '#/components/dashboard/DashboardItemCard'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { CreateRecordDialog } from '#/components/list-layout/CreateRecordDialog'
import {
  Card,
  CardContent,
  CardHeader,
} from '#/components/ui/card'
import { FileTextIcon } from '@phosphor-icons/react'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { stableDocumentTypeLabels } from 'shared/stables/stableDocumentSchema'
import { DocumentUploadForm } from './DocumentUploadForm'
import type { DocumentUploadValues } from './DocumentUploadForm'

export type DocumentListItem = {
  document: Doc<'stableDocuments'>
  horseName?: string
  eventTitle?: string
  fileUrl?: string | null
  canManage: boolean
}

type HorseOption = {
  _id: Id<'horses'>
  name: string
}

type DocumentsCardProps = {
  title: string
  description: string
  documents: Array<DocumentListItem>
  canAddDocument: boolean
  horseOptions?: Array<HorseOption>
  fixedHorseId?: Id<'horses'>
  emptyMessage: string
  listToolbar?: ReactNode
  chrome?: DashboardChrome
  onAdd: (values: DocumentUploadValues) => Promise<void>
  onRemove: (id: Id<'stableDocuments'>) => Promise<void>
}

const fileSizeFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
})

export function DocumentsCard({
  title,
  description,
  documents,
  canAddDocument,
  horseOptions,
  fixedHorseId,
  emptyMessage,
  listToolbar,
  chrome = 'cards',
  onAdd,
  onRemove,
}: DocumentsCardProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const onAddFromDialog = async (values: DocumentUploadValues) => {
    await onAdd(values)
    setIsCreateOpen(false)
  }

  const uploadForm = canAddDocument ? (
    <DocumentUploadForm
      horseOptions={horseOptions}
      fixedHorseId={fixedHorseId}
      onSubmit={onAddFromDialog}
    />
  ) : null
  const uploadDialog = uploadForm ? (
    <CreateRecordDialog
      open={isCreateOpen}
      onOpenChange={setIsCreateOpen}
      triggerLabel="Add document"
      title="Add document"
      description="Upload paperwork without losing your place in the document list."
    >
      {uploadForm}
    </CreateRecordDialog>
  ) : null

  const documentList = (
    <div className="grid gap-4">
      {documents.length === 0 ? (
        <p className={dashboardEmptyClassName(chrome)}>{emptyMessage}</p>
      ) : (
        <div className="grid gap-2">
          {documents.map((item) => (
            <DocumentRow
              key={item.document._id}
              item={item}
              chrome={chrome}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  )

  if (chrome === 'soft') {
    return (
      <section className={dashboardSectionClassName('soft', 'grid gap-6')}>
        <DocumentsHeader
          title={title}
          description={description}
          action={uploadDialog}
        />

        {listToolbar}
        {documentList}
      </section>
    )
  }

  return (
    <Card>
      <CardHeader>
        <DocumentsHeader
          title={title}
          description={description}
          action={uploadDialog}
        />
      </CardHeader>
      <CardContent className="grid gap-5">
        {listToolbar}

        {documentList}
      </CardContent>
    </Card>
  )
}

function DocumentsHeader({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="grid gap-1">
        <h2 className="text-2xl font-semibold leading-tight tracking-tight">
          {title}
        </h2>
        <p className="max-w-2xl text-base leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      {action}
    </header>
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
    <div
      className={dashboardItemCardClassName({
        interactive: true,
        chrome,
        className: 'grid',
      })}
    >
      <div className="flex h-28 items-stretch gap-4">
        <DocumentPreview item={item} />

        <div className="grid min-w-0 flex-1 grid-rows-[auto_1fr_auto] gap-1">
          <div className="flex items-start justify-between gap-3">
            <div className="grid min-w-0 gap-2">
              <h3 className="break-words text-sm font-semibold underline-offset-4 transition-colors group-hover/dashboard-item:text-primary group-hover/dashboard-item:underline">
                {document.fileName}
              </h3>

              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>{getDocumentFormatLabel(document)}</span>
                {document.size !== undefined && (
                  <span>{formatFileSize(document.size)}</span>
                )}
                {item.horseName && <span>{item.horseName}</span>}
                {item.eventTitle && <span>Linked to {item.eventTitle}</span>}
              </div>
            </div>

            <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2">
              <Badge variant="outline">
                {stableDocumentTypeLabels[document.type]}
              </Badge>
              {!item.fileUrl && (
                <Badge variant="secondary">Metadata only</Badge>
              )}
            </div>
          </div>

          <p className="line-clamp-2 min-h-8 whitespace-pre-line text-sm text-muted-foreground">
            {document.notes ?? ''}
          </p>

          <div className="flex flex-wrap justify-end gap-2">
            {item.fileUrl && (
              <Button
                asChild
                type="button"
                variant="ghost"
                size="sm"
                className="shadow-none"
              >
                <a href={item.fileUrl} target="_blank" rel="noreferrer">
                  Open
                </a>
              </Button>
            )}
            {item.canManage && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shadow-none"
                onClick={() => onRemove(document._id)}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DocumentPreview({ item }: { item: DocumentListItem }) {
  const { document, fileUrl } = item
  const isImage = isImageDocument(document)

  if (isImage && fileUrl) {
    return (
      <img
        src={fileUrl}
        alt={`${document.fileName} preview`}
        className="size-28 shrink-0 rounded-row bg-background/55 object-contain"
        loading="lazy"
      />
    )
  }

  return (
    <div className="grid size-28 shrink-0 place-items-center rounded-row bg-background/55 text-muted-foreground">
      <FileTextIcon className="size-10" weight="duotone" />
    </div>
  )
}

function isImageDocument(document: Doc<'stableDocuments'>) {
  if (document.contentType?.startsWith('image/')) return true

  return /\.(avif|gif|jpe?g|png|webp)$/i.test(document.fileName)
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

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${fileSizeFormatter.format(size / 1024)} KB`

  return `${fileSizeFormatter.format(size / (1024 * 1024))} MB`
}
