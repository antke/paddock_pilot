import { api } from 'convex/_generated/api'
import { useMutation } from 'convex/react'
import { useRef, useState } from 'react'
import {
  DashboardItemCardContent,
  DashboardItemList,
  DashboardItemRecordCard,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { RouteStatusAlert } from '#/components/layout/RouteStatusAlert'
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
import { showAppSuccessToast } from '#/components/ui/sonner'
import { formatMediumTimestampDate } from '#/lib/dateDisplay'
import type { StableSettingsData } from './stableSettingsTypes'
import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react'

export type DeletedHorse = StableSettingsData['deletedHorses'][number]

export function DeletedHorsesCard({ horses }: { horses: Array<DeletedHorse> }) {
  const restoreHorse = useMutation(api.horses.restoreHorse)
  const permanentlyDeleteHorse = useMutation(api.horses.permanentlyDeleteHorse)
  return (
    <DeletedHorsesView
      horses={horses}
      onRestore={async (horse) => {
        await restoreHorse({ id: horse._id })
        showAppSuccessToast({
          title: 'Horse restored',
          description: `${horse.name} is visible in the stable again.`,
        })
      }}
      onPermanentlyDelete={async (horse) => {
        await permanentlyDeleteHorse({ id: horse._id })
        showAppSuccessToast({
          title: 'Horse permanently deleted',
          description: `${horse.name} and its horse-specific records were removed.`,
        })
      }}
    />
  )
}

/** Shared view. Callbacks resolve after persistence and reject any unconfirmed operation. */
export function DeletedHorsesView({
  horses,
  onRestore,
  onPermanentlyDelete,
}: {
  horses: Array<DeletedHorse>
  onRestore: (horse: DeletedHorse) => Promise<void>
  onPermanentlyDelete: (horse: DeletedHorse) => Promise<void>
}) {
  const section = useRef<HTMLDivElement>(null)
  return (
    <DashboardSectionCard
      ref={section}
      role="group"
      aria-label="Deleted horses"
      tabIndex={-1}
      title="Deleted horses"
      description="Deleted horses are kept for 14 days, then become eligible for permanent removal. Restore a horse while it is still listed here."
    >
      {horses.length === 0 ? (
        <DashboardEmptyState>
          No horses are waiting to be permanently deleted.
        </DashboardEmptyState>
      ) : (
        <DashboardItemList gap="compact">
          {horses.map((horse) => (
            <DeletedHorseRow
              key={horse._id}
              horse={horse}
              onRestore={async () => {
                await onRestore(horse)
                section.current?.focus()
              }}
              onPermanentlyDelete={() => onPermanentlyDelete(horse)}
              removalFocusTarget={() => section.current}
            />
          ))}
        </DashboardItemList>
      )}
    </DashboardSectionCard>
  )
}

function DeletedHorseRow({
  horse,
  onRestore,
  onPermanentlyDelete,
  removalFocusTarget,
}: {
  horse: DeletedHorse
  onRestore: () => Promise<void>
  onPermanentlyDelete: () => Promise<void>
  removalFocusTarget: () => HTMLElement | null
}) {
  const [pendingAction, setPendingAction] = useState<'restore' | 'delete'>()
  const [failedAction, setFailedAction] = useState<'restore' | 'delete'>()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const pending = useRef(false)
  const deleteTrigger = useRef<HTMLButtonElement>(null)
  const perform = async (action: 'restore' | 'delete') => {
    if (pending.current) return
    pending.current = true
    setPendingAction(action)
    setFailedAction(undefined)
    try {
      if (action === 'restore') await onRestore()
      else {
        await onPermanentlyDelete()
        setDeleteOpen(false)
      }
    } catch {
      setFailedAction(action)
    } finally {
      pending.current = false
      setPendingAction(undefined)
    }
  }
  return (
    <DashboardItemRecordCard
      chrome="flat"
      density="compact"
      interactive={false}
      role="group"
      aria-label={`${horse.name}, deleted horse`}
      actions={
        <>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pendingAction !== undefined}
            aria-busy={pendingAction === 'restore' || undefined}
            onClick={() => void perform('restore')}
          >
            <ArrowCounterClockwiseIcon aria-hidden="true" />
            {pendingAction === 'restore' ? 'Restoring...' : 'Restore'}
          </Button>
          {horse.canPermanentlyDelete && (
            <AlertDialog
              open={deleteOpen}
              onOpenChange={(open) => {
                if (!pending.current) {
                  setDeleteOpen(open)
                  if (open) setFailedAction(undefined)
                }
              }}
            >
              <AlertDialogTrigger
                render={
                  <Button
                    ref={deleteTrigger}
                    type="button"
                    action="delete"
                    size="sm"
                    variant="destructive"
                    disabled={pendingAction !== undefined}
                  />
                }
              >
                Delete permanently
              </AlertDialogTrigger>
              <AlertDialogContent
                finalFocus={() =>
                  deleteTrigger.current?.isConnected
                    ? deleteTrigger.current
                    : removalFocusTarget()
                }
              >
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Permanently delete {horse.name}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This cannot be undone. It removes horse-specific records and
                    single-horse events. Events shared with other horses will
                    remain.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                {failedAction === 'delete' && (
                  <RouteStatusAlert
                    tone="danger"
                    title="Could not permanently delete horse"
                    description="Deletion was not confirmed. Try again or cancel."
                  />
                )}
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={pendingAction !== undefined}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    action="delete"
                    variant="destructive"
                    disabled={pendingAction !== undefined}
                    aria-busy={pendingAction === 'delete' || undefined}
                    onClick={() => void perform('delete')}
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
      footer={
        failedAction === 'restore' ? (
          <RouteStatusAlert
            tone="danger"
            title="Could not restore horse"
            description="Restoration was not confirmed. Try restoring again."
          />
        ) : undefined
      }
    >
      <DashboardItemCardContent
        title={horse.name}
        titleSize="sm"
        meta={
          <>
            <span>
              Deleted{' '}
              {horse.deletedAt === undefined
                ? 'date unavailable'
                : formatMediumTimestampDate(horse.deletedAt)}
            </span>
            <span>
              Eligible for permanent removal{' '}
              {formatMediumTimestampDate(horse.purgeAt)}
            </span>
          </>
        }
        metaSeparator="dot"
      />
    </DashboardItemRecordCard>
  )
}
