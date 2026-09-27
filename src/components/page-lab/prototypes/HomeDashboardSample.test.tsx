// @vitest-environment jsdom
import { useState } from 'react'
import type { ReactNode } from 'react'
import {
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
import { afterEach, expect, it, vi } from 'vitest'
import { useMutation } from 'convex/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import { StableDashboardPageLab } from './StableDashboardPageLab'
import { HomeDashboardSample } from './HomeDashboardSample'

vi.mock('#/lib/devAuthBypass', () => ({
  useDevAuthBypassEnabled: vi.fn(() => true),
}))
vi.mock('convex/react', () => ({
  useMutation: vi.fn(() => {
    throw new Error('No live mutation in home sample')
  }),
}))
vi.mock('@tanstack/react-query', () => ({
  useSuspenseQuery: vi.fn(() => {
    throw new Error('No live query in home sample')
  }),
}))
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.mocked(useDevAuthBypassEnabled).mockReturnValue(true)
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

it('offers actual combined home with local failure/retry through the existing dashboard registration', async () => {
  await open(() => (
    <StableDashboardPageLab data={createDashboardLabFixtureData()} />
  ))
  fireEvent.change(await screen.findByLabelText('Preview composition'), {
    target: { value: 'home' },
  })
  expect(
    screen.getByRole('heading', { level: 1, name: 'Cedar Ridge Barn' }),
  ).toBeTruthy()
  fireEvent.change(screen.getByLabelText('Next sample invitation result'), {
    target: { value: 'failure' },
  })
  const region = screen.getByRole('region', { name: 'Horse invitations' })
  const first = within(region).getAllByRole('button', {
    name: /^Decline invitation/,
  })[0]
  fireEvent.click(first)
  await within(region).findByText(/Could not decline this invitation/)
  expect(within(region).getAllByRole('listitem')).toHaveLength(2)
  fireEvent.click(
    within(region).getAllByRole('button', { name: /^Decline invitation/ })[0],
  )
  await waitFor(() =>
    expect(within(region).getAllByRole('listitem')).toHaveLength(1),
  )
  expect(within(region).getByRole('status').textContent).toContain(
    'was declined',
  )
  fireEvent.change(screen.getByLabelText('Sample home state'), {
    target: { value: 'empty-invitations' },
  })
  expect(screen.queryByRole('region', { name: 'Horse invitations' })).toBeNull()
  fireEvent.change(screen.getByLabelText('Sample home state'), {
    target: { value: 'no-stables' },
  })
  expect(
    screen.getByText(
      /normal signed-in home route sends an account without stables to onboarding/,
    ),
  ).toBeTruthy()
  expect(
    screen.getByRole('link', { name: 'Get started' }).getAttribute('href'),
  ).toBe('/onboarding')
  expect(useMutation).not.toHaveBeenCalled()
  expect(useSuspenseQuery).not.toHaveBeenCalled()
})

it('switches local stable data during a pending response without retaining the previous row state', async () => {
  const first = createDashboardLabFixtureData()
  function Harness() {
    const [data, setData] = useState(first)
    return (
      <>
        <button
          onClick={() =>
            setData(createDashboardLabFixtureData(first.stables[1]._id))
          }
        >
          Change fixture stable
        </button>
        <HomeDashboardSample data={data} />
      </>
    )
  }
  await open(Harness)
  fireEvent.change(await screen.findByLabelText('Invitation response time'), {
    target: { value: '3000' },
  })
  fireEvent.click(
    screen.getAllByRole('button', { name: /^Approve invitation/ })[0],
  )
  expect(
    screen.getByRole<HTMLButtonElement>('button', {
      name: /^Approving invitation/,
    }).disabled,
  ).toBe(true)
  fireEvent.click(screen.getByRole('button', { name: 'Change fixture stable' }))
  expect(
    screen.getByRole('heading', { level: 1, name: 'North Pasture Annex' }),
  ).toBeTruthy()
  const region = screen.getByRole('region', { name: 'Horse invitations' })
  expect(within(region).getAllByRole('listitem')).toHaveLength(1)
  expect(
    within(region).getByRole<HTMLButtonElement>('button', {
      name: /^Approve invitation/,
    }).disabled,
  ).toBe(false)
  expect(within(region).getByRole('status').textContent).toBe('')
  expect(useMutation).not.toHaveBeenCalled()
  expect(useSuspenseQuery).not.toHaveBeenCalled()
})

it('does not mount a simulated home outside development fixture mode', () => {
  vi.mocked(useDevAuthBypassEnabled).mockReturnValue(false)
  render(<HomeDashboardSample data={createDashboardLabFixtureData()} />)
  expect(
    screen.getByText(/available only with development sample data/),
  ).toBeTruthy()
  expect(screen.queryByText('Cedar Ridge Barn')).toBeNull()
  expect(useMutation).not.toHaveBeenCalled()
  expect(useSuspenseQuery).not.toHaveBeenCalled()
})
