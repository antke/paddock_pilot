import type { ComponentProps, ElementType, ReactNode } from 'react'

import { cn } from '#/lib/utils'

type DashboardDisplayHeadingScale = 'hero' | 'page' | 'section' | 'panel'

type DashboardDisplayHeadingProps = Omit<ComponentProps<'h1'>, 'children'> & {
  as?: ElementType
  children: ReactNode
  scale?: DashboardDisplayHeadingScale
}

const dashboardDisplayHeadingScaleClassNames = {
  hero: 'text-5xl sm:text-6xl lg:text-7xl',
  page: 'text-4xl sm:text-5xl',
  section: 'text-3xl sm:text-4xl',
  panel: 'text-2xl sm:text-3xl',
} satisfies Record<DashboardDisplayHeadingScale, string>

export function DashboardDisplayHeading({
  as,
  children,
  className,
  scale = 'page',
  ...props
}: DashboardDisplayHeadingProps) {
  const Heading = as ?? 'h1'

  return (
    <Heading
      data-slot="dashboard-display-heading"
      className={cn(
        'min-w-0 text-balance font-display font-bold [overflow-wrap:anywhere] uppercase leading-[0.96] tracking-[-0.015em]',
        dashboardDisplayHeadingScaleClassNames[scale],
        className,
      )}
      {...props}
    >
      {children}
    </Heading>
  )
}

export function DashboardBrandWordmark({
  className,
  ...props
}: ComponentProps<'span'>) {
  return (
    <span
      className={cn('font-serif text-2xl font-bold leading-none', className)}
      {...props}
    />
  )
}
