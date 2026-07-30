import { Button } from '#/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import type { ReactNode } from 'react'

type FormHelpTooltipProps = {
  label: string
  children: ReactNode
}

export function FormHelpTooltip({ label, children }: FormHelpTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="subtle"
            size="icon-xs"
            aria-label={label}
          />
        }
      >
        ?
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  )
}
