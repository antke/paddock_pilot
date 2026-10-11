import { useT } from '#/i18n/LocaleProvider'
import { DownloadSimpleIcon } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '#/components/ui/button'
import { showAppErrorToast } from '#/components/ui/sonner'
import { ActionFeedback } from '#/components/ui/action-feedback'
import { useTransientConfirmation } from '#/lib/useTransientConfirmation'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import type { StableDocumentFileState } from 'shared/stables/stableDocumentSchema'

type DocumentDownloadActionProps = {
  fileName: string
  fileState: StableDocumentFileState
  fileUrl?: string | null
}

export function DocumentDownloadAction({
  fileName,
  fileState,
  fileUrl,
}: DocumentDownloadActionProps) {
  const t = useT()

  const [isDownloading, setIsDownloading] = useState(false)
  const confirmation = useTransientConfirmation(`${fileUrl}:${fileName}`)
  const activeRequest = useRef<AbortController | null>(null)
  const isMounted = useRef(true)
  const unavailableReason =
    fileState === 'metadata-only'
      ? t('documents.noFileReason')
      : fileState === 'unavailable'
        ? t('documents.unavailableReason')
        : undefined

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
      activeRequest.current?.abort()
    }
  }, [])

  const downloadDocument = async () => {
    if (!fileUrl || activeRequest.current) return

    const controller = new AbortController()
    activeRequest.current = controller
    confirmation.clear()
    setIsDownloading(true)

    try {
      const response = await fetch(fileUrl, { signal: controller.signal })
      if (!response.ok) {
        throw new Error(`Document download failed with ${response.status}`)
      }

      const file = await response.blob()
      if (controller.signal.aborted || !isMounted.current) return
      triggerBrowserDownload(file, fileName)
      confirmation.confirm()
    } catch (error) {
      if (
        controller.signal.aborted ||
        (error instanceof Error && error.name === 'AbortError')
      )
        return

      showAppErrorToast({
        title: t('documents.downloadFailed'),
        description: <p>{t('documents.downloadRetry')}</p>,
      })
    } finally {
      if (activeRequest.current === controller) {
        activeRequest.current = null
      }
      if (isMounted.current) setIsDownloading(false)
    }
  }

  const downloadButton = (
    <Button
      type="button"
      variant="default"
      size="sm"
      className="min-w-32"
      disabled={!fileUrl || isDownloading}
      aria-busy={isDownloading || undefined}
      aria-label={
        unavailableReason
          ? t('documents.unavailableNamed', {
              name: fileName,
              reason: unavailableReason,
            })
          : t(
              isDownloading
                ? 'documents.downloadingNamed'
                : 'documents.downloadNamed',
              { name: fileName },
            )
      }
      onClick={downloadDocument}
    >
      <ActionFeedback
        label={t('documents.download')}
        pendingLabel={t('documents.downloading')}
        confirmedLabel={t('documents.downloadStarted')}
        pending={isDownloading}
        confirmed={confirmation.confirmed}
        icon={<DownloadSimpleIcon weight="bold" aria-hidden="true" />}
      />
    </Button>
  )

  if (!unavailableReason)
    return (
      <>
        {downloadButton}
        <span role="status" className="sr-only">
          {confirmation.confirmed
            ? t('documents.downloadStartedNamed', { name: fileName })
            : ''}
        </span>
      </>
    )

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            className="inline-flex"
            tabIndex={0}
            aria-label={t('documents.unavailableLabel', {
              reason: unavailableReason,
            })}
          />
        }
      >
        {downloadButton}
      </TooltipTrigger>
      <TooltipContent>{unavailableReason}</TooltipContent>
    </Tooltip>
  )
}

function triggerBrowserDownload(file: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(file)
  const downloadLink = document.createElement('a')
  downloadLink.href = objectUrl
  downloadLink.download = fileName
  downloadLink.hidden = true
  document.body.append(downloadLink)

  try {
    downloadLink.click()
  } finally {
    downloadLink.remove()
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0)
  }
}
