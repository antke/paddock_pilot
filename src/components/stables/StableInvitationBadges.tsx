import { Badge } from '#/components/ui/badge'
import { BuildingsIcon } from '@phosphor-icons/react'
import type { Doc } from 'convex/_generated/dataModel'
import type { ComponentProps } from 'react'
import { stableInvitationRoleLabels } from 'shared/stableInvitations/invitationSchema'

type StableInvitationBadgeProps = Omit<
  ComponentProps<typeof Badge>,
  'children' | 'size' | 'variant'
>

type StableInvitationStatus = Doc<'stableInvitations'>['status']
type StableInvitationDeliveryStatus = NonNullable<
  Doc<'stableInvitations'>['deliveryStatus']
>

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
  role: Doc<'stableInvitations'>['role']
}) {
  return (
    <Badge variant="secondary" {...props}>
      {stableInvitationRoleLabels[role]}
    </Badge>
  )
}

export const stableInvitationDeliveryStatusLabels = {
  queued: 'Email queued',
  sent: 'Email sent',
  failed: 'Delivery failed',
  skipped: 'Not sent in this environment',
} satisfies Record<StableInvitationDeliveryStatus, string>

const stableInvitationDeliveryStatusVariant = {
  queued: 'info',
  sent: 'success',
  failed: 'destructive',
  skipped: 'neutral',
} satisfies Record<
  StableInvitationDeliveryStatus,
  NonNullable<ComponentProps<typeof Badge>['variant']>
>

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

export function StableInvitationDeliveryStatusBadge({
  status,
  ...props
}: StableInvitationBadgeProps & {
  status: StableInvitationDeliveryStatus
}) {
  return (
    <Badge variant={stableInvitationDeliveryStatusVariant[status]} {...props}>
      {stableInvitationDeliveryStatusLabels[status]}
    </Badge>
  )
}

export function StableInvitationContextBadge(
  props: StableInvitationBadgeProps,
) {
  return (
    <Badge variant="secondary" {...props}>
      <BuildingsIcon aria-hidden="true" />
      Stable invitation
    </Badge>
  )
}
