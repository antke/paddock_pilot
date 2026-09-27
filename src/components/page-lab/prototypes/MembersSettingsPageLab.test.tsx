// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import { MembersSettingsPageLab } from './MembersSettingsPageLab'

vi.mock('#/lib/devAuthBypass', () => ({ useDevAuthBypassEnabled: () => true }))
afterEach(cleanup)
const data = createDashboardLabFixtureData()
function setup(embedded = false) {
  render(<MembersSettingsPageLab data={data} embedded={embedded} />)
  fireEvent.change(screen.getByLabelText('Sample response time'), {
    target: { value: '100' },
  })
}
function row(name: string) {
  return within(
    screen
      .getByText(name)
      .closest('[data-slot="dashboard-item-card"]') as HTMLElement,
  )
}
function outcome(value: string) {
  fireEvent.change(screen.getByLabelText('Next sample request'), {
    target: { value },
  })
}

describe('actual members settings sample', () => {
  it('renders fifty members, complete invitation statuses and an owner-only empty state without live providers', () => {
    setup(true)
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Show 50 members' }))
    expect(
      screen.getAllByRole('button', { name: 'Edit details' }),
    ).toHaveLength(49)
    for (const label of [
      'Accepted',
      'Accepted, ready to activate',
      'Declined',
      'Revoked',
      'Expired',
      'Delivery failed',
    ])
      expect(screen.getByText(label, { exact: true })).toBeTruthy()
    expect(
      row('invite-7@example.test').queryByRole('button', { name: 'Resend' }),
    ).toBeNull()
    fireEvent.click(
      screen.getByRole('button', { name: 'Owner only, no invitations' }),
    )
    expect(screen.queryByRole('button', { name: 'Edit details' })).toBeNull()
    expect(screen.getByText('No invitations yet.')).toBeTruthy()
  })

  it('moves focus into the row editor, preserves rejected edits, and returns focus after save and cancel', async () => {
    setup()
    outcome('reject')
    const edit = row('Sample Rae').getByRole('button', { name: 'Edit details' })
    fireEvent.click(edit)
    const input = screen.getByLabelText<HTMLInputElement>('Yard display name')
    expect(document.activeElement).toBe(input)
    fireEvent.change(input, { target: { value: 'Sample Rowan' } })
    fireEvent.submit(input.closest('form')!)
    await waitFor(() =>
      expect(
        screen
          .getByRole('button', { name: 'Saving...' })
          .hasAttribute('disabled'),
      ).toBe(true),
    )
    expect(
      screen
        .getAllByRole('button', { name: 'Edit details' })
        .every((button) => button.hasAttribute('disabled')),
    ).toBe(true)
    await screen.findByText(
      'Could not save member details. Your changes are still here. Please try again.',
    )
    expect(input.value).toBe('Sample Rowan')
    fireEvent.submit(input.closest('form')!)
    await waitFor(() =>
      expect(screen.queryByLabelText('Yard display name')).toBeNull(),
    )
    expect(document.activeElement).toBe(edit)
    expect(screen.getByText('Sample Rowan')).toBeTruthy()
    fireEvent.click(edit)
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(document.activeElement).toBe(edit)
  })

  it('protects the invite dialog while pending, keeps rejected email for retry, and adds only acknowledged invitations', async () => {
    setup()
    outcome('reject')
    fireEvent.click(screen.getAllByRole('button', { name: 'Invite member' })[0])
    const input =
      await screen.findByLabelText<HTMLInputElement>('Email address')
    fireEvent.change(input, { target: { value: 'new-member@example.test' } })
    fireEvent.submit(input.closest('form')!)
    await waitFor(() =>
      expect(
        screen
          .getByRole('button', { name: 'Inviting...' })
          .hasAttribute('disabled'),
      ).toBe(true),
    )
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(
      screen.queryByText('new-member@example.test', { exact: true }),
    ).toBeNull()
    await screen.findByText(
      'Could not create the invitation. Check the email address and try again.',
    )
    expect(input.value).toBe('new-member@example.test')
    fireEvent.submit(input.closest('form')!)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(
      screen.getByText('new-member@example.test', { exact: true }),
    ).toBeTruthy()
    expect(screen.getByRole('status').textContent).toContain(
      'No email was sent',
    )
  })

  it('requires reassignment, exposes rejected removal inline, and transfers horses only after success', async () => {
    setup()
    outcome('reject')
    const removeTrigger = row('Sample Rae').getByRole('button', {
      name: 'Remove',
    })
    fireEvent.click(removeTrigger)
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(document.activeElement).toBe(removeTrigger))
    fireEvent.click(removeTrigger)
    const confirmation = await screen.findByRole('button', {
      name: 'Remove member',
    })
    expect(confirmation.hasAttribute('disabled')).toBe(true)
    fireEvent.change(screen.getByLabelText('New owner'), {
      target: { value: 'sample-member-user-1' },
    })
    fireEvent.click(confirmation)
    await screen.findByText(
      'Could not remove this member. Check the horse reassignment and try again.',
    )
    expect(screen.getByRole('alertdialog')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Remove member' }))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
    expect(screen.queryByText('Sample Rae', { exact: true })).toBeNull()
    await waitFor(() =>
      expect(
        screen.getAllByRole('button', { name: 'Invite member' }),
      ).toContain(document.activeElement),
    )
    expect(screen.getByRole('status').textContent).toContain(
      '2 horses reassigned locally',
    )
    fireEvent.click(
      row('Sample Alexandrina Montgomery-Wetherby').getByRole('button', {
        name: 'Remove',
      }),
    )
    expect(await screen.findByText('Reassign 2 horses first')).toBeTruthy()
    expect(screen.getByText(/Sample Clover, Sample Willow/)).toBeTruthy()
  })
})
