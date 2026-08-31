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
}

export function CreateRecordDialog({
  open,
  onOpenChange,
  triggerLabel,
  title,
  description,
  children,
  className,
}: CreateRecordDialogProps) {
  return (
    <Dialog
      data-slot="create-record-dialog"
      open={open}
      onOpenChange={onOpenChange}
    >
      <RecordDialogDesktopTrigger>{triggerLabel}</RecordDialogDesktopTrigger>
      <RecordDialogFloatingTrigger label={triggerLabel} />

      <RecordDialogContent className={className}>
        <DialogHeader className="px-6 pt-6 pb-4 md:px-7 md:pt-7">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <RecordDialogBody>{children}</RecordDialogBody>
      </RecordDialogContent>
    </Dialog>
  )
}
