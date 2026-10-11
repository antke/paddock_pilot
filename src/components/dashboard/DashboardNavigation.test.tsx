// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppDashboardNavigation } from './AppDashboardNavigation'
import {
  DashboardNavigation,
  DashboardNavigationLinkItem,
  DashboardNavigationMenuGroup,
  DashboardNavigationMenuLink,
} from './DashboardNavigation'
import { HorseDetailSectionTabs } from '#/components/horses/HorseDetailSectionTabs'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
const items = [
  {
    id: 'upcoming',
    label: 'Upcoming',
    title: 'Upcoming activity',
    description: 'Future visits.',
  },
  {
    id: 'history',
    label: 'History',
    title: 'Activity history',
    description: 'Earlier visits.',
  },
]
function SectionSample() {
  const [active, setActive] = useState('upcoming')
  return (
    <HorseDetailSectionTabs
      activeId={active}
      items={items}
      onSelect={setActive}
    >
      <p>
        {active === 'upcoming' ? 'Future sample visit' : 'Past sample visit'}
      </p>
    </HorseDetailSectionTabs>
  )
}
describe('shared dashboard navigation contracts', () => {
  it('reveals the active destination on entry, navigation and resize without moving focus or the page', async () => {
    const pageScroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const rect = (left: number, width: number) => ({
      left,
      right: left + width,
      width,
      top: 0,
      bottom: 44,
      height: 44,
      x: left,
      y: 0,
      toJSON() {},
    })
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(
      function (this: HTMLElement) {
        return this.dataset.slot === 'navigation-menu-list' ? 240 : 0
      },
    )
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(
      function (this: HTMLElement) {
        return this.dataset.slot === 'navigation-menu-list' ? 620 : 0
      },
    )
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        if (this.dataset.slot === 'navigation-menu-list') return rect(100, 240)
        const list = this.closest<HTMLElement>(
          '[data-slot="navigation-menu-list"]',
        )
        if (!list || this.dataset.testid === 'hidden-current') return rect(0, 0)
        const offset =
          this.textContent === 'Profile'
            ? 0
            : this.textContent === 'Nutrition'
              ? 380
              : 520
        return rect(100 + offset - list.scrollLeft, 100)
      },
    )
    function Sample({
      active,
    }: {
      active: 'profile' | 'nutrition' | 'summary'
    }) {
      return (
        <>
          <button>Other control</button>
          <DashboardNavigation ariaLabel="Horse sections" overflow="scroll">
            <DashboardNavigationLinkItem
              href="/profile"
              active={active === 'profile'}
            >
              Profile
            </DashboardNavigationLinkItem>
            <DashboardNavigationLinkItem
              href="/nutrition"
              active={active === 'nutrition'}
            >
              Nutrition
            </DashboardNavigationLinkItem>
            <DashboardNavigationLinkItem
              href="/summary"
              data-testid="hidden-current"
              active={active === 'summary'}
            >
              Care summary
            </DashboardNavigationLinkItem>
            <DashboardNavigationMenuGroup
              label="More"
              active={active === 'summary'}
            >
              <DashboardNavigationMenuLink
                href="/summary"
                active={active === 'summary'}
              >
                Care summary
              </DashboardNavigationMenuLink>
            </DashboardNavigationMenuGroup>
          </DashboardNavigation>
        </>
      )
    }
    const { rerender } = render(<Sample active="nutrition" />)
    const list = screen.getByRole('list')
    const nutrition = screen.getByRole('link', { name: 'Nutrition' })
    const isVisible = (element: HTMLElement) =>
      element.getBoundingClientRect().left >= 100 &&
      element.getBoundingClientRect().right <= 340
    expect(isVisible(nutrition)).toBe(true)
    const other = screen.getByRole('button', { name: 'Other control' })
    act(() => other.focus())
    rerender(<Sample active="profile" />)
    await waitFor(() => expect(list.scrollLeft).toBe(0))
    rerender(<Sample active="summary" />)
    const more = screen.getByRole('button', { name: 'More' })
    await waitFor(() => expect(isVisible(more)).toBe(true))
    list.scrollLeft = 0
    fireEvent(window, new Event('resize'))
    expect(isVisible(more)).toBe(true)
    expect(document.activeElement).toBe(other)
    expect(pageScroll).not.toHaveBeenCalled()
  })
  it('keeps control and content IDs unique when multiple section groups share a page', () => {
    render(
      <>
        <SectionSample />
        <SectionSample />
      </>,
    )
    const regions = screen.getAllByRole('tabpanel', { name: 'Upcoming' })
    expect(new Set(regions.map((region) => region.id)).size).toBe(2)
    for (const region of regions) {
      const control = document.getElementById(
        region.getAttribute('aria-labelledby')!,
      )
      expect(control?.getAttribute('aria-controls')).toBe(region.id)
      expect(control?.getAttribute('aria-selected')).toBe('true')
    }
  })
  it('associates section tabs with a named panel and keeps the group name stable', async () => {
    render(<SectionSample />)
    const group = screen.getByRole('tablist', { name: 'Horse section views' })
    const upcoming = within(group).getByRole('tab', { name: 'Upcoming' })
    expect(upcoming.getAttribute('aria-selected')).toBe('true')
    const region = screen.getByRole('tabpanel', { name: 'Upcoming' })
    expect(upcoming.getAttribute('aria-controls')).toBe(region.id)
    act(() => upcoming.focus())
    fireEvent.keyDown(upcoming, { key: 'ArrowRight' })
    const history = within(group).getByRole('tab', { name: 'History' })
    await waitFor(() => expect(document.activeElement).toBe(history))
    expect(upcoming.getAttribute('aria-selected')).toBe('false')
    // Tabs activate on keyboard focus, matching the production Base UI contract.
    expect(history.getAttribute('aria-selected')).toBe('true')
    expect(
      screen.getByRole('tabpanel', { name: 'History' }).textContent,
    ).toContain('Past sample visit')
    expect(screen.getByRole('tablist', { name: 'Horse section views' })).toBe(
      group,
    )
  })
  it('keeps peer route destinations real links and exposes only the current page', () => {
    render(
      <DashboardNavigation ariaLabel="Horse sections" overflow="scroll">
        <DashboardNavigationLinkItem href="/profile" active>
          Profile
        </DashboardNavigationLinkItem>
        <DashboardNavigationLinkItem href="/care">
          Care
        </DashboardNavigationLinkItem>
      </DashboardNavigation>,
    )
    const current = screen.getByRole('link', { name: 'Profile' })
    expect(current.getAttribute('href')).toBe('/profile')
    expect(current.getAttribute('aria-current')).toBe('page')
    expect(
      screen.getByRole('link', { name: 'Care' }).getAttribute('aria-current'),
    ).toBeNull()
  })
  it('names the stable selector and exposes selected button state while preserving selection callbacks', async () => {
    const data = createDashboardLabFixtureData()
    const select = vi.fn()
    render(
      <AppDashboardNavigation
        stables={data.stables}
        activeStableId={data.stable._id}
        onActiveStableChange={select}
      />,
    )
    const nav = screen.getByRole('navigation', { name: 'Stable selection' })
    fireEvent.click(within(nav).getByRole('button', { name: data.stable.name }))
    const current = await screen.findByRole('button', {
      pressed: true,
    })
    expect(current.textContent).toContain(data.stable.name)
    expect(current.getAttribute('aria-pressed')).toBe('true')
    const nextStable = data.stables.find(
      (stable) => stable._id !== data.stable._id,
    )!
    const next = screen.getByRole('button', { name: nextStable.name })
    expect(next.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(next)
    expect(select).toHaveBeenCalledExactlyOnceWith(nextStable._id)
  })
  it('marks the selected nested destination, not its disclosure button, as current', async () => {
    render(
      <DashboardNavigation ariaLabel="Horse sections">
        <DashboardNavigationMenuGroup label="More" active>
          <DashboardNavigationMenuLink href="/timeline" active>
            Timeline
          </DashboardNavigationMenuLink>
        </DashboardNavigationMenuGroup>
      </DashboardNavigation>,
    )
    const trigger = screen.getByRole('button', { name: 'More' })
    expect(trigger.getAttribute('aria-current')).toBeNull()
    fireEvent.click(trigger)
    const link = await screen.findByRole('link', { name: 'Timeline' })
    expect(link.getAttribute('aria-current')).toBe('page')
    expect(link.getAttribute('href')).toBe('/timeline')
  })
})
