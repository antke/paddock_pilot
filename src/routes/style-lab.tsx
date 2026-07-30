import { StableDesignGuidelines } from '#/components/design/StableDesignGuidelines'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/style-lab')({
  component: StyleLabPage,
})

function StyleLabPage() {
  return <StableDesignGuidelines />
}
