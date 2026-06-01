import { buttonVariants } from '#/components/ui/button'
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
        type="button"
        aria-label={label}
        className={buttonVariants({
          variant: 'ghost',
          size: 'icon-xs',
          className: 'text-muted-foreground',
        })}
      >
        ?
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  )
}
