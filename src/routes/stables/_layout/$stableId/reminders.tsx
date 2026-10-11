import { StableRemindersPage } from '#/components/reminders/StableRemindersPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/stables/_layout/$stableId/reminders')({
  validateSearch: (
    search: Record<string, unknown>,
  ): { reminderId?: string } => ({
    reminderId:
      typeof search.reminderId === 'string' ? search.reminderId : undefined,
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId } = Route.useParams()

  const { reminderId } = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <StableRemindersPage
      stableId={stableId}
      reminderId={reminderId}
      onClearSelection={() => void navigate({ search: {} })}
    />
  )
}
