import { api } from 'convex/_generated/api'
import { useMutation } from 'convex/react'
import { useState } from 'react'

import {
  DashboardItemCardContent,
  DashboardItemList,
  DashboardItemRecordCard,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import { Button } from '#/components/ui/button'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { formatMediumTimestampDate } from '#/lib/dateDisplay'
import type { StableSettingsData } from './stableSettingsTypes'

export function DeletedHorsesCard({
  horses,
}: {
  horses: StableSettingsData['deletedHorses']
}) {
  if (horses.length === 0) {
    return (
      <DashboardSectionCard
        title="Deleted horses"
        description="Deleted horses remain recoverable for 14 days."
      >
        <DashboardEmptyState chrome="soft" spacing="flush">
          No horses are waiting to be permanently deleted.
        </DashboardEmptyState>
      </DashboardSectionCard>
    )
  }

  return (
    <DashboardSectionCard
      title="Deleted horses"
      description="Restore a horse before its permanent deletion date. After 14 days it becomes eligible for final removal."
    >
      <DashboardItemList gap="flush">
        {horses.map((horse) => (
          <DeletedHorseRow key={horse._id} horse={horse} />
        ))}
      </DashboardItemList>
    </DashboardSectionCard>
  )
}

function DeletedHorseRow({
  horse,
}: {
  horse: StableSettingsData['deletedHorses'][number]
}) {
  const restoreHorse = useMutation(api.horses.restoreHorse)
  const permanentlyDeleteHorse = useMutation(api.horses.permanentlyDeleteHorse)
  const [pendingAction, setPendingAction] = useState<'restore' | 'delete'>()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const onRestore = async () => {
    try {
      setPendingAction('restore')
      await restoreHorse({ id: horse._id })
      showAppSuccessToast({
        title: 'Horse restored',
        description: <p>{horse.name} is visible in the stable again.</p>,
      })
    } catch {
      showAppErrorToast()
    } finally {
      setPendingAction(undefined)
    }
  }

  const onPermanentlyDelete = async () => {
    try {
      setPendingAction('delete')
      await permanentlyDeleteHorse({ id: horse._id })
      setDeleteOpen(false)
      showAppSuccessToast({
        title: 'Horse permanently deleted',
        description: (
          <p>{horse.name} and its horse-specific records were removed.</p>
        ),
      })
    } catch {
      showAppErrorToast()
    } finally {
      setPendingAction(undefined)
    }
  }

  return (
    <DashboardItemRecordCard
      chrome="soft"
      density="compact"
      actions={
        <>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pendingAction !== undefined}
            onClick={onRestore}
          >
            {pendingAction === 'restore' ? 'Restoring...' : 'Restore'}
          </Button>

          {horse.canPermanentlyDelete && (
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <AlertDialogTrigger
                render={
                  <Button type="button" size="sm" variant="destructive" />
                }
              >
                Delete permanently
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Permanently delete {horse.name}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes horse-specific records and single-horse events.
                    Events shared with other horses will remain.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={pendingAction !== undefined}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    disabled={pendingAction !== undefined}
                    onClick={onPermanentlyDelete}
                  >
                    {pendingAction === 'delete'
                      ? 'Deleting...'
                      : 'Delete permanently'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </>
      }
    >
      <DashboardItemCardContent
        title={horse.name}
        titleSize="sm"
        meta={
          <>
            <span>Deleted {formatMediumTimestampDate(horse.deletedAt!)}</span>
            <span>
              Permanent deletion {formatMediumTimestampDate(horse.purgeAt)}
            </span>
          </>
        }
        metaSeparator="dot"
      />
    </DashboardItemRecordCard>
  )
}
