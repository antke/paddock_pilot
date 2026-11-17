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
import { TrainingDetailCompletion } from './TrainingCompletionControl'
import { getTrainingEntries } from './trainingCalendarData'
import { groupTrainingSessions } from './trainingSessions'

const save = vi.hoisted(() => vi.fn())
vi.mock('convex/react', () => ({ useMutation: () => save }))
vi.mock('#/components/ui/sonner', () => ({
  showAppErrorToast: vi.fn(),
  showAppSuccessToast: vi.fn(),
}))
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
it('blocks duplicate submissions while a session save is pending', async () => {
  let finish!: () => void
  save.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve
      }),
  )
  render(<TrainingDetailCompletion entries={entries()} stableId="yard" />)
  const button = screen.getByRole('button', {
    name: 'Mark complete: Atlas, Maple, and Willow · Group lesson',
  })
  expect(button.textContent).toContain('Complete session for all horses')
  fireEvent.click(button)
  fireEvent.click(button)
  expect(save).toHaveBeenCalledTimes(1)
  finish()
  await waitFor(() => expect(button.hasAttribute('disabled')).toBe(false))
})

it('labels the detail check plainly when it completes only some horses', () => {
  const data = entries()
  data[1].horse.canRecord = false
  render(<TrainingDetailCompletion entries={data} />)
  const button = screen.getByRole('button', {
    name: 'Mark complete: Atlas and Willow · Group lesson',
  })
  expect(button.textContent).toContain('Complete')
  expect(button.textContent).not.toContain('all horses')
})

async function mountSession(
  variant: 'record' | 'week' | 'month',
  canRecord: (name: string) => boolean = () => true,
) {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  const session = groupTrainingSessions(
    getTrainingEntries({
      events: [event],
      horses: horses.map((horse) => ({
        ...horse,
        canRecord: canRecord(horse.name),
      })),
      records: [],
      start: event.date,
      end: event.date,
      today: event.date,
    }),
  )[0]
  const router = createRouter({
    routeTree: createRootRoute({
      component: () => (
        <TrainingSessionLink
          session={session}
          stableId="yard"
          variant={variant}
        />
      ),
    }),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
}

it('completes every horse from the session check when the viewer may record all of them', async () => {
  save.mockResolvedValue(undefined)
  await mountSession('week')
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Mark complete: Atlas, Maple, and Willow · Group lesson',
    }),
  )
  await waitFor(() => expect(save).toHaveBeenCalledTimes(1))
  expect(save.mock.calls[0][0]).toMatchObject({
    eventId: 'session',
    horseIds: ['Atlas', 'Maple', 'Willow'],
    date: event.date,
    stableId: 'yard',
    status: 'completed',
  })
})

it('completes only the horses the viewer may record', async () => {
  save.mockResolvedValue(undefined)
  await mountSession('record', (name) => name === 'Maple')
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Mark complete: Maple · Group lesson',
    }),
  )
  await waitFor(() => expect(save).toHaveBeenCalledTimes(1))
  expect(save.mock.calls[0][0].horseIds).toEqual(['Maple'])
})

it('keeps month cells to the link and offers no check without record access', async () => {
  await mountSession('month')
  expect(screen.queryByRole('button')).toBeNull()
  cleanup()
  await mountSession('week', () => false)
  expect(screen.queryByRole('button')).toBeNull()
})
