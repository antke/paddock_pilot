import { createFileRoute } from '@tanstack/react-router'
import { PersonalHorseForm } from '#/components/ownership/PersonalHorseForm'
import { parseHorseEditSearch } from '#/components/forms/horse/horseEditSection'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/horses/$horseId/edit',
)({ validateSearch: parseHorseEditSearch, component: Page })
function Page() {
  return (
    <PersonalHorseForm
      horseId={Route.useParams().horseId}
      focusSection={Route.useSearch().section}
    />
  )
}
