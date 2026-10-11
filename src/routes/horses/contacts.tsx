import { createFileRoute } from '@tanstack/react-router'
import { PersonalContacts } from '#/components/ownership/PersonalContacts'

export const Route = createFileRoute('/horses/contacts')({
  component: PersonalContacts,
})
