import { useT, useLocale } from '#/i18n/LocaleProvider'
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
  const t = useT()

  const restoreHorse = useMutation(api.horses.restoreHorse)
  const permanentlyDeleteHorse = useMutation(api.horses.permanentlyDeleteHorse)
  return (
    <DeletedHorsesView
      horses={horses}
      onRestore={async (horse) => {
        await restoreHorse({ id: horse._id })
        showAppSuccessToast({
          title: t('stableSetup.restored'),
          description: t('stableSetup.restoredHelp', { name: horse.name }),
        })
      }}
      onPermanentlyDelete={async (horse) => {
        await permanentlyDeleteHorse({ id: horse._id })
        showAppSuccessToast({
          title: t('stableSetup.deleted'),
          description: t('stableSetup.deletedHelp', { name: horse.name }),
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
  const t = useT()

  const section = useRef<HTMLDivElement>(null)
  return (
    <DashboardSectionCard
      ref={section}
      role="group"
      aria-label={t('stableSetup.deletedHorses')}
      tabIndex={-1}
      title={t('stableSetup.deletedHorses')}
      description={t('stableSetup.deletedHorsesHelp')}
    >
      {horses.length === 0 ? (
        <DashboardEmptyState>
          {t('stableSetup.deletedEmpty')}
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
  const t = useT()
  const { locale } = useLocale()

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
      aria-label={t('stableSetup.deletedHorseLabel', { name: horse.name })}
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
            {pendingAction === 'restore'
              ? t('stableSetup.restoring')
              : t('stableSetup.restore')}
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
                {t('stableSetup.deletePermanently')}
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
                    {t('stableSetup.deleteQuestion', { name: horse.name })}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('stableSetup.deleteWarning')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                {failedAction === 'delete' && (
                  <RouteStatusAlert
                    tone="danger"
                    title={t('stableSetup.deleteFailed')}
                    description={t('stableSetup.deleteFailedHelp')}
                  />
                )}
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={pendingAction !== undefined}>
                    {t('stableSetup.cancel')}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    action="delete"
                    variant="destructive"
                    disabled={pendingAction !== undefined}
                    aria-busy={pendingAction === 'delete' || undefined}
                    onClick={() => void perform('delete')}
                  >
                    {pendingAction === 'delete'
                      ? t('stableSetup.deleting')
                      : t('stableSetup.deletePermanently')}
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
            title={t('stableSetup.restoreFailed')}
            description={t('stableSetup.restoreFailedHelp')}
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
              {t('stableSetup.deletedDate', {
                date:
                  horse.deletedAt === undefined
                    ? t('stableSetup.dateUnavailable')
                    : formatMediumTimestampDate(horse.deletedAt, locale),
              })}
            </span>
            <span>
              {t('stableSetup.purgeDate', {
                date: formatMediumTimestampDate(horse.purgeAt, locale),
              })}
            </span>
          </>
        }
        metaSeparator="dot"
      />
    </DashboardItemRecordCard>
  )
}
