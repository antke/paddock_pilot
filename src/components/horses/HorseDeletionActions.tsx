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
            title: 'Horse moved to deleted horses',
            description: `${horse.name} can be restored from stable settings for 14 days.`,
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
      ? 'Moving this horse was not confirmed. Please try again or cancel.'
      : failure === 'continue'
        ? `${horse.name} was moved to deleted horses and can be restored from stable settings for 14 days. Could not continue to the next page. Retry continuing; the horse will not be moved again.`
        : undefined
  const busyLabel = acknowledged ? 'Continuing…' : 'Moving…'
  const actionLabel = acknowledged ? 'Retry continuing' : 'Move horse'
  const errorAlert = error && (
    <Alert variant="destructive">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  )

  return (
    <DashboardSectionCard
      ref={section}
      role="group"
      aria-label={`${horse.name} deletion`}
      tabIndex={-1}
      title="Delete horse"
      description="Use the 14-day deleted horses area for recoverable mistakes. Permanent deletion cannot be undone."
      contentGap="compact"
    >
      {!open &&
        acknowledged &&
        (failure === 'continue' ? (
          errorAlert
        ) : (
          <p role="status">
            {horse.name} was moved to deleted horses. Restoration is available
            in stable settings for 14 days.
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
              {isPending ? busyLabel : 'Retry continuing'}
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
              Move to deleted horses
            </AlertDialogTrigger>
            <AlertDialogContent
              finalFocus={() =>
                deleted.current ? section.current : trigger.current
              }
            >
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {acknowledged
                    ? `${horse.name} moved to deleted horses`
                    : `Move ${horse.name} to deleted horses?`}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {acknowledged
                    ? 'The move is confirmed. All records remain available for restoration from stable settings for 14 days.'
                    : 'The horse disappears from daily views but all records remain available for restoration for 14 days.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              {errorAlert}
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>
                  {acknowledged ? 'Close' : 'Cancel'}
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
