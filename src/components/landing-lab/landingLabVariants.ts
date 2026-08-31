import { lazy } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'

import type { LandingLabVariantProps } from './LandingLabPrimitives'

export const landingLabVariants = [
  {
    id: 'gathered-yard',
    label: 'Gathered Yard',
    thesis:
      'Scattered stable information gathers into one shared operational place through a controlled typographic convergence.',
    component: lazy(() => import('./variants/GatheredYard')),
  },
  {
    id: 'stable-aisle',
    label: 'Stable Aisle',
    thesis:
      'A cinematic central aisle connects horse-specific context with the work happening across the wider stable.',
    component: lazy(() => import('./variants/StableAisle')),
  },
  {
    id: 'paddock-map',
    label: 'Paddock Map',
    thesis:
      'An authored field plan turns the factual product story into one connected route through stable care.',
    component: lazy(() => import('./variants/PaddockMap')),
  },
  {
    id: 'care-cycle',
    label: 'Care Cycle',
    thesis:
      'A continuous horseshoe path frames stable care as a recurring rhythm of attention, context, work, and access.',
    component: lazy(() => import('./variants/CareCycle')),
  },
  {
    id: 'owner-member-gatefold',
    label: 'Owner / Member Gatefold',
    thesis:
      'Two fields of responsibility meet at one shared seam without inventing personas, examples, or product evidence.',
    component: lazy(() => import('./variants/OwnerMemberGatefold')),
  },
] as const satisfies ReadonlyArray<{
  id: string
  label: string
  thesis: string
  component: LazyExoticComponent<ComponentType<LandingLabVariantProps>>
}>

export type LandingLabVariantId = (typeof landingLabVariants)[number]['id']

export function getLandingLabVariant(id: string) {
  return landingLabVariants.find((variant) => variant.id === id)
}

export function isLandingLabVariantId(id: string): id is LandingLabVariantId {
  return landingLabVariants.some((variant) => variant.id === id)
}
