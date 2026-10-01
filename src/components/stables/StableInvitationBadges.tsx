import { useT } from '#/i18n/LocaleProvider'
import { Badge } from '#/components/ui/badge'
import { BuildingsIcon } from '@phosphor-icons/react'
import type { Doc } from 'convex/_generated/dataModel'
import type { ComponentProps } from 'react'

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
  accepted_pending_subscription: 'Accepted, ready to activate',
  accepted: 'Accepted',
  declined: 'Declined',
  revoked: 'Revoked',
  expired: 'Expired',
} satisfies Record<StableInvitationStatus, string>

const stableInvitationStatusVariant = {
  pending: 'info',
  accepted_pending_subscription: 'warning',
  accepted: 'success',
  declined: 'neutral',
  revoked: 'neutral',
  expired: 'neutral',
} satisfies Record<
  StableInvitationStatus,
  NonNullable<ComponentProps<typeof Badge>['variant']>
>

export function StableInvitationRoleBadge({
  role: _role,
  ...props
}: StableInvitationBadgeProps & {
  role: Doc<'stableInvitations'>['role']
}) {
  const t = useT()
  return (
    <Badge variant="secondary" {...props}>
      {t('invitationFlow.member')}
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
  const t = useT()
  return (
    <Badge variant={stableInvitationStatusVariant[status]} {...props}>
      {t(`invitationFlow.status.${status}`)}
    </Badge>
  )
}

export function StableInvitationDeliveryStatusBadge({
  status,
  ...props
}: StableInvitationBadgeProps & {
  status: StableInvitationDeliveryStatus
}) {
  const t = useT()
  return (
    <Badge variant={stableInvitationDeliveryStatusVariant[status]} {...props}>
      {t(`invitationFlow.delivery.${status}`)}
    </Badge>
  )
}

export function StableInvitationContextBadge(
  props: StableInvitationBadgeProps,
) {
  const t = useT()
  return (
    <Badge variant="secondary" {...props}>
      <BuildingsIcon aria-hidden="true" />
      {t('invitationFlow.context')}
    </Badge>
  )
}
