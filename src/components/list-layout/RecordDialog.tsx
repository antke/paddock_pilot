import type { ComponentProps, ReactNode } from 'react'

import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { Button } from '#/components/ui/button'
import { DialogContent, DialogTrigger } from '#/components/ui/dialog'
import { cn } from '#/lib/utils'

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
    <DashboardActions
      data-slot="record-dialog-desktop-trigger"
      className="hidden sm:flex"
    >
      <DialogTrigger render={<Button type="button" action="create" />}>
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
          action="create"
          variant="solid"
          size="fab"
          className="fixed right-5 bottom-5 z-40 sm:hidden"
          aria-label={label}
        />
      }
    >
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
        'grid max-h-[calc(100dvh-1rem)] grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-panel p-0 sm:max-h-[calc(100dvh-2rem)] sm:max-w-2xl',
        className,
      )}
      {...props}
    />
  )
}

export function RecordDialogBody({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      data-slot="record-dialog-body"
      className={cn(
        'min-h-0 overflow-y-auto overscroll-contain px-6 pb-6 [scrollbar-gutter:stable] md:px-7 md:pb-7',
        className,
      )}
      {...props}
    />
  )
}
