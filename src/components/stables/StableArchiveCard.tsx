import { ArchiveBoxIcon } from '@phosphor-icons/react'
import { useState } from 'react'

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

  const handleArchive = async () => {
    try {
      setIsArchiving(true)
      const archived = await onArchive()
      if (archived) setOpen(false)
    } finally {
      setIsArchiving(false)
    }
  }

  return (
    <DashboardSectionCard
      title="Archive stable"
      description="Archive this stable when the team should no longer have access. Its records are preserved, but restoration currently requires support."
      actions={
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger
            render={<Button type="button" variant="destructive" />}
          >
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
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isArchiving}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={isArchiving}
                onClick={handleArchive}
              >
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
