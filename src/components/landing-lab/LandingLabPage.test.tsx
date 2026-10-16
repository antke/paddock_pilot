// @vitest-environment jsdom

import type { ComponentProps, ReactNode } from 'react'
import type * as RouterModule from '@tanstack/react-router'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { LandingLabGallery, LandingLabReview } from './LandingLabPage'
import {
  archivedLandingLabVariants,
  currentLandingLabVariants,
} from './landingLabVariants'

vi.mock('./LandingLabChrome', () => ({
  LandingLabChrome: () => <header>Review controls</header>,
}))

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof RouterModule>()),
  Link: ({
    children,
    params,
    search,
    to,
    ...props
  }: ComponentProps<'a'> & {
    children: ReactNode
    params?: { variant?: string }
    search?: Record<string, unknown>
    to: string
  }) => {
    const path = params?.variant ? to.replace('$variant', params.variant) : to
    const query = new URLSearchParams()
    for (const [key, value] of Object.entries(search ?? {})) {
      if (value !== undefined) query.set(key, String(value))
    }
    return (
      <a href={query.size ? `${path}?${query.toString()}` : path} {...props}>
        {children}
      </a>
    )
  },
}))

afterEach(cleanup)

describe('LandingLabGallery rounds', () => {
  it('mounts exactly the five current previews by default and no archived iframes', () => {
    const { container } = render(<LandingLabGallery />)
    const current = within(
      screen.getByRole('region', { name: 'Current round' }),
    )
    expect(
      current
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual(currentLandingLabVariants.map((variant) => variant.label))
    expect(container.querySelectorAll('iframe')).toHaveLength(5)
    for (const variant of currentLandingLabVariants) {
      const iframe = screen.getByTitle(`${variant.label} landing-page preview`)
      expect(iframe.getAttribute('src')).toBe(
        `/landing-lab/${variant.id}?mode=capture&theme=light`,
      )
      expect(iframe.getAttribute('loading')).toBe('lazy')
    }
    for (const variant of archivedLandingLabVariants) {
      expect(
        screen.queryByTitle(`${variant.label} landing-page preview`),
      ).toBeNull()
    }
    expect(
      screen
        .getByRole('button', { name: 'Show archived round (5 concepts)' })
        .getAttribute('aria-expanded'),
    ).toBe('false')
  })

  it('mounts archived previews only after expansion and unmounts them on collapse', () => {
    const { container } = render(<LandingLabGallery />)
    fireEvent.click(
      screen.getByRole('button', { name: 'Show archived round (5 concepts)' }),
    )
    expect(container.querySelectorAll('iframe')).toHaveLength(10)
    const archived = within(
      screen.getByRole('region', { name: 'Archived concepts' }),
    )
    expect(
      archived
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual(archivedLandingLabVariants.map((variant) => variant.label))
    for (const variant of archivedLandingLabVariants) {
      expect(
        screen
          .getByTitle(`${variant.label} landing-page preview`)
          .getAttribute('src'),
      ).toBe(`/landing-lab/${variant.id}?mode=capture&theme=light`)
    }
    fireEvent.click(
      screen.getByRole('button', { name: 'Hide archived round (5 concepts)' }),
    )
    expect(container.querySelectorAll('iframe')).toHaveLength(5)
    expect(
      screen.queryByRole('region', { name: 'Archived concepts' }),
    ).toBeNull()
  })

  it('exposes an archived selection on initial load and on a changed preference', () => {
    const view = render(<LandingLabGallery selected="paddock-map" />)
    expect(screen.getByText('Review preference: Paddock Map')).toBeTruthy()
    expect(screen.getByTitle('Paddock Map landing-page preview')).toBeTruthy()
    fireEvent.click(
      screen.getByRole('button', { name: 'Hide archived round (5 concepts)' }),
    )
    expect(screen.queryByTitle('Paddock Map landing-page preview')).toBeNull()
    view.rerender(<LandingLabGallery selected="stable-aisle" />)
    expect(screen.getByTitle('Stable Aisle landing-page preview')).toBeTruthy()
    expect(
      screen
        .getByRole('link', { name: 'Clear preference' })
        .getAttribute('href'),
    ).toBe('/landing-lab')
  })

  it('keeps current preferences outside the archive and links to canonical review and selection URLs', () => {
    render(<LandingLabGallery selected="field-journal" />)
    expect(screen.getByText('Review preference: Field Journal')).toBeTruthy()
    expect(screen.queryByTitle('Gathered Yard landing-page preview')).toBeNull()
    const current = within(
      screen.getByRole('region', { name: 'Current round' }),
    )
    expect(
      current
        .getAllByRole('link', { name: 'Open concept' })
        .map((link) => link.getAttribute('href')),
    ).toEqual(
      currentLandingLabVariants.map(
        (variant) =>
          `/landing-lab/${variant.id}?mode=review&theme=light&viewport=fit`,
      ),
    )
    expect(
      current
        .getAllByRole('link', { name: 'Choose this direction' })
        .map((link) => link.getAttribute('href')),
    ).toEqual(
      currentLandingLabVariants.map(
        (variant) => `/landing-lab?selected=${variant.id}`,
      ),
    )
  })
})

describe('LandingLabReview iframe state', () => {
  it('replaces the preview document when switching current concepts', () => {
    const view = render(
      <LandingLabReview
        variantId="field-journal"
        theme="light"
        viewport="fit"
      />,
    )
    let previous = screen.getByTitle('Field Journal responsive preview')
    for (const variant of currentLandingLabVariants.slice(1)) {
      view.rerender(
        <LandingLabReview
          variantId={variant.id}
          theme="light"
          viewport="fit"
        />,
      )
      const iframe = screen.getByTitle(`${variant.label} responsive preview`)
      expect(iframe).not.toBe(previous)
      expect(previous.isConnected).toBe(false)
      expect(iframe.getAttribute('src')).toBe(
        `/landing-lab/${variant.id}?mode=capture&theme=light`,
      )
      previous = iframe
    }
  })

  it('replaces the preview document when switching map studies, including back to the default', () => {
    const view = render(
      <LandingLabReview variantId="paddock-map" theme="light" viewport="fit" />,
    )
    let previous = screen.getByTitle('Paddock Map responsive preview')
    for (const mapVersion of [
      'moving-gates',
      'night-survey',
      'layered-fields',
    ] as const) {
      view.rerender(
        <LandingLabReview
          variantId="paddock-map"
          theme="light"
          viewport="fit"
          mapVersion={mapVersion}
        />,
      )
      const iframe = screen.getByTitle('Paddock Map responsive preview')
      expect(iframe).not.toBe(previous)
      expect(previous.isConnected).toBe(false)
      expect(iframe.getAttribute('src')).toBe(
        `/landing-lab/paddock-map?mode=capture&theme=light${
          mapVersion === 'layered-fields' ? '' : `&mapVersion=${mapVersion}`
        }`,
      )
      previous = iframe
    }
  })

  it('replaces the preview document for theme changes but retains it for viewport changes', () => {
    const view = render(
      <LandingLabReview
        variantId="field-journal"
        theme="light"
        viewport="fit"
      />,
    )
    const lightFrame = screen.getByTitle('Field Journal responsive preview')
    view.rerender(
      <LandingLabReview
        variantId="field-journal"
        theme="dark"
        viewport="fit"
      />,
    )
    const darkFrame = screen.getByTitle<HTMLIFrameElement>(
      'Field Journal responsive preview',
    )
    expect(darkFrame).not.toBe(lightFrame)
    expect(lightFrame.isConnected).toBe(false)
    expect(darkFrame.getAttribute('src')).toBe(
      '/landing-lab/field-journal?mode=capture&theme=dark',
    )
    view.rerender(
      <LandingLabReview
        variantId="field-journal"
        theme="dark"
        viewport="390"
      />,
    )
    expect(screen.getByTitle('Field Journal responsive preview')).toBe(
      darkFrame,
    )
    expect(darkFrame.style.width).toBe('390px')
  })

  it('retains archived map version, theme, and viewport controls', () => {
    render(
      <LandingLabReview
        variantId="paddock-map"
        theme="dark"
        viewport="390"
        mapVersion="night-survey"
      />,
    )
    const iframe = screen.getByTitle<HTMLIFrameElement>(
      'Paddock Map responsive preview',
    )
    expect(iframe.getAttribute('src')).toBe(
      '/landing-lab/paddock-map?mode=capture&theme=dark&mapVersion=night-survey',
    )
    expect(iframe.style.width).toBe('390px')
  })

  it('supports a current concept at fit width without leaking a map version', () => {
    render(
      <LandingLabReview
        variantId="field-journal"
        theme="light"
        viewport="fit"
        mapVersion="moving-gates"
      />,
    )
    const iframe = screen.getByTitle<HTMLIFrameElement>(
      'Field Journal responsive preview',
    )
    expect(iframe.getAttribute('src')).toBe(
      '/landing-lab/field-journal?mode=capture&theme=light',
    )
    expect(iframe.style.width).toBe('100%')
  })
})
