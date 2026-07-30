import type { ComponentProps, ReactNode } from 'react'

import { cn } from '#/lib/utils'

type ListFilterLayoutGap = 'compact' | 'default' | 'loose'

type ListFilterLayoutProps = ComponentProps<'div'> & {
  actions?: ReactNode
  controls?: ReactNode
  gap?: ListFilterLayoutGap
}

const listFilterLayoutGapClassNames = {
  compact: 'gap-3',
  default: 'gap-4',
  loose: 'gap-5',
} satisfies Record<ListFilterLayoutGap, string>

export function ListFilterLayout({
  actions,
  children,
  className,
  controls,
  gap = 'default',
  ...props
}: ListFilterLayoutProps) {
  return (
    <div
      className={cn('grid', listFilterLayoutGapClassNames[gap], className)}
      {...props}
    >
      {controls}
      {actions}
      {children}
    </div>
  )
}
