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
  it('clears saved optional costs without displaying their original values', async () => {
    const { form, props } = setup()
    fireEvent.click(screen.getByRole('button', { name: /Place & provider/ }))
    for (const label of ['Total cost', 'Cost per horse']) {
      const input = screen.getByLabelText<HTMLInputElement>(label)
      fireEvent.change(input, { target: { value: '' } })
      expect(input.value).toBe('')
    }
    fireEvent.submit(form)
    await waitFor(() => expect(props.onSave).toHaveBeenCalledOnce())
    const values = vi.mocked(props.onSave).mock.calls[0][0]
    expect(values.totalCost).toBeUndefined()
    expect(values.costPerHorse).toBeUndefined()
  })

  it('clears an existing optional training duration without displaying or submitting the old default', async () => {
    const { form, props } = setup({
      feature: 'training',
      initialValues: editEventEditorValues(
        {
          ...event,
          type: 'training',
          training: {
            activities: ['flatwork'],
            format: 'lesson',
            durationMinutes: 45,
          },
        },
        [],
      ),
    })
    fireEvent.click(screen.getByRole('button', { name: /Additional details/ }))
    const duration =
      screen.getByLabelText<HTMLInputElement>('Duration (minutes)')
    fireEvent.change(duration, { target: { value: '' } })
    expect(duration.value).toBe('')
    fireEvent.submit(form)
    await waitFor(() => expect(props.onSave).toHaveBeenCalledOnce())
    expect(
      vi.mocked(props.onSave).mock.calls[0][0].training?.durationMinutes,
    ).toBeUndefined()
  })

  it.each([undefined, 'dayOfMonth'] as const)(
    'stores displayed event defaults with monthly mode %s before submitting or resetting',
    async (monthlyMode) => {
      const { form, title, props } = setup({
        initialValues: {
          ...editEventEditorValues(event, []),
          status: undefined,
          recurring: true,
          recurrence: {
            frequency: 'monthly',
            interval: 1,
            monthlyMode,
            dayOfMonth: 31,
          },
        },
      })
      fireEvent.click(
        screen.getByRole('button', { name: /Additional details/ }),
      )
      expect(
        screen.getByRole('button', { name: 'Planned', pressed: true }),
      ).toBeTruthy()
      fireEvent.click(screen.getByRole('button', { name: /Repeat schedule/ }))
      expect(
        screen.getByRole('radio', { name: 'Day of month', checked: true }),
      ).toBeTruthy()
      expect(
        screen.getByRole('radio', {
          name: 'Use the last day of the month',
          checked: true,
        }),
      ).toBeTruthy()
      expect(
        screen.getByRole('radio', { name: 'Never', checked: true }),
      ).toBeTruthy()
      const untouched = new Event('beforeunload', { cancelable: true })
      window.dispatchEvent(untouched)
      expect(untouched.defaultPrevented).toBe(false)
      fireEvent.change(title, { target: { value: 'Temporary title' } })
      fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
      fireEvent.click(
        await screen.findByRole('button', { name: 'Reset changes' }),
      )
      await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
      fireEvent.submit(form)
      await waitFor(() =>
        expect(props.onSave).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'planned',
            recurrence: {
              frequency: 'monthly',
              interval: 1,
              monthlyMode: 'dayOfMonth',
              dayOfMonth: 31,
              missingDateStrategy: 'lastDayOfMonth',
              end: { type: 'never' },
            },
          }),
        ),
      )
    },
  )

  it.each(['planned', 'completed'] as const)(
    'submits the displayed default format for a %s training session without reselecting it',
    async (status) => {
      const { form, props } = setup({
        mode: 'create',
        feature: 'training',
        eventContext: 'personal',
        initialValues: {
          ...createEventEditorValues(),
          type: 'training',
          status,
          date: '2026-07-24',
          time: '10:00',
          horseIds: [horseId],
          // Some entry points provide no training details yet.
        },
      })
      expect(
        screen.getByRole('button', { name: 'Regular session', pressed: true }),
      ).toBeTruthy()
      const untouched = new Event('beforeunload', { cancelable: true })
      window.dispatchEvent(untouched)
      expect(untouched.defaultPrevented).toBe(false)

      fireEvent.submit(form)
      await screen.findByText('Choose at least one activity.')
      expect(props.onSave).not.toHaveBeenCalled()
      fireEvent.click(screen.getByRole('button', { name: 'Flatwork' }))
      fireEvent.submit(form)
      await waitFor(() =>
        expect(props.onSave).toHaveBeenCalledWith(
          expect.objectContaining({
            status,
            training: { activities: ['flatwork'], format: 'regular' },
          }),
        ),
      )
    },
  )

  it('restores a real default format on reset and submits it without touching the format group', async () => {
    const { form, props } = setup({
      mode: 'create',
      feature: 'training',
      initialValues: {
        ...createEventEditorValues(stableId),
        type: 'training',
        date: '2026-07-24',
        time: '10:00',
        horseIds: [horseId],
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Trainer lesson' }))
    fireEvent.click(screen.getByRole('button', { name: 'Flatwork' }))
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    fireEvent.click(
      await screen.findByRole('button', { name: 'Reset changes' }),
    )
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
    expect(
      screen.getByRole('button', { name: 'Regular session', pressed: true }),
    ).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Flatwork' }))
    fireEvent.submit(form)
    await waitFor(() =>
      expect(props.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          training: { activities: ['flatwork'], format: 'regular' },
        }),
      ),
    )
  })

  it('preserves saved training details and restores their format after reset', async () => {
    const training = {
      activities: ['jumping' as const],
      format: 'workshop' as const,
      durationMinutes: 45,
      rider: 'Alex',
    }
    const { form, props } = setup({
      feature: 'training',
      initialValues: editEventEditorValues(
        { ...event, type: 'training', training },
        [],
      ),
    })
    expect(
      screen.getByRole('button', { name: 'Workshop / clinic', pressed: true }),
    ).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Regular session' }))
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    fireEvent.click(
      await screen.findByRole('button', { name: 'Reset changes' }),
    )
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
    expect(
      screen.getByRole('button', { name: 'Workshop / clinic', pressed: true }),
    ).toBeTruthy()
    fireEvent.submit(form)
    await waitFor(() =>
      expect(props.onSave).toHaveBeenCalledWith(
        expect.objectContaining({ training }),
      ),
    )
  })

  it('does not add incomplete training details to a schedule-only editor', async () => {
    const { form, props } = setup({
      feature: 'training',
      scheduleOnly: true,
      initialValues: editEventEditorValues({ ...event, type: 'training' }, []),
    })
    expect(screen.queryByRole('group', { name: 'Session format' })).toBeNull()
    fireEvent.submit(form)
    await waitFor(() => expect(props.onSave).toHaveBeenCalledOnce())
    expect(vi.mocked(props.onSave).mock.calls[0][0].training).toBeUndefined()
  })

  it('treats registered optional fields as pristine, but protects real training edits', async () => {
    const { title } = setup({
      mode: 'create',
      feature: 'training',
      initialValues: {
        ...createEventEditorValues(stableId),
        type: 'training',
        date: '2026-07-24',
        time: '10:00',
        horseIds: [horseId],
        training: { activities: ['flatwork'], format: 'regular' },
      },
    })
    const untouched = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(untouched)
    expect(untouched.defaultPrevented).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.queryByRole('alertdialog')).toBeNull()
    fireEvent.change(title, { target: { value: 'Changed session' } })
    const edited = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(edited)
    expect(edited.defaultPrevented).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(await screen.findByRole('alertdialog')).toBeTruthy()
  })

  it('keeps training requirements together and saves without opening optional sections', async () => {
    const { form, props } = setup({
      mode: 'create',
      feature: 'training',
      initialValues: {
        ...createEventEditorValues(stableId),
        type: 'training',
        date: '2026-07-24',
        time: '10:00',
        horseIds: [horseId],
        training: { activities: ['flatwork'], format: 'regular' },
      },
    })
    const essentials = screen
      .getByRole('heading', { name: 'Session details' })
      .closest('section')!
    for (const name of ['Horses', 'Type of work', 'Session format']) {
      expect(within(essentials).getByRole('group', { name })).toBeTruthy()
    }
    expect(
      within(essentials).getByLabelText('Date').getAttribute('aria-required'),
    ).toBe('true')
    expect(
      within(essentials).getByLabelText('Time').getAttribute('aria-required'),
    ).toBe('true')
    expect(within(essentials).queryByLabelText('Duration (minutes)')).toBeNull()
    for (const section of form.querySelectorAll(
      '[data-slot="form-section"]:not(:first-of-type)',
    )) {
      expect(section.querySelector('[hidden]')).toBeTruthy()
    }
    fireEvent.submit(form)
    await waitFor(() =>
      expect(props.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Flatwork',
          horseIds: [horseId],
          training: { activities: ['flatwork'], format: 'regular' },
        }),
      ),
    )
  })

  it('records completed work with an automatic title and links training validation errors', async () => {
    const { form, props } = setup({
      mode: 'create',
      feature: 'training',
      initialValues: {
        ...createEventEditorValues(stableId),
        type: 'training',
        status: 'completed',
        date: '2026-07-24',
        time: '10:00',
        horseIds: [horseId],
        training: { activities: ['flatwork'], format: 'regular' },
      },
    })
    expect(
      screen.getByRole('heading', { name: 'Add training log' }),
    ).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Additional details/ }))
    const duration = screen.getByLabelText('Duration (minutes)')
    fireEvent.change(duration, { target: { value: '0' } })
    fireEvent.submit(form)
    await waitFor(() =>
      expect(duration.getAttribute('aria-invalid')).toBe('true'),
    )
    expect(
      document.getElementById(duration.getAttribute('aria-describedby')!)
        ?.textContent,
    ).toBeTruthy()
    expect(props.onSave).not.toHaveBeenCalled()
    fireEvent.change(duration, { target: { value: '35' } })
    fireEvent.click(
      screen.getByRole('button', { name: /^Description Optional/ }),
    )
    fireEvent.change(screen.getByLabelText('What happened / what went well'), {
      target: { value: 'Relaxed transitions' },
    })
    fireEvent.submit(form)
    await waitFor(() =>
      expect(props.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Flatwork',
          status: 'completed',
          notesAfterCompletion: 'Relaxed transitions',
          training: expect.objectContaining({ durationMinutes: 35 }),
        }),
      ),
    )
    const saved = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(saved)
    expect(saved.defaultPrevented).toBe(false)
  })

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

