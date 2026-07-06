import type { ReactNode } from 'react'

import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import { cn } from '#/lib/utils'
import { PlusIcon } from '@phosphor-icons/react'

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="hidden justify-end sm:flex">
        <DialogTrigger render={<Button type="button" variant="secondary" />}>
          {triggerLabel}
        </DialogTrigger>
      </div>

      <DialogTrigger
        render={
          <Button
            type="button"
            variant="secondary"
            size="icon-lg"
            className="fixed right-5 bottom-5 z-40 size-14 rounded-full shadow-control sm:hidden"
            aria-label={triggerLabel}
          />
        }
      >
        <PlusIcon className="size-6" weight="bold" aria-hidden={true} />
        <span className="sr-only">{triggerLabel}</span>
      </DialogTrigger>

      <DialogContent
        className={cn(
          'max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-panel p-6 sm:max-w-2xl md:p-7',
          className,
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold leading-tight tracking-tight">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-base leading-6">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {children}
      </DialogContent>
    </Dialog>
  )
}
