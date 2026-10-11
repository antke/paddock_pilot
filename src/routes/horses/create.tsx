import { createFileRoute } from '@tanstack/react-router'
import { PersonalHorseForm } from '#/components/ownership/PersonalHorseForm'

export const Route = createFileRoute('/horses/create')({
  component: PersonalHorseForm,
})
