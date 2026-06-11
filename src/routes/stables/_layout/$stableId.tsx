import { StableFeatureNavigation } from '#/components/stables/StableFeatureNavigation'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/stables/_layout/$stableId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId } = Route.useParams()

  return (
    <div className="grid gap-6">
      <StableFeatureNavigation stableId={stableId} />
      <Outlet />
    </div>
  )
}
