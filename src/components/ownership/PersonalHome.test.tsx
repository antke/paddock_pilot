// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { getFunctionName } from 'convex/server'
import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PersonalAppointments } from './PersonalAppointments'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { Route as HomeRoute } from '#/routes/index'
import { Route as TrainingRoute } from '#/routes/training'
import { Route as HorsesRoute } from '#/routes/horses/index'

const state = vi.hoisted(
  (): {
    queries: Record<string, unknown>
    reads: string[]
    overview: Record<string, unknown>
  } => ({
    queries: {},
    reads: [],
    overview: {},
  }),
)
const queryClients: QueryClient[] = []
vi.mock('convex/react', () => ({
  useQuery: (reference: Parameters<typeof getFunctionName>[0]) => {
    const name = getFunctionName(reference)
    state.reads.push(name)
    if (name === 'userCareOverview:getForCurrentUser') return state.overview
    if (!(name in state.queries)) throw new Error(`Unexpected query ${name}`)
    return state.queries[name]
  },
  useQueries: (requests: Record<string, unknown>) =>
    Object.fromEntries(
      Object.keys(requests).map((id) => [
        id,
        'training:' + id in state.queries
          ? state.queries['training:' + id]
          : {
              horses: [],
              events: [],
              records: [],
            },
      ]),
    ),
  useMutation: () => vi.fn(),
}))
vi.mock('#/components/layout/AuthStateSwitch', () => ({
  AuthStateSwitch: ({ signedIn }: { signedIn: ReactNode }) => signedIn,
}))
vi.mock('#/lib/useLocalDateContext', () => ({
  useLocalDateContext: () => ({ today: '2026-10-09' }),
}))

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  state.reads = []
  state.queries = {
    'events:listPendingHorseInvitations': [],
    'horses:calendarRoster': [],
    'users:getCurrentUser': { _id: 'owner', profileCompletedAt: 1 },
    'horses:listMine': Array.from({ length: 11 }, (_, i) => ({
      _id: `horse-${i}`,
      _creationTime: 0,
      name: `Horse ${i + 1}`,
      age: 10,
      access: { isOwner: i !== 4, stable: null, canEditPersonalRecords: true },
      profileImageUrl: null,
    })),
    'events:list': [
      {
        _id: 'visit',
        _creationTime: 0,
        createdBy: 'owner',
        horseIds: ['horse-0'],
        title: 'Planned visit',
        date: '2026-10-10',
        time: '10:00',
        type: 'vet',
        status: 'planned',
      },
    ],
  }
  state.overview = {
    stableSummaries: [],
    summary: {
      dueReminderCount: 1,
      overdueReminderCount: 0,
      upcomingEventCount: 1,
      highSeverityIssueCount: 0,
      activeMedicationCount: 0,
    },
    dueReminders: [
      {
        id: 'reminder',
        horseId: 'horse-0',
        horseName: 'Horse 1',
        stableName: 'Stable',
        title: 'Check care record',
        dueDate: '2026-10-09',
        category: 'general',
        priority: 'normal',
        overdue: false,
      },
    ],
    upcomingEvents: [
      {
        id: 'visit',
        title: 'Planned visit',
        date: '2026-10-10',
        time: '10:00',
        type: 'vet',
        horseCount: 1,
      },
    ],
    attentionHorses: [],
  }
})
afterEach(() => {
  cleanup()
  queryClients.splice(0).forEach((client) => client.clear())
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

async function open(path = '/') {
  const root = createRootRoute({
    component: () => (
      <>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/horses">Horses</Link>
          <Link to="/events">Events tab</Link>
          <Link to="/training">Training tab</Link>
        </nav>
        <Outlet />
      </>
    ),
  })
  const routeTree = root.addChildren([
    createRoute({
      getParentRoute: () => root,
      path: '/events',
      component: () => <PersonalAppointments onViewChange={() => {}} />,
    }),
    createRoute({
      getParentRoute: () => root,
      path: '/',
      component: HomeRoute.options.component,
    }),
    createRoute({
      getParentRoute: () => root,
      path: '/training',
      component: TrainingRoute.options.component,
    }),
    createRoute({
      getParentRoute: () => root,
      path: '/horses',
      component: HorsesRoute.options.component,
    }),
  ])
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  })
  await router.load()
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        queryFn: ({ queryKey }) => {
          const name = getFunctionName(queryKey[1] as never)
          state.reads.push(name)
          if (name === 'userCareOverview:getForCurrentUser')
            return state.overview
          if (name === 'training:listForHorse') {
            const id = (queryKey[2] as { horseId: string }).horseId
            return 'training:' + id in state.queries
              ? (state.queries['training:' + id] ?? new Promise(() => {}))
              : { horses: [], events: [], records: [] }
          }
          if (!(name in state.queries))
            throw new Error(`Unexpected query ${name}`)
          return state.queries[name] ?? new Promise(() => {})
        },
      },
    },
  })
  queryClients.push(client)
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return router
}

