import { useLocale, useT } from '#/i18n/LocaleProvider'
import { useId, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { FunctionReturnType } from 'convex/server'
import type { api } from 'convex/_generated/api'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { DashboardActions } from '#/components/dashboard/DashboardActions'
import {
  DetailDisplayField,
  DetailGrid,
} from '#/components/dashboard/DetailBlocks'
import { StableInvitationContextBadge } from '#/components/stables/StableInvitationBadges'
import { Button, ButtonLink } from '#/components/ui/button'
import { formatMediumTimestampDate } from '#/lib/dateDisplay'

export type InvitationPreview = FunctionReturnType<
  typeof api.stableInvitations.preview
>
export type FoundInvitationPreview = Extract<
  InvitationPreview,
  { state: 'found' }
>
type Decision = 'accept' | 'decline'
type AuthActions = {
  signIn?: ReactNode
  signUp?: ReactNode
  switchAccount?: ReactNode
  refreshAccount?: ReactNode
}
type Props = {
  preview: InvitationPreview
  signedIn: boolean
  onAccept?: () => Promise<void>
  onDecline?: () => Promise<void>
  authActions?: AuthActions
  sample?: boolean
}

export function InvitationQueryErrorView({ onRetry }: { onRetry: () => void }) {
  const t = useT()

  return (
    <DashboardPage width="compact">
      <DashboardPageHeader title={t('invitationFlow.unavailable')} />
      <InvitationNotice
        title={t('invitationFlow.loadFailed')}
        description={t('invitationFlow.loadFailedHelp')}
      >
        <Button type="button" onClick={onRetry}>
          {t('invitationFlow.retry')}
        </Button>
      </InvitationNotice>
    </DashboardPage>
  )
}

/** Query-free view; remount with a new key when the invitation token changes. */
export function InvitationPageView({
  preview,
  signedIn,
  onAccept,
  onDecline,
  authActions = {},
  sample = false,
}: Props) {
  const t = useT()

  const [pending, setPending] = useState<Decision>()
  const [failed, setFailed] = useState<Decision>()
  const [acknowledged, setAcknowledged] = useState<Decision>()
  const guard = useRef(false)
  const region = useRef<HTMLDivElement>(null)
  const focused = useRef<HTMLElement | null>(null)
  const errorId = useId()
  const latestPreview = useRef(preview)
  latestPreview.current = preview
  useLayoutEffect(() => {
    if (
      focused.current &&
      !focused.current.isConnected &&
      document.activeElement === document.body
    ) {
      region.current?.focus()
      focused.current = null
    }
  })
  const decide = async (decision: Decision) => {
    if (guard.current || acknowledged) return
    const callback = decision === 'accept' ? onAccept : onDecline
    if (!callback) return
    guard.current = true
    setPending(decision)
    setFailed(undefined)
    try {
      await callback()
      setAcknowledged(decision)
    } catch {
      // An authoritative query may already have removed the pending action.
      const current = latestPreview.current
      if (
        current.state === 'found' &&
        (current.status === 'pending' ||
          current.status === 'accepted_pending_subscription')
      )
        setFailed(decision)
    } finally {
      guard.current = false
      setPending(undefined)
    }
  }
  if (preview.state === 'not_found')
    return (
      <DashboardPage width="compact">
        <div
          ref={region}
          role="region"
          aria-label={t('invitationFlow.response')}
          tabIndex={-1}
          className="outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <DashboardPageHeader title={t('invitationFlow.notFound')} />
          <p>{t('invitationFlow.notFoundHelp')}</p>
          <DashboardActions>
            <ButtonLink to="/">{t('invitationFlow.returnHome')}</ButtonLink>
          </DashboardActions>
        </div>
      </DashboardPage>
    )

  const effective =
    acknowledged &&
    (preview.status === 'pending' ||
      preview.status === 'accepted_pending_subscription')
      ? {
          ...preview,
          status:
            acknowledged === 'accept'
              ? ('accepted' as const)
              : ('declined' as const),
          viewer: preview.viewer
            ? {
                ...preview.viewer,
                isAcceptedByViewer: acknowledged === 'accept',
                isDeclinedByViewer: acknowledged === 'decline',
              }
            : null,
        }
      : preview
  const actionButton = (decision: Decision, label: string) => (
    <Button
      type="button"
      variant={decision === 'decline' ? 'outline' : 'default'}
      disabled={pending !== undefined}
      aria-describedby={failed ? errorId : undefined}
      onClick={() => void decide(decision)}
    >
      {pending === decision
        ? decision === 'accept'
          ? t('invitationFlow.accepting')
          : t('invitationFlow.declining')
        : label}
    </Button>
  )
  let content: ReactNode
  if (
    !signedIn &&
    (effective.status === 'pending' ||
      effective.status === 'accepted' ||
      effective.status === 'accepted_pending_subscription')
  ) {
    const pendingInvitation = effective.status === 'pending'
    content = (
      <InvitationNotice
        title={
          pendingInvitation
            ? t('invitationFlow.signInInvited')
            : t('invitationFlow.signInContinue')
        }
        description={
          pendingInvitation
            ? t('invitationFlow.useEmail', { email: effective.emailHint })
            : t('invitationFlow.alreadyLinkedHelp')
        }
      >
        {authActions.signIn}
        {pendingInvitation && authActions.signUp}
      </InvitationNotice>
    )
  } else if (signedIn && !effective.viewer) {
    content = (
      <InvitationNotice
        title={t('invitationFlow.preparing')}
        description={t('invitationFlow.preparingHelp')}
      />
    )
  } else if (effective.status === 'pending') {
    if (!effective.viewer?.emailMatches)
      content = effective.viewer?.hasEmail ? (
        <InvitationNotice
          title={t('invitationFlow.wrongEmail')}
          description={t('invitationFlow.wrongEmailHelp', {
            email: effective.emailHint,
          })}
        >
          {authActions.switchAccount}
        </InvitationNotice>
      ) : (
        <InvitationNotice
          title={t('invitationFlow.emailUnavailable')}
          description={t('invitationFlow.emailUnavailableHelp')}
        >
          {authActions.refreshAccount}
        </InvitationNotice>
      )
    else
      content = (
        <InvitationNotice
          title={t('invitationFlow.ready')}
          description={t('invitationFlow.readyHelp')}
        >
          {onAccept &&
            actionButton(
              'accept',
              failed === 'accept'
                ? t('invitationFlow.retryAccept')
                : t('invitationFlow.accept'),
            )}
          {onDecline &&
            actionButton(
              'decline',
              failed === 'decline'
                ? t('invitationFlow.retryDecline')
                : t('invitationFlow.decline'),
            )}
        </InvitationNotice>
      )
  } else if (effective.status === 'declined') {
    content = (
      <InvitationNotice
        title={t('invitationFlow.declinedTitle')}
        description={
          sample
            ? t('invitationFlow.declinedSample')
            : t('invitationFlow.declinedHelp')
        }
      >
        {effective.viewer?.isDeclinedByViewer && (
          <>
            <ButtonLink to="/">{t('invitationFlow.continue')}</ButtonLink>
            <ButtonLink to="/stables/create" variant="outline">
              {t('invitationFlow.createOwn')}
            </ButtonLink>
          </>
        )}
      </InvitationNotice>
    )
  } else if (effective.status === 'expired') {
    content = (
      <InvitationNotice
        title={t('invitationFlow.expiredTitle')}
        description={t('invitationFlow.expiredHelp')}
      />
    )
  } else if (effective.status === 'revoked') {
    content = (
      <InvitationNotice
        title={t('invitationFlow.revokedTitle')}
        description={t('invitationFlow.revokedHelp')}
      />
    )
  } else if (!effective.viewer?.isAcceptedByViewer) {
    content = (
      <InvitationNotice
        title={
          effective.status === 'accepted'
            ? t('invitationFlow.alreadyUsed')
            : t('invitationFlow.alreadyAccepted')
        }
        description={t('invitationFlow.anotherAccount')}
      >
        {authActions.switchAccount}
      </InvitationNotice>
    )
  } else if (effective.status === 'accepted_pending_subscription') {
    content = (
      <InvitationNotice
        title={t('invitationFlow.finishActivation')}
        description={t('invitationFlow.finishActivationHelp')}
      >
        {onAccept &&
          actionButton(
            'accept',
            failed === 'accept'
              ? t('invitationFlow.retryActivate')
              : t('invitationFlow.activate'),
          )}
      </InvitationNotice>
    )
  } else {
    content = (
      <InvitationNotice
        title={
          acknowledged === 'accept'
            ? t('invitationFlow.welcome', { name: effective.stableName })
            : t('invitationFlow.alreadyMember')
        }
        description={
          sample
            ? t('invitationFlow.activeSample')
            : t('invitationFlow.activeHelp', { name: effective.stableName })
        }
      >
        <ButtonLink to="/onboarding" search={{ stableId: effective.stableId }}>
          {t('invitationFlow.continueStable', { name: effective.stableName })}
        </ButtonLink>
        <ButtonLink to="/stables/create" variant="outline">
          {t('invitationFlow.createOwn')}
        </ButtonLink>
      </InvitationNotice>
    )
  }
  return (
    <DashboardPage width="compact">
      <InvitationSummary preview={preview} />
      <div
        ref={region}
        role="region"
        aria-label={t('invitationFlow.response')}
        tabIndex={-1}
        className="outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onFocusCapture={(event) => {
          focused.current = event.target
        }}
      >
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {acknowledged
            ? sample
              ? t(
                  acknowledged === 'accept'
                    ? 'invitationFlow.sampleAccepted'
                    : 'invitationFlow.sampleDeclined',
                )
              : acknowledged === 'accept'
                ? t('invitationFlow.activeAnnouncement')
                : t('invitationFlow.declinedAnnouncement')
            : ''}
        </div>
        {failed &&
          (effective.status === 'pending' ||
            effective.status === 'accepted_pending_subscription') && (
            <p id={errorId} role="alert" className="text-sm text-destructive">
              {t(
                failed === 'accept'
                  ? 'invitationFlow.acceptFailed'
                  : 'invitationFlow.declineFailed',
              )}
            </p>
          )}
        {content}
      </div>
    </DashboardPage>
  )
}

