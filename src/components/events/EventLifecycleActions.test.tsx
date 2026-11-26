// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { Id } from 'convex/_generated/dataModel'
import { EventLifecycleActions } from './EventLifecycleActions'

const mutate = vi.hoisted(() => vi.fn(async () => undefined))
vi.mock('convex/react', () => ({ useMutation: () => mutate }))
vi.mock('@tanstack/react-router', async (actual) => ({
  ...(await actual<object>()),
  useNavigate: () => vi.fn(),
}))
afterEach(() => {
  cleanup()
  mutate.mockClear()
})

it('explains why an event with history can’t be deleted and cancels it instead', async () => {
  render(
    <EventLifecycleActions
      eventId={'event' as Id<'events'>}
      title="Farrier"
      cancelled={false}
      canDelete={false}
      training={false}
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'More actions' }))
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Delete event' }))
  const dialog = await screen.findByRole('alertdialog')
  expect(dialog.textContent).toContain('You can’t delete Farrier')
  fireEvent.click(screen.getByRole('button', { name: 'Cancel event' }))
  await vi.waitFor(() =>
    expect(mutate).toHaveBeenCalledWith({ id: 'event', cancelled: true }),
  )
})

it('sets a status in place from Change status, confirming only a cancel', async () => {
  render(
    <EventLifecycleActions
      eventId={'event' as Id<'events'>}
      title="Farrier"
      cancelled={false}
      status="planned"
      training={false}
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Change status' }))
  fireEvent.click(
    await screen.findByRole('menuitemradio', { name: 'Completed' }),
  )
  await vi.waitFor(() =>
    expect(mutate).toHaveBeenCalledWith({ id: 'event', completed: true }),
  )
  mutate.mockClear()
  // Cancel and restore move to the status menu, so "…" doesn't repeat them.
  fireEvent.click(screen.getByRole('button', { name: 'More actions' }))
  expect(screen.queryByRole('menuitem', { name: 'Cancel event' })).toBeNull()
  fireEvent.keyDown(document.activeElement!, { key: 'Escape' })
  fireEvent.click(screen.getByRole('button', { name: 'Change status' }))
  fireEvent.click(
    await screen.findByRole('menuitemradio', { name: 'Cancelled' }),
  )
  expect(await screen.findByRole('alertdialog')).toBeTruthy()
  expect(mutate).not.toHaveBeenCalled()
})

it('reopens a cancelled event as completed in two steps', async () => {
  render(
    <EventLifecycleActions
      eventId={'event' as Id<'events'>}
      title="Farrier"
      cancelled
      status="cancelled"
      training={false}
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Change status' }))
  fireEvent.click(
    await screen.findByRole('menuitemradio', { name: 'Completed' }),
  )
  await vi.waitFor(() =>
    expect(mutate.mock.calls).toEqual([
      [{ id: 'event', cancelled: false }],
      [{ id: 'event', completed: true }],
    ]),
  )
})
