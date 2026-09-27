import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/stables/_layout/$stableId/training')({
  component: Outlet,
})
