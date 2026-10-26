// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ComponentType, ReactNode } from 'react'
import type * as Buttons from '#/components/ui/button'
import { getFunctionName } from 'convex/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from 'convex/_generated/api'
import { Route } from '#/routes/invitations/$token'

const state = vi.hoisted(() => ({
  preview: {
    state: 'found',
    token: 'test-token',
    stableId: 'yard-id',
    stableName: 'Willow Yard',
    stableLocation: 'Warsaw',
    inviterName: 'Owner',
    emailHint: 'me••••@example.com',
    expiresAt: Date.now() + 60_000,
    status: 'pending',
    viewer: {
      emailMatches: true,
      hasEmail: true,
      isAcceptedByViewer: false,
      isDeclinedByViewer: false,
    },
  },
  accept: vi.fn(),
  decline: vi.fn(),
  sync: vi.fn(),
  reload: vi.fn(),
  prepareVerification: vi.fn(),
  attemptVerification: vi.fn(),
  openUserProfile: vi.fn(),
  emailStatus: 'unverified',
}))
vi.mock('convex/react', () => ({
  useAction: () => state.sync,
  useQuery: () => [],
  useMutation: (reference: Parameters<typeof getFunctionName>[0]) =>
    getFunctionName(reference) === 'stableInvitations:accept'
      ? state.accept
      : state.decline,
}))
vi.mock('#/components/layout/AuthStateSwitch', () => ({
  AuthStateSwitch: ({ signedIn }: { signedIn: ReactNode }) => signedIn,
}))
vi.mock('@clerk/tanstack-react-start', () => ({
  useClerk: () => ({ openUserProfile: state.openUserProfile }),
  useUser: () => ({
    isLoaded: true,
    user: {
      id: 'member',
      reload: state.reload,
      primaryEmailAddress: {
        id: 'email',
        emailAddress: 'member@example.com',
        verification: { status: state.emailStatus },
        prepareVerification: state.prepareVerification,
        attemptVerification: state.attemptVerification,
      },
    },
  }),
  SignOutButton: ({
    children,
    redirectUrl,
  }: {
    children: ReactNode
    redirectUrl: string
  }) => (
    <div data-testid="switch-account" data-return-to={redirectUrl}>
      {children}
    </div>
  ),
  SignInButton: ({ children }: { children: ReactNode }) => children,
  SignUpButton: ({ children }: { children: ReactNode }) => children,
}))
vi.mock('#/components/ui/button', async (importOriginal) => ({
  ...(await importOriginal<typeof Buttons>()),
  ButtonLink: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))
vi.mock('#/components/ui/sonner', () => ({
  showAppSuccessToast: vi.fn(),
  showAppErrorToast: vi.fn(),
}))

beforeEach(() => {
  vi.spyOn(Route, 'useParams').mockReturnValue({ token: 'test-token' })
  state.preview.status = 'pending'
  state.preview.viewer = {
    emailMatches: true,
    hasEmail: true,
    isAcceptedByViewer: false,
    isDeclinedByViewer: false,
  }
  state.accept.mockReset().mockResolvedValue({ stableId: 'yard-id' })
  state.decline.mockReset().mockResolvedValue(undefined)
  state.sync.mockReset().mockResolvedValue('member')
  state.reload.mockReset().mockResolvedValue(undefined)
  state.prepareVerification.mockReset().mockResolvedValue(undefined)
  state.attemptVerification
    .mockReset()
    .mockResolvedValue({ verification: { status: 'verified' } })
  state.openUserProfile.mockReset()
  state.emailStatus = 'unverified'
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
const InvitationPage = Route.options.component as ComponentType

function renderInvitationPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  // Use the route's real suspense-query contract with local cached data only.
  queryClient.setQueryData(
    convexQuery(api.stableInvitations.preview, { token: 'test-token' })
      .queryKey,
    state.preview,
  )
  return render(
    <QueryClientProvider client={queryClient}>
      <InvitationPage />
    </QueryClientProvider>,
  )
}

describe('invitation response page', () => {
  it('offers accept and decline to the invited account', async () => {
    renderInvitationPage()
    expect(
      screen.getByRole('button', { name: 'Decline invitation' }),
    ).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Accept invitation' }))
    await waitFor(() =>
      expect(state.accept).toHaveBeenCalledWith({ token: 'test-token' }),
    )
    expect(
      await screen.findByRole('heading', { name: 'Welcome to Willow Yard' }),
    ).toBeTruthy()
    expect(
      screen.queryByRole('button', { name: 'Decline invitation' }),
    ).toBeNull()
    expect(state.decline).not.toHaveBeenCalled()
  })

  it('declines using the invitation token', async () => {
    renderInvitationPage()
    fireEvent.click(screen.getByRole('button', { name: 'Decline invitation' }))
    await waitFor(() =>
      expect(state.decline).toHaveBeenCalledWith({ token: 'test-token' }),
    )
    expect(state.accept).not.toHaveBeenCalled()
  })

  it.each(['accepted', 'declined'])(
    'offers own-stable creation after the invitation is %s',
    (status) => {
      state.preview.status = status
      state.preview.viewer.isAcceptedByViewer = status === 'accepted'
      state.preview.viewer.isDeclinedByViewer = status === 'declined'
      renderInvitationPage()
      expect(
        screen
          .getByRole('link', { name: 'Create my own stable' })
          .getAttribute('href'),
      ).toBe('/stables/create')
      expect(
        screen.queryByRole('button', { name: 'Accept invitation' }),
      ).toBeNull()
    },
  )

  it('preserves the invitation URL when switching the wrong account', () => {
    state.preview.viewer.emailMatches = false
    renderInvitationPage()
    expect(screen.getByRole('button', { name: 'Switch account' })).toBeTruthy()
    expect(
      screen.getByTestId('switch-account').getAttribute('data-return-to'),
    ).toBe('/invitations/test-token')
    expect(
      screen.queryByRole('button', { name: 'Accept invitation' }),
    ).toBeNull()
  })

  it('offers code entry for an unverified account without sending another email automatically', () => {
    state.preview.viewer.emailMatches = false
    state.preview.viewer.hasEmail = false
    renderInvitationPage()
    expect(
      screen.getByRole('heading', { name: 'Verify your email to join' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('textbox', { name: 'Confirmation code' }),
    ).toBeTruthy()
    expect(state.prepareVerification).not.toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: 'Switch account' })).toBeNull()
  })

  function renderRecovery() {
    state.preview.viewer.emailMatches = false
    state.preview.viewer.hasEmail = false
    renderInvitationPage()
  }

  it('verifies an existing code and then syncs the account without accepting automatically', async () => {
    renderRecovery()
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Confirmation code' }),
      { target: { value: '012345' } },
    )
    fireEvent.click(screen.getByRole('button', { name: 'Verify email' }))
    await waitFor(() => expect(state.sync).toHaveBeenCalledWith({}))
    expect(state.attemptVerification).toHaveBeenCalledWith({ code: '012345' })
    expect(state.reload).toHaveBeenCalledOnce()
    expect(state.accept).not.toHaveBeenCalled()
    expect(
      screen.queryByRole('textbox', { name: 'Confirmation code' }),
    ).toBeNull()
  })

  it('retains an invalid code and offers a new code without syncing', async () => {
    state.attemptVerification.mockRejectedValue(new Error('Expired code'))
    renderRecovery()
    const input = screen.getByRole<HTMLInputElement>('textbox', {
      name: 'Confirmation code',
    })
    fireEvent.change(input, { target: { value: '012345' } })
    fireEvent.click(screen.getByRole('button', { name: 'Verify email' }))
    expect((await screen.findByRole('alert')).textContent).toContain(
      'couldn’t verify',
    )
    expect(input.value).toBe('012345')
    expect(state.sync).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Send a new code' }))
    await waitFor(() =>
      expect(state.prepareVerification).toHaveBeenCalledWith({
        strategy: 'email_code',
      }),
    )
    await waitFor(() => expect(input.value).toBe(''))
    expect(document.activeElement).toBe(input)
  })

  it('keeps a verified email verified when sync fails and retries the sync', async () => {
    state.sync.mockRejectedValueOnce(new Error('Offline'))
    renderRecovery()
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Confirmation code' }),
      { target: { value: '012345' } },
    )
    fireEvent.click(screen.getByRole('button', { name: 'Verify email' }))
    expect((await screen.findByRole('alert')).textContent).toContain(
      'couldn’t refresh',
    )
    expect(screen.queryByRole('textbox')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Refresh account' }))
    await waitFor(() => expect(state.sync).toHaveBeenCalledTimes(2))
    expect(state.attemptVerification).toHaveBeenCalledOnce()
  })

  it('refreshes an already verified account and provides account settings', async () => {
    state.emailStatus = 'verified'
    renderRecovery()
    expect(screen.queryByRole('textbox')).toBeNull()
    fireEvent.click(
      screen.getByRole('button', { name: 'Open account settings' }),
    )
    expect(state.openUserProfile).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByRole('button', { name: 'Refresh account' }))
    await waitFor(() => expect(state.sync).toHaveBeenCalledOnce())
    expect(state.reload).toHaveBeenCalledOnce()
  })

  it('prevents duplicate submissions while verification is pending', async () => {
    let resolve!: (result: unknown) => void
    state.attemptVerification.mockReturnValue(
      new Promise((done) => {
        resolve = done
      }),
    )
    renderRecovery()
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Confirmation code' }),
      { target: { value: '012345' } },
    )
    const button = screen.getByRole('button', { name: 'Verify email' })
    fireEvent.click(button)
    fireEvent.click(button)
    expect(state.attemptVerification).toHaveBeenCalledOnce()
    expect(
      screen.getByRole<HTMLButtonElement>('button', {
        name: 'Send a new code',
      }).disabled,
    ).toBe(true)
    resolve({ verification: { status: 'verified' } })
    await waitFor(() => expect(state.sync).toHaveBeenCalledOnce())
  })
})
