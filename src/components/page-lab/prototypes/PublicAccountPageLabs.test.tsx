// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { ProfilePageLab } from './ProfilePageLab'
import { PricingPageLab } from './PricingPageLab'

vi.mock('#/lib/devAuthBypass', () => ({ useDevAuthBypassEnabled: () => true }))
vi.mock('convex/react', () => ({
  useMutation: () => {
    throw new Error('No live hook may mount in account samples')
  },
}))
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
async function show(child: ReactNode) {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  const root = createRootRoute({ component: () => child })
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
}
describe('local public and account samples', () => {
  it('saves a profile locally through the actual form with failure recovery and no fetch', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch')
    await show(<ProfilePageLab />)
    const name = await screen.findByLabelText('Preferred name')
    fireEvent.change(screen.getByLabelText('Next sample save'), {
      target: { value: 'failure' },
    })
    fireEvent.change(name, { target: { value: 'Sample updated rider' } })
    fireEvent.submit(name.closest('form')!)
    expect(await screen.findByText(/Could not save your profile/)).toBeTruthy()
    fireEvent.submit(name.closest('form')!)
    expect(
      await screen.findByText(
        'Sample profile acknowledged and continuation finished. No live data changed.',
      ),
    ).toBeTruthy()
    expect(fetch).not.toHaveBeenCalled()
  })
  it('exercises a real throwing boundary locally without a billing provider', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    await show(<PricingPageLab />)
    fireEvent.change(await screen.findByLabelText('Sample pricing state'), {
      target: { value: 'unavailable' },
    })
    expect(await screen.findByText('Plans couldn’t load')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Retry loading plans' }))
    expect(await screen.findByText('Sample plan table area')).toBeTruthy()
    expect(document.activeElement).toBe(
      screen.getByRole('region', { name: 'Plan options' }),
    )
  })
})
