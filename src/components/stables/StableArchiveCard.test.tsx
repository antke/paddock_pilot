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
import { StableArchiveCard } from './StableArchiveCard'

afterEach(cleanup)
describe('Stable archive confirmation', () => {
  it('keeps pending confirmation open, blocks repeats and preserves failure for retry', async () => {
    let reject!: (reason: Error) => void
    const request = new Promise<boolean>((_, no) => {
      reject = no
    })
    const archive = vi
      .fn()
      .mockImplementationOnce(() => request)
      .mockResolvedValueOnce(true)
    render(<StableArchiveCard stableName="Sample yard" onArchive={archive} />)
    fireEvent.click(screen.getByRole('button', { name: 'Archive stable' }))
    const dialog = await screen.findByRole('alertdialog')
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Archive stable' }),
    )
    expect(archive).toHaveBeenCalledTimes(1)
    const pending = within(dialog).getByRole<HTMLButtonElement>('button', {
      name: 'Archiving...',
    })
    expect(pending.disabled).toBe(true)
    fireEvent.click(pending)
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' })
    expect(screen.getByRole('alertdialog')).toBe(dialog)
    expect(archive).toHaveBeenCalledTimes(1)
    await act(async () => reject(new Error('Offline')))
    expect(within(dialog).getByRole('alert').textContent).toContain(
      'Archiving was not confirmed',
    )
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Archive stable' }),
    )
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
    expect(archive).toHaveBeenCalledTimes(2)
  })
  it('does not dismiss a false result and allows cancellation after failure', async () => {
    render(
      <StableArchiveCard
        stableName="Sample yard"
        onArchive={async () => false}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Archive stable' }))
    const dialog = await screen.findByRole('alertdialog')
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Archive stable' }),
    )
    await within(dialog).findByRole('alert')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
  })
})
