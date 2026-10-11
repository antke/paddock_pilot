import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/horses/$horseId/profile')({
  component: () => null,
})
