// @vitest-environment jsdom

import type { ComponentProps } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { forbiddenLandingClaims } from './landingLabContent'
import { landingLabVariants } from './landingLabVariants'
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

afterEach(cleanup)

const concepts = [
  ['Gathered Yard', GatheredYard],
  ['Stable Aisle', StableAisle],
  ['Paddock Map', PaddockMap],
  ['Care Cycle', CareCycle],
  ['Owner / Member Gatefold', OwnerMemberGatefold],
] as const

describe('landing lab registry', () => {
  it('contains the same five unique top-level directions', () => {
    expect(landingLabVariants.map((variant) => variant.id)).toEqual([
      'gathered-yard',
      'stable-aisle',
      'paddock-map',
      'care-cycle',
      'owner-member-gatefold',
    ])
    expect(new Set(landingLabVariants.map((variant) => variant.id)).size).toBe(
      concepts.length,
    )
    expect(
      new Set(landingLabVariants.map((variant) => variant.label)).size,
    ).toBe(concepts.length)
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

function expectFactualLandingStory(container: HTMLElement) {
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  expect(container.querySelector('header')).toBeTruthy()
  expect(container.querySelector('main')).toBeTruthy()
  expect(container.querySelector('footer')).toBeTruthy()
  expect(container.querySelector('a[href="/sign-up/$"]')).toBeTruthy()
  expect(container.querySelector('a[href="/sign-in/$"]')).toBeTruthy()
  expect(container.querySelector('a[href="/pricing"]')).toBeFalsy()

  const copy = container.textContent?.toLowerCase() ?? ''
  expect(copy).toContain('stable')
  expect(copy).toContain('horse')
  expect(copy).toMatch(/appointments|events|reminders/)
  expect(copy).toContain('record')

  for (const forbiddenClaim of forbiddenLandingClaims) {
    expect(copy).not.toContain(forbiddenClaim)
  }
}

describe.each(concepts)('%s', (_label, Concept) => {
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
