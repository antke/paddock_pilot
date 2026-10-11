import { createFileRoute } from '@tanstack/react-router'
import { parseHorseCareSearch } from '#/components/horses/horseCareSearch'

export const Route = createFileRoute('/horses/$horseId/care')({
  validateSearch: parseHorseCareSearch,
  component: () => null,
})
