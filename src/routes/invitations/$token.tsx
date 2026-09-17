import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardLayoutStack } from '#/components/dashboard/DashboardLayoutGrid'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import {
  DetailDisplayField,
  DetailGrid,
} from '#/components/dashboard/DetailBlocks'
import { AuthStateSwitch } from '#/components/layout/AuthStateSwitch'
import { RoutePending } from '#/components/layout/RoutePending'
import { RouteStatusAlert } from '#/components/layout/RouteStatusAlert'
import { StableInvitationContextBadge } from '#/components/stables/StableInvitationBadges'
import { Button, ButtonLink } from '#/components/ui/button'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { formatMediumTimestampDate } from '#/lib/dateDisplay'
import {
  SignInButton,
  SignOutButton,
  SignUpButton,
} from '@clerk/tanstack-react-start'
import { createFileRoute } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import { useMutation, useQuery } from 'convex/react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { getInvitationPath } from 'shared/stableInvitations/invitationState'

export const Route = createFileRoute('/invitations/$token')({
  component: InvitationPage,
})

type InvitationPreview = Exclude<
  ReturnType<typeof useInvitationPreview>,
  undefined
>
type FoundInvitationPreview = Extract<InvitationPreview, { state: 'found' }>

function useInvitationPreview(token: string) {
  return useQuery(api.stableInvitations.preview, { token })
}

function InvitationPage() {
  const { token } = Route.useParams()
  const preview = useInvitationPreview(token)

  if (preview === undefined) return <RoutePending />

  if (preview.state === 'not_found') {
    return (
      <InvitationShell>
        <RouteStatusAlert
          tone="danger"
          title="Invitation not found"
          description="This link is invalid or has been replaced. Ask the stable administrator for a fresh invitation."
          actions={<ButtonLink to="/">Return home</ButtonLink>}
        />
      </InvitationShell>
    )
  }

  return (
    <InvitationShell>
      <InvitationSummary preview={preview} />
      <AuthStateSwitch
        signedOut={<SignedOutInvitation token={token} preview={preview} />}
        signedIn={<SignedInInvitation token={token} preview={preview} />}
      />
    </InvitationShell>
  )
}

function InvitationShell({ children }: { children: ReactNode }) {
  return (
    <DashboardPage width="compact" verticalAlign="center">
      <DashboardLayoutStack gap="compact">{children}</DashboardLayoutStack>
    </DashboardPage>
  )
}

function InvitationSummary({ preview }: { preview: FoundInvitationPreview }) {
  const details = [
    {
      label: 'Location',
      value: preview.stableLocation || 'Not specified',
    },
    {
      label: 'Invited by',
      value: preview.inviterName || 'Stable administrator',
    },
    {
      label: 'Sent to',
      value: preview.emailHint,
    },
    {
      label: preview.status === 'expired' ? 'Expired' : 'Expires',
      value: formatMediumTimestampDate(preview.expiresAt),
    },
  ]

  return (
    <DashboardSectionCard
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
            framed
          />
        ))}
      </DetailGrid>
    </DashboardSectionCard>
  )
}

function SignedOutInvitation({
  token,
  preview,
}: {
  token: string
  preview: FoundInvitationPreview
}) {
  const returnTo = getInvitationPath(token)

  if (
    preview.status === 'expired' ||
    preview.status === 'revoked' ||
    preview.status === 'declined'
  ) {
    return <InvitationStatus preview={preview} />
  }

  if (
    preview.status === 'accepted' ||
    preview.status === 'accepted_pending_subscription'
  ) {
    return (
      <RouteStatusAlert
        title="Sign in to continue"
        description="This invitation is already linked to an account. Sign in with that account to continue to the stable."
        actions={
          <SignInButton forceRedirectUrl={returnTo}>
            <Button type="button">Sign in</Button>
          </SignInButton>
        }
      />
    )
  }

  return (
    <RouteStatusAlert
      title="Sign in with the invited account"
      description={`Use ${preview.emailHint} so Paddock Pilot can connect this invitation to the right person.`}
      actions={
        <>
          <SignInButton forceRedirectUrl={returnTo}>
            <Button type="button">Sign in</Button>
          </SignInButton>
          <SignUpButton forceRedirectUrl={returnTo}>
            <Button type="button" variant="outline">
              Create account
            </Button>
          </SignUpButton>
        </>
      }
    />
  )
}

