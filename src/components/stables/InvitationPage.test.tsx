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
}))
vi.mock('convex/react', () => ({
  useQuery: () => state.preview,
  useMutation: (reference: Parameters<typeof getFunctionName>[0]) =>
    getFunctionName(reference) === 'stableInvitations:accept'
      ? state.accept
      : state.decline,
}))
vi.mock('#/components/layout/AuthStateSwitch', () => ({
  AuthStateSwitch: ({ signedIn }: { signedIn: ReactNode }) => signedIn,
}))
vi.mock('@clerk/tanstack-react-start', () => ({
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
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
const InvitationPage = Route.options.component as ComponentType

describe('invitation response page', () => {
  it('offers accept and decline to the invited account', async () => {
    render(<InvitationPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Accept invitation' }))
    await waitFor(() =>
      expect(state.accept).toHaveBeenCalledWith({ token: 'test-token' }),
    )
    expect(
      screen.getByRole('button', { name: 'Decline invitation' }),
    ).toBeTruthy()
    expect(state.decline).not.toHaveBeenCalled()
  })

  it('declines using the invitation token', async () => {
    render(<InvitationPage />)
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
      render(<InvitationPage />)
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
    render(<InvitationPage />)
    expect(screen.getByRole('button', { name: 'Switch account' })).toBeTruthy()
    expect(
      screen.getByTestId('switch-account').getAttribute('data-return-to'),
    ).toBe('/invitations/test-token')
    expect(
      screen.queryByRole('button', { name: 'Accept invitation' }),
    ).toBeNull()
  })

  it('does not mislabel a missing account email as a different account', () => {
    state.preview.viewer.emailMatches = false
    state.preview.viewer.hasEmail = false
    render(<InvitationPage />)
    expect(
      screen.getByText('Your account email is not available yet'),
    ).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Switch account' })).toBeNull()
  })
})
