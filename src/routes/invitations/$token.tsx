import { useT } from '#/i18n/LocaleProvider'
import { convexQuery } from '@convex-dev/react-query'
import {
  useQueryErrorResetBoundary,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import {
  SignInButton,
  SignOutButton,
  SignUpButton,
} from '@clerk/tanstack-react-start'
import { api } from 'convex/_generated/api'
import { useMutation } from 'convex/react'
import { getInvitationPath } from 'shared/stableInvitations/invitationState'
import { AuthStateSwitch } from '#/components/layout/AuthStateSwitch'
import { RoutePending } from '#/components/layout/RoutePending'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { Button } from '#/components/ui/button'
import {
  InvitationPageView,
  InvitationQueryErrorView,
} from '#/components/invitations/InvitationPageView'
import type { InvitationPreview } from '#/components/invitations/InvitationPageView'

export const Route = createFileRoute('/invitations/$token')({
  component: InvitationPage,
  pendingComponent: InvitationPending,
  errorComponent: InvitationError,
})

function InvitationPending() {
  const t = useT()
  return (
    <DashboardPage width="compact">
      <DashboardPageHeader title={t('invitationFlow.context')} />
      <RoutePending />
    </DashboardPage>
  )
}

function InvitationError({ reset }: ErrorComponentProps) {
  const queryBoundary = useQueryErrorResetBoundary()
  return (
    <InvitationQueryErrorView
      onRetry={() => {
        queryBoundary.reset()
        reset()
      }}
    />
  )
}

function InvitationPage() {
  const t = useT()
  const { token } = Route.useParams()
  const { data: preview } = useSuspenseQuery(
    convexQuery(api.stableInvitations.preview, { token }),
  )
  const returnTo = getInvitationPath(token)
  return (
    <AuthStateSwitch
      signedOut={
        <InvitationPageView
          key={token}
          preview={preview}
          signedIn={false}
          authActions={{
            signIn: (
              <SignInButton forceRedirectUrl={returnTo}>
                <Button type="button">{t('navigation.signIn')}</Button>
              </SignInButton>
            ),
            signUp: (
              <SignUpButton forceRedirectUrl={returnTo}>
                <Button type="button" variant="outline">
                  {t('navigation.createAccount')}
                </Button>
              </SignUpButton>
            ),
          }}
        />
      }
      signedIn={
        <ConnectedInvitation key={token} token={token} preview={preview} />
      }
    />
  )
}

function ConnectedInvitation({
  token,
  preview,
}: {
  token: string
  preview: InvitationPreview
}) {
  const t = useT()
  const accept = useMutation(api.stableInvitations.accept)
  const decline = useMutation(api.stableInvitations.decline)
  return (
    <InvitationPageView
      preview={preview}
      signedIn
      onAccept={async () => {
        await accept({ token })
      }}
      onDecline={async () => {
        await decline({ token })
      }}
      authActions={{
        switchAccount: (
          <SignOutButton redirectUrl={getInvitationPath(token)}>
            <Button type="button" variant="outline">
              {t('invitationFlow.switchAccount')}
            </Button>
          </SignOutButton>
        ),
        refreshAccount: (
          <Button type="button" onClick={() => window.location.reload()}>
            {t('invitationFlow.refreshAccount')}
          </Button>
        ),
      }}
    />
  )
}
