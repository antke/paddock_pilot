import {
  createFileRoute,
  Outlet,
} from '@tanstack/react-router'
import { AuthStateSwitch } from '#/components/layout/AuthStateSwitch'
import { RoutePending } from '#/components/layout/RoutePending'
import { SignedOutRoutePrompt } from '#/components/layout/SignedOutRoutePrompt'

export const Route = createFileRoute('/stables/_layout')({
  pendingComponent: RoutePending,
  component: StableLayout,
})

function StableLayout() {
  return (
    <AuthStateSwitch
      signedOut={
        <SignedOutRoutePrompt
          title="Sign in to view this stable"
          description="Stable records, horses, care reminders, events, documents, and settings are available after signing in."
        />
      }
      signedIn={<Outlet />}
    />
  )
}
