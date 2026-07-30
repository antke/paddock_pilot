import { Badge } from '#/components/ui/badge'
import type { ComponentProps } from 'react'
import { stableInvitationRoleLabels } from 'shared/stableInvitations/invitationSchema'
import type { StableInvitationRole } from 'shared/stableInvitations/invitationSchema'
import type { Doc } from 'convex/_generated/dataModel'

type StableInvitationBadgeProps = Omit<
  ComponentProps<typeof Badge>,
  'children' | 'size' | 'variant'
>

type StableInvitationStatus = Doc<'stableInvitations'>['status']

export const stableInvitationStatusLabels = {
  pending: 'Pending',
  accepted_pending_subscription: 'Accepted, pending subscription',
  accepted: 'Accepted',
  revoked: 'Revoked',
  expired: 'Expired',
} satisfies Record<StableInvitationStatus, string>

const stableInvitationStatusVariant = {
  pending: 'info',
  accepted_pending_subscription: 'warning',
  accepted: 'success',
  revoked: 'neutral',
  expired: 'neutral',
} satisfies Record<
  StableInvitationStatus,
  NonNullable<ComponentProps<typeof Badge>['variant']>
>

export function StableInvitationRoleBadge({
  role,
  ...props
}: StableInvitationBadgeProps & {
  role: StableInvitationRole
}) {
  return (
    <Badge variant="secondary" {...props}>
      {stableInvitationRoleLabels[role]}
    </Badge>
  )
}

export function StableInvitationStatusBadge({
  status,
  ...props
}: StableInvitationBadgeProps & {
  status: StableInvitationStatus
}) {
  return (
    <Badge variant={stableInvitationStatusVariant[status]} {...props}>
      {stableInvitationStatusLabels[status]}
    </Badge>
  )
}
