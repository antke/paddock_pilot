import { useLocale, useT } from '#/i18n/LocaleProvider'
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
  const t = useT()

  const revokeInvitation = useMutation(api.stableInvitations.revoke)
  const resendInvitation = useMutation(api.stableInvitations.resend)
  const copyInvitation = async (token: string) => {
    try {
      await copyTextToClipboard(getInvitationUrl(window.location.origin, token))
      showAppSuccessToast({ title: t('invitationFlow.linkCopied') })
    } catch {
      showAppErrorToast({ title: t('invitationFlow.copyFailed') })
      throw new Error(t('invitationFlow.copyFailed'))
    }
  }

  const onResend = async (invitation: Doc<'stableInvitations'>) => {
    try {
      const result = await resendInvitation({ id: invitation._id })
      showAppSuccessToast({
        title: t('invitationFlow.queuedAgain'),
        description: (
          <p>{t('invitationFlow.freshLink', { email: invitation.email })}</p>
        ),
        action: {
          label: t('invitationFlow.copy'),
          onClick: () => {
            // Copy reports its own toast; this action has no row error surface.
            void copyInvitation(result.token).catch(() => {})
          },
        },
      })
      return true
    } catch {
      showAppErrorToast({ title: t('invitationFlow.resendFailed') })
      return false
    }
  }

  const onRevoke = async (invitation: Doc<'stableInvitations'>) => {
    try {
      await revokeInvitation({ id: invitation._id })
      showAppSuccessToast({
        title: t('invitationFlow.revoked'),
        description: (
          <p>{t('invitationFlow.revokedFor', { email: invitation.email })}</p>
        ),
      })
      return true
    } catch {
      showAppErrorToast({ title: t('invitationFlow.revokeFailedHelp') })
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
  const t = useT()

  if (invitations.length === 0) {
    return (
      <DashboardEmptyState chrome="soft" spacing="flush">
        {t('invitationFlow.empty')}
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
  const t = useT()

  const [pendingAction, setPendingAction] = useState<
    'resend' | 'revoke' | 'copy'
  >()
  const pendingRef = useRef(false)
  const [isRevokeOpen, setIsRevokeOpen] = useState(false)
  const [failedAction, setFailedAction] = useState<
    'resend' | 'revoke' | 'copy'
  >()
  const actionError = failedAction
    ? t(
        failedAction === 'copy'
          ? 'invitationFlow.copyFailedHelp'
          : failedAction === 'resend'
            ? 'invitationFlow.resendFailedHelp'
            : 'invitationFlow.revokeFailedHelp',
      )
    : undefined
  const { locale } = useLocale()
  const runAction = async (action: 'resend' | 'revoke' | 'copy') => {
    if (pendingRef.current) return
    pendingRef.current = true
    setPendingAction(action)
    setFailedAction(undefined)
    try {
      if (action === 'copy') await onCopy(invitation.token)
      else if (action === 'resend') {
        if (!(await onResend(invitation))) setFailedAction('resend')
      } else if (await onRevoke(invitation)) setIsRevokeOpen(false)
      else setFailedAction('revoke')
    } catch {
      setFailedAction(action)
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
                {t('invitationFlow.copy')}
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
                {pendingAction === 'resend'
                  ? t('invitationFlow.resending')
                  : t('invitationFlow.resend')}
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
                  {t('invitationFlow.revoke')}
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t('invitationFlow.revokeConfirm', {
                        email: invitation.email,
                      })}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('invitationFlow.revokeHelp')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  {actionError && (
                    <Alert variant="destructive">
                      <AlertDescription>{actionError}</AlertDescription>
                    </Alert>
                  )}
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>
                      {t('invitationFlow.keep')}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      disabled={isPending}
                      aria-busy={isPending || undefined}
                      onClick={() => void runAction('revoke')}
                    >
                      {pendingAction === 'revoke'
                        ? t('invitationFlow.revoking')
                        : t('invitationFlow.revokeInvitation')}
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
                <AlertTitle>{t('invitationFlow.emailNotSent')}</AlertTitle>
                <AlertDescription>
                  {t('invitationFlow.deliveryError')}
                </AlertDescription>
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
              {t(
                status === 'expired'
                  ? 'invitationFlow.expiredOn'
                  : 'invitationFlow.expiresOn',
                {
                  date: formatMediumTimestampDate(invitation.expiresAt, locale),
                },
              )}
            </span>
            {invitation.lastSentAt && (
              <span>
                {t('invitationFlow.lastSent', {
                  date: formatMediumTimestampDate(
                    invitation.lastSentAt,
                    locale,
                  ),
                })}
              </span>
            )}
          </>
        }
      />
    </DashboardItemRecordCard>
  )
}
