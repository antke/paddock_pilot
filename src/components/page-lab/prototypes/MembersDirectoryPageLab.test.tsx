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
import { MembersDirectoryPageLab } from './MembersDirectoryPageLab'

vi.mock('convex/react', () => ({
  useMutation: vi.fn(() => {
    throw new Error('Directory samples must not mount live mutations')
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
      <MembersDirectoryPageLab data={createDashboardLabFixtureData()} />
    ),
  })
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
  await screen.findByLabelText('Sample directory')
}
describe('member directory sample', () => {
  it('moves focus into profile editing and returns it after cancellation', async () => {
    await openSample()
    const edit = screen.getByRole('button', { name: 'Edit details' })
    expect(document.activeElement).not.toBe(edit)
    fireEvent.click(edit)
    const name = screen.getByRole<HTMLInputElement>('textbox', {
      name: 'Yard display name',
    })
    expect(document.activeElement).toBe(name)
    fireEvent.change(name, { target: { value: 'Unsaved nickname' } })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Edit details' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Edit details' }))
    expect(
      screen.getByRole<HTMLInputElement>('textbox', {
        name: 'Yard display name',
      }).value,
    ).toBe('Alex Morgan')
    expect(useMutation).not.toHaveBeenCalled()
  })
  it('retains failed edits and updates the profile only after acknowledged retry', async () => {
    await openSample()
    fireEvent.change(screen.getByLabelText('Next sample save'), {
      target: { value: 'failure' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Edit details' }))
    const name = screen.getByRole<HTMLInputElement>('textbox', {
      name: 'Yard display name',
    })
    fireEvent.change(name, { target: { value: 'Sample new name' } })
    fireEvent.submit(name.closest('form')!)
    await waitFor(() =>
      expect(
        screen.getByRole<HTMLButtonElement>('button', { name: 'Saving...' })
          .disabled,
      ).toBe(true),
    )
    await waitFor(
      () =>
        expect(screen.getByRole('status').textContent).toContain(
          'Sample request failed',
        ),
      { timeout: 2500 },
    )
    expect(name.value).toBe('Sample new name')
    fireEvent.submit(name.closest('form')!)
    await waitFor(
      () =>
        expect(screen.getByRole('status').textContent).toContain(
          'Profile updated locally',
        ),
      { timeout: 2500 },
    )
    expect(
      screen.queryByRole('textbox', { name: 'Yard display name' }),
    ).toBeNull()
    // The acknowledged view commits before its focus-restoration effect runs.
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'Edit details' }),
      ),
    )
    expect(screen.getAllByText('Sample new name').length).toBeGreaterThan(0)
  })
})
