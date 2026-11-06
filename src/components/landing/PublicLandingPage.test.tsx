// @vitest-environment jsdom
import type * as RouterModule from '@tanstack/react-router'
import type { ComponentProps } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PublicLandingPage } from './PublicLandingPage'

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof RouterModule>()),
  Link: ({ to, ...props }: ComponentProps<'a'> & { to: string }) => (
    <a href={to} {...props} />
  ),
}))
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

/** Stands in for the browser's visibility and motion signals. */
function stubBrowser({ reducedMotion = false } = {}) {
  let notify: (isIntersecting: boolean) => void = () => {}
  class FakeIntersectionObserver {
    constructor(
      callback: (entries: Array<{ isIntersecting: boolean }>) => void,
    ) {
      notify = (isIntersecting) => callback([{ isIntersecting }])
    }
    observe() {}
    disconnect() {}
  }
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
  vi.stubGlobal('matchMedia', () => ({ matches: reducedMotion }))
  return (isIntersecting: boolean) => {
    act(() => notify(isIntersecting))
  }
}

function boardState(container: HTMLElement) {
  return container.querySelector('[data-tidy]')?.getAttribute('data-tidy')
}

describe('PublicLandingPage', () => {
  it('tells the whiteboard story in order and links to working account routes', () => {
    render(<PublicLandingPage />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('main').id).toBe('country-main')
    expect(
      screen
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual([
      'Every yard has a board like this.',
      'Then it keeps itself tidy.',
      'Share the work. Keep what’s yours.',
      'Fair questions, plain answers.',
      'Wipe the whiteboard clean.',
    ])
    const accountLinks = screen.getAllByRole('link', {
      name: 'Create your account',
    })
    expect(accountLinks).toHaveLength(2)
    for (const link of accountLinks) {
      expect(link.getAttribute('href')).toBe('/sign-up/$')
    }
    for (const link of screen.getAllByRole('link', { name: 'Plans' })) {
      expect(link.getAttribute('href')).toBe('/pricing')
    }
  })

  it('lets the visitor switch the board between the notes and the tidy list', () => {
    const { container } = render(<PublicLandingPage />)
    expect(boardState(container)).toBe('false')
    expect(
      screen.getByRole('heading', { name: 'The tack room whiteboard' }),
    ).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Tidy it up' }))
    expect(boardState(container)).toBe('true')
    expect(
      screen.getByRole('heading', { name: 'In Paddock Pilot' }),
    ).toBeTruthy()
    expect(
      screen
        .getByRole('button', { name: 'Tidy it up' })
        .getAttribute('aria-pressed'),
    ).toBe('true')
  })

  it('tidies the board once it has stayed in view', () => {
    vi.useFakeTimers()
    const setVisible = stubBrowser()
    const { container } = render(<PublicLandingPage />)
    setVisible(true)
    act(() => {
      vi.advanceTimersByTime(5900)
    })
    expect(boardState(container)).toBe('false')
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(boardState(container)).toBe('true')
  })

  it('does not tidy a board that scrolled away before the pause ended', () => {
    vi.useFakeTimers()
    const setVisible = stubBrowser()
    const { container } = render(<PublicLandingPage />)
    setVisible(true)
    setVisible(false)
    act(() => {
      vi.advanceTimersByTime(10000)
    })
    expect(boardState(container)).toBe('false')
  })

  it('leaves the choice with a visitor who has used the switch', () => {
    vi.useFakeTimers()
    const setVisible = stubBrowser()
    const { container } = render(<PublicLandingPage />)
    setVisible(true)
    fireEvent.click(screen.getByRole('button', { name: 'As it is' }))
    act(() => {
      vi.advanceTimersByTime(10000)
    })
    expect(boardState(container)).toBe('false')
  })

  it('never moves the notes on its own under reduced motion', () => {
    vi.useFakeTimers()
    stubBrowser({ reducedMotion: true })
    const { container } = render(<PublicLandingPage />)
    act(() => {
      vi.advanceTimersByTime(10000)
    })
    expect(boardState(container)).toBe('false')
    fireEvent.click(screen.getByRole('button', { name: 'Tidy it up' }))
    expect(boardState(container)).toBe('true')
  })

  it('keeps rejected filler and invented commercial proof off the page', () => {
    const { container } = render(<PublicLandingPage />)
    const copy = (container.textContent ?? '').toLowerCase()
    for (const removed of [
      'for small stable owners and members.',
      'one record, there for the next person.',
      'notes after completion',
      'free trial',
      'trusted by',
      'cancel anytime',
      'no payment is required',
    ]) {
      expect(copy).not.toContain(removed)
    }
    for (const screenshot of [
      'stable-command-center',
      'horse-record',
      'provider-visit',
    ]) {
      expect(
        container.querySelector(`img[src="/landing/${screenshot}.png"]`),
      ).toBeNull()
    }
  })
})
