// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { StableInvitationsListView } from './StableInvitationsList'
import { StableInviteFormView } from './StableInviteForm'
import { StableMemberDetailsFormView } from './StableMemberDetailsForm'
import { RemoveMemberButtonView } from './StableMembersSettingsCard'

afterEach(cleanup)
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}
const member: Doc<'stableMembers'> = {
  _id: 'sample-member' as Id<'stableMembers'>,
  _creationTime: 1,
  stableId: 'sample-stable' as Id<'stables'>,
  userId: 'sample-user' as Id<'users'>,
  role: 'member',
  displayNameOverride: 'Sample Morgan',
  phone: '',
  emergencyContact: '',
}
function invitation(id: string): Doc<'stableInvitations'> {
  return {
    _id: id as Id<'stableInvitations'>,
    _creationTime: 1,
    stableId: member.stableId,
    email: `${id}@example.test`,
    role: 'member',
    status: 'pending',
    token: `sample-${id}`,
    invitedBy: member.userId,
    createdAt: 1,
    updatedAt: 1,
    expiresAt: Date.now() + 86400000,
  }
}

describe('member and invitation interaction ownership', () => {
  it.each([0, 1])(
    'keeps each invitation pending independently when row %s resolves first',
    async (first) => {
      const pending = [deferred<boolean>(), deferred<boolean>()]
      const onResend = vi.fn(
        (item: Doc<'stableInvitations'>) =>
          pending[item._id === 'one' ? 0 : 1].promise,
      )
      render(
        <StableInvitationsListView
          invitations={[invitation('one'), invitation('two')]}
          onResend={onResend}
          onRevoke={async () => true}
          onCopy={async () => {}}
        />,
      )
      const rows = ['one', 'two'].map((id) =>
        within(
          screen
            .getByText(`${id}@example.test`)
            .closest('[data-slot="dashboard-item-card"]') as HTMLElement,
        ),
      )
      fireEvent.click(rows[0].getByRole('button', { name: 'Resend' }))
      fireEvent.click(rows[1].getByRole('button', { name: 'Resend' }))
      fireEvent.click(rows[0].getByRole('button', { name: 'Resending...' }))
      expect(onResend).toHaveBeenCalledTimes(2)
      await act(async () => pending[first].resolve(true))
      expect(
        rows[first]
          .getByRole('button', { name: 'Resend' })
          .hasAttribute('disabled'),
      ).toBe(false)
      expect(
        rows[1 - first]
          .getByRole('button', { name: 'Resending...' })
          .hasAttribute('disabled'),
      ).toBe(true)
      expect(
        rows[1 - first]
          .getByRole('button', { name: 'Copy link' })
          .hasAttribute('disabled'),
      ).toBe(true)
      await act(async () => pending[1 - first].resolve(false))
      expect(
        rows[1 - first]
          .getByRole('button', { name: 'Resend' })
          .hasAttribute('disabled'),
      ).toBe(false)
    },
  )

  it('keeps revoke confirmation open through Escape and failure, then closes after successful retry', async () => {
    const pending = deferred<boolean>()
    const onRevoke = vi
      .fn()
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValueOnce(true)
    render(
      <StableInvitationsListView
        invitations={[invitation('one')]}
        onResend={async () => true}
        onRevoke={onRevoke}
        onCopy={async () => {}}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Revoke' }))
    fireEvent.keyDown(await screen.findByRole('alertdialog'), { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
    fireEvent.click(screen.getByRole('button', { name: 'Revoke' }))
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Revoke invitation',
      }),
    )
    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' })
    expect(screen.getByRole('alertdialog')).toBeTruthy()
    expect(
      screen
        .getByRole('button', { name: 'Keep invitation' })
        .hasAttribute('disabled'),
    ).toBe(true)
    await act(async () => pending.resolve(false))
    expect(screen.getByRole('alertdialog')).toBeTruthy()
    expect(screen.getByRole('alert').textContent).toContain(
      'Could not revoke this invitation',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Revoke invitation' }))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
    expect(onRevoke).toHaveBeenCalledTimes(2)
  })

  it('keeps member removal open while pending and after failure', async () => {
    const pending = deferred<boolean>()
    const onRemove = vi
      .fn()
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValueOnce(true)
    const person = { membership: member, user: null, role: member.role }
    render(
      <RemoveMemberButtonView
        member={person}
        membership={member}
        members={[person]}
        horses={[]}
        stableName="Sample stable"
        onRemove={onRemove}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
    fireEvent.click(
      await screen.findByRole('button', { name: 'Remove member' }),
    )
    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' })
    expect(screen.getByRole('alertdialog')).toBeTruthy()
    await act(async () => pending.resolve(false))
    expect(screen.getByRole('alertdialog')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Remove member' }))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
  })

  it('associates each member validation error and resets drafts when member identity changes', async () => {
    const props = {
      onSave: vi.fn(async () => true),
      onSaved: vi.fn(),
      onCancel: vi.fn(),
    }
    const { rerender } = render(
      <StableMemberDetailsFormView member={member} {...props} />,
    )
    for (const [label, length] of [
      ['Yard display name', 101],
      ['Phone', 51],
      ['Emergency contact', 501],
    ] as const) {
      fireEvent.change(screen.getByLabelText(label), {
        target: { value: 'x'.repeat(length) },
      })
    }
    fireEvent.submit(screen.getByLabelText('Phone').closest('form')!)
    await waitFor(() => expect(screen.getAllByRole('alert')).toHaveLength(3))
    for (const label of ['Yard display name', 'Phone', 'Emergency contact']) {
      const field = screen.getByLabelText(label)
      const error = document.getElementById(
        field.getAttribute('aria-describedby')!,
      )
      expect(field.getAttribute('aria-invalid')).toBe('true')
      expect(error?.textContent).toContain('Please use a shorter')
    }
    expect(props.onSave).not.toHaveBeenCalled()
    rerender(
      <StableMemberDetailsFormView
        member={{
          ...member,
          _id: 'other' as Id<'stableMembers'>,
          displayNameOverride: 'Sample Alex',
        }}
        {...props}
      />,
    )
    expect(
      screen.getByLabelText<HTMLInputElement>('Yard display name').value,
    ).toBe('Sample Alex')
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('waits for member save acknowledgement and preserves failed drafts', async () => {
    const pending = deferred<boolean>()
    const onSave = vi
      .fn()
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValueOnce(true)
    const onSaved = vi.fn()
    render(
      <StableMemberDetailsFormView
        member={member}
        onSave={onSave}
        onSaved={onSaved}
        onCancel={() => {}}
      />,
    )
    const input = screen.getByLabelText<HTMLInputElement>('Phone')
    fireEvent.change(input, { target: { value: '555-0100' } })
    fireEvent.submit(input.closest('form')!)
    await waitFor(() =>
      expect(
        screen
          .getByRole('button', { name: 'Saving...' })
          .hasAttribute('disabled'),
      ).toBe(true),
    )
    expect(onSaved).not.toHaveBeenCalled()
    await act(async () => pending.resolve(false))
    expect(input.value).toBe('555-0100')
    expect(onSaved).not.toHaveBeenCalled()
    fireEvent.submit(input.closest('form')!)
    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1))
  })

  it('links invitation errors without duplicate IDs and only clears an acknowledged invitation', async () => {
    const onInvite = vi
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true)
    const onCreated = vi.fn()
    render(
      <>
        <StableInviteFormView onInvite={onInvite} onCreated={onCreated} />
        <StableInviteFormView onInvite={async () => true} />
      </>,
    )
    const [input, second] =
      screen.getAllByLabelText<HTMLInputElement>('Email address')
    expect(input.id).not.toBe(second.id)
    fireEvent.change(input, { target: { value: 'invalid' } })
    fireEvent.submit(input.closest('form')!)
    await waitFor(() => expect(input.getAttribute('aria-invalid')).toBe('true'))
    expect(
      document.getElementById(input.getAttribute('aria-describedby')!)
        ?.textContent,
    ).toContain('Use a valid email address.')
    fireEvent.change(input, { target: { value: 'sample@example.test' } })
    fireEvent.submit(input.closest('form')!)
    await waitFor(() => expect(onInvite).toHaveBeenCalledTimes(1))
    expect(onCreated).not.toHaveBeenCalled()
    expect(input.value).toBe('sample@example.test')
    fireEvent.submit(input.closest('form')!)
    await waitFor(() => expect(onCreated).toHaveBeenCalledTimes(1))
    expect(input.value).toBe('')
  })
})
