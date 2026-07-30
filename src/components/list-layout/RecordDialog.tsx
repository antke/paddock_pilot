import type { ComponentProps, ReactNode } from 'react'

import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { Button } from '#/components/ui/button'
import { DialogContent, DialogTrigger } from '#/components/ui/dialog'
import { cn } from '#/lib/utils'
import { PlusIcon } from '@phosphor-icons/react'

type RecordDialogDesktopTriggerProps = {
  children: ReactNode
}

type RecordDialogFloatingTriggerProps = {
  label: string
}

export function RecordDialogDesktopTrigger({
  children,
}: RecordDialogDesktopTriggerProps) {
  return (
    <DashboardActions data-slot="record-dialog-desktop-trigger" className="hidden sm:flex">
      <DialogTrigger render={<Button type="button" variant="secondary" />}>
        {children}
      </DialogTrigger>
    </DashboardActions>
  )
}

export function RecordDialogFloatingTrigger({
  label,
}: RecordDialogFloatingTriggerProps) {
  return (
    <DialogTrigger
      data-slot="record-dialog-floating-trigger"
      render={
        <Button
          type="button"
          variant="secondary"
          size="fab"
          className="fixed right-5 bottom-5 z-40 sm:hidden"
          aria-label={label}
        />
      }
    >
      <PlusIcon className="size-6" weight="bold" aria-hidden={true} />
      <span className="sr-only">{label}</span>
    </DialogTrigger>
  )
}

export function RecordDialogContent({
  className,
  ...props
}: ComponentProps<typeof DialogContent>) {
  return (
    <DialogContent
      data-slot="record-dialog-content"
      className={cn(
        'max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-panel p-6 sm:max-w-2xl md:p-7',
        className,
      )}
      {...props}
    />
  )
}
