// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { getFunctionName } from 'convex/server'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import {
  AppUserStateProvider,
  AppUserStateGate,
} from '#/components/layout/AppUserStateProvider'
import { PersonalHorseForm } from '#/components/ownership/PersonalHorseForm'
import { SignedOutRoutePrompt } from '#/components/layout/SignedOutRoutePrompt'
import { Route as OnboardingRoute } from '#/routes/onboarding'

const state = vi.hoisted(() => {
  const queries: Record<string, unknown> = {}
  return {
    version: 0,
    listeners: new Set<() => void>(),
    queries,
    sync: vi.fn(),
    saveProfile: vi.fn(),
    uploadUrl: vi.fn(),
    createStable: vi.fn(),
    createHorse: vi.fn(),
    complete: vi.fn(),
    record: vi.fn(),
  }
})
const publish = () => {
  state.version++
  state.listeners.forEach((listener) => listener())
}
vi.mock('@clerk/tanstack-react-start', () => ({
  useAuth: () => ({ userId: 'rider' }),
  ClerkLoaded: ({ children }: { children: ReactNode }) => children,
  ClerkLoading: () => null,
  Show: ({ when, children }: { when: string; children: ReactNode }) =>
    when === 'signed-in' ? children : null,
  SignInButton: ({
    forceRedirectUrl,
    children,
  }: {
    forceRedirectUrl: string
    children: ReactNode
  }) => (
    <div data-testid="sign-in" data-return-to={forceRedirectUrl}>
      {children}
    </div>
  ),
}))
vi.mock('convex/react', async () => {
  const { useSyncExternalStore } = await import('react')
  return {
    useConvex: () => ({}),
    useQueries: () => {
      useSyncExternalStore(
        (listener) => {
          state.listeners.add(listener)
          return () => {
            state.listeners.delete(listener)
          }
        },
        () => state.version,
      )
      return { people: state.queries['people:suggestNames'] }
    },
    useConvexAuth: () => ({ isAuthenticated: true, isLoading: false }),
    useAction: () => state.sync,
    useQuery: (
      reference: Parameters<typeof getFunctionName>[0],
      args: unknown,
    ) => {
      useSyncExternalStore(
        (listener) => {
          state.listeners.add(listener)
          return () => {
            state.listeners.delete(listener)
          }
        },
        () => state.version,
      )
      if (args === 'skip') return undefined
      const name = getFunctionName(reference)
      if (name === 'horses:calendarRoster') return []
      if (!(name in state.queries)) throw new Error(`Unexpected query ${name}`)
      return state.queries[name]
    },
    useMutation: (reference: Parameters<typeof getFunctionName>[0]) => {
      switch (getFunctionName(reference)) {
        case 'onboarding:updateAccountProfile':
          return state.saveProfile
        case 'onboarding:generateProfileImageUploadUrl':
          return state.uploadUrl
        case 'stables:add':
          return state.createStable
        case 'horses:add':
          return state.createHorse
        case 'onboarding:recordStableStep':
          return state.record
        case 'onboarding:completeStableOnboarding':
          return state.complete
        default:
          return () => {
            throw new Error(`Unexpected mutation ${getFunctionName(reference)}`)
          }
      }
    },
  }
})
vi.mock('#/lib/devAuthBypass', () => ({ useDevAuthBypassEnabled: () => false }))
vi.mock('#/components/ui/sonner', () => ({
  showAppErrorToast: vi.fn(),
  showAppSuccessToast: vi.fn(),
}))

