import { Badge } from '#/components/ui/badge'
import type { ComponentProps, ReactNode } from 'react'

type DashboardBadgeProps = Omit<
  ComponentProps<typeof Badge>,
  'children' | 'size'
>

export function DashboardCountBadge({
  count,
  active = count > 0,
  variant,
  ...props
}: DashboardBadgeProps & {
  count: number
  active?: boolean
}) {
  return (
    <Badge
      variant={variant ?? (active ? 'default' : 'secondary')}
      size="count"
      {...props}
    >
      {count}
    </Badge>
  )
}

export function DashboardFeatureBadge({
  children = 'Premium',
  variant = 'secondary',
  ...props
}: DashboardBadgeProps & {
  children?: ReactNode
}) {
  return (
    <Badge variant={variant} {...props}>
      {children}
    </Badge>
  )
}

export function DashboardValueBadge({
  children,
  variant = 'outline',
  ...props
}: DashboardBadgeProps & {
  children: ReactNode
}) {
  return (
    <Badge variant={variant} {...props}>
      {children}
    </Badge>
  )
}

export function DashboardPercentBadge({
  value,
  warningBelow = 75,
  variant,
  ...props
}: DashboardBadgeProps & {
  value: number
  warningBelow?: number
}) {
  return (
    <Badge
      variant={variant ?? (value < warningBelow ? 'destructive' : 'secondary')}
      {...props}
    >
      {value}%
    </Badge>
  )
}
