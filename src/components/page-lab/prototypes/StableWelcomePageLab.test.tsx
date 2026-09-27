// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useMutation } from 'convex/react'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import { StableWelcomePageLab } from './StableWelcomePageLab'

vi.mock('convex/react', () => ({
  useMutation: vi.fn(() => {
    throw new Error('Live mutations must not be mounted in welcome samples')
  }),
}))
beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

async function openSample() {
  const root = createRootRoute({
    component: () => (
      <StableWelcomePageLab data={createDashboardLabFixtureData()} />
    ),
  })
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
  await screen.findByLabelText('Sample welcome state')
}

describe('stable welcome sample', () => {
  it('exposes individual setup completion and accurate progress for owner scenarios', async () => {
    await openSample()
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe(
      '2',
    )
    expect(
      screen.getByRole('listitem', { name: 'Add the first horse: Complete' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('listitem', {
        name: 'Invite the first member: Not complete',
      }),
    ).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Sample welcome state'), {
      target: { value: 'owner-ready' },
    })
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe(
      '4',
    )
    fireEvent.change(screen.getByLabelText('Sample welcome state'), {
      target: { value: 'owner-new' },
    })
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe(
      '0',
    )
  })

  it('keeps failed member entries and updates completion only after a successful local save', async () => {
    await openSample()
    fireEvent.change(screen.getByLabelText('Sample welcome state'), {
      target: { value: 'member-new' },
    })
    fireEvent.change(screen.getByLabelText('Next sample save'), {
      target: { value: 'failure' },
    })
    const phone = screen.getByLabelText<HTMLInputElement>('Phone', {
      exact: true,
    })
    fireEvent.change(phone, { target: { value: '(555) 010-2000' } })
    fireEvent.change(
      screen.getByLabelText('Emergency contact', { exact: true }),
      { target: { value: 'Sam, (555) 010-2001' } },
    )
    fireEvent.submit(phone.closest('form')!)
    await waitFor(() =>
      expect(screen.getByText('Sample save failed')).toBeTruthy(),
    )
    expect(phone.value).toBe('(555) 010-2000')
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe(
      '0',
    )
    fireEvent.submit(phone.closest('form')!)
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain(
        'Member details applied locally',
      ),
    )
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe(
      '1',
    )
    expect(
      screen.getByRole('listitem', {
        name: 'Complete your yard profile: Complete',
      }),
    ).toBeTruthy()
    expect(screen.queryByLabelText('Phone', { exact: true })).toBeNull()
    expect(useMutation).not.toHaveBeenCalled()
  })
})
