// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import type { ReactNode, ComponentProps } from 'react'
import { getFunctionName } from 'convex/server'
import { HorseInvitation, HorseInvitationView } from './HorseInvitation'
import { HorseInvitationSignIn } from '#/routes/horse-invitations/$token'

const queries = vi.hoisted(() => ({
  calls: [] as Array<{ name: string; args: unknown }>,
}))
vi.mock('convex/react', () => ({
  useQuery: (ref: Parameters<typeof getFunctionName>[0], args: unknown) => {
    const name = getFunctionName(ref)
    queries.calls.push({ name, args })
    return name.endsWith(':invitationStatus')
      ? { status: 'wrong_account' }
      : undefined
  },
  useMutation: () => vi.fn(),
}))
vi.mock('@clerk/tanstack-react-start', () => ({
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
  SignUpButton: ({
    forceRedirectUrl,
    children,
  }: {
    forceRedirectUrl: string
    children: ReactNode
  }) => (
    <div data-testid="sign-up" data-return-to={forceRedirectUrl}>
      {children}
    </div>
  ),
}))
afterEach(() => {
  cleanup()
  queries.calls = []
})
async function mount(view: ReactNode) {
  const router = createRouter({
    routeTree: createRootRoute({ component: () => view }),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
}
const data = {
  horseName: 'Juniper',
  stableName: undefined,
  processing: false,
  expired: false,
  leaving: false,
  departure: null,
  invitation: {
    horseId: 'horse',
    status: 'pending',
    kind: 'carer',
    role: 'viewer',
  },
} as NonNullable<ComponentProps<typeof HorseInvitationView>['data']>
it('preserves the invitation path for both account entry actions and explains the invited address', () => {
  render(<HorseInvitationSignIn token="token-123" />)
  expect(screen.getByTestId('sign-in').getAttribute('data-return-to')).toBe(
    '/horse-invitations/token-123',
  )
  expect(screen.getByTestId('sign-up').getAttribute('data-return-to')).toBe(
    '/horse-invitations/token-123',
  )
  expect(screen.getByText(/using the email address that received/)).toBeTruthy()
})
it('does not query private invitation details when signed into the wrong account', async () => {
  await mount(
    <HorseInvitation
      token="token"
      accountActions={<button>Switch account</button>}
    />,
  )
  expect(screen.getByRole('button', { name: 'Switch account' })).toBeTruthy()
  expect(
    queries.calls
      .filter((call) => call.name.endsWith(':invitation'))
      .every((call) => call.args === 'skip'),
  ).toBe(true)
  expect(screen.queryByText('Juniper')).toBeNull()
})
it.each(['expired', 'revoked', 'declined', 'unavailable'] as const)(
  'gives %s recipients a useful next step without private data',
  async (status) => {
    await mount(
      <HorseInvitationView status={status} data={data} onRespond={vi.fn()} />,
    )
    expect(screen.getByRole('status').textContent).toMatch(
      /sender|person who invited/,
    )
    expect(screen.getByRole('link', { name: 'Back to my horses' })).toBeTruthy()
    expect(screen.queryByText('Juniper')).toBeNull()
  },
)
it('guards duplicate/conflicting responses and permits a failed acceptance to retry', async () => {
  let reject!: (error: Error) => void
  const respond = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise((_, fail) => {
          reject = fail
        }),
    )
    .mockResolvedValue(undefined)
  await mount(
    <HorseInvitationView status="ready" data={data} onRespond={respond} />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Accept invitation' }))
  fireEvent.click(screen.getByRole('button', { name: 'Accepting invitation…' }))
  fireEvent.click(screen.getByRole('button', { name: 'Decline' }))
  expect(respond).toHaveBeenCalledTimes(1)
  await act(async () => reject(new Error('Temporary network failure')))
  expect(screen.getByRole('alert').textContent).toContain('try again')
  fireEvent.click(screen.getByRole('button', { name: 'Try accepting again' }))
  expect(await screen.findByRole('link', { name: 'Open horse' })).toBeTruthy()
  expect(respond).toHaveBeenCalledTimes(2)
})
