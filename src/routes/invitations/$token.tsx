import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { AuthStateSwitch } from '#/components/layout/AuthStateSwitch'
import { RouteStatusAlert } from '#/components/layout/RouteStatusAlert'
import { SignedOutRoutePrompt } from '#/components/layout/SignedOutRoutePrompt'
import { Button, ButtonLink } from '#/components/ui/button'
import {
  showAppErrorToast,
  showAppSuccessToast,
} from '#/components/ui/sonner'
import { SignInButton, SignUpButton } from '@clerk/tanstack-react-start'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import { useMutation } from 'convex/react'
import { useState } from 'react'

export const Route = createFileRoute('/invitations/$token')({
  component: InvitationPage,
})

function InvitationPage() {
  const { token } = Route.useParams()

  return (
    <DashboardPage width="compact" verticalAlign="center">
      <DashboardSectionCard
        title="Stable invitation"
        description="Review and accept your stable invitation."
        descriptionSize="sm"
      >
        <AuthStateSwitch
          signedOut={<SignedOutInvitationActions />}
          signedIn={<AcceptInvitation token={token} />}
        />
      </DashboardSectionCard>
    </DashboardPage>
  )
}

function SignedOutInvitationActions() {
  return (
    <SignedOutRoutePrompt
      title="Sign in to accept this invitation"
      description="Use the invited email address so the stable membership can be matched to your account."
      actions={
        <>
          <SignInButton>
            <Button type="button">Sign in</Button>
          </SignInButton>
          <SignUpButton>
            <Button type="button" variant="outline">
              Sign up
            </Button>
          </SignUpButton>
        </>
      }
    />
  )
}

function AcceptInvitation({ token }: { token: string }) {
  const acceptInvitation = useMutation(api.stableInvitations.accept)
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [needsSubscription, setNeedsSubscription] = useState(false)

  const onAccept = async () => {
    try {
      setIsSubmitting(true)
      const result = await acceptInvitation({ token })

      if (result.status === 'accepted_pending_subscription') {
        setNeedsSubscription(true)
        return
      }

      showAppSuccessToast({
        title: 'Invitation accepted',
        description: <p>You can now access the stable.</p>,
      })
      await navigate({
        to: '/stables/$stableId',
        params: { stableId: result.stableId },
      })
    } catch {
      showAppErrorToast({
        title: 'Could not accept invitation',
        description: <p>Please check the invite link and signed-in email.</p>,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (needsSubscription) {
    return (
      <RouteStatusAlert
        tone="warning"
        title="Subscription needed"
        description="Your invitation was accepted, but a Personal Plus subscription is needed before stable membership activates."
        actions={
          <ButtonLink to="/pricing">Choose plan</ButtonLink>
        }
      />
    )
  }

  return (
    <Button type="button" disabled={isSubmitting} onClick={onAccept}>
      {isSubmitting ? 'Accepting...' : 'Accept invitation'}
    </Button>
  )
}
