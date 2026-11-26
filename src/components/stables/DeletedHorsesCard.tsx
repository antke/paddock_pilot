import { MotionList } from '#/components/motion/MotionList'
import { ActionFeedback } from '#/components/ui/action-feedback'
import { getHorseDisplayName } from 'shared/horses/horseDisplayName'
import { useT, useLocale } from '#/i18n/LocaleProvider'
import { api } from 'convex/_generated/api'
import { useMutation } from 'convex/react'
import { useRef, useState } from 'react'
import {
  DashboardItemCardContent,
  DashboardItemRecordCard,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { ActionErrorAlert } from '#/components/layout/ActionErrorAlert'
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

type DeletedHorsesSurface = 'canvas' | 'panel'

/** `canvas` is the standalone page, where the page header owns title and help. */
export function DeletedHorsesCard({
  horses,
  surface,
}: {
  horses: Array<DeletedHorse>
  surface?: DeletedHorsesSurface
}) {
  const t = useT()

  const restoreHorse = useMutation(api.horses.restoreHorse)
  const permanentlyDeleteHorse = useMutation(api.horses.permanentlyDeleteHorse)
  return (
    <DeletedHorsesView
      horses={horses}
      surface={surface}
      onRestore={async (horse) => {
        await restoreHorse({ id: horse._id })
        showAppSuccessToast({
          title: t('stableSetup.restored'),
          description: t('stableSetup.restoredHelp', {
            name: getHorseDisplayName(horse),
          }),
        })
      }}
      onPermanentlyDelete={async (horse) => {
        await permanentlyDeleteHorse({ id: horse._id })
        showAppSuccessToast({
          title: t('stableSetup.deleted'),
          description: t('stableSetup.deletedHelp', {
            name: getHorseDisplayName(horse),
          }),
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
  surface = 'panel',
}: {
  horses: Array<DeletedHorse>
  onRestore: (horse: DeletedHorse) => Promise<void>
  onPermanentlyDelete: (horse: DeletedHorse) => Promise<void>
  surface?: DeletedHorsesSurface
}) {
  const t = useT()

  const section = useRef<HTMLDivElement>(null)
  return (
    <DashboardSectionCard
      ref={section}
      role="group"
      aria-label={t('stableSetup.deletedHorses')}
      tabIndex={-1}
      surface={surface}
      {...(surface === 'panel' && {
        title: t('stableSetup.deletedHorses'),
        description: t('stableSetup.deletedHorsesHelp'),
      })}
    >
      <MotionList
        items={horses}
        getKey={(horse) => horse._id}
        focusTarget={() => section.current}
        empty={
          <DashboardEmptyState>
            {t('stableSetup.deletedEmpty')}
          </DashboardEmptyState>
        }
        renderItem={(horse) => (
          <DeletedHorseRow
            horse={horse}
            onRestore={async () => {
              await onRestore(horse)
              if (
                document.activeElement === document.body ||
                section.current?.contains(document.activeElement)
              ) {
                section.current?.focus({ preventScroll: true })
              }
            }}
            onPermanentlyDelete={() => onPermanentlyDelete(horse)}
            removalFocusTarget={() => section.current}
          />
        )}
      />
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
  const [failure, setFailure] = useState<{
    action: 'restore' | 'delete'
    error: unknown
  }>()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const pending = useRef(false)
  const deleteTrigger = useRef<HTMLButtonElement>(null)
  const perform = async (action: 'restore' | 'delete') => {
    if (pending.current) return
    pending.current = true
    setPendingAction(action)
    setFailure(undefined)
    try {
      if (action === 'restore') await onRestore()
      else {
        await onPermanentlyDelete()
        setDeleteOpen(false)
      }
    } catch (error) {
      setFailure({ action, error })
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
      aria-label={t('stableSetup.deletedHorseLabel', {
        name: getHorseDisplayName(horse),
      })}
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
            <ActionFeedback
              pending={pendingAction === 'restore'}
              label={t('stableSetup.restore')}
              pendingLabel={t('stableSetup.restoring')}
              icon={<ArrowCounterClockwiseIcon aria-hidden="true" />}
            />
          </Button>
          {horse.canPermanentlyDelete && (
            <AlertDialog
              open={deleteOpen}
              onOpenChange={(open) => {
                if (!pending.current) {
                  setDeleteOpen(open)
                  if (open) setFailure(undefined)
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
                    {t('stableSetup.deleteQuestion', {
                      name: getHorseDisplayName(horse),
                    })}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('stableSetup.deleteWarning')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                {failure?.action === 'delete' && (
                  <ActionErrorAlert
                    title={t('stableSetup.deleteFailed')}
                    error={failure.error}
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
                    <ActionFeedback
                      pending={pendingAction === 'delete'}
                      label={t('stableSetup.deletePermanently')}
                      pendingLabel={t('stableSetup.deleting')}
                    />
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </>
      }
      footer={
        failure?.action === 'restore' ? (
          <ActionErrorAlert
            title={t('stableSetup.restoreFailed')}
            error={failure.error}
          />
        ) : undefined
      }
    >
      <DashboardItemCardContent
        title={getHorseDisplayName(horse)}
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
