import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/stables/_layout/$stableId/events/')({
  component: RouteComponent,
})

function RouteComponent() {
  // const { data: events } =
  return <div>Hello "/stables/_layout/$stableId/events"!</div>
}
