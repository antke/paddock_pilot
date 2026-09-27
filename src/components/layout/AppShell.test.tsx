// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ActiveStableNavigation, HeaderView } from '#/components/Header'
import { StableSwitcherView } from '#/integrations/clerk/header-user'
import { AppHeader, AppMain, AppSkipLink } from './AppShell'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('application shell access', () => {
  it('skips repeated navigation and focuses the main content without adding a regular tab stop', () => {
    const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    render(
      <>
        <AppSkipLink />
        <nav>
          <button>Repeated navigation</button>
        </nav>
        <AppMain>
          <h1>Care records</h1>
        </AppMain>
      </>,
    )
    fireEvent.click(screen.getByRole('link', { name: 'Skip to content' }))
    expect(document.activeElement).toBe(screen.getByRole('main'))
    expect(screen.getByRole('main').tabIndex).toBe(-1)
    expect(scroll).toHaveBeenCalledWith({ behavior: 'instant', top: 0 })
  })

  it('keeps the skip link out of the shell grid until focus', () => {
    render(<AppSkipLink />)
    const classes = screen
      .getByRole('link', { name: 'Skip to content' })
      .className.split(' ')
    expect(classes).toContain('absolute')
    expect(classes).not.toContain('relative')
    expect(classes).toContain('sr-only')
    expect(classes).toContain('focus:fixed')
  })

  it('measures sticky headers, updates on resize, and clears its observer and root clearance', () => {
    let height = 117.2
    let resized = () => {}
    const observe = vi.fn()
    const disconnect = vi.fn()
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          resized = callback
        }
        observe = observe
        disconnect = disconnect
      },
    )
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      () => new DOMRect(0, 0, 500, height),
    )
    const headerRef = { current: null as HTMLElement | null }
    const view = render(<AppHeader ref={headerRef}>Navigation</AppHeader>)
    expect(headerRef.current).toBe(screen.getByRole('banner'))
    expect(observe).toHaveBeenCalledWith(headerRef.current)
    expect(
      document.documentElement.style.getPropertyValue(
        '--app-header-scroll-clearance',
      ),
    ).toBe('calc(118px + 1rem)')
    height = 164
    act(() => resized())
    expect(
      document.documentElement.style.getPropertyValue(
        '--app-header-scroll-clearance',
      ),
    ).toBe('calc(164px + 1rem)')
    view.unmount()
    expect(disconnect).toHaveBeenCalledTimes(1)
    expect(
      document.documentElement.style.getPropertyValue(
        '--app-header-scroll-clearance',
      ),
    ).toBe('')
    act(() => resized())
    expect(
      document.documentElement.style.getPropertyValue(
        '--app-header-scroll-clearance',
      ),
    ).toBe('')
  })

  it('ignores static specimens and restores prior clearance when a header stops being sticky', () => {
    document.documentElement.style.setProperty(
      '--app-header-scroll-clearance',
      '2rem',
    )
    const measure = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(0, 0, 500, 90))
    const view = render(
      <AppHeader position="static">Static specimen</AppHeader>,
    )
    expect(measure).not.toHaveBeenCalled()
    expect(
      document.documentElement.style.getPropertyValue(
        '--app-header-scroll-clearance',
      ),
    ).toBe('2rem')
    view.rerender(<AppHeader position="sticky">Application header</AppHeader>)
    expect(
      document.documentElement.style.getPropertyValue(
        '--app-header-scroll-clearance',
      ),
    ).toBe('calc(90px + 1rem)')
    view.rerender(<AppHeader position="static">Static specimen</AppHeader>)
    expect(
      document.documentElement.style.getPropertyValue(
        '--app-header-scroll-clearance',
      ),
    ).toBe('2rem')
    view.unmount()
    document.documentElement.style.removeProperty(
      '--app-header-scroll-clearance',
    )
  })

  it('keeps a surviving sticky header clearance when another instance unmounts', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        return new DOMRect(
          0,
          0,
          500,
          this.textContent === 'Tall header' ? 150 : 80,
        )
      },
    )
    const first = render(<AppHeader>Tall header</AppHeader>)
    const second = render(<AppHeader>Short header</AppHeader>)
    expect(
      document.documentElement.style.getPropertyValue(
        '--app-header-scroll-clearance',
      ),
    ).toBe('calc(150px + 1rem)')
    first.unmount()
    expect(
      document.documentElement.style.getPropertyValue(
        '--app-header-scroll-clearance',
      ),
    ).toBe('calc(80px + 1rem)')
    second.unmount()
    expect(
      document.documentElement.style.getPropertyValue(
        '--app-header-scroll-clearance',
      ),
    ).toBe('')
  })

  it('uses the measured sticky height and rem gap for skip navigation, ignoring static specimens', () => {
    const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    document.documentElement.style.fontSize = '20px'
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        return this.tagName === 'MAIN'
          ? new DOMRect(0, 300, 500, 600)
          : new DOMRect(
              0,
              0,
              500,
              this.textContent === 'Static specimen' ? 900 : 117,
            )
      },
    )
    render(
      <>
        <AppHeader position="static">Static specimen</AppHeader>
        <AppHeader>Application header</AppHeader>
        <AppSkipLink />
        <AppMain>Page content</AppMain>
      </>,
    )
    fireEvent.click(screen.getByRole('link', { name: 'Skip to content' }))
    expect(scroll).toHaveBeenCalledWith({ top: 163, behavior: 'instant' })
    expect(document.activeElement).toBe(screen.getByRole('main'))
    document.documentElement.style.removeProperty('font-size')
  })

  it('merges Calendar into Events and keeps Events active on legacy calendar routes', async () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const root = createRootRoute({
      component: () => (
        <HeaderView
          navigation={
            <ActiveStableNavigation
              stableId="sample-stable"
              pathname="/stables/sample-stable/events/calendar"
            />
          }
          accountActions={<button>Sample account</button>}
        />
      ),
    })
    const router = createRouter({
      routeTree: root,
      history: createMemoryHistory({ initialEntries: ['/'] }),
    })
    await router.load()
    render(<RouterProvider router={router} />)
    const nav = await screen.findByRole('navigation', {
      name: 'Primary navigation',
    })
    for (const name of [
      'Home',
      'Horses',
      'Care',
      'Events',
      'Documents',
      'Analysis',
    ])
      expect(within(nav).getByRole('link', { name })).toBeTruthy()
    expect(within(nav).queryByRole('link', { name: 'Calendar' })).toBeNull()
    expect(
      within(nav)
        .getByRole('link', { name: 'Events' })
        .getAttribute('aria-current'),
    ).toBe('page')
    expect(
      within(nav).getByRole('link', { name: 'Horses' }).getAttribute('href'),
    ).toBe('/stables/sample-stable/horses')
  })

  it.each([true, false])(
    'keeps stable selection and owner-only menu actions separate (owner %s)',
    async (canManage) => {
      const change = vi.fn()
      const open = vi.fn()
      render(
        <StableSwitcherView
          stables={[
            { _id: 'first', name: 'Long sample stable name' },
            { _id: 'second', name: 'North Annex' },
          ]}
          activeStableId="first"
          onStableChange={change}
          onOpen={open}
          canManage={canManage}
        />,
      )
      fireEvent.click(
        screen.getByRole('button', {
          name: 'Active stable: Long sample stable name',
        }),
      )
      expect(
        await screen.findByRole('menuitemradio', { name: 'North Annex' }),
      ).toBeTruthy()
      expect(
        !!screen.queryByRole('menuitem', { name: 'Stable settings' }),
      ).toBe(canManage)
      fireEvent.click(
        screen.getByRole('menuitemradio', { name: 'North Annex' }),
      )
      expect(change.mock.calls.map(([id]) => id)).toEqual(['second'])
      expect(open).not.toHaveBeenCalled()
    },
  )
})
