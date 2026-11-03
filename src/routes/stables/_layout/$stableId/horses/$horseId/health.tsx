import { createFileRoute, redirect } from '@tanstack/react-router'

// Redirect before render; see the personal horse index route.
export const Route = createFileRoute(
  '/stables/_layout/$stableId/horses/$horseId/health',
)({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/stables/$stableId/horses/$horseId/care',
      params: { stableId: params.stableId, horseId: params.horseId },
      replace: true,
    })
  },
})
