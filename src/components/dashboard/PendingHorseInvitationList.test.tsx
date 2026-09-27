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
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import {
  HorseInvitationsPageLab,
  createHorseInvitationSamples,
} from '#/components/page-lab/prototypes/HorseInvitationsPageLab'
import { PendingHorseInvitationList } from './PendingHorseInvitationList'
import { useMutation } from 'convex/react'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'

vi.mock('#/lib/devAuthBypass', () => ({
  useDevAuthBypassEnabled: vi.fn(() => true),
}))
beforeEach(() => {
  vi.mocked(useDevAuthBypassEnabled).mockReturnValue(true)
})

vi.mock('convex/react', () => ({
  useMutation: vi.fn(() => {
    throw new Error('Local invitation samples must not mount live mutations')
  }),
}))
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})
const data = createDashboardLabFixtureData()
const invitations = createHorseInvitationSamples(data).slice(0, 2)
const target = (index: number) =>
  `${invitations[index].horse!.name} to ${invitations[index].event!.title}`
function action(verb: string, index: number) {
  return screen.getByRole<HTMLButtonElement>('button', {
    name: `${verb} invitation for ${target(index)}`,
  })
}
function deferred() {
  let resolve!: () => void
  let reject!: (error: Error) => void
  const promise = new Promise<void>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('pending horse invitation decisions', () => {
  it('guards each invitation independently and retains a failed row for retry without early acknowledgement', async () => {
    const a = deferred()
    const b = deferred()
    const approve = vi.fn(() => a.promise)
    const decline = vi
      .fn()
      .mockReturnValueOnce(b.promise)
      .mockResolvedValueOnce(undefined)
    render(
      <PendingHorseInvitationList
        invitations={invitations}
        onApprove={approve}
        onDecline={decline}
      />,
    )
    fireEvent.click(action('Approve', 0))
    fireEvent.click(action('Decline', 1))
    fireEvent.click(action('Approving', 0))
    fireEvent.click(action('Approve', 1))
    expect(approve).toHaveBeenCalledTimes(1)
    expect(decline).toHaveBeenCalledTimes(1)
    expect(action('Approving', 0).disabled).toBe(true)
    expect(action('Declining', 1).disabled).toBe(true)
    expect(screen.getByRole('status').textContent).toBe('')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    await act(async () => a.resolve())
    expect(action('Declining', 1).disabled).toBe(true)
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    expect(screen.getByRole('status').textContent).toContain('was approved')
    await act(async () => b.reject(new Error('Offline')))
    const error = screen.getByRole('alert')
    expect(error.textContent).toContain('Could not decline')
    expect(action('Decline', 1).getAttribute('aria-describedby')).toBe(error.id)
    fireEvent.click(action('Decline', 1))
    await screen.findByText('No pending horse invitations.')
    expect(screen.getByRole('status').textContent).toContain('was declined')
    expect(decline).toHaveBeenCalledTimes(2)
  })

  it('moves focus to a surviving row and then the empty region after the final acknowledgement', async () => {
    render(
      <PendingHorseInvitationList
        invitations={invitations}
        onApprove={vi.fn().mockResolvedValue(undefined)}
        onDecline={vi.fn().mockResolvedValue(undefined)}
      />,
    )
    action('Approve', 0).focus()
    fireEvent.click(action('Approve', 0))
    await waitFor(() =>
      expect(document.activeElement).toBe(action('Decline', 1)),
    )
    fireEvent.click(action('Decline', 1))
    await screen.findByText('No pending horse invitations.')
    expect(document.activeElement).toBe(
      screen.getByRole('region', { name: 'Horse invitations' }),
    )
  })

  it('handles query removal before mutation acknowledgement and does not steal another control’s focus', async () => {
    const request = deferred()
    const approve = vi.fn(() => request.promise)
    const decline = vi.fn()
    const { rerender } = render(
      <>
        <button>Another task</button>
        <PendingHorseInvitationList
          invitations={invitations}
          onApprove={approve}
          onDecline={decline}
        />
      </>,
    )
    action('Approve', 0).focus()
    fireEvent.click(action('Approve', 0))
    rerender(
      <>
        <button>Another task</button>
        <PendingHorseInvitationList
          invitations={invitations.slice(1)}
          onApprove={approve}
          onDecline={decline}
        />
      </>,
    )
    expect(document.activeElement).toBe(action('Decline', 1))
    const elsewhere = screen.getByRole('button', { name: 'Another task' })
    elsewhere.focus()
    await act(async () => request.resolve())
    expect(document.activeElement).toBe(elsewhere)
    expect(screen.getByRole('status').textContent).toContain('was approved')
  })

  it('shows a later re-invitation when the backend reuses an acknowledged row ID', async () => {
    const approve = vi.fn().mockResolvedValue(undefined)
    const decline = vi.fn().mockResolvedValue(undefined)
    const item = invitations[0]
    const { rerender } = render(
      <PendingHorseInvitationList
        invitations={[item]}
        onApprove={approve}
        onDecline={decline}
      />,
    )
    fireEvent.click(action('Decline', 0))
    await screen.findByText('No pending horse invitations.')
    const invitedAt =
      (item.invitation.invitedAt ??
        item.invitation.updatedAt ??
        item.invitation._creationTime) + 1
    rerender(
      <PendingHorseInvitationList
        invitations={[
          {
            ...item,
            invitation: { ...item.invitation, invitedAt, updatedAt: invitedAt },
          },
        ]}
        onApprove={approve}
        onDecline={decline}
      />,
    )
    fireEvent.click(action('Approve', 0))
    await waitFor(() => expect(approve).toHaveBeenCalledTimes(1))
  })

  it('keeps a new empty production section hidden and explicitly renders the sample empty state', () => {
    const { rerender } = render(
      <PendingHorseInvitationList
        invitations={[]}
        onApprove={vi.fn()}
        onDecline={vi.fn()}
      />,
    )
    expect(screen.queryByRole('region')).toBeNull()
    rerender(
      <PendingHorseInvitationList
        showWhenEmpty
        invitations={[]}
        onApprove={vi.fn()}
        onDecline={vi.fn()}
      />,
    )
    expect(screen.getByText('No pending horse invitations.')).toBeTruthy()
  })

  it.each([
    [true, false],
    [false, true],
  ])(
    'does not mount invitation simulations outside the development fixture boundary (DEV=%s, fixture=%s)',
    (dev, fixture) => {
      vi.stubEnv('DEV', dev)
      vi.mocked(useDevAuthBypassEnabled).mockReturnValue(fixture)
      render(<HorseInvitationsPageLab data={data} />)
      expect(
        screen.getByText(
          'Invitation simulations are available only with development sample data.',
        ),
      ).toBeTruthy()
      expect(screen.queryByLabelText('Sample invitations')).toBeNull()
      expect(document.body.textContent).not.toContain(data.horses[0].name)
      expect(useMutation).not.toHaveBeenCalled()
    },
  )

  it('uses real local failure/retry flows and cancels interrupted samples without live hooks', async () => {
    render(<HorseInvitationsPageLab data={data} />)
    fireEvent.change(screen.getByLabelText('Next sample result'), {
      target: { value: 'failure' },
    })
    fireEvent.click(action('Approve', 0))
    await screen.findByText(
      'Could not approve this invitation. Please try again.',
    )
    fireEvent.click(action('Approve', 0))
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain('was approved'),
    )
    fireEvent.click(action('Decline', 1))
    fireEvent.change(screen.getByLabelText('Sample invitations'), {
      target: { value: 'empty' },
    })
    await screen.findByText('No pending horse invitations.')
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200))
    })
    expect(screen.getByRole('status').textContent).toBe('')
    expect(useMutation).not.toHaveBeenCalled()
    expect(createHorseInvitationSamples({ ...data, horses: [] })).toEqual([])
  })
})
