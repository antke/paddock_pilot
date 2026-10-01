// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { Id } from 'convex/_generated/dataModel'
import { LocaleProvider } from './LocaleProvider'
import { LanguageSelector } from './LanguageSelector'
import { EventEditor } from '#/components/forms/event/EventEditor'
import { createEventEditorValues } from '#/components/forms/event/eventEditorValues'

beforeEach(() => {
  localStorage.clear()
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-GB'])
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
it('keeps a dirty recurring event and retranslates errors without repeating an acknowledged write', async () => {
  const recurrence = {
    frequency: 'monthly',
    interval: 2,
    monthlyMode: 'weekdayPattern',
    ordinal: 'last',
    weekday: 5,
    end: { type: 'after_occurrences', count: 6 },
  } as const
  const save = vi.fn().mockResolvedValue('event-id')
  const open = vi
    .fn()
    .mockRejectedValueOnce(new Error('navigation failed'))
    .mockResolvedValueOnce(undefined)
  render(
    <LocaleProvider>
      <LanguageSelector />
      <EventEditor
        mode="create"
        initialValues={{
          ...createEventEditorValues('stable-id'),
          date: '2026-09-29',
          time: '10:00',
          horseIds: ['horse-id'],
          recurring: true,
          recurrence,
        }}
        horses={[{ _id: 'horse-id' as Id<'horses'>, name: 'Łąka' }]}
        onSave={save}
        onSaved={open}
      />
    </LocaleProvider>,
  )
  const title = screen.getByLabelText<HTMLInputElement>('Title', {
    exact: true,
  })
  fireEvent.submit(title.closest('form')!)
  await waitFor(() => expect(title.getAttribute('aria-invalid')).toBe('true'))
  fireEvent.change(screen.getByRole('combobox', { name: 'Language' }), {
    target: { value: 'pl' },
  })
  await screen.findByText('Wpisz tytuł.')
  fireEvent.change(title, { target: { value: 'Wizyta kontrolna' } })
  fireEvent.submit(title.closest('form')!)
  await screen.findByText(
    /Wydarzenie zostało zapisane, ale nie udało się otworzyć/,
  )
  expect(title.value).toBe('Wizyta kontrolna')
  expect(title.disabled).toBe(true)
  expect(save).toHaveBeenCalledTimes(1)
  expect(save.mock.calls[0][0]).toMatchObject({
    title: 'Wizyta kontrolna',
    horseIds: ['horse-id'],
    recurring: true,
    recurrence,
  })
  fireEvent.change(screen.getByRole('combobox', { name: 'Język' }), {
    target: { value: 'en' },
  })
  expect(
    screen.getByText(/Event saved, but its page could not be opened/),
  ).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Open event' }))
  await waitFor(() => expect(open).toHaveBeenCalledTimes(2))
  expect(save).toHaveBeenCalledTimes(1)
  await screen.findByText('Event saved.')
})

it('retranslates a known server failure without resubmitting', async () => {
  const save = vi.fn().mockRejectedValue({
    data: {
      code: 'trainingScheduleLocked',
      message: 'private transport detail',
    },
  })
  render(
    <LocaleProvider>
      <LanguageSelector />
      <EventEditor
        mode="edit"
        feature="training"
        initialValues={{
          ...createEventEditorValues('stable-id'),
          title: 'Trening Łąki',
          date: '2026-09-29',
          time: '10:00',
          horseIds: ['horse-id'],
          type: 'training',
          training: { activities: ['flatwork'], format: 'regular' },
        }}
        horses={[{ _id: 'horse-id' as Id<'horses'>, name: 'Łąka' }]}
        onSave={save}
        onSaved={vi.fn()}
      />
    </LocaleProvider>,
  )
  const title = screen.getByLabelText<HTMLInputElement>('Title', {
    exact: true,
  })
  fireEvent.submit(title.closest('form')!)
  await screen.findByText(/This session has training history/)
  fireEvent.change(screen.getByRole('combobox', { name: 'Language' }), {
    target: { value: 'pl' },
  })
  expect(screen.getByText(/Ten trening ma już zapisany przebieg/)).toBeTruthy()
  expect(title.value).toBe('Trening Łąki')
  expect(save).toHaveBeenCalledTimes(1)
  expect(screen.queryByText(/private transport detail/)).toBeNull()
})
