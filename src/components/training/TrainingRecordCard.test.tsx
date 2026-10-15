// @vitest-environment jsdom
import type * as ConvexReact from 'convex/react'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { TrainingRecordCard } from './TrainingRecordCard'
import { getTrainingEntries } from './trainingCalendarData'
import type { ReactNode } from 'react'
import type * as ReactRouter from '@tanstack/react-router'

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof ReactRouter>()),
  Link: ({
    params,
    children,
  }: {
    params: { horseId: string }
    children: ReactNode
  }) => <a href={`/horses/${params.horseId}`}>{children}</a>,
}))

const save = vi.hoisted(() => vi.fn())
vi.mock('convex/react', async (importOriginal) => ({
  ...(await importOriginal<typeof ConvexReact>()),
  useMutation: () => save,
}))

function entry(canRecord = true) {
  const horseId = 'horse' as Id<'horses'>
  const event = {
    _id: 'event',
    _creationTime: 0,
    stableId: 'stable',
    createdBy: 'owner',
    horseIds: [horseId],
    title: 'Schooling',
    date: '2000-01-01',
    time: '10:00',
    type: 'training',
    status: 'planned',
    training: {
      activities: ['flatwork'],
      format: 'regular',
      durationMinutes: 30,
      rider: 'Alex',
    },
  } as Doc<'events'>
  return getTrainingEntries({
    events: [event],
    records: [],
    horses: [{ _id: horseId, name: 'Juniper', canRecord }],
    start: event.date,
    end: event.date,
    today: event.date,
  })[0]
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  save.mockReset()
})

describe('focused training recording', () => {
  it('saves a cleared inherited duration without restoring its previous value', async () => {
    save.mockResolvedValue(undefined)
    render(<TrainingRecordCard entry={entry()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Add training log' }))
    const duration =
      screen.getByLabelText<HTMLInputElement>('Duration (minutes)')
    fireEvent.change(duration, { target: { value: '' } })
    expect(duration.value).toBe('')
    fireEvent.click(
      screen.getByRole('button', { name: 'Save training record' }),
    )
    await screen.findByText('Training record saved.')
    expect(save).toHaveBeenCalledOnce()
    expect(save.mock.calls[0][0].details.durationMinutes).toBeUndefined()
  })

  it('labels the training facts and keeps the horse profile reachable without a separate horse list', () => {
    render(<TrainingRecordCard entry={entry(false)} />)
    expect(
      screen.getByRole('link', { name: 'Juniper' }).getAttribute('href'),
    ).toBe('/horses/horse')
    for (const [label, value] of [
      ['Type of work', 'Flatwork'],
      ['Duration', '30 min'],
      ['Session format', 'Regular session'],
      ['Rider / handler', 'Alex'],
    ]) {
      expect(
        screen.getByText(label).closest('div')?.querySelector('dd')
          ?.textContent,
      ).toBe(value)
    }
  })

  it('does not offer edits when the saved record is outside the current role', () => {
    const planned = entry()
    const record = {
      _id: 'record',
      _creationTime: 0,
      eventId: planned.occurrence.event._id,
      horseId: planned.horse._id,
      date: planned.occurrence.startDate,
      status: 'completed',
      details: planned.details,
      recordedBy: 'owner',
      createdAt: 0,
      updatedAt: 0,
      canEdit: false,
    } as Doc<'trainingRecords'> & { canEdit: boolean }
    const [readOnly] = getTrainingEntries({
      events: [planned.occurrence.event],
      records: [record],
      horses: [planned.horse],
      start: record.date,
      end: record.date,
      today: record.date,
    })
    render(<TrainingRecordCard entry={readOnly} />)
    expect(screen.queryByRole('button', { name: 'Update record' })).toBeNull()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('inherits the plan, records completion for the exact horse/date and preserves failed work for retry', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    save
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(undefined)
    render(<TrainingRecordCard entry={entry()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Add training log' }))
    expect(
      screen.getByLabelText<HTMLSelectElement>('Status for this horse and date')
        .value,
    ).toBe('completed')
    expect(
      screen.queryByRole('textbox', { name: 'Rider / handler' }),
    ).toBeNull()
    const outcome = screen.getByLabelText<HTMLTextAreaElement>(
      'What happened / what went well',
    )
    fireEvent.change(outcome, { target: { value: 'Calm transitions' } })
    fireEvent.click(
      screen.getByRole('button', { name: 'Save training record' }),
    )
    await screen.findByText('Could not save training. Please try again.')
    expect(outcome.value).toBe('Calm transitions')
    fireEvent.click(
      screen.getByRole('button', { name: 'Save training record' }),
    )
    await screen.findByText('Training record saved.')
    expect(save).toHaveBeenLastCalledWith(
      expect.objectContaining({
        eventId: 'event',
        horseId: 'horse',
        date: '2000-01-01',
        status: 'completed',
        outcome: 'Calm transitions',
        details: expect.objectContaining({
          activities: ['flatwork'],
          durationMinutes: 30,
          rider: 'Alex',
        }),
      }),
    )
    const unloading = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(unloading)
    expect(unloading.defaultPrevented).toBe(false)
  })

  it('protects edited outcomes on cancellation and navigation', async () => {
    render(<TrainingRecordCard entry={entry()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Add training log' }))
    const untouched = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(untouched)
    expect(untouched.defaultPrevented).toBe(false)
    fireEvent.change(screen.getByLabelText('What happened / what went well'), {
      target: { value: 'Keep this draft' },
    })
    const edited = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(edited)
    expect(edited.defaultPrevented).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    const dialog = await screen.findByRole('alertdialog')
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Keep editing' }),
    )
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
    expect(
      screen.getByLabelText<HTMLTextAreaElement>(
        'What happened / what went well',
      ).value,
    ).toBe('Keep this draft')
    expect(save).not.toHaveBeenCalled()
  })

  it('does not offer recording when the horse is read-only', () => {
    render(<TrainingRecordCard entry={entry(false)} />)
    expect(
      screen.queryByRole('button', { name: 'Add training log' }),
    ).toBeNull()
    expect(
      screen.getByText(
        'The horse owner or stable admin can record this horse’s training.',
      ),
    ).toBeTruthy()
  })
})
