import { useT } from '#/i18n/LocaleProvider'
import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { Alert, AlertDescription } from '#/components/ui/alert'
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
import { Spinner } from '#/components/ui/spinner'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

type HorseDeletionActionsProps = {
  horse: Pick<Doc<'horses'>, '_id' | 'name'>
  onDeleted: () => void | Promise<void>
  onAcknowledged?: () => void
  disabled?: boolean
  onPendingChange?: (pending: boolean) => void
}

type HorseDeletionActionsViewProps = HorseDeletionActionsProps & {
  /** Resolve void/true only after acknowledgement; false/rejection preserves the horse. */
  onDelete: () => Promise<void | boolean>
}

export function HorseDeletionActions({
  horse,
  onDeleted,
  ...props
}: HorseDeletionActionsProps) {
  const t = useT()

  const softDeleteHorse = useMutation(api.horses.deleteHorse)
  const toastedHorse = useRef<string | null>(null)
  return (
    <HorseDeletionActionsView
      {...props}
      horse={horse}
      onDelete={async () => {
        await softDeleteHorse({ id: horse._id })
      }}
      onDeleted={async () => {
        if (toastedHorse.current !== horse._id) {
          toastedHorse.current = horse._id
          showAppSuccessToast({
            title: t('horseDeletion.moved'),
            description: t('horseDeletion.movedHelp', { name: horse.name }),
          })
        }
        await onDeleted()
      }}
    />
  )
}

/** Query-free owner shared by the connected action and local specimens. */
export function HorseDeletionActionsView(props: HorseDeletionActionsViewProps) {
  return <HorseDeletionState key={props.horse._id} {...props} />
}

function HorseDeletionState({
  horse,
  onDelete,
  onDeleted,
  onAcknowledged,
  disabled = false,
  onPendingChange,
}: HorseDeletionActionsViewProps) {
  const t = useT()

  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)
  const [failure, setFailure] = useState<'delete' | 'continue'>()
  const pending = useRef(false)
  const deleted = useRef(false)
  const epoch = useRef(0)
  const pendingCallback = useRef(onPendingChange)
  const trigger = useRef<HTMLButtonElement>(null)
  const section = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    pendingCallback.current = onPendingChange
  }, [onPendingChange])
  useEffect(() => {
    epoch.current += 1
    return () => {
      epoch.current += 1
      if (pending.current) {
        pending.current = false
        pendingCallback.current?.(false)
      }
    }
  }, [])

  const runDelete = async () => {
    if (pending.current || disabled) return
    pending.current = true
    const request = epoch.current
    const current = () => request === epoch.current
    const restoreSectionFocus =
      !open && section.current?.contains(document.activeElement)
    setIsPending(true)
    setFailure(undefined)
    pendingCallback.current?.(true)
    try {
      if (!deleted.current) {
        const result = await onDelete()
        if (!current()) return
        if (result === false) {
          setFailure('delete')
          return
        }
        deleted.current = true
        setAcknowledged(true)
        onAcknowledged?.()
      }
      await onDeleted()
      if (current()) {
        setOpen(false)
        if (restoreSectionFocus) section.current?.focus()
      }
    } catch {
      if (current()) setFailure(deleted.current ? 'continue' : 'delete')
    } finally {
      if (current()) {
        pending.current = false
        setIsPending(false)
        pendingCallback.current?.(false)
      }
    }
  }
  const error =
    failure === 'delete'
      ? t('horseDeletion.moveFailed')
      : failure === 'continue'
        ? t('horseDeletion.continueFailed', { name: horse.name })
        : undefined
  const busyLabel = acknowledged
    ? t('horseDeletion.continuing')
    : t('horseDeletion.moving')
  const actionLabel = acknowledged
    ? t('horseDeletion.retry')
    : t('horseDeletion.move')
  const errorAlert = error && (
    <Alert variant="destructive">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  )

  return (
    <DashboardSectionCard
      ref={section}
      role="group"
      aria-label={t('horseDeletion.region', { name: horse.name })}
      tabIndex={-1}
      title={t('horseDeletion.delete')}
      description={t('horseDeletion.help')}
      contentGap="compact"
    >
      {!open &&
        acknowledged &&
        (failure === 'continue' ? (
          errorAlert
        ) : (
          <p role="status">
            {t('horseDeletion.acknowledged', { name: horse.name })}
          </p>
        ))}
      <DashboardActions align="end">
        {acknowledged && !open ? (
          (failure === 'continue' || isPending) && (
            <Button
              disabled={disabled || isPending}
              aria-busy={isPending || undefined}
              onClick={() => void runDelete()}
            >
              {isPending && <Spinner aria-hidden={true} />}
              {isPending ? busyLabel : t('horseDeletion.retry')}
            </Button>
          )
        ) : (
          <AlertDialog
            open={open}
            onOpenChange={(nextOpen) => {
              if (pending.current) return
              setOpen(nextOpen)
              if (nextOpen && !deleted.current) setFailure(undefined)
            }}
          >
            <AlertDialogTrigger
              disabled={disabled || isPending || acknowledged}
              render={
                <Button
                  ref={trigger}
                  type="button"
                  action="delete"
                  variant="destructive"
                />
              }
            >
              {t('horseDeletion.moveAction')}
            </AlertDialogTrigger>
            <AlertDialogContent
              finalFocus={() =>
                deleted.current ? section.current : trigger.current
              }
            >
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {acknowledged
                    ? t('horseDeletion.movedTitle', { name: horse.name })
                    : t('horseDeletion.moveQuestion', { name: horse.name })}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {acknowledged
                    ? t('horseDeletion.confirmed')
                    : t('horseDeletion.warning')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              {errorAlert}
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>
                  {acknowledged
                    ? t('horseDeletion.close')
                    : t('horseDeletion.cancel')}
                </AlertDialogCancel>
                <AlertDialogAction
                  type="button"
                  action={acknowledged ? undefined : 'delete'}
                  variant={acknowledged ? 'default' : 'destructive'}
                  disabled={disabled || isPending}
                  aria-busy={isPending || undefined}
                  onClick={() => void runDelete()}
                >
                  {isPending && <Spinner aria-hidden={true} />}
                  {isPending ? busyLabel : actionLabel}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </DashboardActions>
    </DashboardSectionCard>
  )
}
