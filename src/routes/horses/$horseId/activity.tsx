import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/horses/$horseId/activity')({
  component: () => null,
})