it('filters horses by destination and confirms removal while preserving the draft', async () => {
  const invitedId = 'invited-horse' as Id<'horses'>
  const mine = {
    _id: horseId,
    _creationTime: 0,
    name: 'Juniper',
    age: 8,
    requiresApproval: false,
    canShareAcrossStables: true,
  }
  const invited = {
    ...mine,
    _id: invitedId,
    name: 'Maple',
    requiresApproval: true,
  }
  const { title, props, form } = setup({
    mode: 'create',
    initialValues: {
      ...createEventEditorValues(stableId),
      title: 'Group visit',
      date: '2026-10-10',
      time: '10:00',
      horseIds: [horseId, invitedId],
    },
    destinations: {
      personal: [mine],
      stables: [{ id: stableId, name: 'Willow', horses: [mine, invited] }],
    },
  })
  expect(screen.getByText('Requires approval')).toBeTruthy()
  expect(screen.getByText('Added directly: 1 · Invitations: 1')).toBeTruthy()
  fireEvent.click(screen.getByRole('checkbox', { name: 'Willow' }))
  expect(screen.getByRole('alertdialog')).toBeTruthy()
  expect(title.value).toBe('Group visit')
  fireEvent.click(
    screen.getByRole('button', { name: 'Keep selected calendars' }),
  )
  expect(screen.getByText('Maple')).toBeTruthy()
  fireEvent.click(screen.getByRole('checkbox', { name: 'Willow' }))
  fireEvent.click(
    screen.getByRole('button', { name: 'Remove horses and continue' }),
  )
  await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
  expect(screen.queryByText('Maple')).toBeNull()
  expect(title.value).toBe('Group visit')
  expect(screen.getByRole('button', { name: 'Create event' })).toBeTruthy()
  fireEvent.submit(form)
  await waitFor(() => expect(props.onSave).toHaveBeenCalled())
  expect(vi.mocked(props.onSave).mock.calls[0][0]).toMatchObject({
    horseIds: [horseId],
    title: 'Group visit',
  })
  expect(vi.mocked(props.onSave).mock.calls[0][0].stableId).toBeUndefined()
})

