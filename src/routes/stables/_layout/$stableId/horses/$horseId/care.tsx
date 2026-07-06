import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/horses/$horseId/care',
)({
  component: () => null,
})
