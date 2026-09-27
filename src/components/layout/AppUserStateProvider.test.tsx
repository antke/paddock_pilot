// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getFunctionName } from 'convex/server'
import type { ReactNode } from 'react'
import type * as RouterModule from '@tanstack/react-router'
import { AppUserStateGate, AppUserStateProvider } from './AppUserStateProvider'
import { ApplicationRouteShell } from './ApplicationRouteShell'

const state = vi.hoisted(() => ({
  path: '/',
  clerkUserId: 'member',
  subject: 'member',
  currentUser: { _id: 'member-id', clerkId: 'member' },
  invitations: [] as Array<{ token: string }> | undefined,
  stables: [] as Array<{ _id: string; name: string }>,
  nextOnboarding: null as { stableId: string } | null,
  sync: vi.fn(),
  signOut: vi.fn(),
}))
vi.mock('@clerk/tanstack-react-start', () => ({
  useAuth: () => ({ userId: state.clerkUserId }),
  useClerk: () => ({ signOut: state.signOut }),
  ClerkLoaded: ({ children }: { children: ReactNode }) => children,
  ClerkLoading: () => null,
  Show: ({ when, children }: { when: string; children: ReactNode }) =>
    (when === 'signed-in') === !!state.clerkUserId ? children : null,
}))
vi.mock('convex/react', () => ({
  useConvexAuth: () => ({
    isAuthenticated: !!state.clerkUserId,
    isLoading: false,
  }),
  useAction: () => state.sync,
  useQuery: (
    reference: Parameters<typeof getFunctionName>[0],
    args: unknown,
  ) => {
    if (args === 'skip') return undefined
    switch (getFunctionName(reference)) {
      case 'users:getCurrentIdentity':
        return { subject: state.subject }
      case 'users:getCurrentUser':
        return state.currentUser
      case 'stables:list':
        return state.stables
      case 'onboarding:getNextIncompleteStable':
        return state.nextOnboarding
      case 'stableInvitations:listForCurrentUser':
        return state.invitations
      default:
        throw new Error(`Unexpected query ${getFunctionName(reference)}`)
    }
  },
}))
vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof RouterModule>()),
  useLocation: () => ({ pathname: state.path }),
  Navigate: (props: {
    to: string
    params?: { token: string }
    search?: { stableId: string }
  }) => <div data-testid="redirect">{JSON.stringify(props)}</div>,
}))
vi.mock('./RoutePending', () => ({
  RoutePending: () => <p>Loading account</p>,
}))
vi.mock('../Header', () => ({
  default: () => <header>Application navigation</header>,
}))
vi.mock('../Footer', () => ({
  default: () => <footer>Application footer</footer>,
}))
vi.mock('#/lib/devAuthBypass', () => ({
  useDevAuthBypassEnabled: () => false,
}))

beforeEach(() => {
  state.path = '/'
  state.clerkUserId = 'member'
  state.subject = 'member'
  state.currentUser = { _id: 'member-id', clerkId: 'member' }
  state.invitations = []
  state.stables = []
  state.nextOnboarding = null
  state.sync.mockReset().mockResolvedValue('member-id')
  state.signOut.mockReset().mockResolvedValue(undefined)
  localStorage.clear()
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})
const app = () => (
  <AppUserStateProvider>
    <ApplicationRouteShell pathname={state.path}>
      <AppUserStateGate>
        <p>Requested page</p>
      </AppUserStateGate>
    </ApplicationRouteShell>
  </AppUserStateProvider>
)
const redirect = () => JSON.parse(screen.getByTestId('redirect').textContent)

