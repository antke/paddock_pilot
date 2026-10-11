import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AuthStateSwitch } from '#/components/layout/AuthStateSwitch'
import { SignedOutRoutePrompt } from '#/components/layout/SignedOutRoutePrompt'

export const Route = createFileRoute('/events')({
  component: () => (
    <AuthStateSwitch
      signedIn={<Outlet />}
      signedOut={<SignedOutRoutePrompt title="Paddock Pilot" description="" />}
    />
  ),
})
