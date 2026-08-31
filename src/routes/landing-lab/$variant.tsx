import {
  LandingLabCapture,
  LandingLabReview,
} from '#/components/landing-lab/LandingLabPage'
import { parseLandingLabSearch } from '#/components/landing-lab/landingLabSearch'
import { isLandingLabVariantId } from '#/components/landing-lab/landingLabVariants'
import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/landing-lab/$variant')({
  validateSearch: parseLandingLabSearch,
  component: LandingLabVariantRoute,
})

function LandingLabVariantRoute() {
  const { variant } = Route.useParams()
  const { mapVersion, mode, theme, viewport } = Route.useSearch()

  if (!isLandingLabVariantId(variant)) {
    return (
      <Navigate to="/landing-lab" search={{ selected: undefined }} replace />
    )
  }

  if (mode === 'capture') {
    return (
      <LandingLabCapture
        variantId={variant}
        theme={theme}
        mapVersion={variant === 'paddock-map' ? mapVersion : undefined}
      />
    )
  }

  return (
    <LandingLabReview
      variantId={variant}
      theme={theme}
      viewport={viewport}
      mapVersion={variant === 'paddock-map' ? mapVersion : undefined}
    />
  )
}
