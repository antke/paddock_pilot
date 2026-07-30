import type { ComponentProps } from 'react'

import type { Badge } from '#/components/ui/badge'

export type AppBadgeVariant = NonNullable<
  ComponentProps<typeof Badge>['variant']
>

export const attentionLevelBadgeVariant = {
  low: 'success',
  medium: 'warning',
  high: 'destructive',
} satisfies Record<'low' | 'medium' | 'high', AppBadgeVariant>