function SignedInInvitation({
  token,
  preview,
}: {
  token: string
  preview: FoundInvitationPreview
}) {
  const acceptInvitation = useMutation(api.stableInvitations.accept)
  const declineInvitation = useMutation(api.stableInvitations.decline)
  const [pendingAction, setPendingAction] = useState<'accept' | 'decline'>()
  const isSubmitting = pendingAction !== undefined
  const returnTo = getInvitationPath(token)

  const onAccept = async () => {
    try {
      setPendingAction('accept')
      await acceptInvitation({ token })

      showAppSuccessToast({
        title: `Welcome to ${preview.stableName}`,
        description: <p>Your stable membership is active.</p>,
      })
    } catch {
      showAppErrorToast({
        title: 'Could not accept invitation',
        description: <p>Refresh the invitation and try again.</p>,
      })
    } finally {
      setPendingAction(undefined)
    }
  }

  const onDecline = async () => {
    try {
      setPendingAction('decline')
      await declineInvitation({ token })
      showAppSuccessToast({ title: 'Invitation declined' })
    } catch {
      showAppErrorToast({ title: 'Could not decline invitation' })
    } finally {
      setPendingAction(undefined)
    }
  }

  if (!preview.viewer) {
    return (
      <RouteStatusAlert
        tone="muted"
        title="Preparing your account"
        description="Your account is signed in. We are finishing the Paddock Pilot profile needed to review this invitation."
      />
    )
  }

  if (preview.status !== 'pending') {
    return (
      <InvitationStatus
        preview={preview}
        returnTo={returnTo}
        onActivate={onAccept}
        isSubmitting={isSubmitting}
      />
    )
  }

  if (!preview.viewer.emailMatches) {
    if (!preview.viewer.hasEmail) {
      return (
        <RouteStatusAlert
          tone="warning"
          title="Your account email is not available yet"
          description="We couldn’t confirm a verified email for your signed-in account. Verify your email in your account settings, then refresh this page."
          actions={
            <Button type="button" onClick={() => window.location.reload()}>
              Refresh account
            </Button>
          }
        />
      )
    }
    return (
      <RouteStatusAlert
        tone="warning"
        title="This invitation belongs to another email"
        description={`Sign in with ${preview.emailHint} to accept it. Your current account has not been given access.`}
        actions={
          <SignOutButton redirectUrl={returnTo}>
            <Button type="button" variant="outline">
              Switch account
            </Button>
          </SignOutButton>
        }
      />
    )
  }

  return (
    <RouteStatusAlert
      title="Ready to join"
      description="Accept to join this stable and access its shared records, or decline. You can create your own stable after either choice."
      actions={
        <>
          <Button type="button" disabled={isSubmitting} onClick={onAccept}>
            {pendingAction === 'accept' ? 'Accepting...' : 'Accept invitation'}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onDecline}
          >
            {pendingAction === 'decline'
              ? 'Declining...'
              : 'Decline invitation'}
          </Button>
        </>
      }
    />
  )
}

function InvitationStatus({
  preview,
  returnTo,
  onActivate,
  isSubmitting,
}: {
  preview: FoundInvitationPreview
  returnTo?: string
  onActivate?: () => void | Promise<void>
  isSubmitting?: boolean
}) {
  if (preview.status === 'declined') {
    return (
      <RouteStatusAlert
        title="Invitation declined"
        description="This invitation no longer grants access to the stable. You can continue with your account or create a stable of your own."
        actions={
          preview.viewer?.isDeclinedByViewer ? (
            <>
              <ButtonLink to="/">Continue</ButtonLink>
              <ButtonLink to="/stables/create" variant="outline">
                Create my own stable
              </ButtonLink>
            </>
          ) : undefined
        }
      />
    )
  }

  if (preview.status === 'expired') {
    return (
      <RouteStatusAlert
        tone="warning"
        title="This invitation has expired"
        description="Ask the stable administrator to resend it. Resending creates a fresh link and another 14-day acceptance window."
      />
    )
  }

  if (preview.status === 'revoked') {
    return (
      <RouteStatusAlert
        tone="danger"
        title="This invitation was revoked"
        description="It can no longer be used. Contact the stable administrator if you still need access."
      />
    )
  }

  if (preview.status === 'accepted_pending_subscription') {
    if (!preview.viewer?.isAcceptedByViewer) {
      return (
        <RouteStatusAlert
          tone="muted"
          title="This invitation has already been accepted"
          description="It is linked to another account and cannot be used again."
          actions={
            returnTo ? (
              <SignOutButton redirectUrl={returnTo}>
                <Button type="button" variant="outline">
                  Switch account
                </Button>
              </SignOutButton>
            ) : undefined
          }
        />
      )
    }

    return (
      <RouteStatusAlert
        tone="warning"
        title="Finish activating your membership"
        description="Subscriptions are no longer required for stable access. Activate this previously accepted invitation to continue."
        actions={
          onActivate ? (
            <Button type="button" disabled={isSubmitting} onClick={onActivate}>
              {isSubmitting ? 'Activating...' : 'Activate membership'}
            </Button>
          ) : undefined
        }
      />
    )
  }

  if (preview.status === 'accepted') {
    if (!preview.viewer?.isAcceptedByViewer) {
      return (
        <RouteStatusAlert
          tone="muted"
          title="This invitation has already been used"
          description="Each invitation can activate one account only."
          actions={
            returnTo ? (
              <SignOutButton redirectUrl={returnTo}>
                <Button type="button" variant="outline">
                  Switch account
                </Button>
              </SignOutButton>
            ) : undefined
          }
        />
      )
    }

    return (
      <RouteStatusAlert
        title="You are already a member"
        description={`Your access to ${preview.stableName} is active. Continue to this stable, or create one of your own.`}
        actions={
          <>
            <ButtonLink
              to="/onboarding"
              search={{ stableId: preview.stableId }}
            >
              Continue to {preview.stableName}
            </ButtonLink>
            <ButtonLink to="/stables/create" variant="outline">
              Create my own stable
            </ButtonLink>
          </>
        }
      />
    )
  }

  return null
}
