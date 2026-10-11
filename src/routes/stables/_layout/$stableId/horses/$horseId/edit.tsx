import { createFileRoute } from '@tanstack/react-router'
import { PersonalHorseForm } from '#/components/ownership/PersonalHorseForm'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/horses/$horseId/edit',
)({ component: Page })
function Page() {
  return <PersonalHorseForm horseId={Route.useParams().horseId} />
}
