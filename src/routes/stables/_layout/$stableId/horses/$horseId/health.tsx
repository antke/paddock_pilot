import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/horses/$horseId/health',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId, horseId } = Route.useParams()

  return (
    <Navigate
      to="/stables/$stableId/horses/$horseId/nutrition"
      params={{ stableId, horseId }}
    />
  )
}
