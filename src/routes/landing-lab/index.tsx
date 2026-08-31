import { LandingLabGallery } from '#/components/landing-lab/LandingLabPage'
import { parseLandingLabSelection } from '#/components/landing-lab/landingLabSearch'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/landing-lab/')({
  validateSearch: parseLandingLabSelection,
  component: LandingLabIndexRoute,
})

function LandingLabIndexRoute() {
  const { selected } = Route.useSearch()
  return <LandingLabGallery selected={selected} />
}
