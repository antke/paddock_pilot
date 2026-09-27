// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useMutation } from 'convex/react'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import { HorseRecordsPageLab } from './HorseRecordsPageLab'

vi.mock('#/lib/devAuthBypass', () => ({ useDevAuthBypassEnabled: () => true }))
vi.mock('convex/react', () => ({
  useMutation: vi.fn(() => {
    throw new Error('Horse samples must never mount a live mutation')
  }),
}))
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('actual horse record section samples', () => {
  it('mounts every actual subsection and its header action without connected mutation hooks', async () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    const root = createRootRoute({
      component: () => (
        <HorseRecordsPageLab data={createDashboardLabFixtureData()} />
      ),
    })
    const router = createRouter({
      routeTree: root,
      history: createMemoryHistory({ initialEntries: ['/'] }),
    })
    await router.load()
    render(<RouterProvider router={router} />)
    await screen.findByRole('heading', { name: 'Care reminders', level: 2 })
    expect(
      await screen.findAllByRole('button', { name: 'Add reminder' }),
    ).not.toHaveLength(0)
    fireEvent.click(screen.getByRole('button', { name: 'Health issues' }))
    expect(
      await screen.findByRole('heading', { name: 'Health issues', level: 2 }),
    ).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Sample section'), {
      target: { value: 'nutrition' },
    })
    expect(
      await screen.findByRole('heading', { name: 'Nutrition', level: 2 }),
    ).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Weight' }))
    expect(
      await screen.findByRole('heading', { name: 'Weight', level: 2 }),
    ).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Medication' }))
    expect(
      await screen.findByRole('heading', { name: 'Medication', level: 2 }),
    ).toBeTruthy()
    expect(useMutation).not.toHaveBeenCalled()
  })
})
