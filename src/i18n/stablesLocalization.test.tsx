// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { LocaleProvider } from './LocaleProvider'
import { LanguageSelector } from './LanguageSelector'
import { StableProviderForm } from '#/components/stables/StableProviderForm'
import { StableProfileForm } from '#/components/stables/StableProfileForm'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'

beforeEach(() => {
  localStorage.clear()
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-GB'])
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
function polish() {
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'pl' } })
}

it('translates provider choices and validation while preserving the stored type and user text', async () => {
  const save = vi.fn().mockResolvedValue(undefined)
  render(
    <LocaleProvider>
      <LanguageSelector />
      <StableProviderForm onSubmit={save} />
    </LocaleProvider>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Farrier' }))
  fireEvent.change(screen.getByLabelText('Name', { exact: true }), {
    target: { value: 'Łukasz Żak' },
  })
  fireEvent.change(screen.getByLabelText('Email', { exact: true }), {
    target: { value: 'invalid' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Save provider' }))
  await screen.findByText('Enter a valid email address.')
  polish()
  await screen.findByText('Podaj prawidłowy adres e-mail.')
  expect(
    screen.getByRole('button', { name: 'Kowal' }).getAttribute('aria-pressed'),
  ).toBe('true')
  expect(
    screen.getByLabelText<HTMLInputElement>('Imię i nazwisko lub nazwa').value,
  ).toBe('Łukasz Żak')
  expect(save).not.toHaveBeenCalled()
  fireEvent.change(screen.getByLabelText('E-mail', { exact: true }), {
    target: { value: 'kowal@example.com' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Zapisz specjalistę' }))
  await waitFor(() =>
    expect(save).toHaveBeenCalledWith({
      type: 'farrier',
      name: 'Łukasz Żak',
      email: 'kowal@example.com',
      phone: '',
      notes: '',
    }),
  )
})

it('translates the stable continuation error without repeating an acknowledged creation', async () => {
  const save = vi
    .fn()
    .mockResolvedValue(createDashboardLabFixtureData().stable._id)
  const open = vi
    .fn()
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValue(undefined)
  render(
    <LocaleProvider>
      <LanguageSelector />
      <StableProfileForm mode="create" save={save} onSaved={open} />
    </LocaleProvider>,
  )
  fireEvent.change(screen.getByLabelText('Stable name'), {
    target: { value: 'Stajnia Łąkowa' },
  })
  fireEvent.change(screen.getByLabelText('Location'), {
    target: { value: 'Łódź' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Create stable' }))
  await screen.findByText(/Your stable was created, but setup could not open/)
  polish()
  expect(screen.getByRole('alert').textContent).toContain(
    'Stajnia została utworzona',
  )
  fireEvent.click(
    screen.getByRole('button', { name: 'Przejdź do konfiguracji' }),
  )
  await waitFor(() => expect(open).toHaveBeenCalledTimes(2))
  expect(save).toHaveBeenCalledTimes(1)
})
