import type { ReactElement, ReactNode } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'

export function CalendarEventTooltip({
  trigger,
  children,
}: {
  trigger: ReactElement
  children: ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={trigger} />
      <TooltipContent
        side="right"
        align="start"
        sideOffset={8}
        className="block max-h-[min(32rem,var(--available-height))] w-72 max-w-full overflow-y-auto overscroll-contain p-4 text-sm font-normal leading-6"
      >
        {children}
      </TooltipContent>
    </Tooltip>
  )
}
