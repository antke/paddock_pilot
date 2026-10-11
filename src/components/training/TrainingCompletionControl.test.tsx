// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { TrainingEntryLink } from './TrainingEntryLink'
import { getTrainingEntries } from './trainingCalendarData'
import { TrainingCompletionControl } from './TrainingCompletionControl'

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  error: vi.fn(),
  success: vi.fn(),
}))
vi.mock('convex/react', () => ({ useMutation: () => mocks.save }))
vi.mock('#/components/ui/sonner', () => ({
  showAppErrorToast: mocks.error,
  showAppSuccessToast: mocks.success,
}))

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  mocks.save.mockReset()
  mocks.error.mockReset()
  mocks.success.mockReset()
})
const horseId = 'horse' as Id<'horses'>
function entry() {
  const event = {
    _id: 'session',
    _creationTime: 0,
    createdBy: 'owner',
    horseIds: [horseId],
    title: 'Schooling',
    date: '2000-01-01',
    time: '10:00',
    type: 'training',
    training: {
      activities: ['groundwork'],
      format: 'regular',
      durationMinutes: 30,
    },
  } as Doc<'events'>
  return getTrainingEntries({
    events: [event],
    records: [],
    horses: [{ _id: horseId, name: 'Juniper', canRecord: true }],
    start: event.date,
    end: event.date,
    today: event.date,
  })[0]
}
async function mount(
  variant: 'record' | 'week' | 'month' | 'summary',
  current = entry(),
) {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  const root = createRootRoute()
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <TrainingEntryLink entry={current} variant={variant} />,
  })
  const detail = createRoute({
    getParentRoute: () => root,
    path: '/events/$eventId',
    component: () => <h1>Session detail</h1>,
  })
  const router = createRouter({
    routeTree: root.addChildren([index, detail]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
  await screen.findByRole('link')
  return router
}

it.each(['record', 'week', 'month', 'summary'] as const)(
  'completes from the %s card without opening the session',
  async (variant) => {
    mocks.save.mockResolvedValue(undefined)
    const router = await mount(variant)
    const control = screen.getByRole('button', {
      name: 'Mark complete: Juniper · Schooling',
    })
    expect(control.closest('a')).toBeNull()
    fireEvent.click(control)
    await waitFor(() => expect(mocks.success).toHaveBeenCalled())
    expect(mocks.save).toHaveBeenCalledExactlyOnceWith({
      eventId: 'session',
      horseId,
      date: '2000-01-01',
      status: 'completed',
      errorFormat: 'structured',
    })
    expect(router.state.location.pathname).toBe('/')
    fireEvent.click(screen.getByRole('link'))
    await screen.findByRole('heading', { name: 'Session detail' })
  },
)

it('offers completion from the keyboard-accessible preview', async () => {
  mocks.save.mockResolvedValue(undefined)
  await mount('week')
  act(() => screen.getByRole('link').focus())
  const preview = await screen.findByRole('dialog')
  fireEvent.click(
    within(preview).getByRole('button', {
      name: 'Mark complete: Juniper · Schooling',
    }),
  )
  await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(1))
})

it.each(['record', 'week', 'month', 'summary'] as const)(
  'uses the completion control as the sole completed indicator in a writable %s entry',
  async (variant) => {
    await mount(variant, { ...entry(), status: 'completed' })
    expect(
      screen.getByRole('button', {
        name: 'Mark incomplete: Juniper · Schooling',
        pressed: true,
      }),
    ).toBeTruthy()
    expect(screen.queryByText('Completed')).toBeNull()
  },
)

it('keeps completed status available on a read-only month entry', async () => {
  const current = entry()
  await mount('month', {
    ...current,
    status: 'completed',
    horse: { ...current.horse, canRecord: false },
  })
  expect(screen.queryByRole('button')).toBeNull()
  expect(screen.getByRole('link').getAttribute('aria-label')).toContain(
    'Completed',
  )
  expect(screen.getByText('Completed')).toBeTruthy()
})

it('prevents duplicate submissions, keeps failure recoverable, and offers undo after completion', async () => {
  let reject!: (reason: Error) => void
  mocks.save
    .mockImplementationOnce(
      () =>
        new Promise((_, fail) => {
          reject = fail
        }),
    )
    .mockResolvedValue(undefined)
  const current = entry()
  const view = render(<TrainingCompletionControl entry={current} />)
  let button = screen.getByRole('button')
  fireEvent.click(button)
  fireEvent.click(button)
  expect(mocks.save).toHaveBeenCalledTimes(1)
  expect(button.getAttribute('aria-busy')).toBe('true')
  await act(async () => reject(new Error('offline')))
  expect(mocks.error).toHaveBeenCalled()
  expect(button.getAttribute('aria-pressed')).toBe('false')
  expect(button.hasAttribute('disabled')).toBe(false)
  fireEvent.click(button)
  await waitFor(() => expect(mocks.success).toHaveBeenCalled())
  view.rerender(
    <TrainingCompletionControl entry={{ ...current, status: 'completed' }} />,
  )
  button = screen.getByRole('button', {
    name: 'Mark incomplete: Juniper · Schooling',
  })
  expect(button.getAttribute('aria-pressed')).toBe('true')
  fireEvent.click(button)
  await waitFor(() =>
    expect(mocks.save).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'planned' }),
    ),
  )
})

it('hides completion for viewers and future sessions', () => {
  const current = entry()
  const view = render(
    <TrainingCompletionControl
      entry={{ ...current, horse: { ...current.horse, canRecord: false } }}
    />,
  )
  expect(screen.queryByRole('button')).toBeNull()
  view.rerender(
    <TrainingCompletionControl
      entry={{
        ...current,
        occurrence: { ...current.occurrence, startDate: '2099-01-01' },
      }}
    />,
  )
  expect(screen.queryByRole('button')).toBeNull()
})
