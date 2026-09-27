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
import { StrictMode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Id } from 'convex/_generated/dataModel'
import {
  HorseDeletionActions,
  HorseDeletionActionsView,
} from './HorseDeletionActions'

const backend = vi.hoisted(() => ({ remove: vi.fn(), toast: vi.fn() }))
vi.mock('convex/react', () => ({ useMutation: () => backend.remove }))
vi.mock('#/components/ui/sonner', () => ({
  showAppSuccessToast: backend.toast,
}))
const horse = { _id: 'sample-horse' as Id<'horses'>, name: 'Juniper' }
function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: Error) => void
  const promise = new Promise<T>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
async function open() {
  fireEvent.click(
    screen.getByRole('button', { name: 'Move to deleted horses' }),
  )
  return await screen.findByRole('alertdialog')
}
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
describe('horse deletion acknowledgement and continuation', () => {
  it('blocks repeated actions and dismissal while pending, retains rejection and supports retry', async () => {
    const request = deferred<void>()
    const remove = vi
      .fn()
      .mockReturnValueOnce(request.promise)
      .mockResolvedValueOnce(true)
    const continued = vi.fn()
    const pending = vi.fn()
    render(
      <HorseDeletionActionsView
        horse={horse}
        onDelete={remove}
        onDeleted={continued}
        onPendingChange={pending}
      />,
    )
    const dialog = await open()
    const action = within(dialog).getByRole('button', { name: 'Move horse' })
    act(() => {
      action.click()
      action.click()
    })
    expect(remove).toHaveBeenCalledTimes(1)
    expect(continued).not.toHaveBeenCalled()
    const busy = within(dialog).getByRole<HTMLButtonElement>('button', {
      name: 'Moving…',
    })
    expect(busy.disabled).toBe(true)
    expect(busy.getAttribute('aria-busy')).toBe('true')
    fireEvent.keyDown(dialog, { key: 'Escape' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('alertdialog')).toBe(dialog)
    await act(async () => request.reject(new Error('offline')))
    expect(within(dialog).getByRole('alert').textContent).toContain(
      'Moving this horse was not confirmed',
    )
    expect(continued).not.toHaveBeenCalled()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Move horse' }))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
    expect(remove).toHaveBeenCalledTimes(2)
    expect(continued).toHaveBeenCalledTimes(1)
    expect(pending.mock.calls.map(([value]) => value)).toEqual([
      true,
      false,
      true,
      false,
    ])
    expect(
      screen.queryByRole('button', { name: 'Move to deleted horses' }),
    ).toBeNull()
  })
  it('keeps an unconfirmed false result available for cancellation and respects another save being pending', async () => {
    const remove = vi.fn().mockResolvedValue(false)
    const continued = vi.fn()
    const view = render(
      <HorseDeletionActionsView
        horse={horse}
        onDelete={remove}
        onDeleted={continued}
        disabled
      />,
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Move to deleted horses' }),
    )
    expect(screen.queryByRole('alertdialog')).toBeNull()
    view.rerender(
      <HorseDeletionActionsView
        horse={horse}
        onDelete={remove}
        onDeleted={continued}
      />,
    )
    const dialog = await open()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Move horse' }))
    expect(await within(dialog).findByRole('alert')).toBeTruthy()
    expect(continued).not.toHaveBeenCalled()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
  })
  it('retains acknowledgement through closing and retries only continuation with a stable busy action', async () => {
    const remove = vi.fn().mockResolvedValue(undefined)
    const acknowledged = vi.fn()
    const pending = vi.fn()
    const request = deferred<void>()
    const continued = vi
      .fn()
      .mockRejectedValueOnce(new Error('navigation failed'))
      .mockReturnValueOnce(request.promise)
    render(
      <HorseDeletionActionsView
        horse={horse}
        onDelete={remove}
        onDeleted={continued}
        onAcknowledged={acknowledged}
        onPendingChange={pending}
      />,
    )
    const dialog = await open()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Move horse' }))
    const error = await within(dialog).findByRole('alert')
    expect(error.textContent).toContain('Juniper was moved to deleted horses')
    expect(error.textContent).toContain('14 days')
    expect(
      within(dialog).queryByRole('button', { name: 'Move horse' }),
    ).toBeNull()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
    expect(screen.getByRole('alert').textContent).toContain(
      'Could not continue',
    )
    const retry = screen.getByRole('button', { name: 'Retry continuing' })
    retry.focus()
    fireEvent.click(retry)
    const busy = screen.getByRole('button', { name: 'Continuing…' })
    expect(busy).toBe(retry)
    expect(document.activeElement).toBe(retry)
    expect(remove).toHaveBeenCalledTimes(1)
    await act(async () => request.resolve())
    expect(continued).toHaveBeenCalledTimes(2)
    expect(acknowledged).toHaveBeenCalledTimes(1)
    expect(pending.mock.calls.map(([value]) => value)).toEqual([
      true,
      false,
      true,
      false,
    ])
    expect(acknowledged.mock.invocationCallOrder[0]).toBeLessThan(
      continued.mock.invocationCallOrder[0],
    )
    expect(document.activeElement).toBe(
      screen.getByRole('group', { name: 'Juniper deletion' }),
    )
    expect(screen.getByRole('status').textContent).toContain('14 days')
  })
  it('suppresses late continuation after unmount or a horse change and releases pending once', async () => {
    const request = deferred<void>()
    const remove = vi.fn().mockReturnValue(request.promise)
    const continued = vi.fn()
    const pending = vi.fn()
    const view = render(
      <StrictMode>
        <HorseDeletionActionsView
          horse={horse}
          onDelete={remove}
          onDeleted={continued}
          onPendingChange={pending}
        />
      </StrictMode>,
    )
    const dialog = await open()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Move horse' }))
    view.rerender(
      <StrictMode>
        <HorseDeletionActionsView
          horse={{
            ...horse,
            _id: 'other-horse' as Id<'horses'>,
            name: 'Maple',
          }}
          onDelete={remove}
          onDeleted={continued}
          onPendingChange={pending}
        />
      </StrictMode>,
    )
    await act(async () => request.resolve())
    expect(continued).not.toHaveBeenCalled()
    expect(screen.getByRole('group', { name: 'Maple deletion' })).toBeTruthy()
    expect(pending.mock.calls.map(([value]) => value)).toEqual([true, false])
    const second = deferred<void>()
    remove.mockReturnValueOnce(second.promise)
    const next = await open()
    fireEvent.click(within(next).getByRole('button', { name: 'Move horse' }))
    view.unmount()
    await act(async () => second.reject(new Error('late failure')))
    expect(continued).not.toHaveBeenCalled()
    expect(pending.mock.calls.map(([value]) => value)).toEqual([
      true,
      false,
      true,
      false,
    ])
  })
  it('keeps connected mutation and acknowledgement toast once-only when navigation must be retried', async () => {
    backend.remove.mockResolvedValue(undefined)
    const continued = vi
      .fn()
      .mockRejectedValueOnce(new Error('navigation'))
      .mockResolvedValue(undefined)
    render(<HorseDeletionActions horse={horse} onDeleted={continued} />)
    const dialog = await open()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Move horse' }))
    await within(dialog).findByRole('alert')
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Retry continuing' }),
    )
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
    expect(backend.remove).toHaveBeenCalledExactlyOnceWith({ id: horse._id })
    expect(backend.toast).toHaveBeenCalledTimes(1)
    expect(continued).toHaveBeenCalledTimes(2)
  })
})
