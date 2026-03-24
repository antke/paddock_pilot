import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/stables/_layout/$stableId/horses')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <Outlet />
    </>
  )
}
