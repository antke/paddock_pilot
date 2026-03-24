import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/horses/$horseId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <div>Hello "/stables/_layout/$stableId/horses/$horseId"!</div>
      <Outlet />
    </div>
  )
}
