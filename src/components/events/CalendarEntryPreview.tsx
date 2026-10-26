import { Popover } from '@base-ui/react/popover'
import { useId, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'

/** Hover details with a reachable action; the session link still navigates. */
export function CalendarEntryPreview({
  trigger,
  label,
  children,
}: {
  trigger: ReactElement
  label: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        render={trigger}
        nativeButton={false}
        role="link"
        openOnHover
        delay={250}
        closeDelay={150}
        onFocus={() => setOpen(true)}
        aria-describedby={open ? id : undefined}
      />
      <Popover.Portal>
        <Popover.Positioner
          side="right"
          align="start"
          sideOffset={8}
          collisionPadding={12}
          className="z-50 max-w-[calc(100vw-1.5rem)]"
        >
          <Popover.Popup
            id={id}
            aria-label={label}
            initialFocus={false}
            finalFocus={false}
            className="grid max-h-[min(32rem,var(--available-height))] w-80 max-w-full gap-3 overflow-y-auto overscroll-contain rounded-panel border border-border bg-popover p-4 text-sm leading-6 text-popover-foreground"
          >
            {children}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
