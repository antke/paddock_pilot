import { useT } from '#/i18n/LocaleProvider'
import { ActionErrorAlert } from '#/components/layout/ActionErrorAlert'
import { ArchiveBoxIcon } from '@phosphor-icons/react'
import { useRef, useState } from 'react'

import { DashboardActions } from '#/components/dashboard/DashboardActions'
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
  const [archiveError, setArchiveError] = useState<unknown>(null)
  const pending = useRef(false)

  const handleArchive = async () => {
    if (pending.current) return
    pending.current = true
    setArchiveError(null)
    try {
      setIsArchiving(true)
      const archived = await onArchive()
      if (archived) setOpen(false)
      else setArchiveError(new Error('Archive failed'))
    } catch (error) {
      setArchiveError(error ?? new Error('Archive failed'))
    } finally {
      pending.current = false
      setIsArchiving(false)
    }
  }

  return (
    // A quiet footer after the stable's content, not a peer of the main record.
    <DashboardSectionCard
      surface="flat"
      size="compact"
      title={t('stables.archive')}
      description={t('stables.archiveHelp')}
      contentGap="compact"
    >
      <DashboardActions align="start">
        <AlertDialog
          open={open}
          onOpenChange={(nextOpen) => {
            if (pending.current) return
            setOpen(nextOpen)
            if (nextOpen) setArchiveError(null)
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
            {archiveError != null && (
              <ActionErrorAlert
                title={t('stables.archiveFailed')}
                error={archiveError}
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
      </DashboardActions>
    </DashboardSectionCard>
  )
}