it('reuses live data across Home, Events and Training without mounting a loading screen', async () => {
  const router = await open()
  await screen.findByRole('heading', { level: 1, name: 'Home' })
  const reads = state.reads.filter(
    (name) =>
      name !== 'users:getCurrentUser' &&
      name !== 'events:listPendingHorseInvitations',
  )
  const pendingScreens: Element[] = []
  const observer = new MutationObserver((records) => {
    for (const record of records)
      for (const node of record.addedNodes) {
        if (node instanceof Element) {
          if (node.matches('[data-slot="route-pending"]'))
            pendingScreens.push(node)
          pendingScreens.push(
            ...node.querySelectorAll('[data-slot="route-pending"]'),
          )
        }
      }
  })
  observer.observe(document.body, { childList: true, subtree: true })
  try {
    for (const href of [
      '/events',
      '/training',
      '/',
      '/events',
      '/training',
      '/',
    ]) {
      await act(() => router.navigate({ href }))
      expect(document.querySelector('[data-slot="route-pending"]')).toBeNull()
    }
    expect(pendingScreens).toHaveLength(0)
    expect(
      state.reads.filter(
        (name) =>
          name !== 'users:getCurrentUser' &&
          name !== 'events:listPendingHorseInvitations',
      ),
    ).toEqual(reads)
  } finally {
    observer.disconnect()
  }
})

it('uses distinct real route components when navigating Home → Horses → Home', async () => {
  const router = await open()
  await screen.findByRole('heading', { level: 1, name: 'Home' })
  expect(screen.getByRole('heading', { name: 'Events' })).toBeTruthy()
  expect(screen.getByText('Next 7 days')).toBeTruthy()
  fireEvent.click(screen.getByText('Next 7 days'))
  expect(screen.getAllByText('Planned visit')).toHaveLength(1)
  expect(screen.getByRole('heading', { name: 'Horse 11' })).toBeTruthy()
  expect(screen.queryByRole('link', { name: 'View all horses' })).toBeNull()
  expect(
    screen.getByRole('link', { name: 'Add training log' }).getAttribute('href'),
  ).toContain('training=true')
  expect(
    screen
      .getByRole('link', { name: 'View training log' })
      .getAttribute('href'),
  ).toBe('/training')
  expect(
    screen
      .getAllByRole('link', { name: /Check care record/ })[0]
      .getAttribute('href'),
  ).toBe('/horses/horse-0/care?reminderId=reminder')
  fireEvent.click(screen.getByRole('link', { name: 'Horses' }))
  await screen.findByRole('heading', { level: 1, name: 'My horses' })
  expect(router.state.location.pathname).toBe('/horses')
  expect(screen.getByRole('heading', { name: 'Horse 5' })).toBeTruthy()
  expect(
    screen.getByRole('link', { name: /Horse 5.*Shared with me/ }),
  ).toBeTruthy()
  expect(screen.queryByText('Upcoming appointments')).toBeNull()
  expect(screen.queryByText('Check care record')).toBeNull()
  expect(
    screen.getByRole('link', { name: 'My care contacts' }).getAttribute('href'),
  ).toBe('/horses/contacts')
  fireEvent.click(screen.getByRole('link', { name: 'Home' }))
  await screen.findByRole('heading', { level: 1, name: 'Home' })
  expect(screen.getByText('Planned visit')).toBeTruthy()
})

