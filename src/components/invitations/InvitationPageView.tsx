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
  return (
    <DashboardPage width="compact">
      <DashboardPageHeader title="Invitation unavailable" />
      <InvitationNotice
        title="We couldn’t load this invitation"
        description="Check your connection and try again. Your invitation has not been changed."
      >
        <Button type="button" onClick={onRetry}>
          Try again
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
          aria-label="Invitation response"
          tabIndex={-1}
          className="outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <DashboardPageHeader title="Invitation not found" />
          <p>
            This link is invalid or has been replaced. Ask the stable
            administrator for a fresh invitation.
          </p>
          <DashboardActions>
            <ButtonLink to="/">Return home</ButtonLink>
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
          ? 'Accepting…'
          : 'Declining…'
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
            ? 'Sign in with the invited account'
            : 'Sign in to continue'
        }
        description={
          pendingInvitation
            ? `Use ${effective.emailHint} so Paddock Pilot can connect this invitation to the right person.`
            : 'This invitation is already linked to an account. Sign in with that account to continue to the stable.'
        }
      >
        {authActions.signIn}
        {pendingInvitation && authActions.signUp}
      </InvitationNotice>
    )
  } else if (signedIn && !effective.viewer) {
    content = (
      <InvitationNotice
        title="Preparing your account"
        description="Your account is signed in. We are finishing the Paddock Pilot profile needed to review this invitation."
      />
    )
  } else if (effective.status === 'pending') {
    if (!effective.viewer?.emailMatches)
      content = effective.viewer?.hasEmail ? (
        <InvitationNotice
          title="This invitation belongs to another email"
          description={`Sign in with ${effective.emailHint} to accept it. Your current account has not been given access.`}
        >
          {authActions.switchAccount}
        </InvitationNotice>
      ) : (
        <InvitationNotice
          title="Your account email is not available yet"
          description="We couldn’t confirm a verified email for your signed-in account. Verify your email in your account settings, then refresh this page."
        >
          {authActions.refreshAccount}
        </InvitationNotice>
      )
    else
      content = (
        <InvitationNotice
          title="Ready to join"
          description="Accept to join this stable and access its shared records, or decline. You can create your own stable after either choice."
        >
          {onAccept &&
            actionButton(
              'accept',
              failed === 'accept' ? 'Try accepting again' : 'Accept invitation',
            )}
          {onDecline &&
            actionButton(
              'decline',
              failed === 'decline'
                ? 'Try declining again'
                : 'Decline invitation',
            )}
        </InvitationNotice>
      )
  } else if (effective.status === 'declined') {
    content = (
      <InvitationNotice
        title="Invitation declined"
        description={
          sample
            ? 'This sample invitation is declined. No real invitation or membership was changed.'
            : 'This invitation no longer grants access to the stable. You can continue with your account or create a stable of your own.'
        }
      >
        {effective.viewer?.isDeclinedByViewer && (
          <>
            <ButtonLink to="/">Continue</ButtonLink>
            <ButtonLink to="/stables/create" variant="outline">
              Create my own stable
            </ButtonLink>
          </>
        )}
      </InvitationNotice>
    )
  } else if (effective.status === 'expired') {
    content = (
      <InvitationNotice
        title="This invitation has expired"
        description="Ask the stable administrator to resend it. Resending creates a fresh link and another 14-day acceptance window."
      />
    )
  } else if (effective.status === 'revoked') {
    content = (
      <InvitationNotice
        title="This invitation was revoked"
        description="It can no longer be used. Contact the stable administrator if you still need access."
      />
    )
  } else if (!effective.viewer?.isAcceptedByViewer) {
    content = (
      <InvitationNotice
        title={
          effective.status === 'accepted'
            ? 'This invitation has already been used'
            : 'This invitation has already been accepted'
        }
        description="It is linked to another account and cannot be used again."
      >
        {authActions.switchAccount}
      </InvitationNotice>
    )
  } else if (effective.status === 'accepted_pending_subscription') {
    content = (
      <InvitationNotice
        title="Finish activating your membership"
        description="Subscriptions are no longer required for stable access. Activate this previously accepted invitation to continue."
      >
        {onAccept &&
          actionButton(
            'accept',
            failed === 'accept'
              ? 'Try activating again'
              : 'Activate membership',
          )}
      </InvitationNotice>
    )
  } else {
    content = (
      <InvitationNotice
        title={
          acknowledged === 'accept'
            ? `Welcome to ${effective.stableName}`
            : 'You are already a member'
        }
        description={
          sample
            ? 'This sample shows active membership. No real stable access was granted.'
            : `Your access to ${effective.stableName} is active. Continue to this stable, or create one of your own.`
        }
      >
        <ButtonLink to="/onboarding" search={{ stableId: effective.stableId }}>
          Continue to {effective.stableName}
        </ButtonLink>
        <ButtonLink to="/stables/create" variant="outline">
          Create my own stable
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
        aria-label="Invitation response"
        tabIndex={-1}
        className="outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onFocusCapture={(event) => {
          focused.current = event.target
        }}
      >
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {acknowledged
            ? sample
              ? `Sample invitation ${acknowledged === 'accept' ? 'accepted' : 'declined'}. No real membership changed.`
              : acknowledged === 'accept'
                ? 'Your stable membership is active.'
                : 'Invitation declined.'
            : ''}
        </div>
        {failed &&
          (effective.status === 'pending' ||
            effective.status === 'accepted_pending_subscription') && (
            <p id={errorId} role="alert" className="text-sm text-destructive">
              Could not {failed} this invitation. Your choice was not confirmed.
              Try again below.
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
  const details = [
    { label: 'Location', value: preview.stableLocation || 'Not specified' },
    {
      label: 'Invited by',
      value: preview.inviterName || 'Stable administrator',
    },
    { label: 'Sent to', value: preview.emailHint },
    {
      label: preview.status === 'expired' ? 'Expired' : 'Expires',
      value: formatMediumTimestampDate(preview.expiresAt),
    },
  ]
  return (
    <DashboardSectionCard
      as="h1"
      title={preview.stableName}
      description="You have been invited to join this stable as a member."
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
