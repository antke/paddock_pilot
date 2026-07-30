import type { ComponentProps, ReactNode } from 'react'

import {
  ActionGroup,
  actionGroupInlineClassName,
  actionGroupInlineNoWrapClassName,
} from '#/components/ui/action-group'
import { cn } from '#/lib/utils'

type DashboardActionsAlign = 'start' | 'center' | 'end'
type DashboardActionsWidth = 'auto' | 'full'

type DashboardActionsProps = Omit<
  ComponentProps<'div'>,
  'align' | 'children'
> & {
  align?: DashboardActionsAlign
  wrap?: boolean
  width?: DashboardActionsWidth
  children: ReactNode
}

export const dashboardActionsClassName = actionGroupInlineClassName
export const dashboardActionsNoWrapClassName = actionGroupInlineNoWrapClassName

export function DashboardActions({
  align = 'end',
  wrap = true,
  width = 'auto',
  children,
  className,
  ...props
}: DashboardActionsProps) {
  return (
    <ActionGroup
      {...props}
      align={align}
      className={cn(width === 'full' && 'w-full', className)}
      wrap={wrap}
    >
      {children}
    </ActionGroup>
  )
}
