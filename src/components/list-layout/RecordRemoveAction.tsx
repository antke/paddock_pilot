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
import { useState } from 'react'

type RecordRemoveActionProps = {
  confirmLabel?: string
  description: string
  disabled?: boolean
  onConfirm: () => Promise<void>
  title: string
  triggerLabel?: string
}

export function RecordRemoveAction({
  confirmLabel = 'Remove record',
  description,
  disabled = false,
  onConfirm,
  title,
  triggerLabel = 'Remove',
}: RecordRemoveActionProps) {
  const [open, setOpen] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const confirmRemoval = async () => {
    try {
      setIsRemoving(true)
      await onConfirm()
      setOpen(false)
    } catch {
      // The mutation owner reports the error; keep the dialog open for retry.
    } finally {
      setIsRemoving(false)
    }
  }

  const actionDisabled = disabled || isRemoving

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isRemoving) setOpen(nextOpen)
      }}
    >
      <AlertDialogTrigger
        disabled={actionDisabled}
        render={
          <Button
            type="button"
            action="delete"
            variant="destructive"
            size="sm"
          />
        }
      >
        {triggerLabel}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={actionDisabled}>
            Keep record
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
            {isRemoving ? 'Removing…' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
