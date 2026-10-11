import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/horses/$horseId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { horseId } = Route.useParams()

  return <Navigate replace to="/horses/$horseId/profile" params={{ horseId }} />
}
