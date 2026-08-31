import { DashboardInlinePanel } from '#/components/dashboard/DashboardInlinePanel'
import { cn } from '#/lib/utils'
import { FileTextIcon, FileXIcon } from '@phosphor-icons/react'
import type { Doc } from 'convex/_generated/dataModel'
import { useState } from 'react'
import type { ComponentProps } from 'react'
import type { StableDocumentFileState } from 'shared/stables/stableDocumentSchema'

type DocumentPreviewProps = {
  document: Doc<'stableDocuments'>
  fileUrl?: string | null
  fileState: StableDocumentFileState
}

type DocumentPreviewFrameProps = ComponentProps<typeof DashboardInlinePanel> & {
  muted?: boolean
  overflow?: 'hidden' | 'visible'
}

type DocumentPreviewImageProps = ComponentProps<'img'>

export function DocumentPreview({
  document,
  fileUrl,
  fileState,
}: DocumentPreviewProps) {
  const isImage = isImageDocument(document)
  const [failedPreviewUrl, setFailedPreviewUrl] = useState<string>()
  const previewFailed =
    fileState === 'unavailable' ||
    Boolean(fileUrl && failedPreviewUrl === fileUrl)

  if (isImage && fileUrl && !previewFailed) {
    return (
      <DocumentPreviewFrame overflow="hidden">
        <DocumentPreviewImage
          src={fileUrl}
          alt=""
          loading="lazy"
          onError={() => setFailedPreviewUrl(fileUrl)}
        />
      </DocumentPreviewFrame>
    )
  }

  return (
    <DocumentPreviewFrame muted aria-hidden={true}>
      <DocumentPreviewIcon failed={previewFailed} />
    </DocumentPreviewFrame>
  )
}

function DocumentPreviewFrame({
  className,
  muted = false,
  overflow = 'visible',
  ...props
}: DocumentPreviewFrameProps) {
  return (
    <DashboardInlinePanel
      padding="none"
      className={cn(
        'grid size-20 shrink-0 place-items-center sm:size-28',
        muted && 'text-muted-foreground',
        overflow === 'hidden' && 'overflow-hidden',
        className,
      )}
      {...props}
    />
  )
}

function DocumentPreviewImage({
  className,
  src,
  ...props
}: DocumentPreviewImageProps) {
  if (!src) return null

  return (
    <img
      src={src}
      className={cn('size-full object-contain', className)}
      {...props}
    />
  )
}

function DocumentPreviewIcon({ failed = false }: { failed?: boolean }) {
  const Icon = failed ? FileXIcon : FileTextIcon

  return <Icon className="size-10" weight="duotone" aria-hidden={true} />
}

function isImageDocument(document: Doc<'stableDocuments'>) {
  if (document.contentType) return document.contentType.startsWith('image/')

  return /\.(avif|gif|jpe?g|png|webp)$/i.test(document.fileName)
}
