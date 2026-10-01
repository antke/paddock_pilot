// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { Id } from 'convex/_generated/dataModel'
import { EventFormFields } from './EventFormFields'
import { eventFormSchema } from './eventFormSchema'
import type { EventFormInput, EventFormSchema } from './eventFormSchema'

afterEach(cleanup)

const defaultValues: EventFormInput = {
  stableId: 'sample-stable',
  horseIds: ['sample-horse'],
  title: 'Farrier visit',
  type: 'hoof_trimming',
  status: 'planned',
  date: '2026-07-24',
  time: '10:30',
  endDate: '',
  description: '',
  location: '',
  providerName: '',
  providerPhone: '',
  notesAfterCompletion: '',
  recurring: false,
  totalCost: undefined,
  costPerHorse: undefined,
}

function Harness({
  recurrence,
  onSubmit = () => undefined,
  empty = false,
}: {
  recurrence?: EventFormInput['recurrence']
  onSubmit?: (data: EventFormSchema) => void
  empty?: boolean
}) {
  const form = useForm<EventFormInput, unknown, EventFormSchema>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      ...defaultValues,
      horseIds: empty ? [] : defaultValues.horseIds,
      recurring: Boolean(recurrence),
      recurrence,
    },
  })
  return (
    <form aria-label="Event" onSubmit={form.handleSubmit(onSubmit)}>
      <EventFormFields
        control={form.control}
        setValue={form.setValue}
        horses={
          empty
            ? []
            : [{ _id: 'sample-horse' as Id<'horses'>, name: 'Juniper' }]
        }
      />
      <button type="submit">Save</button>
      <button type="button" onClick={() => form.reset()}>
        Reset form
      </button>
    </form>
  )
}

function openRepeat() {
  fireEvent.click(screen.getByRole('button', { name: /Repeat schedule/ }))
}

describe('EventFormFields', () => {
  it('shows the existing daily preset and preserves the rule when submitting', async () => {
    const onSubmit = vi.fn()
    const recurrence = {
      frequency: 'daily',
      interval: 1,
      end: { type: 'never' },
    } as const
    render(<Harness recurrence={recurrence} onSubmit={onSubmit} />)
    openRepeat()
    const daily = screen.getByRole('button', {
      name: /^Every day/,
      pressed: true,
    })
    expect(daily.getAttribute('aria-pressed')).toBe('true')
    fireEvent.submit(screen.getByRole('form', { name: 'Event' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit.mock.calls[0][0].recurrence).toEqual(recurrence)
  })

  it('opens a custom monthly rule in advanced mode and never rewrites it on date change or reset', async () => {
    const onSubmit = vi.fn()
    const recurrence = {
      frequency: 'monthly',
      interval: 2,
      monthlyMode: 'weekdayPattern',
      ordinal: 'last',
      weekday: 3,
      end: { type: 'never' },
    } as const
    render(<Harness recurrence={recurrence} onSubmit={onSubmit} />)
    openRepeat()
    expect(
      screen.getByRole('heading', { name: 'Build a custom schedule' }),
    ).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Date', { exact: true }), {
      target: { value: '2026-07-26' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Reset form' }))
    fireEvent.submit(screen.getByRole('form', { name: 'Event' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit.mock.calls[0][0].recurrence).toEqual(recurrence)
  })

  it('connects required and recurrence leaf errors to their inputs', async () => {
    const onSubmit = vi.fn()
    render(
      <Harness
        recurrence={{
          frequency: 'weekly',
          interval: 1,
          daysOfWeek: [5],
          end: { type: 'on_date', date: '' },
        }}
        onSubmit={onSubmit}
      />,
    )
    fireEvent.change(screen.getByLabelText('Title', { exact: true }), {
      target: { value: '' },
    })
    fireEvent.submit(screen.getByRole('form', { name: 'Event' }))
    await waitFor(() =>
      expect(
        screen
          .getByLabelText('Title', { exact: true })
          .getAttribute('aria-invalid'),
      ).toBe('true'),
    )
    for (const id of ['title', 'recurrence-end-date']) {
      const input = document.getElementById(id)!
      const error = document.getElementById(
        input.getAttribute('aria-describedby')!,
      )
      expect(error?.textContent?.length).toBeGreaterThan(0)
    }
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('explains an empty horse roster and prevents an invalid save', async () => {
    const onSubmit = vi.fn()
    render(<Harness empty onSubmit={onSubmit} />)
    fireEvent.submit(screen.getByRole('form', { name: 'Event' }))
    await waitFor(() =>
      expect(screen.getByRole('group', { name: 'Horses' })).toBeTruthy(),
    )
    const group = screen.getByRole('group', { name: 'Horses' })
    expect(within(group).getByRole('alert')).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
