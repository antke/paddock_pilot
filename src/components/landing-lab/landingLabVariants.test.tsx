// @vitest-environment jsdom

import type { ComponentProps } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { forbiddenLandingClaims } from './landingLabContent'
import {
  archivedLandingLabVariants,
  currentLandingLabVariants,
  getLandingLabVariant,
  isLandingLabVariantId,
  landingLabVariants,
} from './landingLabVariants'
import FieldJournal from './variants/FieldJournal'
import OpenPaddock from './variants/OpenPaddock'
import PineStatement from './variants/PineStatement'
import WorkingJournal from './variants/WorkingJournal'
import YardEditorial from './variants/YardEditorial'
import CareCycle from './variants/CareCycle'
import GatheredYard from './variants/GatheredYard'
import OwnerMemberGatefold from './variants/OwnerMemberGatefold'
import PaddockMap from './variants/PaddockMap'
import StableAisle from './variants/StableAisle'
import {
  defaultPaddockMapVersionId,
  paddockMapVersions,
} from './variants/paddock-map/paddockMapVersions'

vi.mock('#/components/ui/button', () => ({
  Button: (props: ComponentProps<'button'>) => <button {...props} />,
  ButtonLink: ({
    size,
    to,
    variant,
    ...props
  }: ComponentProps<'a'> & {
    size?: string
    to: string
    variant?: string
  }) => {
    void size
    void variant
    return <a href={to} {...props} />
  },
}))

vi.mock('#/i18n/LanguageSelector', () => ({
  LanguageSelector: () => <span>Language</span>,
}))

afterEach(cleanup)

const currentConcepts = [
  ['Field Journal', FieldJournal],
  ['Yard Editorial', YardEditorial],
  ['Open Paddock', OpenPaddock],
  ['Working Journal', WorkingJournal],
  ['Pine Statement', PineStatement],
] as const

const archivedConcepts = [
  ['Gathered Yard', GatheredYard],
  ['Stable Aisle', StableAisle],
  ['Paddock Map', PaddockMap],
  ['Care Cycle', CareCycle],
  ['Owner / Member Gatefold', OwnerMemberGatefold],
] as const

describe('landing lab registry', () => {
  it('contains exactly five current directions with the refinement first', () => {
    expect(currentLandingLabVariants.map((variant) => variant.id)).toEqual([
      'field-journal',
      'yard-editorial',
      'open-paddock',
      'working-journal',
      'pine-statement',
    ])
    expect(currentLandingLabVariants.map((variant) => variant.label)).toEqual(
      currentConcepts.map(([label]) => label),
    )
  })

  it('retains all five archived directions for backwards ID lookup', () => {
    expect(archivedLandingLabVariants.map((variant) => variant.id)).toEqual([
      'gathered-yard',
      'stable-aisle',
      'paddock-map',
      'care-cycle',
      'owner-member-gatefold',
    ])
    expect(archivedLandingLabVariants.map((variant) => variant.label)).toEqual(
      archivedConcepts.map(([label]) => label),
    )
    expect(landingLabVariants).toEqual([
      ...currentLandingLabVariants,
      ...archivedLandingLabVariants,
    ])
    for (const variant of landingLabVariants) {
      expect(getLandingLabVariant(variant.id)).toBe(variant)
      expect(isLandingLabVariantId(variant.id)).toBe(true)
    }
    expect(getLandingLabVariant('unknown')).toBeUndefined()
    expect(isLandingLabVariantId('unknown')).toBe(false)
    expect(new Set(landingLabVariants.map((variant) => variant.id)).size).toBe(
      landingLabVariants.length,
    )
    expect(
      new Set(landingLabVariants.map((variant) => variant.label)).size,
    ).toBe(landingLabVariants.length)
  })

  it('keeps three unique Paddock Map studies below the top-level registry', () => {
    expect(defaultPaddockMapVersionId).toBe('layered-fields')
    expect(paddockMapVersions.map((version) => version.id)).toEqual([
      'layered-fields',
      'moving-gates',
      'night-survey',
    ])
    expect(new Set(paddockMapVersions.map((version) => version.id)).size).toBe(
      paddockMapVersions.length,
    )

    const topLevelIds = new Set(
      landingLabVariants.map((variant) => variant.id as string),
    )
    for (const version of paddockMapVersions) {
      expect(topLevelIds.has(version.id)).toBe(false)
    }
  })
})

function expectFactualLandingStory(
  container: HTMLElement,
  includesPlans = false,
) {
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  expect(container.querySelector('header')).toBeTruthy()
  expect(container.querySelector('main')).toBeTruthy()
  expect(container.querySelector('footer')).toBeTruthy()
  expect(container.querySelector('a[href="/sign-up/$"]')).toBeTruthy()
  expect(container.querySelector('a[href="/sign-in/$"]')).toBeTruthy()
  expect(Boolean(container.querySelector('a[href="/pricing"]'))).toBe(
    includesPlans,
  )

  const copy = container.textContent?.toLowerCase() ?? ''
  expect(copy).toContain('stable')
  expect(copy).toContain('horse')
  expect(copy).toMatch(/appointments|events|reminders/)
  expect(copy).toContain('record')

  for (const forbiddenClaim of forbiddenLandingClaims) {
    expect(copy).not.toContain(forbiddenClaim)
  }
}

describe.each(currentConcepts)('%s', (_label, Concept) => {
  it('renders a factual and accessible landing-page story with live account routes', () => {
    const { container } = render(<Concept theme="light" />)
    expectFactualLandingStory(container, true)
    expect(container.querySelector('main#main-content')).toBeTruthy()
  })
})

describe.each(archivedConcepts)('%s', (_label, Concept) => {
  it('renders a factual and accessible landing-page story', () => {
    const { container } = render(<Concept theme="light" />)
    expectFactualLandingStory(container)
  })
})

describe.each(paddockMapVersions)('Paddock Map: $label', ({ id }) => {
  it('renders the shared factual story with decorative map geometry', () => {
    const { container } = render(<PaddockMap theme="light" versionId={id} />)

    expectFactualLandingStory(container)
    expect(container.querySelector('svg[aria-hidden="true"]')).toBeTruthy()
    expect(container.querySelectorAll('h2')).toHaveLength(4)
  })
})
