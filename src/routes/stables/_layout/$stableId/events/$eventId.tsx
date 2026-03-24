import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/events/$eventId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <div>Hello "/stables/_layout/$stableId/events/$eventId"!</div>
      <Outlet />
    </div>
  )
}
