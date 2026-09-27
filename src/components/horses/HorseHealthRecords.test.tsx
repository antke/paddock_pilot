// @vitest-environment jsdom
import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import { createHorseHistorySummary } from '#/components/page-lab/prototypes/horseHistoryFixtures'
import {
  HealthIssuesSample,
  MedicationRecordsSample,
} from '#/components/page-lab/prototypes/HorseHealthRecordsSample'
import { HorseHealthIssuesCardView } from './HorseHealthIssuesCard'
import { HealthIssueForm } from './HealthIssueForm'
import { MedicationRecordForm } from './MedicationRecordForm'
import { useMutation } from 'convex/react'

vi.mock('convex/react', () => ({
  useMutation: vi.fn(() => {
    throw new Error('No live mutation in samples')
  }),
}))
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})
const data = createDashboardLabFixtureData()
const horse = data.horses[0]
const summary = createHorseHistorySummary(data, 'standard')
describe('health and medication record recovery', () => {
  it('keeps a header-mounted create dialog pending, handles failure and closes after local retry', async () => {
    function HeaderSample() {
      const [action, setAction] = useState<ReactNode>(null)
      return (
        <>
          <header>{action}</header>
          <HealthIssuesSample horse={horse} onCreateActionChange={setAction} />
        </>
      )
    }
    render(<HeaderSample />)
    fireEvent.change(screen.getByLabelText('Next sample result'), {
      target: { value: 'failure' },
    })
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Add health issue' })[0],
    )
    const title = await screen.findByLabelText<HTMLInputElement>('Issue title')
    fireEvent.change(title, { target: { value: 'Sample eye check' } })
    // Hold the specimen's response clock while checking its pending state.
    // Under concurrent test load the real 150ms response could previously
    // fail before Escape, when dismissal is correctly allowed again.
    vi.useFakeTimers()
    await act(async () => fireEvent.submit(title.closest('form')!))
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
    fireEvent.keyDown(screen.getByRole('dialog'), {
      key: 'Escape',
      code: 'Escape',
    })
    expect(screen.getByRole('dialog')).toBeTruthy()
    await act(async () => vi.advanceTimersByTimeAsync(150))
    vi.useRealTimers()
    await screen.findByText(
      'Could not save this record. Your entries are still here; please try again.',
    )
    expect(title.value).toBe('Sample eye check')
    fireEvent.submit(title.closest('form')!)
    await screen.findByText(
      'Sample health issue applied locally. No live records changed.',
    )
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(
      screen.getByRole('heading', { name: 'Sample eye check' }),
    ).toBeTruthy()
  })

  it('links health errors, names severity, retains failed data and retries', async () => {
    const save = vi
      .fn()
      .mockRejectedValueOnce(new Error('Offline'))
      .mockResolvedValueOnce(undefined)
    const pending = vi.fn()
    render(<HealthIssueForm onSubmit={save} onPendingChange={pending} />)
    const title = screen.getByLabelText<HTMLInputElement>('Issue title')
    fireEvent.submit(title.closest('form')!)
    await waitFor(() => expect(title.getAttribute('aria-invalid')).toBe('true'))
    expect(
      document.getElementById(title.getAttribute('aria-describedby')!)
        ?.textContent,
    ).toBeTruthy()
    expect(
      screen.getByRole('group', { name: 'Severity (optional)' }),
    ).toBeTruthy()
    fireEvent.change(title, { target: { value: 'Hoof follow-up' } })
    fireEvent.submit(title.closest('form')!)
    await screen.findByText(
      'Could not save this record. Your entries are still here; please try again.',
    )
    expect(title.value).toBe('Hoof follow-up')
    fireEvent.submit(title.closest('form')!)
    await waitFor(() => expect(title.value).toBe(''))
    expect(pending.mock.calls.map((call) => call[0])).toEqual([
      true,
      false,
      true,
      false,
    ])
  })
  it('focuses and describes invalid medication end dates', async () => {
    render(<MedicationRecordForm onSubmit={vi.fn()} />)
    const medication = screen.getByLabelText('Medication')
    fireEvent.change(medication, { target: { value: 'Sample medication' } })
    fireEvent.change(screen.getByLabelText('Dosage'), {
      target: { value: 'As prescribed' },
    })
    fireEvent.change(screen.getByLabelText('Start date'), {
      target: { value: '2026-09-18' },
    })
    const end = screen.getByLabelText('End date (optional)')
    fireEvent.change(end, { target: { value: '2026-09-17' } })
    fireEvent.submit(medication.closest('form')!)
    await waitFor(() => expect(document.activeElement).toBe(end))
    expect(
      document.getElementById(end.getAttribute('aria-describedby')!)
        ?.textContent,
    ).toContain('before the start date')
  })
  it('keeps both concurrent health actions pending until each request finishes', async () => {
    const first = summary.activeHealthIssues![0]
    const issues = [
      first,
      {
        ...first,
        _id: 'sample-second' as typeof first._id,
        title: 'Second issue',
      },
    ]
    let finishFirst!: () => void
    let finishSecond!: () => void
    const resolve = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<void>((r) => {
            finishFirst = r
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise<void>((r) => {
            finishSecond = r
          }),
      )
    render(
      <HorseHealthIssuesCardView
        horse={horse}
        issues={issues}
        canManage
        onAdd={vi.fn()}
        onResolve={resolve}
        onRemove={vi.fn()}
      />,
    )
    const a = screen.getByRole<HTMLButtonElement>('button', {
      name: `Resolve ${first.title}`,
    })
    const b = screen.getByRole<HTMLButtonElement>('button', {
      name: 'Resolve Second issue',
    })
    fireEvent.click(a)
    fireEvent.click(b)
    fireEvent.click(a)
    expect(resolve).toHaveBeenCalledTimes(2)
    expect(a.disabled).toBe(true)
    expect(b.disabled).toBe(true)
    const search = screen.getByRole('searchbox')
    fireEvent.change(search, { target: { value: 'Second issue' } })
    fireEvent.change(search, { target: { value: '' } })
    expect(
      screen.getByRole<HTMLButtonElement>('button', {
        name: `Resolve ${first.title}`,
      }).disabled,
    ).toBe(true)

    await act(async () => finishFirst())
    expect(
      screen.getByRole<HTMLButtonElement>('button', {
        name: `Resolve ${first.title}`,
      }).disabled,
    ).toBe(false)
    expect(b.disabled).toBe(true)
    await act(async () => finishSecond())
    expect(b.disabled).toBe(false)
  })
  it('uses local actual views for failure/retry, future courses and read-only states', async () => {
    const { unmount } = render(<HealthIssuesSample horse={horse} />)
    fireEvent.change(screen.getByLabelText('Next sample result'), {
      target: { value: 'failure' },
    })
    const resolve = screen.getByRole('button', {
      name: 'Resolve Turnout follow-up',
    })
    fireEvent.click(resolve)
    await screen.findByText('Could not update this record. Please try again.')
    fireEvent.click(resolve)
    await screen.findByText(
      'Sample resolution applied locally. No live records changed.',
    )
    expect(
      screen.queryByRole('button', { name: 'Resolve Turnout follow-up' }),
    ).toBeNull()
    unmount()
    render(<MedicationRecordsSample horse={horse} />)
    expect(
      screen.getByRole<HTMLButtonElement>('button', {
        name: 'Complete Future sample course',
      }).disabled,
    ).toBe(true)
    expect(screen.getAllByText(/Planned end/).length).toBe(3)
    fireEvent.change(screen.getByLabelText('Sample medication records'), {
      target: { value: 'viewer' },
    })
    expect(screen.queryByRole('button', { name: /^Complete / })).toBeNull()
    expect(useMutation).not.toHaveBeenCalled()
  })
})
