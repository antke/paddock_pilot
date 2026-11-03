import { StableRouteLayoutView } from '#/components/layout/StableRouteLayoutView'
import { StableBreadcrumbs } from '#/components/layout/StableBreadcrumbs'
import { StableLocalNavigation } from '#/components/stables/StableLocalNavigation'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/stables/_layout/$stableId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId } = Route.useParams()

  return (
    <StableRouteLayoutView
      breadcrumbs={<StableBreadcrumbs stableId={stableId} />}
    >
      <StableLocalNavigation stableId={stableId} />
      <Outlet />
    </StableRouteLayoutView>
  )
}