function InvitationNotice({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <DashboardSectionCard
      title={title}
      description={description}
      descriptionSize="sm"
      contentGap="compact"
    >
      {children && (
        <DashboardActions align="start">{children}</DashboardActions>
      )}
    </DashboardSectionCard>
  )
}

function InvitationSummary({ preview }: { preview: FoundInvitationPreview }) {
  const { locale } = useLocale()
  const t = useT()

  const details = [
    {
      label: t('invitationFlow.location'),
      value: preview.stableLocation || t('invitationFlow.notSpecified'),
    },
    {
      label: t('invitationFlow.invitedBy'),
      value: preview.inviterName || t('invitationFlow.administrator'),
    },
    { label: t('invitationFlow.sentTo'), value: preview.emailHint },
    {
      label:
        preview.status === 'expired'
          ? t('invitationFlow.expired')
          : t('invitationFlow.expires'),
      value: formatMediumTimestampDate(preview.expiresAt, locale),
    },
  ]
  return (
    <DashboardSectionCard
      as="h1"
      title={preview.stableName}
      description={t('invitationFlow.summary')}
      badges={<StableInvitationContextBadge />}
      contentGap="comfortable"
    >
      <DetailGrid columns={2} gap="compact">
        {details.map(({ label, value }) => (
          <DetailDisplayField
            key={label}
            label={label}
            value={value}
            valueWeight="normal"
          />
        ))}
      </DetailGrid>
    </DashboardSectionCard>
  )
}
