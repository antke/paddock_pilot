import { DashboardInlinePanel } from '#/components/dashboard/DashboardInlinePanel'
import { cn } from '#/lib/utils'
import { FileTextIcon } from '@phosphor-icons/react'
import type { Doc } from 'convex/_generated/dataModel'
import type { ComponentProps } from 'react'

type DocumentPreviewProps = {
  document: Doc<'stableDocuments'>
  fileUrl?: string | null
}

type DocumentPreviewFrameProps = ComponentProps<
  typeof DashboardInlinePanel
> & {
  muted?: boolean
  overflow?: 'hidden' | 'visible'
}

type DocumentPreviewImageProps = ComponentProps<'img'>

export function DocumentPreview({ document, fileUrl }: DocumentPreviewProps) {
  const isImage = isImageDocument(document)

  if (isImage && fileUrl) {
    return (
      <DocumentPreviewFrame overflow="hidden">
        <DocumentPreviewImage
          src={fileUrl}
          alt={`${document.fileName} preview`}
          loading="lazy"
        />
      </DocumentPreviewFrame>
    )
  }

  return (
    <DocumentPreviewFrame muted>
      <DocumentPreviewIcon />
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
        'grid size-28 shrink-0 place-items-center',
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
  ...props
}: DocumentPreviewImageProps) {
  return <img className={cn('size-full object-contain', className)} {...props} />
}

function DocumentPreviewIcon() {
  return <FileTextIcon className="size-10" weight="duotone" />
}

function isImageDocument(document: Doc<'stableDocuments'>) {
  if (document.contentType?.startsWith('image/')) return true

  return /\.(avif|gif|jpe?g|png|webp)$/i.test(document.fileName)
}