const user = { _id: 'rider-id', clerkId: 'rider', firstName: 'Sample Rider' }
const stable = { _id: 'yard', name: 'Sample Yard', location: 'Warsaw' }
function savedProfile() {
  state.queries['users:getCurrentUser'] = { ...user, profileCompletedAt: 1 }
  state.queries['onboarding:getAccountProfile'] = {
    ...user,
    displayName: 'Sample Rider',
    isComplete: true,
  }
}
function stableSetup(role: 'owner' | 'member', step: string) {
  state.queries['stables:list'] = [stable]
  state.queries['stables:get'] = stable
  state.queries['stables:getAccess'] = { role }
  state.queries['onboarding:getNextIncompleteStable'] = { stableId: 'yard' }
  state.queries['onboarding:getStableProgress'] = {
    currentStep: step,
    completedSteps: [],
    deferredSteps: [],
  }
}
beforeEach(() => {
  localStorage.clear()
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
  state.queries = {
    'people:suggestNames': [{ name: 'Sample Rider', isCurrentUser: true }],
    'users:getCurrentIdentity': { subject: 'rider' },
    'users:getCurrentUser': user,
    'onboarding:getAccountProfile': {
      ...user,
      displayName: 'Sample Rider',
      isComplete: false,
    },
    'stables:list': [],
    'onboarding:getNextIncompleteStable': null,
    'stableInvitations:listForCurrentUser': [],
    'personalProviders:list': [],
    'onboarding:resolveStableId': 'yard',
    'horses:list': [],
    'stableMembers:listWithUsers': { invitations: [], members: [] },
    'stableMembers:getMyDetails': {
      _id: 'membership',
      userId: 'rider-id',
      stableId: 'yard',
    },
  }
  state.sync.mockReset().mockResolvedValue('rider-id')
  state.uploadUrl.mockReset().mockResolvedValue({
    uploadUrl: 'https://upload.invalid/profile',
    uploadToken: 'upload-token',
  })
  state.saveProfile.mockReset().mockImplementation(async () => {
    savedProfile()
    publish()
  })
  state.createHorse.mockReset().mockResolvedValue('horse-1')
  state.createStable.mockReset().mockImplementation(async () => {
    stableSetup('owner', 'stable-operations')
    publish()
    return 'yard'
  })
  state.record.mockReset().mockImplementation(async ({ nextStep }) => {
    state.queries['onboarding:getStableProgress'] = {
      currentStep: nextStep,
      completedSteps: [],
      deferredSteps: [],
    }
    publish()
  })
  state.complete.mockReset().mockImplementation(async () => {
    state.queries['onboarding:getStableProgress'] = {
      currentStep: 'complete',
      completedSteps: [],
      deferredSteps: [],
      completedAt: 1,
    }
    state.queries['onboarding:getNextIncompleteStable'] = null
    publish()
  })
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

async function setup(path = '/') {
  const root = createRootRoute({
    component: () => (
      <AppUserStateProvider>
        <AppUserStateGate>
          <Outlet />
        </AppUserStateGate>
      </AppUserStateProvider>
    ),
  })
  const onboarding = createRoute({
    getParentRoute: () => root,
    path: '/onboarding',
    component: OnboardingRoute.options.component,
    validateSearch: OnboardingRoute.options.validateSearch,
  })
  const routes = [
    onboarding,
    createRoute({
      getParentRoute: () => root,
      path: '/',
      component: () => <h1>My horses home</h1>,
    }),
    createRoute({
      getParentRoute: () => root,
      path: '/horses/create',
      component: PersonalHorseForm,
    }),
    createRoute({
      getParentRoute: () => root,
      path: '/horses/$horseId',
      component: () => <h1>Saved horse</h1>,
    }),
    createRoute({
      getParentRoute: () => root,
      path: '/stables/$stableId',
      component: () => <h1>Stable dashboard</h1>,
    }),
    createRoute({
      getParentRoute: () => root,
      path: '/horse-invitations/$token',
      component: () => <h1>Horse invitation response</h1>,
    }),
    createRoute({
      getParentRoute: () => root,
      path: '/events/create',
      component: () => (
        <SignedOutRoutePrompt
          title="Appointments"
          description="Sign in to continue"
        />
      ),
    }),
  ]
  const router = createRouter({
    routeTree: root.addChildren(routes),
    history: createMemoryHistory({ initialEntries: [path] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
  return router
}

it.each([false, true])(
  'saves the personal profile (photo %s), creates the first horse, and does not bounce back on reload or return home',
  async (withPhoto) => {
    const upload = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ storageId: 'profile-image' }),
    })
    vi.stubGlobal('fetch', upload)
    let router = await setup()
    fireEvent.click(
      await screen.findByRole('button', { name: 'Manage my horses' }),
    )
    if (withPhoto) {
      const photo = new File(['sample image'], 'profile.png', {
        type: 'image/png',
      })
      const files = Object.assign([photo], {
        item: (index: number) => (index === 0 ? photo : null),
      })
      fireEvent.change(screen.getByLabelText('Profile image (optional)'), {
        target: { files },
      })
    }
    fireEvent.click(screen.getByRole('button', { name: 'Continue to horse' }))
    await screen.findByRole('heading', { name: 'Add horse · Personal' })
    expect(router.state.location.pathname).toBe('/horses/create')
    expect(state.saveProfile).toHaveBeenCalledTimes(1)
    expect(upload).toHaveBeenCalledTimes(withPhoto ? 1 : 0)
    if (withPhoto)
      expect(state.saveProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          profileImageId: 'profile-image',
          profileUploadToken: 'upload-token',
        }),
      )
    cleanup()
    router = await setup('/horses/create')
    await screen.findByRole('heading', { name: 'Add horse · Personal' })
    const horseName = screen.getByLabelText('Horse name')
    fireEvent.change(horseName, { target: { value: 'Maple' } })
    fireEvent.click(
      screen.getByRole('button', { name: 'Optional horse details' }),
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Show owner name suggestions' }),
    )
    fireEvent.click(
      await screen.findByRole('option', { name: 'Sample Rider (me)' }),
    )
    fireEvent.change(screen.getByLabelText('Or current age'), {
      target: { value: '8' },
    })
    fireEvent.submit(horseName.closest('form')!)
    await screen.findByRole('heading', { name: 'Saved horse' })
    expect(router.state.location.pathname).toBe('/horses/horse-1')
    expect(state.createHorse).toHaveBeenCalledTimes(1)
    expect(state.createHorse).toHaveBeenCalledWith(
      expect.objectContaining({ ownerName: 'Sample Rider' }),
    )
    await act(async () => router.navigate({ to: '/' }))
    await screen.findByRole('heading', { name: 'My horses home' })
    expect(router.state.location.pathname).toBe('/')
  },
)

