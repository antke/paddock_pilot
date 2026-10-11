// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DashboardUpdates } from './DashboardUpdates'

afterEach(cleanup)
const update = {
  id: 'one',
  body: 'Arena closed until noon.',
  authorName: 'Ada',
  createdAt: Date.parse('2026-10-01T08:00:00Z'),
  canManage: true,
}
describe('shared yard updates view', () => {
  it('hides an empty preview and gives the yard page a useful empty state', () => {
    const { rerender } = render(
      <DashboardUpdates
        preview
        updates={[]}
        onSave={vi.fn()}
        onRemove={vi.fn()}
      />,
    )
    expect(screen.queryByText('Yard updates')).toBeNull()
    rerender(
      <DashboardUpdates updates={[]} onSave={vi.fn()} onRemove={vi.fn()} />,
    )
    expect(screen.getByText(/No current yard updates/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Add update' })).toBeTruthy()
  })
  it('keeps a rejected draft and prevents empty or duplicate saves', async () => {
    let reject!: (error: Error) => void
    const onSave = vi.fn(
      () =>
        new Promise<void>((_, fail) => {
          reject = fail
        }),
    )
    render(
      <DashboardUpdates
        updates={[update]}
        onSave={onSave}
        onRemove={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Add update' }))
    const body = screen.getByLabelText('Update')
    fireEvent.submit(body.closest('form')!)
    expect(screen.getByText(/Write an update between/)).toBeTruthy()
    expect(onSave).not.toHaveBeenCalled()
    fireEvent.change(body, { target: { value: 'Gate repair today.' } })
    fireEvent.submit(body.closest('form')!)
    fireEvent.submit(body.closest('form')!)
    expect(onSave).toHaveBeenCalledTimes(1)
    reject(new Error('Network'))
    await waitFor(() =>
      expect(screen.getByText(/Could not save this change/)).toBeTruthy(),
    )
    expect((body as HTMLTextAreaElement).value).toBe('Gate repair today.')
  })
  it('limits management to records allowed by the server and keeps preview read-only', () => {
    const { rerender } = render(
      <DashboardUpdates
        updates={[{ ...update, canManage: false }]}
        onSave={vi.fn()}
        onRemove={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Remove' })).toBeNull()
    rerender(
      <DashboardUpdates
        preview
        updates={[update]}
        onSave={vi.fn()}
        onRemove={vi.fn()}
        viewAll={<a href="/yard">View yard updates</a>}
      />,
    )
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByRole('link', { name: 'View yard updates' })).toBeTruthy()
    expect(screen.getByText('Ada')).toBeTruthy()
  })
})
