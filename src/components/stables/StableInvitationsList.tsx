import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Separator } from '#/components/ui/separator'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { stableInvitationRoleLabels } from 'shared/stableInvitations/invitationSchema'

type StableInvitationsListProps = {
  invitations: Array<Doc<'stableInvitations'>>
}

const invitationStatusLabels = {
  pending: 'Pending',
  accepted_pending_subscription: 'Accepted, pending subscription',
  accepted: 'Accepted',
  revoked: 'Revoked',
  expired: 'Expired',
} satisfies Record<Doc<'stableInvitations'>['status'], string>

export function StableInvitationsList({
  invitations,
}: StableInvitationsListProps) {
  const revokeInvitation = useMutation(api.stableInvitations.revoke)
  const [revokingId, setRevokingId] = useState<string>()

  const onRevoke = async (invitation: Doc<'stableInvitations'>) => {
    try {
      setRevokingId(invitation._id)
      await revokeInvitation({ id: invitation._id })
      toast.success('Invitation revoked', {
        description: <p>{invitation.email} can no longer accept this invite.</p>,
        position: 'top-right',
      })
    } catch {
      toast.error('Oops! Something went wrong.', {
        description: <p>Please try again.</p>,
        position: 'top-right',
      })
    } finally {
      setRevokingId(undefined)
    }
  }

  if (invitations.length === 0) {
    return <p className="text-sm text-muted-foreground">No invitations yet.</p>
  }

  return (
    <div className="grid gap-4">
      {invitations.map((invitation, index) => (
        <div key={invitation._id}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="grid gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{invitation.email}</span>
                <Badge variant="secondary">
                  {stableInvitationRoleLabels[invitation.role]}
                </Badge>
                <Badge
                  variant={invitation.status === 'pending' ? 'default' : 'secondary'}
                >
                  {invitationStatusLabels[invitation.status]}
                </Badge>
              </div>
              <span className="text-sm text-muted-foreground">
                Expires {new Date(invitation.expiresAt).toLocaleDateString()}
              </span>
            </div>

            {invitation.status === 'pending' && (
              <Button
                type="button"
                variant="outline"
                disabled={revokingId === invitation._id}
                onClick={() => onRevoke(invitation)}
              >
                {revokingId === invitation._id ? 'Revoking...' : 'Revoke'}
              </Button>
            )}
          </div>
          {index < invitations.length - 1 && <Separator className="mt-4" />}
        </div>
      ))}
    </div>
  )
}
