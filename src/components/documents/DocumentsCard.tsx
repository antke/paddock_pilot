import { localeInstances } from '#/i18n/resources'
import type { Locale } from 'shared/i18n/locale'
import { useT, useLocale } from '#/i18n/LocaleProvider'
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
import { useRef, useState } from 'react'
import type { ElementType, ReactNode } from 'react'
import { DocumentFileStateBadge } from './DocumentBadges'
import { DocumentDownloadAction } from './DocumentDownloadAction'
import { DocumentPreview } from './DocumentPreview'
import { DocumentUploadForm } from './DocumentUploadForm'
import type { DocumentUploadValues } from './DocumentUploadForm'
import { formatFileSize } from '#/lib/numberDisplay'
import { formatMediumTimestampDate } from '#/lib/dateDisplay'
import { formatConjunctionList } from '#/lib/textDisplay'
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
  const t = useT()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const uploading = useRef(false)

  if (!canAddDocument) return null

  const onAddFromDialog = async (values: DocumentUploadValues) => {
    await onAdd(values)
    setIsCreateOpen(false)
  }

  return (
    <CreateRecordDialog
      open={isCreateOpen}
      onOpenChange={(open) => {
        if (!uploading.current) setIsCreateOpen(open)
      }}
      isPending={isUploading}
      triggerLabel={t('documents.add')}
      title={t('documents.add')}
      description={t('documents.uploadHelp')}
    >
      <DocumentUploadForm
        horseOptions={horseOptions}
        fixedHorseId={fixedHorseId}
        onSubmit={onAddFromDialog}
        onPendingChange={(pending) => {
          uploading.current = pending
          setIsUploading(pending)
        }}
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
  chrome = 'soft',
  onRemove,
}: DocumentsCardProps) {
  const t = useT()
  const section = useRef<HTMLElement>(null)
  const documentList = (
    <>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic>
        {t('documents.count', { count: documents.length })}
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
                removalFocusTarget={() => section.current}
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
        ref={(element) => {
          section.current = element
        }}
        role="group"
        aria-label={title ?? t('documents.documents')}
        tabIndex={-1}
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
      ref={(element) => {
        section.current = element
      }}
      role="group"
      aria-label={title ?? t('documents.documents')}
      tabIndex={-1}
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
  removalFocusTarget,
}: {
  item: DocumentListItem
  headingLevel: 2 | 3
  removalFocusTarget: () => HTMLElement | null
  onRemove: (id: Id<'stableDocuments'>) => Promise<void>
}) {
  const t = useT()
  const { locale } = useLocale()
  const { document } = item
  const RowHeading = headingLevel === 2 ? 'h2' : 'h3'

  return (
    <DashboardItemMediaCard
      chrome="flat"
      interactive={false}
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
          <span>{t(`documents.types.${document.type}`)}</span>
          <span>{getDocumentFormatLabel(document, locale)}</span>
          {document.size !== undefined && (
            <span>{formatFileSize(document.size, locale)}</span>
          )}
          {item.horseName && <span>{item.horseName}</span>}
          {item.eventTitle && (
            <span>{t('documents.linkedTo', { name: item.eventTitle })}</span>
          )}
          <span>
            {t('documents.addedAt', {
              date: formatMediumTimestampDate(document.createdAt, locale),
            })}
          </span>
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
              aria-label={t('documents.openNamed', { name: document.fileName })}
            >
              {t('documents.open')}
            </ButtonAnchor>
          )}
          <DocumentDownloadAction
            fileName={document.fileName}
            fileUrl={item.fileUrl}
            fileState={item.fileState}
          />
          {item.canManage && (
            <RecordRemoveAction
              title={t('documents.removeNamed', { name: document.fileName })}
              description={getRemoveDescription(item, locale)}
              confirmLabel={t('documents.remove')}
              onConfirm={() => onRemove(document._id)}
              removalFocusTarget={removalFocusTarget}
            />
          )}
        </>
      }
    />
  )
}

function getRemoveDescription(item: DocumentListItem, locale: Locale) {
  const t = localeInstances[locale].t
  const consequences = [
    item.fileState !== 'metadata-only'
      ? t('documents.uploadedFile')
      : undefined,
    item.horseName
      ? t('documents.linkTo', { name: item.horseName })
      : undefined,
    item.eventTitle
      ? t('documents.linkTo', { name: item.eventTitle })
      : undefined,
  ]
  const consequenceCopy = formatConjunctionList(consequences, locale)

  if (!consequenceCopy) {
    return t('documents.removeRecordHelp')
  }

  return t('documents.removeConsequences', { consequences: consequenceCopy })
}

function getDocumentFormatLabel(
  document: Doc<'stableDocuments'>,
  locale: Locale,
) {
  const t = localeInstances[locale].t
  const extension = document.fileName.split('.').pop()?.toLowerCase()
  const extensionLabel = extension
    ? documentExtensionLabels[extension]
    : undefined

  if (extensionLabel) return extensionLabel

  const mimeTypeLabel = document.contentType
    ? documentMimeTypeLabels[document.contentType]
    : undefined

  if (mimeTypeLabel) return mimeTypeLabel

  return t('documents.file')
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
