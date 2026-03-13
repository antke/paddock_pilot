import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/stables/$stableId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/stables/$stableId"!</div>
}
