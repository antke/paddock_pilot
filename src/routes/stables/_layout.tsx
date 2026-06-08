import { ClerkLoaded, ClerkLoading, Show } from '@clerk/tanstack-react-start'
import { createFileRoute, Navigate, Outlet, useLocation } from '@tanstack/react-router'
import { RoutePending } from '#/components/layout/RoutePending'

export const Route = createFileRoute('/stables/_layout')({
  pendingComponent: RoutePending,
  component: StableLayout,
})

function StableLayout() {
  const location = useLocation()

  return (
    <>
      <ClerkLoading>
        <RoutePending />
      </ClerkLoading>

      <ClerkLoaded>
        <Show when="signed-out">
          <Navigate to="/" search={{ redirect: location.href }} />
        </Show>

        <Show when="signed-in">
          <Outlet />
        </Show>
      </ClerkLoaded>
    </>
  )
}
