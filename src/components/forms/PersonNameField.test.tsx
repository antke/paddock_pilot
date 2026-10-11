// @vitest-environment jsdom
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { api } from 'convex/_generated/api'
import { PersonNameField } from './PersonNameField'
import { TrainingFormFields } from '#/components/training/TrainingFormFields'
import { createEventEditorValues } from './event/eventEditorValues'
import type { EventFormInput, EventFormSchema } from './event/eventFormSchema'
import { LocaleProvider, GUEST_LOCALE_KEY } from '#/i18n/LocaleProvider'

const people = vi.hoisted(() => ({ query: vi.fn(), authenticated: true }))
vi.mock('convex/react', () => ({
  useConvex: () => ({}),
  useConvexAuth: () => ({ isAuthenticated: people.authenticated }),
  useQueries: people.query,
}))
vi.mock('#/lib/devAuthBypass', () => ({ useDevAuthBypassEnabled: () => false }))
beforeEach(() => {
  people.authenticated = true
  people.query.mockReset().mockImplementation(({ people: request }) => ({
    people: request
      ? [
          { name: 'Stable Member', isCurrentUser: false },
          { name: 'Alex Rider', isCurrentUser: true },
          { name: ' alex rider ', isCurrentUser: false },
          ...(request.args.horseIds.includes('juniper')
            ? [{ name: 'Juniper Helper', isCurrentUser: false }]
            : []),
          ...(request.args.horseIds.includes('meadow')
            ? [{ name: 'Meadow Helper', isCurrentUser: false }]
            : []),
        ]
      : undefined,
  }))
})
afterEach(() => {
  cleanup()
  localStorage.clear()
})

function TrainingHarness({
  save,
  horseIds,
}: {
  save: (values: EventFormSchema) => void
  horseIds?: string[]
}) {
  const form = useForm<EventFormInput, unknown, EventFormSchema>({
    defaultValues: {
      ...createEventEditorValues('yard'),
      horseIds: ['juniper'],
      type: 'training',
      training: { activities: ['flatwork'], format: 'regular' },
    },
  })
  return (
    <form onSubmit={form.handleSubmit(save)}>
      <TrainingFormFields
        control={form.control}
        disabled={false}
        fields="optional"
        horseIds={horseIds}
      />
      <button
        type="button"
        onClick={() => form.setValue('horseIds', ['meadow'])}
      >
        Change horse
      </button>
      <button type="submit">Save</button>
    </form>
  )
}
const rider = () =>
  screen.getByRole<HTMLInputElement>('combobox', { name: 'Rider / handler' })
const open = () =>
  fireEvent.click(
    screen.getByRole('button', { name: 'Show people suggestions' }),
  )

it('puts the current user first, searches stable people and saves the name without the me label', async () => {
  const save = vi.fn()
  render(<TrainingHarness save={save} />)
  open()
  await screen.findByRole('option', { name: 'Alex Rider (me)' })
  expect(
    screen.getAllByRole('option').map((option) => option.textContent),
  ).toEqual(['Alex Rider (me)', 'Stable Member', 'Juniper Helper'])
  fireEvent.change(rider(), { target: { value: 'Alex' } })
  expect(screen.getAllByRole('option')).toHaveLength(1)
  fireEvent.keyDown(rider(), { key: 'ArrowDown' })
  fireEvent.keyDown(rider(), { key: 'Enter' })
  expect(rider().value).toBe('Alex Rider')
  expect(save).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() => expect(save).toHaveBeenCalled())
  expect(save.mock.calls[0][0].training.rider).toBe('Alex Rider')
})

it('updates horse-specific helpers without overwriting the rider already entered', async () => {
  render(<TrainingHarness save={vi.fn()} />)
  fireEvent.change(rider(), { target: { value: 'Independent rider' } })
  fireEvent.click(screen.getByRole('button', { name: 'Change horse' }))
  expect(rider().value).toBe('Independent rider')
  expect(people.query).toHaveBeenLastCalledWith({
    people: {
      query: api.people.suggestNames,
      args: { stableId: 'yard', horseIds: ['meadow'] },
    },
  })
  fireEvent.change(rider(), { target: { value: '' } })
  fireEvent.keyDown(rider(), { key: 'Escape' })
  open()
  await screen.findByRole('option', { name: 'Meadow Helper' })
  expect(screen.queryByRole('option', { name: 'Juniper Helper' })).toBeNull()
})

it('scopes a per-horse record to its own horse instead of all event horses', () => {
  render(<TrainingHarness save={vi.fn()} horseIds={['meadow']} />)
  expect(people.query).toHaveBeenLastCalledWith({
    people: {
      query: api.people.suggestNames,
      args: { stableId: 'yard', horseIds: ['meadow'] },
    },
  })
})

function NameHarness({ disabled = false }: { disabled?: boolean }) {
  const [value, setValue] = useState('')
  return (
    <PersonNameField
      aria-label="Person"
      value={value}
      onValueChange={setValue}
      disabled={disabled}
    />
  )
}

it('keeps the same editable input and draft through loading and request failure', async () => {
  people.query.mockReturnValue({ people: undefined })
  const view = render(<NameHarness />)
  const input = screen.getByRole<HTMLInputElement>('combobox', {
    name: 'Person',
  })
  open()
  await screen.findByText('Loading people. You can also enter a name.')
  fireEvent.change(input, { target: { value: 'Guest rider' } })
  people.query.mockReturnValue({ people: new Error('offline') })
  view.rerender(<NameHarness />)
  await screen.findByText(
    'People could not be loaded. You can still enter a name.',
  )
  expect(screen.getByRole('combobox', { name: 'Person' })).toBe(input)
  expect(input.value).toBe('Guest rider')
  fireEvent.blur(input)
  expect(input.value).toBe('Guest rider')
  people.query.mockReturnValue({
    people: [{ name: 'Alex Rider', isCurrentUser: true }],
  })
  view.rerender(<NameHarness />)
  expect(input.value).toBe('Guest rider')
})

it('localizes the current-person label and disables the whole picker while saving', async () => {
  localStorage.setItem(GUEST_LOCALE_KEY, 'pl')
  const view = render(
    <LocaleProvider initialLocale="pl">
      <NameHarness />
    </LocaleProvider>,
  )
  fireEvent.click(
    await screen.findByRole('button', { name: 'Pokaż podpowiedzi osób' }),
  )
  expect(
    await screen.findByRole('option', { name: 'Alex Rider (ja)' }),
  ).toBeTruthy()
  view.rerender(
    <LocaleProvider initialLocale="pl">
      <NameHarness disabled />
    </LocaleProvider>,
  )
  expect(
    screen.getByRole<HTMLInputElement>('combobox', { name: 'Person' }).disabled,
  ).toBe(true)
  expect(
    screen.getByRole<HTMLButtonElement>('button', {
      name: 'Pokaż podpowiedzi osób',
    }).disabled,
  ).toBe(true)
})
