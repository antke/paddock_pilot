// @vitest-environment jsdom

import type { ReactNode } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApplicationRouteShell } from './ApplicationRouteShell'

const auth = vi.hoisted<{
  state: 'signed-in' | 'signed-out' | 'loading'
  devBypass: boolean
}>(() => ({ state: 'signed-out', devBypass: false }))

vi.mock('@clerk/tanstack-react-start', () => ({
  ClerkLoaded: ({ children }: { children: ReactNode }) =>
    auth.state !== 'loading' ? children : null,
  ClerkLoading: ({ children }: { children: ReactNode }) =>
    auth.state === 'loading' ? children : null,
  Show: ({ children, when }: { children: ReactNode; when: string }) =>
    auth.state === when ? children : null,
}))

vi.mock('#/lib/devAuthBypass', () => ({
  useDevAuthBypassEnabled: () => auth.devBypass,
}))

vi.mock('../Header', () => ({
  default: () => <header>Application navigation</header>,
}))

vi.mock('../Footer', () => ({
  default: () => <footer>Application footer</footer>,
}))

afterEach(() => {
  cleanup()
  auth.state = 'signed-out'
  auth.devBypass = false
})

describe('ApplicationRouteShell', () => {
  it('lets the signed-out home page own its header, main, and footer', () => {
    const { container } = render(
      <ApplicationRouteShell pathname="/">
        <header>Public navigation</header>
        <main>Public home</main>
        <footer>Public footer</footer>
      </ApplicationRouteShell>,
    )

    expect(container.querySelector('[data-slot="app-shell"]')).toBeNull()
    expect(screen.getAllByRole('banner')).toHaveLength(1)
    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1)
    expect(screen.getByRole('banner').textContent).toBe('Public navigation')
    expect(screen.getByRole('main').textContent).toBe('Public home')
    expect(screen.getByRole('contentinfo').textContent).toBe('Public footer')
  })

  it.each(['signed-in', 'loading'] as const)(
    'retains the application shell on the %s home page',
    (state) => {
      auth.state = state
      const { container } = render(
        <ApplicationRouteShell pathname="/">
          <p>Home route content</p>
        </ApplicationRouteShell>,
      )

      expect(container.querySelector('[data-slot="app-shell"]')).toBeTruthy()
      expect(screen.getByRole('banner').textContent).toBe(
        'Application navigation',
      )
      expect(screen.getByRole('main').textContent).toBe('Home route content')
      expect(screen.getByRole('contentinfo').textContent).toBe(
        'Application footer',
      )
    },
  )

  it.each(['signed-in', 'signed-out', 'loading'] as const)(
    'keeps other routes inside the application shell while %s',
    (state) => {
      auth.state = state
      for (const pathname of ['/pricing', '/horses', '/stables/example']) {
        const { container, unmount } = render(
          <ApplicationRouteShell pathname={pathname}>
            <p>Route content</p>
          </ApplicationRouteShell>,
        )

        expect(container.querySelector('[data-slot="app-shell"]')).toBeTruthy()
        expect(screen.getByRole('banner').textContent).toBe(
          'Application navigation',
        )
        expect(screen.getByRole('main').textContent).toBe('Route content')
        expect(screen.getByRole('contentinfo').textContent).toBe(
          'Application footer',
        )
        unmount()
      }
    },
  )

  it('uses the existing development auth bypass decision', () => {
    auth.devBypass = true
    const { container } = render(
      <ApplicationRouteShell pathname="/">
        <p>Fixture content</p>
      </ApplicationRouteShell>,
    )

    expect(container.querySelector('[data-slot="app-shell"]')).toBeTruthy()
    expect(screen.getByRole('main').textContent).toBe('Fixture content')
  })
})
