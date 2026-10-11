import type { ReactNode } from 'react'
import { Dialog, DialogHeader, DialogTitle } from '#/components/ui/dialog'
import { RecordDialogBody, RecordDialogContent } from './RecordDialog'

/** Controlled record editor shared by list surfaces; callers own save/error state. */
export function EditRecordDialog({
  open,
  onOpenChange,
  title,
  children,
  isPending = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
  isPending?: boolean
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isPending) onOpenChange(next)
      }}
    >
      <RecordDialogContent showCloseButton={!isPending}>
        <DialogHeader className="px-6 pt-6 pb-4 md:px-7 md:pt-7">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <RecordDialogBody>{children}</RecordDialogBody>
      </RecordDialogContent>
    </Dialog>
  )
}
