import { createFileRoute } from '@tanstack/react-router'
import { PersonalHorseForm } from '#/components/ownership/PersonalHorseForm'

export const Route = createFileRoute('/horses/$horseId/edit')({
  component: () => <PersonalHorseForm horseId={Route.useParams().horseId} />,
})
