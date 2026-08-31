import { DownloadSimpleIcon } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '#/components/ui/button'
import { showAppErrorToast } from '#/components/ui/sonner'
import { Spinner } from '#/components/ui/spinner'
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
  const [isDownloading, setIsDownloading] = useState(false)
  const activeRequest = useRef<AbortController | null>(null)
  const isMounted = useRef(true)
  const unavailableReason = getUnavailableReason(fileState)

  useEffect(() => {
    return () => {
      isMounted.current = false
      activeRequest.current?.abort()
    }
  }, [])

  const downloadDocument = async () => {
    if (!fileUrl || activeRequest.current) return

    const controller = new AbortController()
    activeRequest.current = controller
    setIsDownloading(true)

    try {
      const response = await fetch(fileUrl, { signal: controller.signal })
      if (!response.ok) {
        throw new Error(`Document download failed with ${response.status}`)
      }

      const file = await response.blob()
      triggerBrowserDownload(file, fileName)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return

      showAppErrorToast({
        title: 'Could not download document',
        description: <p>Check your connection, then try the download again.</p>,
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
          ? `Download unavailable for ${fileName}: ${unavailableReason}`
          : `${isDownloading ? 'Downloading' : 'Download'} ${fileName}`
      }
      onClick={downloadDocument}
    >
      {isDownloading ? (
        <Spinner data-icon="inline-start" aria-hidden={true} />
      ) : (
        <DownloadSimpleIcon
          data-icon="inline-start"
          weight="bold"
          aria-hidden={true}
        />
      )}
      {isDownloading ? 'Downloading…' : 'Download'}
    </Button>
  )

  if (!unavailableReason) return downloadButton

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            className="inline-flex"
            tabIndex={0}
            aria-label={`Download unavailable: ${unavailableReason}`}
          />
        }
      >
        {downloadButton}
      </TooltipTrigger>
      <TooltipContent>{unavailableReason}</TooltipContent>
    </Tooltip>
  )
}

function getUnavailableReason(fileState: StableDocumentFileState) {
  if (fileState === 'metadata-only') return 'No file is attached'
  if (fileState === 'unavailable') return 'The attached file is unavailable'

  return undefined
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
