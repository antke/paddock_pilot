// @vitest-environment jsdom

import type * as RouterModule from '@tanstack/react-router'
import type { ComponentProps } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { forbiddenLandingClaims } from './landingLabContent'
import {
  archivedLandingLabVariants,
  currentLandingLabVariants,
  getLandingLabVariant,
  isLandingLabVariantId,
  landingLabVariants,
} from './landingLabVariants'
import LifeRecord from './variants/country/LifeRecord'
import SameThursday from './variants/country/SameThursday'
import CleanBoard from './variants/country/CleanBoard'
import TackRoomBoard from './variants/country/TackRoomBoard'
import YardQuestions from './variants/country/YardQuestions'
import YardWeek from './variants/country/YardWeek'
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

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof RouterModule>()),
  Link: ({ to, ...props }: ComponentProps<'a'> & { to: string }) => (
    <a href={to} {...props} />
  ),
}))

vi.mock('#/i18n/LanguageSelector', () => ({
  LanguageSelector: () => <span>Language</span>,
}))

afterEach(cleanup)

const currentConcepts = [
  ['Clean Board', CleanBoard],
  ['Yard Week', YardWeek],
  ['Life Record', LifeRecord],
  ['Tack Room Board', TackRoomBoard],
  ['Same Thursday', SameThursday],
  ['Yard Questions', YardQuestions],
] as const

const previousConcepts = [
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
  it('contains the merged page first, then its five source directions', () => {
    expect(currentLandingLabVariants.map((variant) => variant.id)).toEqual([
      'clean-board',
      'yard-week',
      'life-record',
      'tack-room-board',
      'same-thursday',
      'yard-questions',
    ])
    expect(currentLandingLabVariants.map((variant) => variant.label)).toEqual(
      currentConcepts.map(([label]) => label),
    )
  })

  it('retains all ten earlier directions for backwards ID lookup', () => {
    expect(archivedLandingLabVariants.map((variant) => variant.id)).toEqual([
      'field-journal',
      'yard-editorial',
      'open-paddock',
      'working-journal',
      'pine-statement',
      'gathered-yard',
      'stable-aisle',
      'paddock-map',
      'care-cycle',
      'owner-member-gatefold',
    ])
    expect(archivedLandingLabVariants.map((variant) => variant.label)).toEqual(
      [...previousConcepts, ...archivedConcepts].map(([label]) => label),
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

describe.each(currentConcepts)('%s', (label, Concept) => {
  it('renders the country landing world with live account routes', () => {
    const { container } = render(<Concept theme="light" />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(container.querySelector('.country-page')).toBeTruthy()
    expect(container.querySelector('main#country-main')).toBeTruthy()
    expect(container.querySelector('footer')).toBeTruthy()
    expect(
      container.querySelectorAll('a[href="/sign-up/$"]').length,
    ).toBeGreaterThanOrEqual(2)
    expect(container.querySelector('a[href="/sign-in/$"]')).toBeTruthy()
    expect(container.querySelector('a[href="/pricing"]')).toBeTruthy()

    const copy = container.textContent?.toLowerCase() ?? ''
    expect(copy).toContain('horse')
    expect(copy).toMatch(/stable|yard/)
    expect(copy).toMatch(/calendar|appointments|reminders/)
    expect(copy).toContain('record')
    // Clean Board's notes are unlabelled by review decision; every number in
    // them is from a range reserved for fiction.
    if (label !== 'Clean Board') {
      expect(copy).toContain('example')
    }
    for (const forbiddenClaim of forbiddenLandingClaims.filter(
      (claim) => claim !== 'juniper',
    )) {
      expect(copy).not.toContain(forbiddenClaim)
    }
  })
})

describe('country round interactions', () => {
  it('Clean Board keeps the chosen section order', () => {
    render(<CleanBoard />)
    expect(
      screen
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual([
      'Every yard has a board like this.',
      'Paddock Pilot tidies it up.',
      'Share the work. Keep what’s yours.',
      'Fair questions, plain answers.',
      'Wipe the whiteboard clean.',
    ])
  })

  it('Yard Week switches the example day', () => {
    render(<YardWeek />)
    expect(screen.getByText('Farrier visit')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /^Friday 7/ }))
    expect(screen.getByText('Hay delivery')).toBeTruthy()
    expect(screen.queryByText('Farrier visit')).toBeNull()
  })

  it('Tack Room Board exposes only the active note wording', () => {
    const { container } = render(<TackRoomBoard />)
    const figure = container.querySelector('[data-tidy]')
    expect(figure?.getAttribute('data-tidy')).toBe('false')
    fireEvent.click(screen.getByRole('button', { name: 'Tidy it up' }))
    expect(figure?.getAttribute('data-tidy')).toBe('true')
    expect(
      screen
        .getByRole('button', { name: 'Tidy it up' })
        .getAttribute('aria-pressed'),
    ).toBe('true')
  })

  it('Same Thursday hides private records from the yard view', () => {
    render(<SameThursday />)
    expect(screen.queryByText(/Private to Juniper’s owner/)).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'The yard' }))
    expect(screen.getByText(/Private to Juniper’s owner/)).toBeTruthy()
    expect(screen.queryByText(/Slight heat in near fore/)).toBeNull()
  })
})

describe.each(previousConcepts)('%s', (_label, Concept) => {
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
