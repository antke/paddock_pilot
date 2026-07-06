import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/page-lab')({
  component: Outlet,
})
