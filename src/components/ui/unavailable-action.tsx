import { Popover } from '@base-ui/react/popover'
import { useId } from 'react'
import type { ComponentProps } from 'react'
import { Button } from './button'
import { cn } from '#/lib/utils.ts'

/**
 * An action that can't be used here: it keeps its place, greyed out, and says
 * why and what to do instead on hover, or on press/tap (phones have no hover).
 */
export function UnavailableAction({
  reason,
  className,
  children,
  ...props
}: { reason: string } & Omit<
  ComponentProps<typeof Button>,
  'onClick' | 'disabled' | 'type'
>) {
  const reasonId = useId()
  return (
    <Popover.Root>
      <Popover.Trigger
        openOnHover
        delay={0}
        closeDelay={100}
        aria-disabled="true"
        aria-describedby={reasonId}
        render={
          <Button
            type="button"
            {...props}
            // Readable against the row (at least 3:1) yet clearly not live.
            className={cn('cursor-default text-muted-foreground', className)}
          />
        }
      >
        {children}
      </Popover.Trigger>
      {/* Outside the button so the reason describes it without joining its name. */}
      <span id={reasonId} className="sr-only">
        {reason}
      </span>
      <Popover.Portal>
        <Popover.Positioner
          side="top"
          sideOffset={4}
          collisionPadding={8}
          className="isolate z-50 max-w-[min(var(--available-width),calc(100vw-1rem))]"
        >
          <Popover.Popup
            initialFocus={false}
            className="max-w-xs rounded-control border border-border bg-foreground px-3 py-1.5 text-xs leading-5 font-medium text-background shadow-control"
          >
            {reason}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
