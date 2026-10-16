import { useT } from '#/i18n/LocaleProvider'
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
import { ActionFeedback } from '#/components/ui/action-feedback'
import { useRef, useState } from 'react'
import type { RefObject } from 'react'
import { Alert, AlertDescription } from '#/components/ui/alert'

type RecordRemoveActionProps = {
  confirmLabel?: string
  description: string
  disabled?: boolean
  onConfirm: () => Promise<void>
  title: string
  triggerLabel?: string
  triggerAriaLabel?: string
  cancelLabel?: string
  removalFocusTarget?: () => HTMLElement | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  externalTrigger?: RefObject<HTMLButtonElement | null>
}

export function RecordRemoveAction({
  confirmLabel,
  description,
  disabled = false,
  onConfirm,
  title,
  triggerLabel,
  triggerAriaLabel,
  cancelLabel,
  removalFocusTarget,
  open: controlledOpen,
  onOpenChange,
  externalTrigger,
}: RecordRemoveActionProps) {
  const t = useT()

  const [localOpen, setLocalOpen] = useState(false)
  const open = controlledOpen ?? localOpen
  const setOpen = (value: boolean) => {
    if (!value) setFailed(false)
    setLocalOpen(value)
    onOpenChange?.(value)
  }
  const [isRemoving, setIsRemoving] = useState(false)
  const [failed, setFailed] = useState(false)
  const pending = useRef(false)
  const removed = useRef(false)
  const trigger = useRef<HTMLButtonElement>(null)

  const confirmRemoval = async () => {
    if (pending.current || disabled) return
    pending.current = true
    setFailed(false)
    try {
      setIsRemoving(true)
      await onConfirm()
      removed.current = true
      setOpen(false)
    } catch {
      setFailed(true)
    } finally {
      pending.current = false
      setIsRemoving(false)
    }
  }

  const actionDisabled = disabled || isRemoving

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!pending.current) {
          setOpen(nextOpen)
          if (nextOpen) {
            setFailed(false)
            removed.current = false
          }
        }
      }}
    >
      {!externalTrigger && (
        <AlertDialogTrigger
          disabled={actionDisabled}
          aria-label={triggerAriaLabel}
          render={
            <Button
              ref={trigger}
              type="button"
              action="delete"
              variant="destructive"
              size="sm"
            />
          }
        >
          {triggerLabel ?? t('careRecords.remove')}
        </AlertDialogTrigger>
      )}
      <AlertDialogContent
        finalFocus={() =>
          removed.current
            ? (removalFocusTarget?.() ?? trigger.current)
            : trigger.current?.isConnected
              ? trigger.current
              : (externalTrigger?.current ?? removalFocusTarget?.())
        }
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {failed && (
          <Alert variant="destructive">
            <AlertDescription>{t('careRecords.removeFailed')}</AlertDescription>
          </Alert>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={actionDisabled}>
            {cancelLabel ?? t('careRecords.keepRecord')}
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            action="delete"
            variant="destructive"
            disabled={actionDisabled}
            aria-busy={isRemoving || undefined}
            onClick={() => void confirmRemoval()}
          >
            <ActionFeedback
              pending={isRemoving}
              pendingLabel={t('careRecords.removing')}
              label={confirmLabel ?? t('careRecords.removeRecord')}
            />
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
