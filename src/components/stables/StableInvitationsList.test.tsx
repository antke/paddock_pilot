// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { Doc } from 'convex/_generated/dataModel'
import { StableInvitationsListView } from './StableInvitationsList'

afterEach(cleanup)

it('confirms resend only after acknowledgement, survives token rotation, and keeps failure retryable', async () => {
  let resolve!: (success: boolean) => void
  const resend = vi.fn(
    () =>
      new Promise<boolean>((done) => {
        resolve = done
      }),
  )
  const invitation = {
    _id: 'resend-1',
    email: 'rider@example.test',
    status: 'pending',
    token: 'first',
    role: 'member',
    expiresAt: Date.now() + 86400000,
    _creationTime: Date.now(),
  } as Doc<'stableInvitations'>
  const props = { onCopy: vi.fn(), onResend: resend, onRevoke: vi.fn() }
  const view = render(
    <StableInvitationsListView invitations={[invitation]} {...props} />,
  )
  const button = screen.getByRole('button', { name: 'Resend' })
  fireEvent.click(button)
  fireEvent.click(button)
  expect(resend).toHaveBeenCalledTimes(1)
  expect(screen.queryByRole('button', { name: 'Email queued' })).toBeNull()
  await act(async () => resolve(true))
  view.rerender(
    <StableInvitationsListView
      invitations={[{ ...invitation, token: 'rotated' }]}
      {...props}
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Email queued' }))
  expect(resend).toHaveBeenCalledTimes(2)
  await act(async () => resolve(false))
  expect(screen.queryByRole('button', { name: 'Email queued' })).toBeNull()
  expect(
    screen.getByRole<HTMLButtonElement>('button', { name: 'Resend' }).disabled,
  ).toBe(false)
  expect(screen.getByRole('alert')).toBeTruthy()
})

it('confirms a copied invitation only after success and clears feedback for a fresh token', async () => {
  let resolve!: () => void
  const copy = vi.fn(
    () =>
      new Promise<void>((done) => {
        resolve = done
      }),
  )
  const invitation = {
    _id: 'invitation-1',
    email: 'rider@example.test',
    status: 'pending',
    token: 'first',
    role: 'member',
    expiresAt: Date.now() + 86400000,
    _creationTime: Date.now(),
  } as Doc<'stableInvitations'>
  const props = { onCopy: copy, onResend: vi.fn(), onRevoke: vi.fn() }
  const view = render(
    <StableInvitationsListView invitations={[invitation]} {...props} />,
  )
  const button = screen.getByRole('button', { name: 'Copy link' })
  fireEvent.click(button)
  fireEvent.click(button)
  expect(copy).toHaveBeenCalledExactlyOnceWith('first')
  expect(
    screen.getByRole<HTMLButtonElement>('button', { name: 'Copying…' })
      .disabled,
  ).toBe(true)
  expect(screen.queryByRole('button', { name: 'Copied' })).toBeNull()
  await act(async () => resolve())
  expect(screen.getByRole('button', { name: 'Copied' })).toBeTruthy()
  view.rerender(
    <StableInvitationsListView
      invitations={[{ ...invitation, token: 'fresh' }]}
      {...props}
    />,
  )
  expect(screen.getByRole('button', { name: 'Copy link' })).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Copied' })).toBeNull()
})
