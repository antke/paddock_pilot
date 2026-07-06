import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/horses/$horseId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId, horseId } = Route.useParams()

  return (
    <Navigate
      to="/stables/$stableId/horses/$horseId/profile"
      params={{ stableId, horseId }}
    />
  )
}
