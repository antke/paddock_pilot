import { ListStyleComparison } from '#/components/design/ListStyleComparison'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/style-lab')({
  component: StyleLabPage,
})

function StyleLabPage() {
  return <ListStyleComparison />
}