it('offers training in event creation and exposes its required activity fields', async () => {
  setup({ mode: 'create', initialValues: createEventEditorValues() })
  fireEvent.click(screen.getByRole('button', { name: 'Training' }))
  expect(
    await screen.findByText('Select all activities practised in this session.'),
  ).toBeTruthy()
})

it.each(['events', 'training'] as const)(
  'keeps one %s draft while selecting several stable audiences',
  async (feature) => {
    const mine = {
      _id: horseId,
      _creationTime: 0,
      name: 'Juniper',
      age: 8,
      requiresApproval: false,
      canShareAcrossStables: true,
    }
    const secondStable = 'second-stable' as Id<'stables'>
    const { props, form, title } = setup({
      mode: 'create',
      feature,
      initialValues: {
        ...createEventEditorValues(),
        horseIds: [horseId],
        title: 'Shared session',
        date: '2026-10-01',
        time: '10:00',
        ...(feature === 'training'
          ? {
              type: 'training',
              training: { activities: ['jumping'], format: 'lesson' },
            }
          : {}),
      },
      destinations: {
        personal: [mine],
        stables: [
          { id: stableId, name: 'Willow', horses: [mine] },
          { id: secondStable, name: 'Oak', horses: [] },
        ],
      },
    })
    expect(
      screen
        .getByRole('checkbox', { name: 'My calendar' })
        .getAttribute('aria-disabled'),
    ).toBe('true')
    fireEvent.click(screen.getByRole('checkbox', { name: 'Willow' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Oak' }))
    expect(
      screen
        .getByRole('checkbox', { name: 'Willow' })
        .getAttribute('aria-checked'),
    ).toBe('true')
    expect(
      screen
        .getByRole('checkbox', { name: 'Oak' })
        .getAttribute('aria-checked'),
    ).toBe('true')
    expect(title.value).toBe('Shared session')
    fireEvent.submit(form)
    await waitFor(() => expect(props.onSave).toHaveBeenCalledOnce())
    expect(vi.mocked(props.onSave).mock.calls[0][0]).toMatchObject({
      horseIds: [horseId],
      sharedStableIds: [stableId, secondStable],
    })
  },
)

it.each(['events', 'training'] as const)(
  'saves a whole-day %s entry and restores its clock time when toggled off',
  async (feature) => {
    const { props, form } = setup({
      mode: 'create',
      feature,
      initialValues: {
        ...createEventEditorValues(),
        title: 'Whole-day session',
        horseIds: [horseId],
        date: '2026-10-01',
        time: '10:30',
        ...(feature === 'training'
          ? {
              type: 'training',
              training: { activities: ['jumping'], format: 'lesson' },
            }
          : {}),
      },
    })
    const time = screen.getByLabelText<HTMLInputElement>('Time', {
      exact: true,
    })
    const wholeDay = screen.getByRole('switch', { name: 'Whole day' })
    fireEvent.click(wholeDay)
    expect(time.disabled).toBe(true)
    expect(time.value).toBe('')
    fireEvent.click(wholeDay)
    expect(time.disabled).toBe(false)
    expect(time.value).toBe('10:30')
    fireEvent.click(wholeDay)
    fireEvent.submit(form)
    await waitFor(() => expect(props.onSave).toHaveBeenCalledOnce())
    expect(vi.mocked(props.onSave).mock.calls[0][0].time).toBe('all-day')
  },
)

it('opens an existing whole-day entry and requires a time when changing it to a timed entry', async () => {
  const { props, form } = setup({
    initialValues: { ...editEventEditorValues(event, []), time: 'all-day' },
  })
  const time = screen.getByLabelText<HTMLInputElement>('Time', { exact: true })
  expect(time.disabled).toBe(true)
  fireEvent.click(screen.getByRole('switch', { name: 'Whole day' }))
  expect(time.disabled).toBe(false)
  expect(time.value).toBe('')
  fireEvent.submit(form)
  await waitFor(() =>
    expect(screen.getByText('Use a valid time.')).toBeTruthy(),
  )
  expect(props.onSave).not.toHaveBeenCalled()
  fireEvent.change(time, { target: { value: '15:00' } })
  fireEvent.submit(form)
  await waitFor(() => expect(props.onSave).toHaveBeenCalledOnce())
  expect(vi.mocked(props.onSave).mock.calls[0][0].time).toBe('15:00')
})

it('preselects the horse owner, allows removing them and keeps independent attendees when the horse is removed', async () => {
  const { form, props } = setup({
    mode: 'create',
    initialValues: {
      ...editEventEditorValues(event, []),
      horseIds: [],
      peopleIds: [],
    },
    horses: [{ _id: horseId, name: 'Juniper', ownerId: 'anna' }],
    people: [
      { id: 'anna', name: 'Anna' },
      { id: 'rider', name: 'Rider without a horse' },
    ],
  })
  const horse = screen.getByRole('checkbox', { name: /Juniper/ })
  const owner = screen.getByRole<HTMLInputElement>('checkbox', { name: 'Anna' })
  const rider = screen.getByRole<HTMLInputElement>('checkbox', {
    name: 'Rider without a horse',
  })
  fireEvent.click(horse)
  expect(owner.checked).toBe(true)
  fireEvent.click(owner)
  fireEvent.click(rider)
  expect(owner.checked).toBe(false)
  fireEvent.click(horse)
  expect(rider.checked).toBe(true)
  fireEvent.click(horse)
  fireEvent.click(owner)
  fireEvent.submit(form)
  await waitFor(() => expect(props.onSave).toHaveBeenCalledOnce())
  expect(vi.mocked(props.onSave).mock.calls[0][0].peopleIds).toEqual(['rider'])
})

it('preselects an initial horse’s owner only when creating, and preserves an explicit empty attendance list when editing', () => {
  const options = {
    horses: [{ _id: horseId, name: 'Juniper', ownerId: 'anna' }],
    people: [{ id: 'anna', name: 'Anna' }],
  }
  const created = setup({ ...options, mode: 'create' })
  expect(
    screen.getByRole<HTMLInputElement>('checkbox', { name: 'Anna' }).checked,
  ).toBe(true)
  created.unmount()
  setup({ ...options, mode: 'edit' })
  expect(
    screen.getByRole<HTMLInputElement>('checkbox', { name: 'Anna' }).checked,
  ).toBe(false)
})

it('scopes people and their horse subtitles to the selected calendars', () => {
  const zapiId = 'zapi' as Id<'horses'>
  const otherStableId = 'other-stable' as Id<'stables'>
  const personalHorse = {
    _id: horseId,
    _creationTime: 0,
    name: 'Juniper',
    ownerId: 'owner' as Id<'users'>,
    ownerName: 'Outdated owner',
    age: 8,
    requiresApproval: false,
    canShareAcrossStables: true,
  }
  const zapi = {
    ...personalHorse,
    _id: zapiId,
    name: 'Zapi',
    ownerId: 'visitor' as Id<'users'>,
  }
  setup({
    mode: 'create',
    initialValues: {
      ...editEventEditorValues(event, []),
      stableId: undefined,
      sharedStableIds: [],
      horseIds: [],
      peopleIds: [],
    },
    horses: [personalHorse],
    people: [
      { id: 'owner', name: 'Current owner', personal: true, stableIds: [] },
      {
        id: 'visitor',
        name: 'Test stable member',
        personal: false,
        stableIds: [stableId],
      },
      {
        id: 'horseless',
        name: 'Member without horses',
        personal: false,
        stableIds: [stableId],
      },
    ],
    destinations: {
      personal: [personalHorse],
      stables: [
        { id: stableId, name: 'Test stable', horses: [zapi] },
        { id: otherStableId, name: 'Other stable', horses: [] },
      ],
    },
  })
  expect(screen.queryByText(/Horses: Zapi/)).toBeNull()
  expect(
    screen.queryByRole('checkbox', { name: /Test stable member/ }),
  ).toBeNull()
  expect(screen.queryByText('Outdated owner')).toBeNull()
  expect(screen.getByText('Horses: Juniper')).toBeTruthy()
  fireEvent.click(screen.getByRole('checkbox', { name: 'Other stable' }))
  expect(screen.queryByText(/Horses: Zapi/)).toBeNull()
  fireEvent.click(screen.getByRole('checkbox', { name: 'Test stable' }))
  expect(screen.getByText('Horses: Zapi')).toBeTruthy()
  expect(
    screen.getByRole('checkbox', { name: 'Member without horses' }),
  ).toBeTruthy()
  fireEvent.click(screen.getByRole('checkbox', { name: 'Test stable' }))
  expect(screen.queryByText(/Horses: Zapi/)).toBeNull()
  expect(
    screen.queryByRole('checkbox', { name: /Test stable member/ }),
  ).toBeNull()
})
