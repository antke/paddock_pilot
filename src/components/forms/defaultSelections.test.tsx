// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { MedicationRecordForm } from '#/components/horses/MedicationRecordForm'
import { StableProviderForm } from '#/components/stables/StableProviderForm'
import { StableInviteFormView } from '#/components/stables/StableInviteForm'

afterEach(cleanup)

it('submits the default medication status without selecting it manually', async () => {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  render(<MedicationRecordForm onSubmit={onSubmit} />)
  const medication = screen.getByLabelText('Medication')
  expect(
    screen.getByRole('button', { name: 'Active', pressed: true }),
  ).toBeTruthy()
  fireEvent.change(medication, { target: { value: 'Prescribed medication' } })
  fireEvent.change(screen.getByLabelText('Dosage'), {
    target: { value: 'As prescribed' },
  })
  fireEvent.submit(medication.closest('form')!)
  await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({ status: 'active' }),
  )
})

it('submits the default provider type without selecting it manually', async () => {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  render(<StableProviderForm onSubmit={onSubmit} />)
  const name = screen.getByLabelText('Name')
  expect(
    screen.getByRole('button', { name: 'Vet', pressed: true }),
  ).toBeTruthy()
  fireEvent.change(name, { target: { value: 'Alex' } })
  fireEvent.submit(name.closest('form')!)
  await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({ type: 'vet' }),
  )
})

it('submits the displayed invitation language without selecting it manually', async () => {
  const onInvite = vi.fn().mockResolvedValue(true)
  render(<StableInviteFormView onInvite={onInvite} />)
  const language = screen.getByRole<HTMLSelectElement>('combobox')
  expect(language.value).toBe('en')
  const email = screen.getByRole('textbox')
  fireEvent.change(email, { target: { value: 'rider@example.com' } })
  fireEvent.submit(email.closest('form')!)
  await waitFor(() => expect(onInvite).toHaveBeenCalledOnce())
  expect(onInvite).toHaveBeenCalledWith({
    email: 'rider@example.com',
    role: 'member',
    locale: 'en',
  })
})
