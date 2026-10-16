import { lazy } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'

import type { LandingLabVariantProps } from './LandingLabPrimitives'

type LandingLabVariantDefinition = {
  id: string
  label: string
  thesis: string
  component: LazyExoticComponent<ComponentType<LandingLabVariantProps>>
}

export const currentLandingLabVariants = [
  {
    id: 'field-journal',
    label: 'Field Journal',
    thesis:
      'A refinement of the current landing direction, keeping horse records and day-to-day stable care in one clear field journal.',
    component: lazy(() => import('./variants/FieldJournal')),
  },
  {
    id: 'yard-editorial',
    label: 'Yard Editorial',
    thesis:
      'An editorial rhythm connects the stable view, each horse’s context, and the people doing the work.',
    component: lazy(() => import('./variants/YardEditorial')),
  },
  {
    id: 'open-paddock',
    label: 'Open Paddock',
    thesis:
      'An open composition gives horse records and shared stable care room to breathe without losing their connection.',
    component: lazy(() => import('./variants/OpenPaddock')),
  },
  {
    id: 'working-journal',
    label: 'Working Journal',
    thesis:
      'A practical journal follows stable work from what needs attention to the record of what was done.',
    component: lazy(() => import('./variants/WorkingJournal')),
  },
  {
    id: 'pine-statement',
    label: 'Pine Statement',
    thesis:
      'A concise typographic statement brings horse context, stable work, and shared access into one factual story.',
    component: lazy(() => import('./variants/PineStatement')),
  },
] as const satisfies ReadonlyArray<LandingLabVariantDefinition>

export const archivedLandingLabVariants = [
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
] as const satisfies ReadonlyArray<LandingLabVariantDefinition>

// Keep both rounds available for existing review, capture, and preference URLs.
export const landingLabVariants = [
  ...currentLandingLabVariants,
  ...archivedLandingLabVariants,
] as const

export type LandingLabVariantId = (typeof landingLabVariants)[number]['id']

export function getLandingLabVariant(id: string) {
  return landingLabVariants.find((variant) => variant.id === id)
}

export function isLandingLabVariantId(id: string): id is LandingLabVariantId {
  return landingLabVariants.some((variant) => variant.id === id)
}
