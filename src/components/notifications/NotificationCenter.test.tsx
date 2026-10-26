// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { FunctionReturnType } from 'convex/server'
import type * as RouterModule from '@tanstack/react-router'
import type { api } from 'convex/_generated/api'
import { NotificationCenterView } from './NotificationCenter'

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof RouterModule>()),
  Link: ({ to, children, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))
afterEach(cleanup)
const items: FunctionReturnType<typeof api.notifications.list> = [
  {
    key: 'invite',
    kind: 'horse_carer',
    name: 'Maple',
    context: 'viewer',
    href: '/horse-invitations/token',
    createdAt: 1790000000000,
    actionRequired: true,
    read: false,
  },
  {
    key: 'update',
    kind: 'sharing_complete',
    name: 'Willow',
    createdAt: 1790000000000,
    actionRequired: false,
    read: true,
  },
]
it('separates decisions from updates and does not mark invitations read merely by opening', () => {
  const onRead = vi.fn()
  render(<NotificationCenterView items={items} onRead={onRead} />)
  fireEvent.click(
    screen.getByRole('button', { name: 'Notifications · 1 unread' }),
  )
  expect(screen.getByRole('dialog')).toBeTruthy()
  expect(screen.getByRole('region', { name: 'Needs a decision' })).toBeTruthy()
  expect(screen.getByRole('region', { name: 'Updates' })).toBeTruthy()
  expect(screen.getByText('Can view records')).toBeTruthy()
  expect(
    screen
      .getByRole('link', { name: 'Review invitation' })
      .getAttribute('href'),
  ).toBe('/horse-invitations/token')
  expect(onRead).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Unread (1)' }))
  expect(screen.queryByText('Willow')).toBeNull()
  expect(screen.getByText('Maple')).toBeTruthy()
})
it('marks only unread items and keeps failed actions recoverable', async () => {
  const onRead = vi.fn().mockRejectedValue(new Error('offline'))
  render(<NotificationCenterView items={items} onRead={onRead} />)
  fireEvent.click(screen.getByRole('button', { name: /Notifications/ }))
  fireEvent.click(screen.getByRole('button', { name: 'Mark all as read' }))
  await waitFor(() =>
    expect(screen.getByRole('alert').textContent).toContain('Could not update'),
  )
  expect(onRead).toHaveBeenCalledWith(['invite'])
  expect(screen.getByRole('link', { name: 'Review invitation' })).toBeTruthy()
})
it('shows loading, failure with retry, and empty states', () => {
  const retry = vi.fn()
  const { rerender } = render(
    <NotificationCenterView onRead={async () => {}} />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Notifications' }))
  expect(screen.getByRole('status').textContent).toContain('Loading')
  rerender(
    <NotificationCenterView
      onRead={async () => {}}
      loadError
      onRetry={retry}
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
  expect(retry).toHaveBeenCalledOnce()
  rerender(<NotificationCenterView items={[]} onRead={async () => {}} />)
  expect(screen.getByText('You’re all caught up.')).toBeTruthy()
})

it('shows the event schedule and confirms a participation decision', async () => {
  const onRespond = vi.fn().mockResolvedValue(undefined)
  render(
    <NotificationCenterView
      items={[
        {
          ...items[0],
          kind: 'event_invitation',
          eventHorseId: 'event-horse' as NonNullable<
            (typeof items)[number]['eventHorseId']
          >,
          eventDate: '2026-10-25',
          eventTime: '10:00',
        },
      ]}
      onRead={async () => {}}
      onRespond={onRespond}
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: /Notifications/ }))
  expect(screen.getByText('Scheduled: Oct 25, 2026 · 10:00')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Accept participation' }))
  await waitFor(() =>
    expect(screen.getByRole('status').textContent).toBe(
      'Participation accepted.',
    ),
  )
  expect(onRespond).toHaveBeenCalledWith('event-horse', true)
})
