import { createFileRoute } from '@tanstack/react-router'
import { PersonalHorses } from '#/components/ownership/PersonalHorses'

export const Route = createFileRoute('/horses/')({ component: PersonalHorses })
