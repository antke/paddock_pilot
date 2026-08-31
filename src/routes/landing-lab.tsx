import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/landing-lab')({
  head: () => ({
    meta: [
      {
        name: 'robots',
        content: 'noindex, nofollow',
      },
    ],
  }),
  component: LandingLabRoute,
})

function LandingLabRoute() {
  return <Outlet />
}
