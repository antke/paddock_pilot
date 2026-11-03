import { useEffect, useRef } from 'react'
import { useRecordCreateActions } from './RecordCreateActionsContext'
import {
  useFloatingActionsRegistry,
  useFloatingCreateAction,
} from '#/components/layout/floatingActionsContext'
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
  RecordDialogFloatingTrigger,
  RecordDialogTitleTrigger,
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
  const floatingRegistry = useFloatingActionsRegistry()
  const titleTrigger = useRef<HTMLButtonElement>(null)
  const floatingTrigger = useRef<HTMLButtonElement>(null)
  // A page-level menu or the phone shortcut owns focus return when it opened us.
  const openedFromPage = useRef(false)
  const pageOwnsShortcut = pageActions?.ownsFloatingAction ?? false
  const registered = useFloatingCreateAction(
    pageOwnsShortcut
      ? undefined
      : {
          label: triggerLabel,
          onSelect: () => {
            openedFromPage.current = true
            onOpenChange(true)
          },
        },
  )

  useEffect(() => {
    if (actionId && pageActions?.requestedAction === actionId) {
      openedFromPage.current = true
      onOpenChange(true)
      pageActions.consumeAction()
    }
  }, [actionId, onOpenChange, pageActions])

  return (
    <Dialog
      data-slot="create-record-dialog"
      open={open}
      onOpenChange={(nextOpen) => {
        if (isPending) return
        if (nextOpen) openedFromPage.current = false
        onOpenChange(nextOpen)
      }}
    >
      {/* The title-row trigger is visible on every viewport. */}
      <RecordDialogTitleTrigger triggerRef={titleTrigger}>
        {triggerLabel}
      </RecordDialogTitleTrigger>
      {/* Without the app's shortcut registry (labs, isolated renders) keep a local phone shortcut. */}
      {!registered && !pageOwnsShortcut && (
        <RecordDialogFloatingTrigger
          triggerRef={floatingTrigger}
          label={triggerLabel}
        />
      )}

      <RecordDialogContent
        className={className}
        showCloseButton={!isPending}
        finalFocus={() =>
          // The opener can become hidden when the viewport crosses the mobile breakpoint.
          (openedFromPage.current
            ? [
                pageActions?.returnFocus(),
                floatingRegistry?.returnFocus(),
                titleTrigger.current,
                floatingTrigger.current,
              ]
            : [
                titleTrigger.current,
                floatingTrigger.current,
                pageActions?.returnFocus(),
              ]
          ).find(
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
