import { createFileRoute } from '@tanstack/react-router'
import { PersonalHorseTrash } from '#/components/ownership/PersonalHorses'

export const Route = createFileRoute('/horses/deleted')({
  component: PersonalHorseTrash,
})
