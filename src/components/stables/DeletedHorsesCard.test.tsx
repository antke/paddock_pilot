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
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Id } from 'convex/_generated/dataModel'
import { DeletedHorsesView } from './DeletedHorsesCard'
import type { DeletedHorse } from './DeletedHorsesCard'

afterEach(cleanup)
function horse(canPermanentlyDelete = true): DeletedHorse {
  return {
    _id: 'deleted-sample' as Id<'horses'>,
    _creationTime: 0,
    name: 'Willow',
    age: 9,
    stableId: 'sample-stable' as Id<'stables'>,
    ownerId: 'sample-owner' as Id<'users'>,
    deletedAt: 0,
    purgeAt: 14 * 86_400_000,
    canPermanentlyDelete,
  }
}
function deferred() {
  let resolve!: () => void
  let reject!: (error: Error) => void
  const promise = new Promise<void>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}

describe('Deleted horse recovery and permanent removal', () => {
  it('keeps restore available but hides permanent removal when the backend does not permit it', () => {
    render(
      <DeletedHorsesView
        horses={[horse(false)]}
        onRestore={async () => undefined}
        onPermanentlyDelete={async () => undefined}
      />,
    )
    expect(document.activeElement).toBe(document.body)
    expect(screen.getByRole('button', { name: 'Restore' })).toBeTruthy()
    expect(
      screen.queryByRole('button', { name: 'Delete permanently' }),
    ).toBeNull()
    expect(screen.getByText(/Eligible for permanent removal/)).toBeTruthy()
  })

  it('guards repeated restores, retains failure and moves focus to the surviving section after retry succeeds', async () => {
    const first = deferred(),
      retry = deferred()
    const restore = vi
      .fn()
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => retry.promise)
    function Sample() {
      const [horses, setHorses] = useState([horse()])
      return (
        <DeletedHorsesView
          horses={horses}
          onRestore={async () => {
            await restore()
            setHorses([])
          }}
          onPermanentlyDelete={async () => undefined}
        />
      )
    }
    render(<Sample />)
    fireEvent.click(screen.getByRole('button', { name: 'Restore' }))
    await waitFor(() => expect(restore).toHaveBeenCalledTimes(1))
    const pending = screen.getByRole<HTMLButtonElement>('button', {
      name: 'Restoring...',
    })
    expect(pending.disabled).toBe(true)
    fireEvent.click(pending)
    expect(restore).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Willow')).toBeTruthy()
    await act(async () => first.reject(new Error('Offline')))
    expect(screen.getByRole('alert').textContent).toContain(
      'Could not restore horse',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Restore' }))
    await waitFor(() => expect(restore).toHaveBeenCalledTimes(2))
    await act(async () => retry.resolve())
    expect(screen.queryByText('Willow')).toBeNull()
    expect(document.activeElement).toBe(
      screen.getByRole('group', { name: 'Deleted horses' }),
    )
  })

  it('requires confirmation, blocks pending dismissal, retains delete failure, and restores focus after successful removal', async () => {
    const first = deferred(),
      retry = deferred()
    const remove = vi
      .fn()
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => retry.promise)
    function Sample() {
      const [horses, setHorses] = useState([horse()])
      return (
        <DeletedHorsesView
          horses={horses}
          onRestore={async () => undefined}
          onPermanentlyDelete={async () => {
            await remove()
            setHorses([])
          }}
        />
      )
    }
    render(<Sample />)
    fireEvent.click(screen.getByRole('button', { name: 'Delete permanently' }))
    const dialog = await screen.findByRole('alertdialog')
    expect(remove).not.toHaveBeenCalled()
    expect(within(dialog).getByText(/This cannot be undone/)).toBeTruthy()
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Delete permanently' }),
    )
    await waitFor(() => expect(remove).toHaveBeenCalledTimes(1))
    fireEvent.click(within(dialog).getByRole('button', { name: 'Deleting...' }))
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(remove).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('alertdialog')).toBeTruthy()
    await act(async () => first.reject(new Error('Offline')))
    expect(within(dialog).getByRole('alert').textContent).toContain(
      'Deletion was not confirmed',
    )
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Delete permanently' }),
    )
    await waitFor(() => expect(remove).toHaveBeenCalledTimes(2))
    await act(async () => retry.resolve())
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
    expect(screen.queryByText('Willow')).toBeNull()
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('group', { name: 'Deleted horses' }),
      ),
    )
  })
})
