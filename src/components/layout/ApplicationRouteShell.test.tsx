// @vitest-environment jsdom

import type { ReactNode } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApplicationRouteShell } from './ApplicationRouteShell'
import { MotionList } from '#/components/motion/MotionList'

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
  it('preserves shell and navigation elements across signed-in Home, Events and Training', () => {
    auth.state = 'signed-in'
    const { container, rerender } = render(
      <ApplicationRouteShell pathname="/">
        <p>Home</p>
      </ApplicationRouteShell>,
    )
    const shell = container.querySelector('[data-slot="app-shell"]')
    const header = screen.getByRole('banner')
    for (const pathname of ['/events', '/training', '/']) {
      rerender(
        <ApplicationRouteShell pathname={pathname}>
          <p>{pathname}</p>
        </ApplicationRouteShell>,
      )
      expect(container.querySelector('[data-slot="app-shell"]')).toBe(shell)
      expect(screen.getByRole('banner')).toBe(header)
    }
  })
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
      expect(screen.queryByRole('contentinfo')).toBeNull()
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
        if (state === 'signed-out') {
          expect(screen.getByRole('contentinfo').textContent).toBe(
            'Application footer',
          )
        } else {
          expect(screen.queryByRole('contentinfo')).toBeNull()
        }
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
    expect(screen.queryByRole('contentinfo')).toBeNull()
  })
})

it('retains animated exits only in the working app, keeping pricing and historical labs static', () => {
  auth.state = 'signed-in'
  const ui = (pathname: string, items: string[]) => (
    <ApplicationRouteShell pathname={pathname}>
      <MotionList
        items={items}
        getKey={(item) => item}
        renderItem={(item) => <button>{item}</button>}
      />
    </ApplicationRouteShell>
  )
  const { container, rerender } = render(ui('/pricing', ['Juniper']))
  for (const pathname of [
    '/pricing',
    '/style-lab',
    '/page-lab/forms',
    '/dashboard-lab/sample',
  ]) {
    rerender(ui(pathname, ['Juniper']))
    rerender(ui(pathname, []))
    expect(
      screen.queryByRole('button', { name: 'Juniper', hidden: true }),
    ).toBeNull()
    expect(container.querySelector('[data-exiting]')).toBeNull()
  }
  rerender(ui('/horses', ['Juniper']))
  rerender(ui('/horses', []))
  expect(container.querySelector('[data-exiting]')?.hasAttribute('inert')).toBe(
    true,
  )
})
