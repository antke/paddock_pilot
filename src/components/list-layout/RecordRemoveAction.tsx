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
import { Spinner } from '#/components/ui/spinner'
import { useRef, useState } from 'react'
import { Alert, AlertDescription } from '#/components/ui/alert'

type RecordRemoveActionProps = {
  confirmLabel?: string
  description: string
  disabled?: boolean
  onConfirm: () => Promise<void>
  title: string
  triggerLabel?: string
  removalFocusTarget?: () => HTMLElement | null
}

export function RecordRemoveAction({
  confirmLabel,
  description,
  disabled = false,
  onConfirm,
  title,
  triggerLabel,
  removalFocusTarget,
}: RecordRemoveActionProps) {
  const t = useT()

  const [open, setOpen] = useState(false)
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
      <AlertDialogTrigger
        disabled={actionDisabled}
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
      <AlertDialogContent
        finalFocus={() =>
          removed.current
            ? (removalFocusTarget?.() ?? trigger.current)
            : trigger.current?.isConnected
              ? trigger.current
              : removalFocusTarget?.()
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
            {t('careRecords.keepRecord')}
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            action="delete"
            variant="destructive"
            disabled={actionDisabled}
            aria-busy={isRemoving || undefined}
            onClick={() => void confirmRemoval()}
          >
            {isRemoving && <Spinner aria-hidden={true} />}
            {isRemoving
              ? t('careRecords.removing')
              : (confirmLabel ?? t('careRecords.removeRecord'))}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
