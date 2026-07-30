import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import {
  DashboardItemCardContent,
  DashboardItemList,
  DashboardItemRecordCard,
} from '#/components/dashboard/DashboardItemCard'
import { Button } from '#/components/ui/button'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { formatMediumTimestampDate } from '#/lib/dateDisplay'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import {
  StableInvitationRoleBadge,
  StableInvitationStatusBadge,
} from './StableInvitationBadges'

type StableInvitationsListProps = {
  invitations: Array<Doc<'stableInvitations'>>
}

export function StableInvitationsList({
  invitations,
}: StableInvitationsListProps) {
  const revokeInvitation = useMutation(api.stableInvitations.revoke)
  const [revokingId, setRevokingId] = useState<string>()

  const onRevoke = async (invitation: Doc<'stableInvitations'>) => {
    try {
      setRevokingId(invitation._id)
      await revokeInvitation({ id: invitation._id })
      showAppSuccessToast({
        title: 'Invitation revoked',
        description: (
          <p>{invitation.email} can no longer accept this invite.</p>
        ),
      })
    } catch {
      showAppErrorToast()
    } finally {
      setRevokingId(undefined)
    }
  }

  if (invitations.length === 0) {
    return (
      <DashboardEmptyState chrome="soft" spacing="flush">
        No invitations yet.
      </DashboardEmptyState>
    )
  }

  return (
    <DashboardItemList gap="flush">
      {invitations.map((invitation) => (
        <DashboardItemRecordCard
          key={invitation._id}
          chrome="soft"
          density="compact"
          actions={
            invitation.status === 'pending' ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={revokingId === invitation._id}
                onClick={() => onRevoke(invitation)}
              >
                {revokingId === invitation._id ? 'Revoking...' : 'Revoke'}
              </Button>
            ) : undefined
          }
        >
          <DashboardItemCardContent
            title={invitation.email}
            titleSize="sm"
            meta={
              <span>
                Expires {formatMediumTimestampDate(invitation.expiresAt)}
              </span>
            }
            badges={
              <>
                <StableInvitationRoleBadge role={invitation.role} />
                <StableInvitationStatusBadge status={invitation.status} />
              </>
            }
          />
        </DashboardItemRecordCard>
      ))}
    </DashboardItemList>
  )
}
