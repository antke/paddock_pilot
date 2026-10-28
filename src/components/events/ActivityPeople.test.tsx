// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { getFunctionName } from 'convex/server'
import { ActivityPeople, MyActivityInvitations } from './ActivityPeople'
import type { Id } from 'convex/_generated/dataModel'

const state = vi.hoisted(() => ({
  rows: [] as unknown[],
  save: vi.fn(),
  invite: vi.fn(),
  respond: vi.fn(),
}))
vi.mock('convex/react', () => ({
  useQuery: (reference: Parameters<typeof getFunctionName>[0]) =>
    getFunctionName(reference) === 'activityParticipants:mine'
      ? state.rows
      : { horses: [{ id: 'horse', name: 'Luna' }], participants: [] },
  useMutation: (reference: Parameters<typeof getFunctionName>[0]) =>
    getFunctionName(reference) === 'activityParticipants:reportRide'
      ? state.save
      : getFunctionName(reference) === 'activityParticipants:invite'
        ? state.invite
        : state.respond,
}))
vi.mock('#/lib/useLocalDateContext', () => ({
  useLocalDateContext: () => ({ today: '2026-10-27' }),
}))
afterEach(cleanup)
beforeEach(() => {
  vi.clearAllMocks()
  state.rows = []
})

it('invites a rider for the selected horse and date and explains in-app delivery', async () => {
  render(<ActivityPeople eventId={'event' as Id<'events'>} date="2026-10-27" />)
  expect(screen.getByText(/invitation appears in their Events/)).toBeTruthy()
  fireEvent.change(screen.getByLabelText('Participant’s email'), {
    target: { value: 'anna@example.test' },
  })
  fireEvent.click(
    screen.getByRole('button', { name: 'Invite to this session' }),
  )
  await waitFor(() =>
    expect(state.invite).toHaveBeenCalledWith({
      eventId: 'event',
      horseId: 'horse',
      date: '2026-10-27',
      email: 'anna@example.test',
      role: 'rider',
    }),
  )
})

it('preserves the planned jumping lesson in a rider’s report', async () => {
  state.rows = [
    {
      id: 'participant',
      eventId: 'event',
      horseName: 'Luna',
      title: 'Lesson',
      date: '2026-10-27',
      time: '10:00',
      role: 'rider',
      status: 'accepted',
      canReport: true,
      report: null,
      plannedTraining: {
        activities: ['jumping'],
        format: 'lesson',
        durationMinutes: 30,
      },
    },
  ]
  render(<MyActivityInvitations />)
  fireEvent.click(screen.getByRole('button', { name: 'Record my ride' }))
  fireEvent.change(screen.getByLabelText('How did the ride go?'), {
    target: { value: 'Good session' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Save ride report' }))
  await waitFor(() =>
    expect(state.save).toHaveBeenCalledWith({
      id: 'participant',
      details: {
        activities: ['jumping'],
        format: 'lesson',
        durationMinutes: 30,
      },
      outcome: 'Good session',
    }),
  )
})

it('keeps failed invitations actionable and does not expose a reporting form before acceptance', async () => {
  state.respond.mockRejectedValueOnce(new Error('Invitation expired'))
  state.rows = [
    {
      id: 'participant',
      horseName: 'Luna',
      title: 'Ride',
      date: '2026-10-27',
      time: '10:00',
      role: 'rider',
      status: 'invited',
      canReport: false,
    },
  ]
  render(<MyActivityInvitations invitationsOnly />)
  expect(screen.queryByRole('button', { name: 'Record my ride' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Accept' }))
  expect(await screen.findByRole('alert')).toBeTruthy()
  expect(
    screen.getByRole('button', { name: 'Accept' }).hasAttribute('disabled'),
  ).toBe(false)
})
