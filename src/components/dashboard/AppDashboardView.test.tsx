// @vitest-environment jsdom
import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import { createHorseInvitationSamples } from '#/components/page-lab/prototypes/HorseInvitationsPageLab'
import { AppDashboardView } from './AppDashboardView'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
async function open(component: () => ReactNode) {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
  const root = createRootRoute({ component })
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
}
const primary = createDashboardLabFixtureData()
const secondary = createDashboardLabFixtureData(primary.stables[1]._id)
const invitations = createHorseInvitationSamples(primary).map(
  (item, index) => ({
    ...item,
    event: item.event
      ? {
          ...item.event,
          stableId: index === 2 ? secondary.stable._id : primary.stable._id,
        }
      : null,
  }),
)
const approve = vi.fn().mockResolvedValue(undefined)
const decline = vi.fn().mockResolvedValue(undefined)

describe('actual signed-in dashboard composition', () => {
  it('renders the command center and only invitations for the active stable', async () => {
    await open(() => (
      <AppDashboardView
        data={primary}
        invitations={invitations}
        onApprove={approve}
        onDecline={decline}
      />
    ))
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: primary.stable.name,
      }),
    ).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Today' })).toBeTruthy()
    const region = screen.getByRole('region', { name: 'Horse invitations' })
    expect(within(region).getAllByRole('listitem')).toHaveLength(2)
    expect(within(region).queryByText(invitations[2].event!.title)).toBeNull()
    const first = within(region).getAllByRole('button', {
      name: /^Approve invitation/,
    })[0]
    fireEvent.click(first)
    await waitFor(() =>
      expect(approve).toHaveBeenCalledWith(invitations[0].invitation._id),
    )
  })

  it('does not transfer pending or acknowledged row state to a different stable', async () => {
    let acknowledge!: () => void
    const request = new Promise<void>((resolve) => {
      acknowledge = resolve
    })
    const delayedApprove = vi.fn(() => request)
    function Harness() {
      const [data, setData] = useState(primary)
      return (
        <>
          <button onClick={() => setData(secondary)}>
            Switch sample stable
          </button>
          <AppDashboardView
            data={data}
            invitations={invitations}
            onApprove={delayedApprove}
            onDecline={decline}
          />
        </>
      )
    }
    await open(Harness)
    const first = (
      await screen.findAllByRole('button', { name: /^Approve invitation/ })
    )[0]
    fireEvent.click(first)
    expect(delayedApprove).toHaveBeenCalledTimes(1)
    expect(
      screen.getByRole<HTMLButtonElement>('button', {
        name: /^Approving invitation/,
      }).disabled,
    ).toBe(true)
    fireEvent.click(
      screen.getByRole('button', { name: 'Switch sample stable' }),
    )
    expect(
      screen.getByRole('heading', { level: 1, name: secondary.stable.name }),
    ).toBeTruthy()
    const region = screen.getByRole('region', { name: 'Horse invitations' })
    expect(within(region).getAllByRole('listitem')).toHaveLength(1)
    expect(
      within(region).getByRole<HTMLButtonElement>('button', {
        name: /^Approve invitation/,
      }).disabled,
    ).toBe(false)
    await act(async () => acknowledge())
    expect(within(region).getAllByRole('listitem')).toHaveLength(1)
    expect(within(region).getByRole('status').textContent).toBe('')
  })

  it('omits an initially empty invitation area without replacing the dashboard', async () => {
    await open(() => (
      <AppDashboardView
        data={primary}
        invitations={[]}
        onApprove={approve}
        onDecline={decline}
      />
    ))
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: primary.stable.name,
      }),
    ).toBeTruthy()
    expect(
      screen.queryByRole('region', { name: 'Horse invitations' }),
    ).toBeNull()
  })

  it('uses the existing no-stables fallback and onboarding destination', async () => {
    await open(() => <AppDashboardView />)
    expect(await screen.findByText('No stables yet')).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Get started' }).getAttribute('href'),
    ).toBe('/onboarding')
    expect(
      screen.queryByRole('region', { name: 'Horse invitations' }),
    ).toBeNull()
  })
})
