// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PricingPageView } from './PricingPageView'
import { getInvitationReturnPath } from './invitationReturnPath'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
async function show(enabled: boolean, returnTo?: string) {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  const root = createRootRoute({
    component: () => (
      <PricingPageView
        billingEnabled={enabled}
        returnTo={returnTo}
        renderPricingTable={(attempt) => {
          if (attempt === 0) throw new Error('Sample unavailable')
          return <div>Recovered sample table</div>
        }}
      />
    ),
  })
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
}
describe('pricing states and local return', () => {
  it('allows only local invitation token paths, rejecting protocol and normalization tricks', () => {
    expect(getInvitationReturnPath('/invitations/abc-123_DEF')).toBe(
      '/invitations/abc-123_DEF',
    )
    for (const path of [
      '//example.com',
      '/\\example.com',
      'https://example.com',
      '/invitations/../profile',
      '/invitations/%2f%2fevil',
      '/invitations/token?returnTo=//evil',
      '/profile',
      '/invitations/token#x',
      null,
      123,
    ])
      expect(getInvitationReturnPath(path)).toBeUndefined()
  })
  it('keeps configured testing access distinct from a failed enabled widget and retries the real boundary', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    await show(false, '//example.com')
    expect(await screen.findByText('Testing access')).toBeTruthy()
    expect(
      screen.queryByRole('link', { name: 'Return to invitation' }),
    ).toBeNull()
    cleanup()
    await show(true, '/invitations/sample-token')
    expect(await screen.findByText('Plans couldn’t load')).toBeTruthy()
    expect(screen.queryByText('Testing access')).toBeNull()
    expect(screen.queryByText(/Testers can use every current/)).toBeNull()
    expect(
      screen
        .getByRole('link', { name: 'Return to invitation' })
        .getAttribute('href'),
    ).toBe('/invitations/sample-token')
    fireEvent.click(screen.getByRole('button', { name: 'Retry loading plans' }))
    expect(await screen.findByText('Recovered sample table')).toBeTruthy()
  })
})
