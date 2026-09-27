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
import { useRef, useState } from 'react'
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
  const copyInvitation = async (token: string) => {
    try {
      await copyTextToClipboard(getInvitationUrl(window.location.origin, token))
      showAppSuccessToast({ title: 'Invitation link copied' })
    } catch {
      showAppErrorToast({ title: 'Could not copy invitation link' })
      throw new Error('Could not copy invitation link')
    }
  }

  const onResend = async (invitation: Doc<'stableInvitations'>) => {
    try {
      const result = await resendInvitation({ id: invitation._id })
      showAppSuccessToast({
        title: 'Invitation queued again',
        description: <p>A fresh link was created for {invitation.email}.</p>,
        action: {
          label: 'Copy link',
          onClick: () => {
            // Copy reports its own toast; this action has no row error surface.
            void copyInvitation(result.token).catch(() => {})
          },
        },
      })
      return true
    } catch {
      showAppErrorToast({ title: 'Could not resend invitation' })
      return false
    }
  }

  const onRevoke = async (invitation: Doc<'stableInvitations'>) => {
    try {
      await revokeInvitation({ id: invitation._id })
      showAppSuccessToast({
        title: 'Invitation revoked',
        description: (
          <p>{invitation.email} can no longer accept this invite.</p>
        ),
      })
      return true
    } catch {
      showAppErrorToast()
      return false
    }
  }

  return (
    <StableInvitationsListView
      invitations={invitations}
      onResend={onResend}
      onRevoke={onRevoke}
      onCopy={copyInvitation}
    />
  )
}

type InvitationActions = {
  onResend: (invitation: Doc<'stableInvitations'>) => Promise<boolean>
  onRevoke: (invitation: Doc<'stableInvitations'>) => Promise<boolean>
  onCopy: (token: string) => Promise<void>
}

export function StableInvitationsListView({
  invitations,
  ...actions
}: StableInvitationsListProps & InvitationActions) {
  if (invitations.length === 0) {
    return (
      <DashboardEmptyState chrome="soft" spacing="flush">
        No invitations yet.
      </DashboardEmptyState>
    )
  }

  return (
    <DashboardItemList gap="compact">
      {invitations.map((invitation) => (
        <StableInvitationRow
          key={invitation._id}
          invitation={invitation}
          {...actions}
        />
      ))}
    </DashboardItemList>
  )
}

function StableInvitationRow({
  invitation,
  onResend,
  onRevoke,
  onCopy,
}: InvitationActions & { invitation: Doc<'stableInvitations'> }) {
  const [pendingAction, setPendingAction] = useState<
    'resend' | 'revoke' | 'copy'
  >()
  const pendingRef = useRef(false)
  const [isRevokeOpen, setIsRevokeOpen] = useState(false)
  const [actionError, setActionError] = useState<string>()
  const runAction = async (action: 'resend' | 'revoke' | 'copy') => {
    if (pendingRef.current) return
    pendingRef.current = true
    setPendingAction(action)
    setActionError(undefined)
    try {
      if (action === 'copy') await onCopy(invitation.token)
      else if (action === 'resend') {
        if (!(await onResend(invitation)))
          setActionError('Could not resend this invitation. Please try again.')
      } else if (await onRevoke(invitation)) setIsRevokeOpen(false)
      else setActionError('Could not revoke this invitation. Please try again.')
    } catch {
      setActionError(
        action === 'copy'
          ? 'Could not copy this link. Please try again.'
          : `Could not ${action} this invitation. Please try again.`,
      )
    } finally {
      pendingRef.current = false
      setPendingAction(undefined)
    }
  }
  const status = getEffectiveInvitationStatus({
    status: invitation.status,
    expiresAt: invitation.expiresAt,
  })
  const canResend = status === 'pending' || status === 'expired'
  const canCopy = status === 'pending'
  const isPending = pendingAction !== undefined

  return (
    <DashboardItemRecordCard
      key={invitation._id}
      chrome="flat"
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
                onClick={() => void runAction('copy')}
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
                onClick={() => void runAction('resend')}
              >
                {pendingAction === 'resend' ? 'Resending...' : 'Resend'}
              </Button>
            )}
            {invitation.status === 'pending' && (
              <AlertDialog
                open={isRevokeOpen}
                onOpenChange={(open) => {
                  if (!pendingRef.current) setIsRevokeOpen(open)
                }}
              >
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
                      This link will stop working immediately. You can create
                      another invitation later if they still need access.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  {actionError && (
                    <Alert variant="destructive">
                      <AlertDescription>{actionError}</AlertDescription>
                    </Alert>
                  )}
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>
                      Keep invitation
                    </AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      disabled={isPending}
                      aria-busy={isPending || undefined}
                      onClick={() => void runAction('revoke')}
                    >
                      {pendingAction === 'revoke'
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
        invitation.deliveryError || (actionError && !isRevokeOpen) ? (
          <DashboardItemRecordFooter>
            {actionError && !isRevokeOpen && (
              <Alert variant="destructive">
                <AlertDescription>{actionError}</AlertDescription>
              </Alert>
            )}
            {invitation.deliveryError && (
              <Alert variant="destructive">
                <AlertTitle>Email not sent</AlertTitle>
                <AlertDescription>{invitation.deliveryError}</AlertDescription>
              </Alert>
            )}
          </DashboardItemRecordFooter>
        ) : undefined
      }
    >
      <DashboardItemCardContent
        title={invitation.email}
        titleSize="sm"
        titleClassName="line-clamp-none wrap-anywhere"
        meta={
          <>
            <span>
              {status === 'expired' ? 'Expired' : 'Expires'}{' '}
              {formatMediumTimestampDate(invitation.expiresAt)}
            </span>
            {invitation.lastSentAt && (
              <span>
                Last sent {formatMediumTimestampDate(invitation.lastSentAt)}
              </span>
            )}
          </>
        }
      />
    </DashboardItemRecordCard>
  )
}
