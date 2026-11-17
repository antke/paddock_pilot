import { WorkspaceRecordAudience } from '#/components/sharing/RecordAudienceLabel'
import { MotionList } from '#/components/motion/MotionList'
import { localeInstances } from '#/i18n/resources'
import type { Locale } from 'shared/i18n/locale'
import { useT, useLocale } from '#/i18n/LocaleProvider'
import type { DashboardChrome } from '#/components/dashboard/dashboardChrome'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { DashboardItemMediaCard } from '#/components/dashboard/DashboardItemCard'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { Button } from '#/components/ui/button'
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
  /** `canvas` when the list is the whole page, open on the page canvas. */
  surface?: 'canvas' | 'panel'
  onRemove: (id: Id<'stableDocuments'>) => Promise<void>
}

type DocumentUploadDialogProps = {
  enableSharing?: boolean
  canAddDocument: boolean
  horseOptions?: Array<DocumentHorseOption>
  fixedHorseId?: Id<'horses'>
  onAdd: (values: DocumentUploadValues) => Promise<void>
}

export function DocumentUploadDialog({
  enableSharing,
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
      actionId="document"
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
        enableSharing={enableSharing}
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
  surface = 'panel',
  onRemove,
}: DocumentsCardProps) {
  const t = useT()
  const section = useRef<HTMLElement>(null)
  // Reserve the Remove slot once any row has it, so actions form columns.
  const reserveRemove = documents.some((item) => item.canManage)
  const documentList = (
    <>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic>
        {t('documents.count', { count: documents.length })}
      </p>

      <MotionList
        items={documents}
        getKey={(item) => item.document._id}
        focusTarget={() => section.current}
        empty={
          <DashboardEmptyState chrome={chrome}>
            {emptyMessage}
          </DashboardEmptyState>
        }
        renderItem={(item) => (
          <DocumentRow
            item={item}
            headingLevel={title ? 3 : 2}
            reserveRemove={reserveRemove}
            onRemove={onRemove}
            removalFocusTarget={() => section.current}
          />
        )}
      />
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
      surface={surface}
      contentGap="comfortable"
    >
      {listToolbar}

      {documentList}
    </DashboardSectionCard>
  )
}

/** Invisible stand-in that keeps an absent action's width in the row. */
function ReservedRemoveSlot() {
  const t = useT()
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      action="delete"
      disabled
      tabIndex={-1}
      aria-hidden="true"
      // Phones stack actions under the text, so there is no column to keep aligned.
      className="invisible max-sm:hidden"
    >
      {t('careRecords.remove')}
    </Button>
  )
}

function DocumentRow({
  item,
  headingLevel,
  reserveRemove,
  onRemove,
  removalFocusTarget,
}: {
  item: DocumentListItem
  headingLevel: 2 | 3
  reserveRemove: boolean
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
      // Phones: the labelled actions sit as one unbroken group under the text, not beside it.
      className="[&_[data-dashboard-item-actions]]:flex-nowrap max-sm:[&_[data-dashboard-item-actions]]:col-start-2 max-sm:[&_[data-dashboard-item-actions]]:col-span-1 max-sm:[&_[data-dashboard-item-actions]]:-ms-3.5"
      // The file-state pill follows the title inline instead of floating mid-row.
      title={
        <>
          <RowHeading className="inline">
            {item.fileUrl ? (
              <a
                href={item.fileUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={t('documents.openNamed', {
                  name: document.fileName,
                })}
                className="app-control-focus rounded-control text-foreground underline-offset-4 hover:underline"
              >
                {document.fileName}
              </a>
            ) : (
              document.fileName
            )}
          </RowHeading>
          {item.fileState !== 'available' && (
            <>
              {' '}
              <DocumentFileStateBadge
                fileState={item.fileState}
                className="ml-1 align-[0.125em]"
              />
            </>
          )}
        </>
      }
      titleClassName="line-clamp-none break-words [overflow-wrap:anywhere]"
      // An array, not a fragment, so DashboardMetaList can separate the items.
      meta={[
        <span key="type">{t(`documents.types.${document.type}`)}</span>,
        <span key="format">{getDocumentFormatLabel(document, locale)}</span>,
        document.size !== undefined && (
          <span key="size">{formatFileSize(document.size, locale)}</span>
        ),
        item.horseName && <span key="horse">{item.horseName}</span>,
        item.eventTitle && (
          <span key="event">
            {t('documents.linkedTo', { name: item.eventTitle })}
          </span>
        ),
        <span key="added">
          {t('documents.addedAt', {
            date: formatMediumTimestampDate(document.createdAt, locale),
          })}
        </span>,
      ]}
      metaSeparator="dot"
      summary={
        <>
          {document.notes}
          {document.horseId && (
            <WorkspaceRecordAudience
              horseId={document.horseId}
              recordId={document._id}
            />
          )}
        </>
      }
      actions={
        <>
          <DocumentDownloadAction
            fileName={document.fileName}
            fileUrl={item.fileUrl}
            fileState={item.fileState}
          />
          {item.canManage ? (
            <RecordRemoveAction
              title={t('documents.removeNamed', { name: document.fileName })}
              description={getRemoveDescription(item, locale)}
              confirmLabel={t('documents.remove')}
              onConfirm={() => onRemove(document._id)}
              removalFocusTarget={removalFocusTarget}
            />
          ) : (
            reserveRemove && <ReservedRemoveSlot />
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
