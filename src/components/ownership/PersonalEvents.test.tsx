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
  add: vi.fn(),
  addHorse: false,
  replaceHorse: false,
}))
vi.mock('convex/react', () => ({
  useQuery: (reference: FunctionReference<'query'>, args: unknown) =>
    args === 'skip' ? undefined : mocks.queries.get(getFunctionName(reference)),
  useMutation: (reference: FunctionReference<'mutation'>) =>
    getFunctionName(reference) === 'events:add' ? mocks.add : mocks.update,
}))
vi.mock('#/components/forms/event/EventEditor', () => ({
  EventEditor: ({
    initialValues,
    horses,
    onSave,
    onSaved,
  }: ComponentProps<typeof EventEditor>) => (
    <>
      <p>{initialValues.training?.activities.join(', ')}</p>
      <output aria-label="Selectable horses">
        {horses.map((horse) => horse._id).join(',')}
      </output>
      <button
        onClick={async () => {
          const id = await onSave({
            ...initialValues,
            horseIds: mocks.replaceHorse
              ? ['replacement']
              : mocks.addHorse
                ? [...initialValues.horseIds, 'additional']
                : initialValues.horseIds,
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
  mocks.add.mockReset()
  mocks.addHorse = false
  vi.restoreAllMocks()
})

it.each(['unchanged', 'replace', 'add'])(
  'opens the selected record and returns to its saved horse (replacement: %s)',
  async (action) => {
    const replaceHorse = action === 'replace'
    mocks.addHorse = action === 'add'
    mocks.replaceHorse = replaceHorse
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
    mocks.queries.set('events:creationOptions', {
      personal: [],
      stables: [],
      people: [],
    })
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
    expect(mocks.add).not.toHaveBeenCalled()
    expect(mocks.update).toHaveBeenCalledTimes(1)
    if (action === 'add')
      expect(mocks.update).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'session',
          horseIds: ['horse', 'additional'],
        }),
      )
    await waitFor(() =>
      expect(router.state.location.search).toEqual({
        date: '2026-10-09',
        horseId: replaceHorse ? 'replacement' : 'horse',
        ...(replaceHorse ? {} : { participationId: 'participation' }),
      }),
    )
  },
)

it.each([undefined, 'stable'])(
  'retains authorized participants when the editor has no personal roster or stable membership (origin: %s)',
  async (stableId) => {
    mocks.replaceHorse = false
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    mocks.queries.set('events:getWithHorses', {
      event: {
        _id: 'shared',
        stableId,
        type: 'vet',
        title: 'Visit',
        date: '2026-10-20',
        time: '10:00',
        horseIds: ['shared-horse'],
      },
      eventHorses: [{ horseId: 'shared-horse', status: 'confirmed' }],
      horses: [{ _id: 'shared-horse', name: 'Maple' }],
    })
    mocks.queries.set('events:getPermissions', { canManageEvent: true })
    mocks.queries.set('horses:listMine', [])
    mocks.queries.set('events:creationOptions', { personal: [], stables: [] })
    const root = createRootRoute()
    const edit = createRoute({
      getParentRoute: () => root,
      path: '/',
      component: () => (
        <PersonalEventEditor eventId={'shared' as Id<'events'>} />
      ),
    })
    const router = createRouter({
      routeTree: root.addChildren([edit]),
      history: createMemoryHistory({ initialEntries: ['/'] }),
    })
    await router.load()
    render(<RouterProvider router={router} />)
    expect(
      (await screen.findByLabelText('Selectable horses')).textContent,
    ).toBe('shared-horse')
  },
)
