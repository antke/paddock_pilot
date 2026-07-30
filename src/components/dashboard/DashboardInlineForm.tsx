import type { ComponentProps } from 'react'

import { InlineForm } from '#/components/forms/FormLayout'
import { cn } from '#/lib/utils'
import type { DashboardChrome } from './dashboardChrome'
import { dashboardInlinePanelClassName } from './dashboardChrome'

type DashboardInlineFormProps = ComponentProps<typeof InlineForm> & {
  chrome?: DashboardChrome
  presentation?: 'panel' | 'plain'
}

export function DashboardInlineForm({
  chrome = 'soft',
  presentation = 'panel',
  className,
  ...props
}: DashboardInlineFormProps) {
  return (
    <InlineForm
      data-slot="dashboard-inline-form"
      className={cn(
        presentation === 'panel' &&
          dashboardInlinePanelClassName(chrome, 'p-5'),
        className,
      )}
      {...props}
    />
  )
}
