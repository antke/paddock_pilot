import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/events/calendar',
)({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/stables/$stableId/events',
      params: { stableId: params.stableId },
      search: {},
      replace: true,
    })
  },
})
