import { MotionList } from '#/components/motion/MotionList'
import { useLocale, useT } from '#/i18n/LocaleProvider'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import {
  DashboardItemCardContent,
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
} from '#/components/ui/alert-dialog'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { RecordRemoveMenuItem } from '#/components/list-layout/RecordRemoveAction'
import { ActionFeedback } from '#/components/ui/action-feedback'
import { useTransientConfirmation } from '#/lib/useTransientConfirmation'
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
  CopyIcon,
  DotsThreeIcon,
  PaperPlaneTiltIcon,
} from '@phosphor-icons/react'
import { StableInvitationStatusBadge } from './StableInvitationBadges'

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

  return (
    <MotionList
      items={invitations}
      getKey={(invitation) => invitation._id}
      empty={
        <DashboardEmptyState chrome="soft" spacing="flush">
          {t('invitationFlow.empty')}
        </DashboardEmptyState>
      }
      renderItem={(invitation) => (
        <StableInvitationRow invitation={invitation} {...actions} />
      )}
    />
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
  // The "…" button or the lone Revoke button; only one renders.
  const revokeOpener = useRef<HTMLButtonElement>(null)
  const copyConfirmation = useTransientConfirmation(invitation.token)
  const resendConfirmation = useTransientConfirmation(invitation._id)
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
      if (action === 'copy') {
        copyConfirmation.clear()
        await onCopy(invitation.token)
        copyConfirmation.confirm()
      } else if (action === 'resend') {
        resendConfirmation.clear()
        if (await onResend(invitation)) resendConfirmation.confirm()
        else setFailedAction('resend')
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
  const canRevoke = invitation.status === 'pending'
  const isPending = pendingAction !== undefined

  return (
    <DashboardItemRecordCard
      key={invitation._id}
      chrome="flat"
      density="compact"
      interactive={false}
      // One status pill in the action row at button height; delivery reads as plain meta, in the danger colour only when it failed.
      actions={
        <>
          <StableInvitationStatusBadge status={status} size="action" />
          {(canResend || canCopy) && (
            <>
              {canResend && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  // The wider queued/resending states reserve space on the outer side, so the group stays tight.
                  className="[&_[data-slot=action-feedback]>span]:justify-start sm:[&_[data-slot=action-feedback]>span]:justify-end"
                  disabled={isPending}
                  aria-busy={isPending || undefined}
                  onClick={() => void runAction('resend')}
                >
                  <ActionFeedback
                    icon={<PaperPlaneTiltIcon aria-hidden="true" />}
                    pending={pendingAction === 'resend'}
                    confirmed={resendConfirmation.confirmed}
                    confirmedLabel={t('invitationFlow.queuedShort')}
                    failed={failedAction === 'resend'}
                    failedLabel={t('invitationFlow.resend')}
                    label={t('invitationFlow.resend')}
                    pendingLabel={t('invitationFlow.resending')}
                  />
                </Button>
              )}
              {canCopy && canRevoke ? (
                // Copy link and Revoke share one "…" menu, so Resend stays the row's only visible action.
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        ref={revokeOpener}
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={isPending && pendingAction !== 'copy'}
                        aria-label={t('reminders.actionsNamed', {
                          name: invitation.email,
                        })}
                      />
                    }
                  >
                    <DotsThreeIcon weight="bold" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      // Stays open so the item can show Copying… and Copied.
                      closeOnClick={false}
                      disabled={isPending}
                      aria-busy={pendingAction === 'copy' || undefined}
                      onClick={() => void runAction('copy')}
                    >
                      <ActionFeedback
                        icon={<CopyIcon aria-hidden="true" />}
                        label={t('invitationFlow.copy')}
                        pendingLabel={t('common.copying')}
                        confirmedLabel={t('common.copied')}
                        pending={pendingAction === 'copy'}
                        confirmed={copyConfirmation.confirmed}
                        failed={failedAction === 'copy'}
                        failedLabel={t('invitationFlow.copy')}
                      />
                    </DropdownMenuItem>
                    <RecordRemoveMenuItem
                      label={t('invitationFlow.revoke')}
                      disabled={isPending}
                      onOpen={() => setIsRevokeOpen(true)}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                canRevoke && (
                  // Without Copy link a lone Revoke stays visible: a menu never holds Remove alone.
                  <Button
                    ref={revokeOpener}
                    type="button"
                    action="delete"
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    aria-busy={isPending || undefined}
                    onClick={() => setIsRevokeOpen(true)}
                  >
                    {t('invitationFlow.revoke')}
                  </Button>
                )
              )}
              {canRevoke && (
                <AlertDialog
                  open={isRevokeOpen}
                  onOpenChange={(open) => {
                    if (!pendingRef.current) setIsRevokeOpen(open)
                  }}
                >
                  <AlertDialogContent finalFocus={revokeOpener}>
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
                        <ActionFeedback
                          pending={pendingAction === 'revoke'}
                          label={t('invitationFlow.revokeInvitation')}
                          pendingLabel={t('invitationFlow.revoking')}
                        />
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </>
          )}
        </>
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
        // An array, not a fragment, so DashboardMetaList can separate the items.
        meta={[
          <span key="expires">
            {t(
              status === 'expired'
                ? 'invitationFlow.expiredOn'
                : 'invitationFlow.expiresOn',
              { date: formatMediumTimestampDate(invitation.expiresAt, locale) },
            )}
          </span>,
          invitation.lastSentAt && (
            <span key="sent">
              {t('invitationFlow.lastSent', {
                date: formatMediumTimestampDate(invitation.lastSentAt, locale),
              })}
            </span>
          ),
          // "Last sent" already says a sent email went out.
          invitation.deliveryStatus &&
            !(
              invitation.deliveryStatus === 'sent' && invitation.lastSentAt
            ) && (
              <span
                key="delivery"
                className={
                  invitation.deliveryStatus === 'failed'
                    ? 'font-semibold text-destructive'
                    : undefined
                }
              >
                {t(`invitationFlow.delivery.${invitation.deliveryStatus}`)}
              </span>
            ),
        ]}
        metaSeparator="dot"
      />
    </DashboardItemRecordCard>
  )
}
