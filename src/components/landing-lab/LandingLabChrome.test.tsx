// @vitest-environment jsdom

import type { ComponentProps, ReactNode } from 'react'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { LandingLabChrome } from './LandingLabChrome'

vi.mock('#/components/ui/button', () => ({
  ButtonAnchor: ({ children, ...props }: ComponentProps<'a'>) => (
    <a {...props}>{children}</a>
  ),
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

  it('gives the existing title page-heading semantics without adding a title', () => {
    render(
      <LandingLabChrome
        variantId="stable-aisle"
        theme="light"
        viewport="fit"
      />,
    )
    expect(
      screen.getByRole('heading', { name: 'Landing concepts', level: 1 }),
    ).toBeTruthy()
    expect(screen.getAllByText('Landing concepts')).toHaveLength(1)
  })

  it('waits for clipboard acknowledgement and prevents duplicate pending requests', async () => {
    let resolve!: () => void
    const writeText = vi.fn(
      () =>
        new Promise<void>((done) => {
          resolve = done
        }),
    )
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    render(
      <LandingLabChrome
        variantId="stable-aisle"
        theme="light"
        viewport="fit"
      />,
    )
    const copy = screen.getByRole<HTMLButtonElement>('button', {
      name: 'Copy capture link',
    })
    fireEvent.click(copy)
    fireEvent.click(copy)
    expect(writeText).toHaveBeenCalledTimes(1)
    expect(copy.disabled).toBe(true)
    expect(copy.getAttribute('aria-busy')).toBe('true')
    expect(screen.queryByText('Capture link copied.')).toBeNull()
    await act(async () => resolve())
    expect(screen.getByRole('status').textContent).toBe('Capture link copied.')
    expect(screen.getByRole('status').className).not.toContain('sr-only')
    expect(copy.disabled).toBe(false)
  })

  it('exposes the real selectable capture URL when copying is denied, then supports retry', async () => {
    const writeText = vi
      .fn()
      .mockRejectedValueOnce(new Error('Denied'))
      .mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    window.history.replaceState(
      {},
      '',
      '/landing-lab/paddock-map?mode=review&viewport=390',
    )
    render(
      <LandingLabChrome
        variantId="paddock-map"
        theme="dark"
        viewport="390"
        mapVersion="night-survey"
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Copy capture link' }))
    const field = await screen.findByLabelText<HTMLInputElement>('Capture URL')
    const url = new URL(field.value)
    expect(url.pathname).toBe('/landing-lab/paddock-map')
    expect(url.searchParams.get('mode')).toBe('capture')
    expect(url.searchParams.get('theme')).toBe('dark')
    expect(url.searchParams.get('mapVersion')).toBe('night-survey')
    expect(url.searchParams.has('viewport')).toBe(false)
    expect(field.readOnly).toBe(true)
    field.focus()
    expect(field.selectionStart).toBe(0)
    expect(field.selectionEnd).toBe(field.value.length)
    expect(
      screen.getByRole('link', { name: 'Open capture' }).getAttribute('href'),
    ).toBe(field.value)
    expect(screen.getByRole('status').className).not.toContain('sr-only')
    expect(screen.getByRole('status').textContent).not.toContain('address bar')
    fireEvent.click(screen.getByRole('button', { name: 'Copy capture link' }))
    await screen.findByText('Capture link copied.')
    expect(screen.queryByLabelText('Capture URL')).toBeNull()
    expect(writeText).toHaveBeenCalledTimes(2)
  })

  it('does not display old failures after changing variant while a copy is pending', async () => {
    let reject!: (error: Error) => void
    const writeText = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<void>((_resolve, fail) => {
            reject = fail
          }),
      )
      .mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    const view = render(
      <LandingLabChrome variantId="paddock-map" theme="light" viewport="fit" />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Copy capture link' }))
    view.rerender(
      <LandingLabChrome variantId="stable-aisle" theme="dark" viewport="390" />,
    )
    expect(screen.getByRole('status').textContent).toBe('')
    fireEvent.click(screen.getByRole('button', { name: 'Copy capture link' }))
    await screen.findByText('Capture link copied.')
    await act(async () => reject(new Error('Old denied request')))
    expect(screen.getByRole('status').textContent).toBe('Capture link copied.')
    expect(screen.queryByLabelText('Capture URL')).toBeNull()
    expect(new URL(writeText.mock.calls[1][0]).pathname).toBe(
      '/landing-lab/stable-aisle',
    )
    view.rerender(
      <LandingLabChrome
        variantId="stable-aisle"
        theme="light"
        viewport="390"
      />,
    )
    expect(screen.getByRole('status').textContent).toBe('')
  })

  it('offers manual recovery when neither clipboard API nor a legacy copy command is available', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    })
    render(
      <LandingLabChrome
        variantId="gathered-yard"
        theme="light"
        viewport="fit"
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Copy capture link' }))
    expect(await screen.findByLabelText('Capture URL')).toBeTruthy()
    expect(document.querySelector('textarea')).toBeNull()
    expect(
      screen.getByRole<HTMLButtonElement>('button', {
        name: 'Copy capture link',
      }).disabled,
    ).toBe(false)
  })
})
