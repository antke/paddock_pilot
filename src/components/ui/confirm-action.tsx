import { useState } from 'react'
import type { ComponentProps } from 'react'
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

/** A button that asks before doing something people cannot undo themselves. */
export function ConfirmActionButton({
  label,
  title,
  description,
  confirmLabel = label,
  cancelLabel,
  failedLabel,
  onConfirm,
  size = 'default',
}: {
  label: string
  title: string
  description: string
  confirmLabel?: string
  cancelLabel: string
  failedLabel: string
  onConfirm: () => Promise<unknown>
  size?: ComponentProps<typeof Button>['size']
}) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const confirm = async () => {
    if (busy) return
    setBusy(true)
    setFailed(false)
    try {
      await onConfirm()
      setOpen(false)
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (busy) return
        setOpen(next)
        if (next) setFailed(false)
      }}
    >
      <AlertDialogTrigger
        render={<Button type="button" variant="outline" size={size} />}
      >
        {label}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {failed && (
          <p role="alert" className="text-sm text-destructive">
            {failedLabel}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={busy}
            aria-busy={busy || undefined}
            onClick={() => void confirm()}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
