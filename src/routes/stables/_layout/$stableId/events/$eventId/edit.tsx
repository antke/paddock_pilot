import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/events/$eventId/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/stables/_layout/$stableId/events/$eventId/edit"!</div>
}