describe('invitation-first account routing', () => {
  it.each(['/', '/onboarding', '/stables/create'])(
    'shows invitations before onboarding at %s',
    async (path) => {
      state.path = path
      state.invitations = [
        { token: 'invite-first' },
        { token: 'invite-second' },
      ]
      render(app())
      await waitFor(() =>
        expect(redirect()).toMatchObject({
          to: '/invitations/$token',
          params: { token: 'invite-first' },
        }),
      )
      expect(state.sync).toHaveBeenCalledTimes(1)
    },
  )

  it('checks invitations before resuming an existing stable setup', async () => {
    state.stables = [{ _id: 'stable', name: 'Own stable' }]
    state.nextOnboarding = { stableId: 'stable' }
    state.invitations = [{ token: 'invite-first' }]
    render(app())
    await waitFor(() => expect(redirect().to).toBe('/invitations/$token'))
  })

  it('waits for invitations instead of flashing the onboarding form', async () => {
    state.path = '/onboarding'
    state.invitations = undefined
    render(app())
    await waitFor(() => expect(state.sync).toHaveBeenCalledTimes(1))
    expect(screen.queryByText('Requested page')).toBeNull()
    expect(screen.queryByTestId('redirect')).toBeNull()
  })

  it('continues normal first-stable onboarding when there are no invitations', async () => {
    render(app())
    await waitFor(() => expect(redirect().to).toBe('/onboarding'))
  })

  it('leaves the invitation response page visible while other invitations are pending', async () => {
    state.path = '/invitations/invite-first'
    state.invitations = [{ token: 'invite-second' }]
    render(app())
    await screen.findByText('Requested page')
    expect(screen.queryByTestId('redirect')).toBeNull()
  })

  it('allows creating an owned stable after responding, even with member onboarding incomplete', async () => {
    state.path = '/stables/create'
    state.stables = [{ _id: 'joined', name: 'Joined stable' }]
    state.nextOnboarding = { stableId: 'joined' }
    render(app())
    await screen.findByText('Requested page')
    expect(screen.queryByTestId('redirect')).toBeNull()
  })

  it('waits for Convex to recognize the switched Clerk account before syncing or rendering', async () => {
    state.path = '/invitations/invite-first'
    const view = render(app())
    await screen.findByText('Requested page')
    state.clerkUserId = 'second-account'
    view.rerender(app())
    expect(screen.queryByText('Requested page')).toBeNull()
    expect(state.sync).toHaveBeenCalledTimes(1)
    state.subject = 'second-account'
    state.currentUser = { _id: 'second-id', clerkId: 'second-account' }
    view.rerender(app())
    await screen.findByText('Requested page')
    expect(state.sync).toHaveBeenCalledTimes(2)
  })

  it('lets users retry account synchronization without a sign-in loop', async () => {
    state.path = '/invitations/invite-first'
    state.sync.mockRejectedValueOnce(new Error('temporarily unavailable'))
    render(app())
    await screen.findByText('Could not prepare your account')
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    await screen.findByText('Requested page')
    expect(state.sync).toHaveBeenCalledTimes(2)
  })

  it('preserves the shell during initial account loading and a failed refresh', async () => {
    state.sync.mockRejectedValueOnce(new Error('unavailable'))
    render(app())
    expect(screen.getByRole('banner').textContent).toBe(
      'Application navigation',
    )
    expect(screen.getByRole('contentinfo').textContent).toBe(
      'Application footer',
    )
    expect(screen.getByRole('main').textContent).toContain('Loading account')
    await screen.findByRole('heading', {
      name: 'Could not prepare your account',
    })
    expect(screen.getByRole('banner')).toBeTruthy()
    expect(screen.getByRole('contentinfo')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Reload page' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeTruthy()
    expect(screen.queryByText('Requested page')).toBeNull()
  })

  it('shows retry progress and a repeated failure while keeping sign-out available', async () => {
    let rejectRetry!: (reason: Error) => void
    state.sync
      .mockRejectedValueOnce(new Error('unavailable'))
      .mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            rejectRetry = reject
          }),
      )
    render(app())
    fireEvent.click(await screen.findByRole('button', { name: 'Try again' }))
    const retry = screen.getByRole<HTMLButtonElement>('button', {
      name: 'Trying again…',
    })
    expect(retry.disabled).toBe(true)
    expect(screen.getByRole('status').textContent).toBe(
      'Refreshing your account…',
    )
    fireEvent.click(retry)
    expect(state.sync).toHaveBeenCalledTimes(2)
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeTruthy()
    await act(async () => rejectRetry(new Error('still unavailable')))
    expect(screen.getByRole('status').textContent).toContain(
      'still couldn’t be refreshed',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    await waitFor(() =>
      expect(state.signOut).toHaveBeenCalledWith({ redirectUrl: '/sign-in' }),
    )
  })

  it('explains a failed sign-out and allows another attempt', async () => {
    state.sync.mockRejectedValue(new Error('unavailable'))
    state.signOut.mockRejectedValueOnce(new Error('offline'))
    render(app())
    fireEvent.click(await screen.findByRole('button', { name: 'Sign out' }))
    await screen.findByText(/We couldn’t sign you out/)
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    await waitFor(() => expect(state.signOut).toHaveBeenCalledTimes(2))
  })

  it('times out stalled synchronization and ignores its late result after retry', async () => {
    vi.useFakeTimers()
    state.path = '/invitations/invite-first'
    let resolveStalled!: () => void
    state.sync
      .mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            resolveStalled = resolve
          }),
      )
      .mockRejectedValueOnce(new Error('retry failed'))
    render(app())
    await act(async () => {
      await vi.advanceTimersByTimeAsync(20_000)
    })
    expect(
      screen.getByRole('heading', { name: 'Could not prepare your account' }),
    ).toBeTruthy()
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    })
    await act(async () => resolveStalled())
    expect(screen.queryByText('Requested page')).toBeNull()
    expect(screen.getByRole('status').textContent).toContain(
      'still couldn’t be refreshed',
    )
  })
})
