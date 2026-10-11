import { useEffect, useRef } from 'react'
import { useRecordCreateActions } from './RecordCreateActionsContext'
import type { ReactNode } from 'react'

import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import {
  RecordDialogBody,
  RecordDialogContent,
  RecordDialogDesktopTrigger,
  RecordDialogFloatingTrigger,
} from './RecordDialog'

type CreateRecordDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerLabel: string
  title: string
  description?: string
  children: ReactNode
  className?: string
  isPending?: boolean
  actionId?: string
}

export function CreateRecordDialog({
  open,
  onOpenChange,
  triggerLabel,
  title,
  description,
  children,
  className,
  isPending = false,
  actionId,
}: CreateRecordDialogProps) {
  const pageActions = useRecordCreateActions()
  const desktopTrigger = useRef<HTMLButtonElement>(null)
  const floatingTrigger = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (actionId && pageActions?.requestedAction === actionId) {
      onOpenChange(true)
      pageActions.consumeAction()
    }
  }, [actionId, onOpenChange, pageActions])

  return (
    <Dialog
      data-slot="create-record-dialog"
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isPending) onOpenChange(nextOpen)
      }}
    >
      {!pageActions?.hideTriggers && (
        <>
          <RecordDialogDesktopTrigger triggerRef={desktopTrigger}>
            {triggerLabel}
          </RecordDialogDesktopTrigger>
          <RecordDialogFloatingTrigger
            triggerRef={floatingTrigger}
            label={triggerLabel}
          />
        </>
      )}

      <RecordDialogContent
        className={className}
        showCloseButton={!isPending}
        finalFocus={() =>
          // The opener can become hidden when the viewport crosses the mobile breakpoint.
          [
            desktopTrigger.current,
            floatingTrigger.current,
            pageActions?.returnFocus(),
          ].find(
            (trigger) =>
              trigger?.isConnected && trigger.getClientRects().length > 0,
          ) ?? true
        }
      >
        <DialogHeader className="px-6 pt-6 pb-4 md:px-7 md:pt-7">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <RecordDialogBody>{children}</RecordDialogBody>
      </RecordDialogContent>
    </Dialog>
  )
}
