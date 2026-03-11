import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/stables/$stableId/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/stables/$stableId/edit"!</div>
}
