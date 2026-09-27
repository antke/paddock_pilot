import { StableRouteLayoutView } from '#/components/layout/StableRouteLayoutView'
import { StableBreadcrumbs } from '#/components/layout/StableBreadcrumbs'
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
      <Outlet />
    </StableRouteLayoutView>
  )
}
