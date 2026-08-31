import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import {
  DashboardItemCardContent,
  DashboardItemList,
  DashboardItemRecordCard,
  DashboardItemRecordFooter,
} from '#/components/dashboard/DashboardItemCard'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import { Button } from '#/components/ui/button'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { copyTextToClipboard } from '#/lib/clipboard'
import { formatMediumTimestampDate } from '#/lib/dateDisplay'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import {
  getEffectiveInvitationStatus,
  getInvitationUrl,
} from 'shared/stableInvitations/invitationState'
import {
  StableInvitationDeliveryStatusBadge,
  StableInvitationStatusBadge,
} from './StableInvitationBadges'

type StableInvitationsListProps = {
  invitations: Array<Doc<'stableInvitations'>>
}

export function StableInvitationsList({
  invitations,
}: StableInvitationsListProps) {
  const revokeInvitation = useMutation(api.stableInvitations.revoke)
  const resendInvitation = useMutation(api.stableInvitations.resend)
  const [pendingAction, setPendingAction] = useState<{
    id: string
    type: 'resend' | 'revoke'
  }>()

  const copyInvitation = async (token: string) => {
    try {
      await copyTextToClipboard(getInvitationUrl(window.location.origin, token))
      showAppSuccessToast({ title: 'Invitation link copied' })
    } catch {
      showAppErrorToast({ title: 'Could not copy invitation link' })
    }
  }

  const onResend = async (invitation: Doc<'stableInvitations'>) => {
    try {
      setPendingAction({ id: invitation._id, type: 'resend' })
      const result = await resendInvitation({ id: invitation._id })
      showAppSuccessToast({
        title: 'Invitation queued again',
        description: <p>A fresh link was created for {invitation.email}.</p>,
        action: {
          label: 'Copy link',
          onClick: () => copyInvitation(result.token),
        },
      })
    } catch {
      showAppErrorToast({ title: 'Could not resend invitation' })
    } finally {
      setPendingAction(undefined)
    }
  }

  const onRevoke = async (invitation: Doc<'stableInvitations'>) => {
    try {
      setPendingAction({ id: invitation._id, type: 'revoke' })
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
      setPendingAction(undefined)
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
    <DashboardItemList gap="compact">
      {invitations.map((invitation) => {
        const status = getEffectiveInvitationStatus({
          status: invitation.status,
          expiresAt: invitation.expiresAt,
        })
        const canResend = status === 'pending' || status === 'expired'
        const canCopy = status === 'pending'
        const isPending = pendingAction?.id === invitation._id

        return (
          <DashboardItemRecordCard
            key={invitation._id}
            chrome="cards"
            density="compact"
            interactive={false}
            actionBadges={
              <>
                <StableInvitationStatusBadge status={status} />
                {invitation.deliveryStatus && (
                  <StableInvitationDeliveryStatusBadge
                    status={invitation.deliveryStatus}
                  />
                )}
              </>
            }
            actions={
              canResend || canCopy ? (
                <>
                  {canCopy && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isPending}
                      aria-busy={isPending || undefined}
                      onClick={() => copyInvitation(invitation.token)}
                    >
                      Copy link
                    </Button>
                  )}
                  {canResend && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isPending}
                      aria-busy={isPending || undefined}
                      onClick={() => onResend(invitation)}
                    >
                      {pendingAction?.type === 'resend' && isPending
                        ? 'Resending...'
                        : 'Resend'}
                    </Button>
                  )}
                  {invitation.status === 'pending' && (
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isPending}
                            aria-busy={isPending || undefined}
                          />
                        }
                      >
                        Revoke
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Revoke invitation for {invitation.email}?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This link will stop working immediately. You can
                            create another invitation later if they still need
                            access.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isPending}>
                            Keep invitation
                          </AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            disabled={isPending}
                            aria-busy={isPending || undefined}
                            onClick={() => onRevoke(invitation)}
                          >
                            {pendingAction?.type === 'revoke' && isPending
                              ? 'Revoking...'
                              : 'Revoke invitation'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </>
              ) : undefined
            }
            footer={
              invitation.deliveryError ? (
                <DashboardItemRecordFooter>
                  <Alert variant="destructive">
                    <AlertTitle>Email not sent</AlertTitle>
                    <AlertDescription>
                      {invitation.deliveryError}
                    </AlertDescription>
                  </Alert>
                </DashboardItemRecordFooter>
              ) : undefined
            }
          >
            <DashboardItemCardContent
              title={invitation.email}
              titleSize="sm"
              meta={
                <>
                  <span>
                    {status === 'expired' ? 'Expired' : 'Expires'}{' '}
                    {formatMediumTimestampDate(invitation.expiresAt)}
                  </span>
                  {invitation.lastSentAt && (
                    <span>
                      Last sent{' '}
                      {formatMediumTimestampDate(invitation.lastSentAt)}
                    </span>
                  )}
                </>
              }
            />
          </DashboardItemRecordCard>
        )
      })}
    </DashboardItemList>
  )
}
