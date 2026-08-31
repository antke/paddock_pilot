// @vitest-environment jsdom

import type { ComponentProps, ReactNode } from 'react'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { LandingLabChrome } from './LandingLabChrome'

vi.mock('#/components/ui/button', () => ({
  Button: ({ children, ...props }: ComponentProps<'button'>) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    activeOptions,
    children,
    params,
    search,
    to,
    ...props
  }: ComponentProps<'a'> & {
    activeOptions?: { exact?: boolean }
    children: ReactNode
    params?: { variant?: string }
    search?: Record<string, unknown>
    to: string
  }) => {
    void activeOptions
    const path = params?.variant ? to.replace('$variant', params.variant) : to
    const query = new URLSearchParams()

    for (const [key, value] of Object.entries(search ?? {})) {
      if (value !== undefined) query.set(key, String(value))
    }

    const href = query.size > 0 ? `${path}?${query.toString()}` : path
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  },
}))

afterEach(() => {
  cleanup()
  window.history.replaceState({}, '', '/')
  vi.restoreAllMocks()
})

describe('LandingLabChrome Paddock Map studies', () => {
  it('shows the secondary version navigation only for Paddock Map', () => {
    const { rerender } = render(
      <LandingLabChrome variantId="paddock-map" theme="light" viewport="fit" />,
    )

    expect(
      screen.getByRole('navigation', { name: 'Paddock Map versions' }),
    ).toBeTruthy()
    expect(
      screen
        .getByRole('link', { name: 'Layered Fields' })
        .getAttribute('aria-current'),
    ).toBe('page')

    rerender(
      <LandingLabChrome
        variantId="stable-aisle"
        theme="light"
        viewport="fit"
      />,
    )

    expect(
      screen.queryByRole('navigation', { name: 'Paddock Map versions' }),
    ).toBeNull()
  })

  it('creates canonical study links and marks the active study', () => {
    render(
      <LandingLabChrome
        variantId="paddock-map"
        theme="light"
        viewport="768"
        mapVersion="moving-gates"
      />,
    )

    const layeredFields = screen.getByRole('link', { name: 'Layered Fields' })
    const movingGates = screen.getByRole('link', { name: 'Moving Gates' })
    const nightSurvey = screen.getByRole('link', { name: 'Night Survey' })

    expect(layeredFields.getAttribute('href')).not.toContain('mapVersion')
    expect(movingGates.getAttribute('aria-current')).toBe('page')
    expect(movingGates.getAttribute('href')).toContain(
      'mapVersion=moving-gates',
    )
    expect(nightSurvey.getAttribute('href')).toContain(
      'mapVersion=night-survey',
    )
  })

  it('preserves study state through theme and viewport links and clears it elsewhere', () => {
    render(
      <LandingLabChrome
        variantId="paddock-map"
        theme="light"
        viewport="fit"
        mapVersion="night-survey"
      />,
    )

    expect(
      screen.getByLabelText('Use dark theme').getAttribute('href'),
    ).toContain('mapVersion=night-survey')
    expect(
      screen.getByRole('link', { name: '390px' }).getAttribute('href'),
    ).toContain('mapVersion=night-survey')
    expect(
      screen.getByRole('link', { name: 'Stable Aisle' }).getAttribute('href'),
    ).not.toContain('mapVersion')
  })

  it('copies a capture URL for the active study without viewport state', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    window.history.replaceState(
      {},
      '',
      '/landing-lab/paddock-map?mode=review&theme=light&viewport=1440&mapVersion=night-survey',
    )

    render(
      <LandingLabChrome
        variantId="paddock-map"
        theme="light"
        viewport="1440"
        mapVersion="night-survey"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Copy capture link' }))

    await waitFor(() => expect(writeText).toHaveBeenCalledOnce())
    const copiedUrl = new URL(String(writeText.mock.calls[0]?.[0]))
    expect(copiedUrl.searchParams.get('mode')).toBe('capture')
    expect(copiedUrl.searchParams.get('theme')).toBe('light')
    expect(copiedUrl.searchParams.get('mapVersion')).toBe('night-survey')
    expect(copiedUrl.searchParams.has('viewport')).toBe(false)
  })
})
