import { PreviewCard } from '@base-ui/react/preview-card'
import { useId, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'

/** Keeps calendar details readable without replacing the chip's link or action. */
export function CalendarItemPreview({
  trigger,
  children,
}: {
  trigger: ReactElement
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <PreviewCard.Root open={open} onOpenChange={setOpen}>
      <PreviewCard.Trigger
        render={trigger}
        delay={250}
        closeDelay={150}
        aria-describedby={open ? id : undefined}
      />
      <PreviewCard.Portal>
        <PreviewCard.Positioner
          side="right"
          align="start"
          sideOffset={8}
          collisionPadding={12}
          className="z-50 max-w-[min(var(--available-width),calc(100vw-1.5rem))]"
        >
          <PreviewCard.Popup
            id={id}
            role="tooltip"
            data-slot="calendar-item-preview"
            className="app-popup-motion origin-(--transform-origin) w-96 max-w-full max-h-[min(var(--available-height),28rem)] overflow-y-auto overscroll-contain rounded-panel border border-border bg-popover p-4 text-sm text-popover-foreground wrap-anywhere"
          >
            {children}
          </PreviewCard.Popup>
        </PreviewCard.Positioner>
      </PreviewCard.Portal>
    </PreviewCard.Root>
  )
}