it('stays on the profile after a rejected save and advances only after retry succeeds', async () => {
  state.saveProfile.mockRejectedValueOnce(new Error('offline'))
  const router = await setup()
  fireEvent.click(
    await screen.findByRole('button', { name: 'Manage my horses' }),
  )
  fireEvent.click(screen.getByRole('button', { name: 'Continue to horse' }))
  await screen.findByText(/Could not save your profile/)
  expect(router.state.location.pathname).toBe('/onboarding')
  fireEvent.click(screen.getByRole('button', { name: 'Continue to horse' }))
  await screen.findByRole('heading', { name: 'Add horse · Personal' })
})

it('preserves a shared horse destination through required profile setup', async () => {
  const router = await setup('/horses/horse-1?tab=care#latest')
  fireEvent.click(
    await screen.findByRole('button', { name: 'Save and continue' }),
  )
  await screen.findByRole('heading', { name: 'Saved horse' })
  expect(router.state.location.href).toBe('/horses/horse-1?tab=care#latest')
  expect(state.createHorse).not.toHaveBeenCalled()
})

it('reaches stable creation after saving the profile, then resumes the created stable setup', async () => {
  const router = await setup()
  fireEvent.click(
    await screen.findByRole('button', { name: 'Set up a stable' }),
  )
  fireEvent.click(screen.getByRole('button', { name: 'Continue to stable' }))
  const name = await screen.findByLabelText('Stable name')
  fireEvent.change(name, { target: { value: 'Sample Yard' } })
  fireEvent.change(screen.getByLabelText('Location'), {
    target: { value: 'Warsaw' },
  })
  fireEvent.submit(name.closest('form')!)
  await screen.findByLabelText('Primary contact')
  expect(router.state.location.search).toMatchObject({ stableId: 'yard' })
  expect(state.createStable).toHaveBeenCalledTimes(1)
})

it.each(['owner', 'member'] as const)(
  'resumes and finishes %s setup with optional steps deferred, then opens the stable without returning to onboarding',
  async (role) => {
    savedProfile()
    stableSetup(
      role,
      role === 'owner' ? 'stable-operations' : 'stable-introduction',
    )
    const router = await setup()
    if (role === 'member')
      fireEvent.click(await screen.findByRole('button', { name: 'Continue' }))
    fireEvent.click(
      await screen.findByRole('button', { name: 'Do this later' }),
    )
    await screen.findByLabelText('Horse name')
    fireEvent.click(screen.getByRole('button', { name: 'Do this later' }))
    if (role === 'owner')
      fireEvent.click(await screen.findByRole('button', { name: 'I’m ready' }))
    fireEvent.click(
      await screen.findByRole('button', { name: 'Open Sample Yard' }),
    )
    await screen.findByRole('heading', { name: 'Stable dashboard' })
    expect(state.complete).toHaveBeenCalledTimes(1)
    expect(router.state.location.pathname).toBe('/stables/yard')
    await act(async () =>
      router.navigate({ to: '/onboarding', search: { stableId: 'yard' } }),
    )
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/stables/yard'),
    )
    expect(state.complete).toHaveBeenCalledTimes(1)
  },
)

it('keeps an explicit horse invitation visible for a new account even with other invitations pending', async () => {
  state.queries['stableInvitations:listForCurrentUser'] = [
    { token: 'other-stable' },
  ]
  const router = await setup('/horse-invitations/horse-token')
  await screen.findByRole('heading', { name: 'Horse invitation response' })
  expect(router.state.location.pathname).toBe('/horse-invitations/horse-token')
})

it('preserves a protected destination in its sign-in action', async () => {
  savedProfile()
  await setup('/events/create?horseId=horse-1')
  expect(
    (await screen.findByTestId('sign-in')).getAttribute('data-return-to'),
  ).toBe('/events/create?horseId=horse-1')
})
