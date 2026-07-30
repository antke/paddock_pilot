import { Badge } from '#/components/ui/badge'
import { cn } from '#/lib/utils'
import type { Doc } from 'convex/_generated/dataModel'
import type { ComponentProps } from 'react'
import { stableProviderTypeLabels } from 'shared/stables/stableProviderSchema'
import type { StableProviderType } from 'shared/stables/stableProviderSchema'

type StableBadgeProps = Omit<ComponentProps<typeof Badge>, 'children' | 'size'>

export const stableMemberRoleLabels = {
  owner: 'Owner',
  member: 'Member',
  guest: 'Guest',
} satisfies Record<Doc<'stableMembers'>['role'], string>

const stableMemberRoleVariant = {
  owner: 'default',
  member: 'secondary',
  guest: 'neutral',
} satisfies Record<
  Doc<'stableMembers'>['role'],
  NonNullable<ComponentProps<typeof Badge>['variant']>
>

export function StableMemberRoleBadge({
  role,
  className,
  ...props
}: StableBadgeProps & {
  role: Doc<'stableMembers'>['role']
}) {
  return (
    <Badge
      variant={stableMemberRoleVariant[role]}
      className={cn('min-w-20', className)}
      {...props}
    >
      {stableMemberRoleLabels[role]}
    </Badge>
  )
}

export function StableProviderTypeBadge({
  type,
  ...props
}: StableBadgeProps & {
  type: StableProviderType
}) {
  return (
    <Badge variant="outline" {...props}>
      {stableProviderTypeLabels[type]}
    </Badge>
  )
}

export function StableNameBadge({
  name,
  ...props
}: StableBadgeProps & {
  name: string
}) {
  return (
    <Badge variant="neutral" {...props}>
      {name}
    </Badge>
  )
}
