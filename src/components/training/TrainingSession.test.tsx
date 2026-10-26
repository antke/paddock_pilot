// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { TrainingSessionLink } from './TrainingSessionLink'
import { TrainingSessionCompletionControl } from './TrainingSessionCompletionControl'
import { getTrainingEntries } from './trainingCalendarData'
import { groupTrainingSessions } from './trainingSessions'

const save = vi.hoisted(() => vi.fn())
vi.mock('convex/react', () => ({ useMutation: () => save }))
afterEach(() => {
  cleanup()
  save.mockReset()
  vi.restoreAllMocks()
})
const horses = ['Atlas', 'Maple', 'Willow'].map((name) => ({
  _id: name as Id<'horses'>,
  name,
  canRecord: true,
}))
const event = {
  _id: 'session',
  _creationTime: 0,
  createdBy: 'owner',
  title: 'Group lesson',
  date: '2026-01-01',
  time: '10:00',
  type: 'training',
  horseIds: horses.map((h) => h._id),
  training: { activities: ['flatwork'], format: 'lesson' },
} as Doc<'events'>
function entries() {
  return getTrainingEntries({
    events: [event],
    horses,
    records: [],
    start: event.date,
    end: event.date,
    today: event.date,
  })
}
it('opens the whole session from one link while retaining the stable context', async () => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  const session = groupTrainingSessions(entries())[0]
  const router = createRouter({
    routeTree: createRootRoute({
      component: () => (
        <TrainingSessionLink session={session} stableId="yard" />
      ),
    }),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
  const link = screen.getByRole('link')
  expect(link.textContent).toContain('Atlas, Maple, Willow')
  const url = new URL(link.getAttribute('href')!, 'http://localhost')
  expect(url.pathname).toBe('/events/session')
  expect(url.searchParams.get('date')).toBe(event.date)
  expect(url.searchParams.get('stableId')).toBe('yard')
  expect(url.searchParams.has('horseId')).toBe(false)
  expect(url.searchParams.has('participationId')).toBe(false)
})
it('sends one atomic completion request and blocks duplicate submissions', async () => {
  let finish!: () => void
  save.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve
      }),
  )
  render(
    <TrainingSessionCompletionControl entries={entries()} stableId="yard" />,
  )
  const button = screen.getByRole('button', {
    name: 'Complete session for all horses',
  })
  fireEvent.click(button)
  fireEvent.click(button)
  expect(save).toHaveBeenCalledTimes(1)
  expect(save).toHaveBeenCalledWith({
    eventId: 'session',
    horseIds: ['Atlas', 'Maple', 'Willow'],
    date: event.date,
    stableId: 'yard',
    status: 'completed',
    errorFormat: 'structured',
  })
  finish()
  await waitFor(() => expect(button.hasAttribute('disabled')).toBe(false))
})
it('does not offer session-wide edits when any participant is read-only', () => {
  const data = entries()
  data[1].horse.canRecord = false
  render(<TrainingSessionCompletionControl entries={data} />)
  expect(screen.queryByRole('button')).toBeNull()
  expect(save).not.toHaveBeenCalled()
})
it('shows failed saves and allows retry', async () => {
  save
    .mockRejectedValueOnce(new Error('Permission changed'))
    .mockResolvedValueOnce(undefined)
  render(<TrainingSessionCompletionControl entries={entries()} />)
  fireEvent.click(screen.getByRole('button'))
  expect(await screen.findByRole('alert')).toBeTruthy()
  fireEvent.click(screen.getByRole('button'))
  await waitFor(() => expect(screen.queryByRole('alert')).toBeNull())
  expect(save).toHaveBeenCalledTimes(2)
})
