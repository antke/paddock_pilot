import { createFileRoute } from '@tanstack/react-router'
import { PersonalEventEditor } from '#/components/ownership/PersonalEvents'

export const Route = createFileRoute('/events/create')({
  validateSearch: (
    s,
  ): { horseId?: string; training?: boolean; intent?: 'record' } => ({
    horseId: typeof s.horseId === 'string' ? s.horseId : undefined,
    training: s.training === true,
    intent: s.training === true && s.intent === 'record' ? 'record' : undefined,
  }),
  component: Page,
})
function Page() {
  return <PersonalEventEditor {...Route.useSearch()} />
}
