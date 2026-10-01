import { useT } from '#/i18n/LocaleProvider'
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
  const t = useT()

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
      title={t('stables.archive')}
      description={t('stables.archiveHelp')}
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
            {t('stables.archive')}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia>
                <ArchiveBoxIcon aria-hidden="true" />
              </AlertDialogMedia>
              <AlertDialogTitle>
                {t('stables.archiveConfirm', { name: stableName })}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t('stables.archiveConsequences')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            {archiveFailed && (
              <RouteStatusAlert
                tone="danger"
                title={t('stables.archiveFailed')}
                description={t('stables.archiveFailedHelp')}
              />
            )}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isArchiving}>
                {t('stables.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={isArchiving}
                aria-busy={isArchiving || undefined}
                onClick={handleArchive}
              >
                <ArchiveBoxIcon aria-hidden="true" />
                {isArchiving ? t('stables.archiving') : t('stables.archive')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      }
      contentGap="compact"
    />
  )
}