it('loads the full horse directory directly without waiting for appointments or care', async () => {
  state.queries['events:list'] = undefined
  await open('/horses')
  await screen.findByRole('heading', { level: 1, name: 'My horses' })
  expect(screen.getByRole('heading', { name: 'Horse 5' })).toBeTruthy()
  expect(state.reads).toEqual(['horses:listMine'])
})

it.each([false, true])(
  'keeps first-horse creation available and avoids empty care panels (mobile: %s)',
  async (mobile) => {
    vi.stubGlobal('matchMedia', () => ({
      matches: mobile,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    state.queries['horses:listMine'] = []
    state.queries['events:list'] = []
    state.overview.dueReminders = []
    await open()
    await screen.findByRole('heading', { level: 1, name: 'Home' })
    expect(
      screen.getByRole('link', { name: 'Add a horse' }).getAttribute('href'),
    ).toBe('/horses/create')
    expect(screen.queryByText('Care centre')).toBeNull()
    expect(screen.getByText('Next 7 days')).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Add training log' })).toBeNull()
    if (mobile) {
      fireEvent.click(screen.getByRole('button', { name: 'Add a horse' }))
      expect(
        (
          await screen.findByRole('menuitem', { name: 'Add a horse' })
        ).getAttribute('href'),
      ).toBe('/horses/create')
      expect(screen.getAllByRole('menuitem')).toHaveLength(1)
    }
  },
)

it('does not hide existing appointments or stable reminders when no horses are accessible', async () => {
  state.queries['horses:listMine'] = []
  state.overview.dueReminders = [
    {
      id: 'yard-reminder',
      stableId: 'yard',
      stableName: 'Sample Yard',
      title: 'Yard reminder',
      dueDate: '2026-10-09',
      category: 'general',
      priority: 'normal',
      overdue: false,
    },
  ]
  await open()
  await screen.findByRole('heading', { level: 1, name: 'Home' })
  expect(screen.getByText('Planned visit')).toBeTruthy()
  expect(
    screen
      .getAllByRole('link', { name: /Yard reminder/ })[0]
      .getAttribute('href'),
  ).toBe('/stables/yard/reminders?reminderId=yard-reminder')
})

it('keeps Home pending until its appointment data has loaded', async () => {
  state.queries['events:list'] = undefined
  const router = await open()
  expect(screen.queryByRole('heading', { level: 1, name: 'Home' })).toBeNull()
  await act(async () => {
    await router.navigate({ to: '/horses' })
  })
  await screen.findByRole('heading', { level: 1, name: 'My horses' })
})

it('hides creation actions for a workspace containing only read-only shared horses', async () => {
  state.queries['horses:listMine'] = [
    {
      _id: 'shared',
      name: 'Shared horse',
      access: { isOwner: false, canEditPersonalRecords: false },
    },
  ]
  await open()
  await screen.findByRole('heading', { level: 1, name: 'Home' })
  expect(screen.queryByRole('link', { name: 'Add training log' })).toBeNull()
  expect(screen.queryByRole('link', { name: 'Add event' })).toBeNull()
  expect(screen.getByRole('heading', { name: 'Shared horse' })).toBeTruthy()
})

it('opens the combined training route with one creation action beside the calendar controls', async () => {
  await open('/training')
  await screen.findByRole('heading', { level: 1, name: 'Training log' })
  expect(screen.queryByRole('link', { name: 'Add training log' })).toBeNull()
  expect(
    screen.getAllByRole('link', { name: 'Add training session' }),
  ).toHaveLength(1)
  expect(
    screen
      .getByRole('link', { name: 'Add training session' })
      .getAttribute('href'),
  ).toBe('/events/create?training=true')
})
it('starts mobile training with its title and a single bottom recording action', async () => {
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
  await open('/training')
  await screen.findByRole('heading', { level: 1, name: 'Training log' })
  expect(
    screen.queryByText(
      'Plan sessions, record completed work, and review each horse’s training.',
    ),
  ).toBeNull()
  expect(
    screen.queryByRole('link', { name: 'Add training session' }),
  ).toBeNull()
  const actions = screen.getAllByRole('link', { name: 'Add training log' })
  expect(actions).toHaveLength(1)
  expect(actions[0].closest('[data-slot="mobile-action-bar"]')).toBeTruthy()
})
it('offers first-horse creation on a directly opened empty training log', async () => {
  state.queries['horses:listMine'] = []
  await open('/training')
  await screen.findByRole('heading', { level: 1, name: 'Training log' })
  expect(
    screen.getByRole('link', { name: 'Add a horse' }).getAttribute('href'),
  ).toBe('/horses/create')
  expect(
    screen.queryByRole('link', { name: 'Add training session' }),
  ).toBeNull()
})
it('keeps training visible but removes recording controls for a viewer', async () => {
  state.queries['horses:listMine'] = [
    {
      _id: 'shared',
      name: 'Shared horse',
      access: { canEditPersonalRecords: false },
    },
  ]
  await open('/training')
  await screen.findByRole('heading', { level: 1, name: 'Training log' })
  expect(screen.queryByRole('link', { name: 'Add training log' })).toBeNull()
  expect(
    screen.queryByRole('link', { name: 'Add training session' }),
  ).toBeNull()
})

it('waits for every horse training subscription before presenting a complete day', async () => {
  state.queries['training:horse-10'] = undefined
  await open()
  expect(screen.queryByRole('heading', { level: 1, name: 'Home' })).toBeNull()
})
it('shows shared training once and opens the whole session', async () => {
  for (const index of [0, 1]) {
    const horseId = `horse-${index}`
    state.queries['training:' + horseId] = {
      horses: [{ _id: horseId, name: `Horse ${index + 1}`, canRecord: true }],
      records: [],
      events: [
        {
          _id: 'training',
          _creationTime: 0,
          createdBy: 'owner',
          horseIds: [horseId],
          contextHorseId: horseId,
          contextParticipationId: `participation-${index}`,
          date: '2026-10-09',
          time: '09:00',
          title: 'Morning work',
          type: 'training',
          status: 'planned',
          training: { activities: ['flatwork'], format: 'regular' },
        },
      ],
    }
  }
  await open()
  await screen.findByRole('heading', { level: 1, name: 'Home' })
  const sessions = screen.getAllByRole('link', { name: /Morning work/ })
  expect(sessions).toHaveLength(1)
  expect(sessions[0].getAttribute('href')).toBe(
    '/events/training?date=2026-10-09',
  )
  expect(sessions[0].textContent).toContain('Horse 1, Horse 2')
})

it('uses one mobile creation menu and keeps the page title available to screen readers', async () => {
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
  await open()
  const heading = await screen.findByRole('heading', { level: 1, name: 'Home' })
  expect(heading.classList.contains('sr-only')).toBe(false)
  expect(screen.queryByText('9 October 2026')).toBeNull()
  expect(
    screen.getByRole('button', { name: 'Add event, training log or horse' }),
  ).toBeTruthy()
  expect(screen.queryByRole('link', { name: 'Add training log' })).toBeNull()
  expect(screen.queryByRole('link', { name: 'Add event' })).toBeNull()
  expect(screen.queryByRole('link', { name: 'Add a horse' })).toBeNull()
  fireEvent.click(
    screen.getByRole('button', { name: 'Add event, training log or horse' }),
  )
  expect(
    (await screen.findByRole('menuitem', { name: 'Add a horse' })).getAttribute(
      'href',
    ),
  ).toBe('/horses/create')
  expect(screen.getAllByRole('menuitem')).toHaveLength(3)
})

it('lets read-only horse viewers add their own horse without offering record creation', async () => {
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
  state.queries['horses:listMine'] = [
    {
      _id: 'horse-0',
      name: 'Shared horse',
      profileImageUrl: null,
      access: { isOwner: false, stable: null, canEditPersonalRecords: false },
    },
  ]
  await open()
  await screen.findByRole('heading', { level: 1, name: 'Home' })
  fireEvent.click(screen.getByRole('button', { name: 'Add a horse' }))
  expect(
    (await screen.findByRole('menuitem', { name: 'Add a horse' })).getAttribute(
      'href',
    ),
  ).toBe('/horses/create')
  expect(screen.getAllByRole('menuitem')).toHaveLength(1)
})
