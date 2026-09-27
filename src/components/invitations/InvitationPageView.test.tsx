// @vitest-environment jsdom
import { useState } from 'react'
import type { ReactNode } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import {
  createInvitationSample,
  InvitationsPageLab,
} from '#/components/page-lab/prototypes/InvitationsPageLab'
import {
  InvitationPageView,
  InvitationQueryErrorView,
} from './InvitationPageView'
import type { InvitationPreview } from './InvitationPageView'

vi.mock('#/lib/devAuthBypass', () => ({
  useDevAuthBypassEnabled: vi.fn(() => true),
}))
vi.mock('convex/react', () => ({
  useMutation: () => {
    throw new Error('Sample must not mount real mutations')
  },
  useQuery: () => {
    throw new Error('Sample must not query live invitations')
  },
}))
beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
  vi.mocked(useDevAuthBypassEnabled).mockReturnValue(true)
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  vi.useRealTimers()
})
const data = () => createDashboardLabFixtureData()
const sample = (scenario = 'pending') =>
  createInvitationSample(data(), scenario)
async function mount(view: ReactNode) {
  const root = createRootRoute({ component: () => view })
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
}
function deferred() {
  let resolve!: () => void
  let reject!: () => void
  const promise = new Promise<void>((yes, no) => {
    resolve = yes
    reject = () => no(new Error('Sample failure'))
  })
  return { promise, resolve, reject }
}

describe('invitation response contract', () => {
  it('guards conflicting repeated actions, retains a failed choice and focuses the acknowledged result', async () => {
    const request = deferred()
    const accept = vi
      .fn()
      .mockReturnValueOnce(request.promise)
      .mockResolvedValue(undefined)
    const decline = vi.fn()
    await mount(
      <InvitationPageView
        preview={sample()}
        signedIn
        onAccept={accept}
        onDecline={decline}
      />,
    )
    const button = await screen.findByRole('button', {
      name: 'Accept invitation',
    })
    button.focus()
    fireEvent.click(button)
    fireEvent.click(button)
    fireEvent.click(screen.getByRole('button', { name: 'Decline invitation' }))
    expect(accept).toHaveBeenCalledTimes(1)
    expect(decline).not.toHaveBeenCalled()
    expect(screen.queryByText('Your stable membership is active.')).toBeNull()
    expect(
      screen
        .getByRole('button', { name: 'Accepting…' })
        .hasAttribute('disabled'),
    ).toBe(true)
    await act(async () => request.reject())
    const error = screen.getByRole('alert')
    const retry = screen.getByRole('button', { name: 'Try accepting again' })
    expect(retry.getAttribute('aria-describedby')).toBe(error.id)
    retry.focus()
    fireEvent.click(retry)
    expect(
      await screen.findByRole('heading', { name: /Welcome to/ }),
    ).toBeTruthy()
    expect(screen.getByText('Your stable membership is active.')).toBeTruthy()
    expect(screen.queryByRole('alert')).toBeNull()
    expect(document.activeElement).toBe(
      screen.getByRole('region', { name: 'Invitation response' }),
    )
    expect(accept).toHaveBeenCalledTimes(2)
  })

  it('retains failed decline for retry and never describes local sample acknowledgement as granted access', async () => {
    const decline = vi
      .fn()
      .mockRejectedValueOnce(new Error('Failure'))
      .mockResolvedValue(undefined)
    await mount(
      <InvitationPageView
        preview={sample()}
        signedIn
        sample
        onAccept={async () => {}}
        onDecline={decline}
      />,
    )
    fireEvent.click(
      await screen.findByRole('button', { name: 'Decline invitation' }),
    )
    const retry = await screen.findByRole('button', {
      name: 'Try declining again',
    })
    retry.focus()
    fireEvent.click(retry)
    expect(
      await screen.findByRole('heading', { name: 'Invitation declined' }),
    ).toBeTruthy()
    expect(screen.getByText(/This sample invitation is declined/)).toBeTruthy()
    expect(decline).toHaveBeenCalledTimes(2)
  })

  it('handles authoritative removal before the callback and does not steal unrelated focus afterward', async () => {
    const request = deferred()
    let update!: (preview: InvitationPreview) => void
    function Harness() {
      const [preview, setPreview] = useState(sample())
      update = setPreview
      return (
        <>
          <button>Unrelated control</button>
          <InvitationPageView
            preview={preview}
            signedIn
            onAccept={() => request.promise}
          />
        </>
      )
    }
    await mount(<Harness />)
    const accept = await screen.findByRole('button', {
      name: 'Accept invitation',
    })
    accept.focus()
    fireEvent.click(accept)
    act(() => update(sample('accepted')))
    expect(document.activeElement).toBe(
      screen.getByRole('region', { name: 'Invitation response' }),
    )
    screen.getByRole('button', { name: 'Unrelated control' }).focus()
    await act(async () => request.resolve())
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Unrelated control' }),
    )
    screen.getByRole('link', { name: /Continue to Sample/ }).focus()
    act(() => update({ state: 'not_found' }))
    expect(
      screen.getByRole('heading', { name: 'Invitation not found' }),
    ).toBeTruthy()
    expect(document.activeElement).toBe(
      screen.getByRole('region', { name: 'Invitation response' }),
    )
  })

  it.each([
    ['signed-out', 'Sign in with the invited account'],
    ['signed-out-accepted', 'Sign in to continue'],
    ['preparing', 'Preparing your account'],
    ['wrong-email', 'This invitation belongs to another email'],
    ['no-email', 'Your account email is not available yet'],
    ['expired', 'This invitation has expired'],
    ['revoked', 'This invitation was revoked'],
    ['declined', 'Invitation declined'],
    ['declined-other', 'Invitation declined'],
    ['accepted', 'You are already a member'],
    ['accepted-other', 'This invitation has already been used'],
    ['legacy-other', 'This invitation has already been accepted'],
    ['not-found', 'Invitation not found'],
  ])(
    'renders %s without offering an unauthorized decision',
    async (scenario, heading) => {
      await mount(
        <InvitationPageView
          preview={sample(scenario)}
          signedIn={!scenario.startsWith('signed-out')}
          onAccept={async () => {}}
          onDecline={async () => {}}
        />,
      )
      expect(await screen.findByRole('heading', { name: heading })).toBeTruthy()
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
      expect(
        screen.queryByRole('button', {
          name: /Accept invitation|Decline invitation|Activate membership/,
        }),
      ).toBeNull()
    },
  )

  it('awaits legacy activation and exposes retryable query failure with an H1', async () => {
    const request = deferred()
    await mount(
      <InvitationPageView
        preview={sample('legacy')}
        signedIn
        onAccept={() => request.promise}
      />,
    )
    const activate = await screen.findByRole('button', {
      name: 'Activate membership',
    })
    activate.focus()
    fireEvent.click(activate)
    expect(screen.queryByRole('heading', { name: /Welcome to/ })).toBeNull()
    await act(async () => request.resolve())
    expect(screen.getByRole('heading', { name: /Welcome to/ })).toBeTruthy()
    cleanup()
    const retry = vi.fn()
    await mount(<InvitationQueryErrorView onRetry={retry} />)
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Invitation unavailable',
      }),
    ).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(retry).toHaveBeenCalledOnce()
  })
})

