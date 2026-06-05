import { StableRemindersPage } from '#/components/reminders/StableRemindersPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/stables/_layout/$stableId/reminders')({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId } = Route.useParams()

  return <StableRemindersPage stableId={stableId} />
}
