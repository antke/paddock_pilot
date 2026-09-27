import type { ComponentProps } from 'react'

import { Field } from '#/components/ui/field'
import { cn } from '#/lib/utils'
import type { DashboardChrome } from './dashboardChrome'
import { dashboardInlinePanelClassName } from './dashboardChrome'

type DashboardInlineFieldPadding = 'default' | 'compact' | 'tight' | 'none'

type DashboardInlineFieldProps = ComponentProps<typeof Field> & {
  chrome?: DashboardChrome
  disabled?: boolean
  interactive?: boolean
  padding?: DashboardInlineFieldPadding
  selected?: boolean
}

const dashboardInlineFieldPaddingClassNames = {
  default: '',
  compact: 'p-4',
  tight: 'p-3',
  none: 'p-0',
} satisfies Record<DashboardInlineFieldPadding, string>

export function DashboardInlineField({
  chrome = 'soft',
  className,
  disabled = false,
  interactive = false,
  padding = 'default',
  selected = false,
  ...props
}: DashboardInlineFieldProps) {
  return (
    <Field
      data-slot="dashboard-inline-field"
      data-disabled={disabled || undefined}
      data-selected={selected || undefined}
      className={dashboardInlinePanelClassName(
        chrome,
        cn(
          dashboardInlineFieldPaddingClassNames[padding],
          interactive &&
            'cursor-pointer transition-colors hover:bg-surface-muted data-[selected=true]:border-selection data-[selected=true]:bg-selection-surface data-[selected=true]:text-selection data-[selected=true]:ring-1 data-[selected=true]:ring-selection data-[disabled=true]:cursor-not-allowed data-[disabled=true]:hover:bg-surface-elevated',
          className,
        ),
      )}
      {...props}
    />
  )
}