describe('local invitation sample boundary', () => {
  it('simulates a delayed failure/retry and ignores an interrupted sample', async () => {
    await mount(<InvitationsPageLab data={data()} />)
    await screen.findByLabelText('Sample invitation state')
    fireEvent.change(screen.getByLabelText('Next sample response'), {
      target: { value: 'failure' },
    })
    fireEvent.change(screen.getByLabelText('Sample response time'), {
      target: { value: '3000' },
    })
    vi.useFakeTimers()
    fireEvent.click(screen.getByRole('button', { name: 'Accept invitation' }))
    await act(async () => vi.advanceTimersByTimeAsync(3000))
    expect(screen.getByRole('alert')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Try accepting again' }))
    await act(async () => vi.advanceTimersByTimeAsync(3000))
    expect(
      screen.getByText(
        'This sample shows active membership. No real stable access was granted.',
      ),
    ).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Sample invitation state'), {
      target: { value: 'long' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Accept invitation' }))
    fireEvent.change(screen.getByLabelText('Sample invitation state'), {
      target: { value: 'expired' },
    })
    await act(async () => vi.advanceTimersByTimeAsync(4000))
    expect(
      screen.getByRole('heading', { name: 'This invitation has expired' }),
    ).toBeTruthy()
    expect(screen.queryByText(/Sample invitation accepted/)).toBeNull()
  })

  it.each(['production', 'fixture-off'])(
    'does not mount sample data or decisions in %s',
    async (boundary) => {
      if (boundary === 'production') vi.stubEnv('DEV', false)
      else vi.mocked(useDevAuthBypassEnabled).mockReturnValue(false)
      await mount(<InvitationsPageLab data={data()} />)
      expect(
        await screen.findByText(/Invitation access samples require/),
      ).toBeTruthy()
      expect(screen.queryByLabelText('Sample invitation state')).toBeNull()
      expect(screen.queryByText(/Sample Cedar Ridge/)).toBeNull()
    },
  )
})
