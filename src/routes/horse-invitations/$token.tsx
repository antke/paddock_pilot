import { BackLink } from '#/components/ui/back-action'
import { createFileRoute } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import {
  SignInButton,
  SignOutButton,
  SignUpButton,
} from '@clerk/tanstack-react-start'
import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import {
  HorseInvitation,
  horseInvitationPath,
} from '#/components/ownership/HorseInvitation'
import { AuthStateSwitch } from '#/components/layout/AuthStateSwitch'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { Button } from '#/components/ui/button'
import { useOwnershipCopy } from '#/components/ownership/ownershipCopy'
import { useOwnershipRecoveryCopy } from '#/components/ownership/ownershipRecoveryCopy'

export const Route = createFileRoute('/horse-invitations/$token')({
  component: Page,
  errorComponent: HorseInvitationError,
})
export function HorseInvitationSignIn({ token }: { token: string }) {
  const c = useOwnershipCopy()
  const r = useOwnershipRecoveryCopy()
  const returnTo = horseInvitationPath(token)
  return (
    <DashboardSectionCard title={c.invitation} description={r.signInHelp}>
      <div className="flex flex-wrap gap-3">
        <SignInButton forceRedirectUrl={returnTo}>
          <Button>{r.signIn}</Button>
        </SignInButton>
        <SignUpButton forceRedirectUrl={returnTo}>
          <Button variant="outline">{r.signUp}</Button>
        </SignUpButton>
      </div>
    </DashboardSectionCard>
  )
}
function AccountActions({ token }: { token: string }) {
  const r = useOwnershipRecoveryCopy()
  return (
    <>
      <SignOutButton redirectUrl={horseInvitationPath(token)}>
        <Button variant="outline">{r.switchAccount}</Button>
      </SignOutButton>
      <Button variant="ghost" onClick={() => window.location.reload()}>
        {r.refresh}
      </Button>
    </>
  )
}
function HorseInvitationError({ reset }: ErrorComponentProps) {
  const { token } = Route.useParams()
  const r = useOwnershipRecoveryCopy()
  const queryBoundary = useQueryErrorResetBoundary()
  return (
    <DashboardPage width="compact">
      <BackLink to="/horses">{r.backHorses}</BackLink>
      <DashboardSectionCard title={r.loadError} description={r.loadErrorHelp}>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => {
              queryBoundary.reset()
              reset()
            }}
          >
            {r.retry}
          </Button>
          <AccountActions token={token} />
        </div>
      </DashboardSectionCard>
    </DashboardPage>
  )
}
function Page() {
  const { token } = Route.useParams()
  return (
    <DashboardPage width="compact">
      <AuthStateSwitch
        signedIn={
          <HorseInvitation
            token={token}
            accountActions={<AccountActions token={token} />}
          />
        }
        signedOut={<HorseInvitationSignIn token={token} />}
      />
    </DashboardPage>
  )
}
