// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ComponentProps } from 'react'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { EventEditor } from './EventEditor'
import {
  createEventEditorValues,
  editEventEditorValues,
} from './eventEditorValues'

const horseId = 'sample-horse' as Id<'horses'>
const eventId = 'sample-event' as Id<'events'>
const stableId = 'sample-stable' as Id<'stables'>
const event: Doc<'events'> = {
  _id: eventId,
  _creationTime: 0,
  stableId,
  createdBy: 'sample-user' as Id<'users'>,
  horseIds: [horseId],
  title: 'Summer farrier visit',
  date: '2026-07-24',
  time: '10:30',
  type: 'hoof_trimming',
  status: 'completed',
  totalCost: 120,
  costPerHorse: 60,
  notesAfterCompletion: 'Front shoes replaced.',
}
function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: Error) => void
  const promise = new Promise<T>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
function setup(overrides: Partial<ComponentProps<typeof EventEditor>> = {}) {
  const props = {
    mode: 'edit' as const,
    initialValues: editEventEditorValues(event, []),
    horses: [{ _id: horseId, name: 'Juniper' }],
    onSave: vi.fn().mockResolvedValue(eventId),
    onSaved: vi.fn().mockResolvedValue(undefined),
    onAcknowledged: vi.fn(),
    ...overrides,
  }
  const view = render(<EventEditor {...props} />)
  const title = screen.getByLabelText<HTMLInputElement>('Title', {
    exact: true,
  })
  return { ...view, props, title, form: title.closest('form')! }
}
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('EventEditor production composition', () => {
  it('uses empty create defaults and prevents invalid input from saving', async () => {
    const { form, title, props } = setup({
      mode: 'create',
      initialValues: createEventEditorValues(stableId),
    })
    expect(title.value).toBe('')
    expect(screen.getByRole('button', { name: 'Create event' })).toBeTruthy()
    fireEvent.submit(form)
    await waitFor(() => expect(title.getAttribute('aria-invalid')).toBe('true'))
    expect(
      document.getElementById(title.getAttribute('aria-describedby')!)
        ?.textContent,
    ).toContain('Title must')
    expect(props.onSave).not.toHaveBeenCalled()
    expect(props.onSaved).not.toHaveBeenCalled()
  })

  it.each(['create', 'edit'] as const)(
    'guards rapid %s submissions and preserves the draft after a rejected save',
    async (mode) => {
      const request = deferred<Id<'events'>>()
      const onSave = vi
        .fn()
        .mockReturnValueOnce(request.promise)
        .mockResolvedValue(eventId)
      const { form, title, props } = setup({ mode, onSave })
      fireEvent.change(title, { target: { value: 'Autumn farrier visit' } })
      fireEvent.submit(form)
      fireEvent.submit(form)
      await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1))
      expect(title.disabled).toBe(true)
      expect(
        screen.getByRole<HTMLButtonElement>('button', { name: 'Reset' })
          .disabled,
      ).toBe(true)
      expect(props.onAcknowledged).not.toHaveBeenCalled()
      await act(async () => request.reject(new Error('offline')))
      await waitFor(() => expect(title.disabled).toBe(false))
      expect(title.value).toBe('Autumn farrier visit')
      expect(screen.getByRole('alert').textContent).toContain(
        'Could not save event',
      )
      expect(document.activeElement).toBe(screen.getByRole('alert'))
      expect(props.onSaved).not.toHaveBeenCalled()
      fireEvent.submit(form)
      await waitFor(() => expect(props.onSaved).toHaveBeenCalledWith(eventId))
      expect(onSave).toHaveBeenCalledTimes(2)
      expect(props.onAcknowledged).toHaveBeenCalledTimes(1)
    },
  )

  it('retries only opening after an acknowledged save, retaining the lock through repeated retry actions', async () => {
    const opening = deferred<void>()
    const onSaved = vi
      .fn()
      .mockRejectedValueOnce(new Error('navigation failed'))
      .mockReturnValueOnce(opening.promise)
    const { form, title, props } = setup({ onSaved })
    fireEvent.submit(form)
    await screen.findByText(/Event saved, but its page could not be opened/)
    expect(title.disabled).toBe(true)
    expect(screen.queryByRole('button', { name: 'Reset' })).toBeNull()
    expect(props.onSave).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: 'Open event' }))
    fireEvent.submit(form)
    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(2))
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Opening event…' })
        .disabled,
    ).toBe(true)
    await act(async () => opening.resolve())
    await screen.findByRole('status')
    fireEvent.submit(form)
    expect(props.onSave).toHaveBeenCalledTimes(1)
    expect(props.onAcknowledged).toHaveBeenCalledTimes(1)
    expect(onSaved).toHaveBeenCalledTimes(2)
  })

  it('does not open or announce a late acknowledgement after the editor unmounts', async () => {
    const request = deferred<Id<'events'>>()
    const { form, unmount, props } = setup({
      onSave: vi.fn().mockReturnValue(request.promise),
    })
    fireEvent.submit(form)
    await waitFor(() => expect(props.onSave).toHaveBeenCalledOnce())
    unmount()
    await act(async () => request.resolve(eventId))
    expect(props.onSaved).not.toHaveBeenCalled()
    expect(props.onAcknowledged).not.toHaveBeenCalled()
  })

  it('confirms dirty reset, can cancel it, and restores the opened values without saving', async () => {
    const { title, props } = setup()
    fireEvent.change(title, { target: { value: 'Unsaved visit' } })
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    await screen.findByRole('alertdialog')
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }))
    expect(title.value).toBe('Unsaved visit')
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    fireEvent.click(
      await screen.findByRole('button', { name: 'Reset changes' }),
    )
    await waitFor(() => expect(title.value).toBe('Summer farrier visit'))
    expect(props.onSave).not.toHaveBeenCalled()
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
  })

  it('preserves recurring edit values, status, costs and active horse associations', async () => {
    const recurrence = {
      frequency: 'monthly',
      interval: 2,
      monthlyMode: 'weekdayPattern',
      ordinal: 'last',
      weekday: 5,
      end: { type: 'after_occurrences', count: 6 },
    } as const
    const initialValues = editEventEditorValues({ ...event, recurrence }, [
      { horseId, status: 'confirmed' },
      { horseId: 'declined-horse' as Id<'horses'>, status: 'declined' },
      { horseId: 'withdrawn-horse' as Id<'horses'>, status: 'withdrawn' },
    ])
    const onSave = vi.fn().mockResolvedValue(eventId)
    const { form } = setup({ initialValues, onSave })
    fireEvent.submit(form)
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce())
    expect(onSave.mock.calls[0][0]).toMatchObject({
      horseIds: [horseId],
      status: 'completed',
      totalCost: 120,
      costPerHorse: 60,
      notesAfterCompletion: 'Front shoes replaced.',
      recurring: true,
      recurrence,
    })
    expect(editEventEditorValues(event, []).horseIds).toEqual(event.horseIds)
    expect(
      editEventEditorValues(event, [{ horseId, status: 'declined' }]).horseIds,
    ).toEqual(event.horseIds)
  })

  it('does not replace an unsaved draft when reactive initial values change', () => {
    const { title, props, rerender } = setup()
    fireEvent.change(title, { target: { value: 'Local draft' } })
    rerender(
      <EventEditor
        {...props}
        initialValues={{ ...props.initialValues, title: 'Remote update' }}
      />,
    )
    expect(title.value).toBe('Local draft')
  })
})
