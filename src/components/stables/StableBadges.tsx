import { Badge } from '#/components/ui/badge'
import { cn } from '#/lib/utils'
import type { Doc } from 'convex/_generated/dataModel'
import type { ComponentProps } from 'react'

type StableBadgeProps = Omit<ComponentProps<typeof Badge>, 'children' | 'size'>

export const stableMemberRoleLabels = {
  owner: 'Owner',
  member: 'Member',
  guest: 'Guest (legacy)',
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
