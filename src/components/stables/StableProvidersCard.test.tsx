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
import type { Doc, Id } from 'convex/_generated/dataModel'
import { StableProvidersView } from './StableProvidersCard'
import { StableProviderForm } from './StableProviderForm'

afterEach(cleanup)
const provider: Doc<'stableProviders'> = {
  _id: 'sample-provider' as Id<'stableProviders'>,
  _creationTime: 0,
  stableId: 'sample-stable' as Id<'stables'>,
  createdBy: 'sample-user' as Id<'users'>,
  createdAt: 0,
  updatedAt: 0,
  name: 'Ben Carter',
  type: 'farrier',
  phone: '123',
  email: '',
  notes: '',
}
const deferred = () => {
  let resolve!: () => void
  let reject!: (error: Error) => void
  const promise = new Promise<void>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}

describe('Provider directory interactions', () => {
  it('keeps failed edits, ignores pending repeats and returns focus after success', async () => {
    const first = deferred(),
      second = deferred()
    const update = vi
      .fn()
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise)
    render(
      <StableProvidersView
        providers={[provider]}
        canManage
        onAdd={async () => undefined}
        onUpdate={update}
        onRemove={async () => undefined}
      />,
    )
    expect(document.activeElement).toBe(document.body)
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    const name = screen.getByRole<HTMLInputElement>('textbox', { name: 'Name' })
    expect(document.activeElement).toBe(name)
    fireEvent.change(name, { target: { value: 'Ben Carter updated' } })
    fireEvent.submit(name.closest('form')!)
    await waitFor(() => expect(update).toHaveBeenCalledTimes(1))
    fireEvent.submit(name.closest('form')!)
    await act(async () => {})
    expect(update).toHaveBeenCalledTimes(1)
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Saving...' })
        .disabled,
    ).toBe(true)
    await act(async () => first.reject(new Error('Offline')))
    expect(screen.getByRole('alert').textContent).toContain(
      'Your entries are still here',
    )
    expect(name.value).toBe('Ben Carter updated')
    fireEvent.click(screen.getByRole('button', { name: 'Save provider' }))
    await waitFor(() => expect(update).toHaveBeenCalledTimes(2))
    await act(async () => second.resolve())
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Edit' }),
    )
  })

  it('guards a pending create dialog from Escape and preserves its failed entries for retry', async () => {
    const request = deferred()
    const add = vi.fn(() => request.promise)
    render(
      <StableProvidersView
        providers={[]}
        canManage
        onAdd={add}
        onUpdate={async () => undefined}
        onRemove={async () => undefined}
      />,
    )
    fireEvent.click(screen.getAllByRole('button', { name: 'Add provider' })[0])
    const dialog = await screen.findByRole('dialog')
    const name = within(dialog).getByRole<HTMLInputElement>('textbox', {
      name: 'Name',
    })
    fireEvent.change(name, { target: { value: 'Dr. Nova' } })
    fireEvent.submit(name.closest('form')!)
    await waitFor(() => expect(add).toHaveBeenCalledTimes(1))
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(screen.getByRole('dialog')).toBeTruthy()
    await act(async () => request.reject(new Error('Offline')))
    expect(name.value).toBe('Dr. Nova')
    expect(within(dialog).getByRole('alert').textContent).toContain(
      'Could not save provider',
    )
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('confirms removal, retains failure and restores focus to the surviving directory control after success', async () => {
    const first = deferred(),
      second = deferred()
    const remove = vi
      .fn()
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise)
    function Sample() {
      const [providers, setProviders] = useState([provider])
      return (
        <StableProvidersView
          providers={providers}
          canManage
          onAdd={async () => undefined}
          onUpdate={async () => undefined}
          onRemove={async () => {
            await remove()
            setProviders([])
          }}
        />
      )
    }
    render(<Sample />)
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
    const dialog = await screen.findByRole('alertdialog')
    expect(remove).not.toHaveBeenCalled()
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Remove provider' }),
    )
    await waitFor(() => expect(remove).toHaveBeenCalledTimes(1))
    fireEvent.click(within(dialog).getByRole('button', { name: 'Removing...' }))
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(remove).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('alertdialog')).toBeTruthy()
    await act(async () => first.reject(new Error('Offline')))
    expect(within(dialog).getByRole('alert').textContent).toContain(
      'Could not remove provider',
    )
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Remove provider' }),
    )
    await waitFor(() => expect(remove).toHaveBeenCalledTimes(2))
    await act(async () => second.resolve())
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
    expect(screen.getByText('No providers saved yet.')).toBeTruthy()
    await waitFor(() =>
      expect(document.activeElement).toBe(
        within(
          screen.getByRole('group', { name: 'Provider directory' }),
        ).getAllByRole('button', { name: 'Add provider' })[0],
      ),
    )
  })

  it('names the type control and links validation messages with unique IDs', async () => {
    render(
      <>
        <StableProviderForm onSubmit={async () => undefined} />
        <StableProviderForm onSubmit={async () => undefined} />
      </>,
    )
    expect(
      screen.getAllByRole('group', { name: 'Provider type' }),
    ).toHaveLength(2)
    const names = screen.getAllByRole<HTMLInputElement>('textbox', {
      name: 'Name',
    })
    expect(names[0].id).not.toBe(names[1].id)
    fireEvent.submit(names[0].closest('form')!)
    await waitFor(() =>
      expect(names[0].getAttribute('aria-invalid')).toBe('true'),
    )
    expect(
      document.getElementById(names[0].getAttribute('aria-describedby')!)
        ?.textContent,
    ).toContain('Provider name is required')
  })
})
