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
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { getFunctionName } from 'convex/server'
import type { FunctionReference } from 'convex/server'
import type { ComponentProps } from 'react'
import type { Id } from 'convex/_generated/dataModel'
import type { EventEditor } from '#/components/forms/event/EventEditor'
import type { EventFormSchema } from '#/components/forms/event/eventFormSchema'
import { PersonalEventEditor } from './PersonalEvents'

const mocks = vi.hoisted(() => ({
  queries: new Map<string, unknown>(),
  update: vi.fn(),
}))
vi.mock('convex/react', () => ({
  useQuery: (reference: FunctionReference<'query'>, args: unknown) =>
    args === 'skip' ? undefined : mocks.queries.get(getFunctionName(reference)),
  useMutation: () => mocks.update,
}))
vi.mock('#/components/forms/event/EventEditor', () => ({
  EventEditor: ({
    initialValues,
    onSave,
    onSaved,
  }: ComponentProps<typeof EventEditor>) => (
    <>
      <p>{initialValues.training?.activities.join(', ')}</p>
      <button
        onClick={async () => {
          const id = await onSave({
            ...initialValues,
            training: {
              ...initialValues.training,
              activities: ['flatwork'],
              format: 'regular',
            },
          } as EventFormSchema)
          await onSaved(id)
        }}
      >
        Save flatwork
      </button>
    </>
  ),
}))
afterEach(() => {
  cleanup()
  mocks.queries.clear()
  mocks.update.mockReset()
  vi.restoreAllMocks()
})

it('opens the selected record’s work type and keeps its horse/date after saving', async () => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  const event = {
    _id: 'session',
    type: 'training',
    title: 'Schooling',
    date: '2026-10-01',
    time: '10:00',
    horseIds: ['horse'],
    training: { activities: ['jumping'], format: 'regular' },
  }
  mocks.queries.set('events:getWithHorses', {
    event,
    eventHorses: [{ horseId: 'horse', status: 'confirmed' }],
  })
  mocks.queries.set('events:getPermissions', { canManageEvent: true })
  mocks.queries.set('horses:listMine', [
    { _id: 'horse', access: { canEditPersonalRecords: true } },
  ])
  mocks.queries.set('personalProviders:list', [])
  mocks.queries.set('training:listForEvent', {
    records: [
      {
        _id: 'record',
        horseId: 'horse',
        date: '2026-10-09',
        canEdit: true,
        details: { activities: ['groundwork'], format: 'regular' },
      },
    ],
  })
  mocks.update.mockResolvedValue(undefined)
  const root = createRootRoute()
  const edit = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => (
      <PersonalEventEditor
        eventId={'session' as Id<'events'>}
        horseId="horse"
        date="2026-10-09"
        participationId="participation"
      />
    ),
  })
  const detail = createRoute({
    getParentRoute: () => root,
    path: '/events/$eventId',
    component: () => <h1>Session detail</h1>,
  })
  const router = createRouter({
    routeTree: root.addChildren([edit, detail]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
  await screen.findByText('groundwork')
  fireEvent.click(screen.getByRole('button', { name: 'Save flatwork' }))
  await screen.findByRole('heading', { name: 'Session detail' })
  expect(mocks.update).toHaveBeenCalledWith(
    expect.objectContaining({
      id: 'session',
      trainingOccurrenceDate: '2026-10-09',
      trainingHorseId: 'horse',
      trainingRecordId: 'record',
      training: { activities: ['flatwork'], format: 'regular' },
    }),
  )
  await waitFor(() =>
    expect(router.state.location.search).toEqual({
      date: '2026-10-09',
      horseId: 'horse',
      participationId: 'participation',
    }),
  )
})
