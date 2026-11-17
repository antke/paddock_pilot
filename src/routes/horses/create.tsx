import { createFileRoute } from '@tanstack/react-router'
import { HorseCreateForm } from '#/components/horses/HorseCreateForm'

export const Route = createFileRoute('/horses/create')({
  component: () => <HorseCreateForm />,
})
