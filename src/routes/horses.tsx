import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AuthStateSwitch } from '#/components/layout/AuthStateSwitch'
import { SignedOutRoutePrompt } from '#/components/layout/SignedOutRoutePrompt'
import { useOwnershipCopy } from '#/components/ownership/ownershipCopy'

export const Route = createFileRoute('/horses')({ component: HorsesLayout })
function HorsesLayout() {
  const c = useOwnershipCopy()
  return (
    <AuthStateSwitch
      signedIn={<Outlet />}
      signedOut={<SignedOutRoutePrompt title={c.title} description={c.intro} />}
    />
  )
}
