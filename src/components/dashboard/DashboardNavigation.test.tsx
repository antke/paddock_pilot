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

afterEach(cleanup)
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
  it('keeps control and content IDs unique when multiple section groups share a page', () => {
    render(
      <>
        <SectionSample />
        <SectionSample />
      </>,
    )
    const regions = screen.getAllByRole('region', { name: 'Upcoming' })
    expect(new Set(regions.map((region) => region.id)).size).toBe(2)
    for (const region of regions) {
      const control = document.getElementById(
        region.getAttribute('aria-labelledby')!,
      )
      expect(control?.getAttribute('aria-controls')).toBe(region.id)
      expect(control?.getAttribute('aria-pressed')).toBe('true')
    }
  })
  it('associates section buttons with a named content region and keeps the group name stable', async () => {
    render(<SectionSample />)
    const group = screen.getByRole('group', { name: 'Horse section views' })
    const upcoming = within(group).getByRole('button', { name: 'Upcoming' })
    expect(upcoming.getAttribute('aria-pressed')).toBe('true')
    const region = screen.getByRole('region', { name: 'Upcoming' })
    expect(upcoming.getAttribute('aria-controls')).toBe(region.id)
    act(() => upcoming.focus())
    fireEvent.keyDown(upcoming, { key: 'ArrowRight' })
    const history = within(group).getByRole('button', { name: 'History' })
    await waitFor(() => expect(document.activeElement).toBe(history))
    expect(upcoming.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(history)
    expect(history.getAttribute('aria-pressed')).toBe('true')
    expect(
      screen.getByRole('region', { name: 'History' }).textContent,
    ).toContain('Past sample visit')
    expect(screen.getByRole('group', { name: 'Horse section views' })).toBe(
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
