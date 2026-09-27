import { RouteStatusAlert } from '#/components/layout/RouteStatusAlert'
import { ArchiveBoxIcon } from '@phosphor-icons/react'
import { useRef, useState } from 'react'

import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import { Button } from '#/components/ui/button'

type StableArchiveCardProps = {
  stableName: string
  onArchive: () => boolean | Promise<boolean>
}

export function StableArchiveCard({
  stableName,
  onArchive,
}: StableArchiveCardProps) {
  const [open, setOpen] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [archiveFailed, setArchiveFailed] = useState(false)
  const pending = useRef(false)

  const handleArchive = async () => {
    if (pending.current) return
    pending.current = true
    setArchiveFailed(false)
    try {
      setIsArchiving(true)
      const archived = await onArchive()
      if (archived) setOpen(false)
      else setArchiveFailed(true)
    } catch {
      setArchiveFailed(true)
    } finally {
      pending.current = false
      setIsArchiving(false)
    }
  }

  return (
    <DashboardSectionCard
      title="Archive stable"
      description="Archive this stable when the team should no longer have access. Its records are preserved, but restoration currently requires support."
      actions={
        <AlertDialog
          open={open}
          onOpenChange={(nextOpen) => {
            if (pending.current) return
            setOpen(nextOpen)
            if (nextOpen) setArchiveFailed(false)
          }}
        >
          <AlertDialogTrigger
            render={<Button type="button" variant="destructive" />}
          >
            <ArchiveBoxIcon aria-hidden="true" />
            Archive stable
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia>
                <ArchiveBoxIcon aria-hidden="true" />
              </AlertDialogMedia>
              <AlertDialogTitle>Archive {stableName}?</AlertDialogTitle>
              <AlertDialogDescription>
                Everyone immediately loses access to this stable. Horses,
                events, documents and member history are preserved, but this
                cannot currently be undone inside the app.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {archiveFailed && (
              <RouteStatusAlert
                tone="danger"
                title="Could not archive the stable"
                description="Archiving was not confirmed. Try again or cancel to keep this page open."
              />
            )}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isArchiving}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={isArchiving}
                aria-busy={isArchiving || undefined}
                onClick={handleArchive}
              >
                <ArchiveBoxIcon aria-hidden="true" />
                {isArchiving ? 'Archiving...' : 'Archive stable'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      }
      contentGap="compact"
    />
  )
}
