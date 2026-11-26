// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { LocaleProvider, useLocale } from './LocaleProvider'
import { LanguageSelector } from './LanguageSelector'
import { HealthIssueForm } from '#/components/horses/HealthIssueForm'
import { MedicationRecordForm } from '#/components/horses/MedicationRecordForm'
import { WeightRecordForm } from '#/components/horses/WeightRecordForm'
import { NutritionLogForm } from '#/components/horses/NutritionLogForm'
import { HorseHealthIssuesCardView } from '#/components/horses/HorseHealthIssuesCard'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'

let changeLocale: ReturnType<typeof useLocale>['changeLocale']
function LocaleControl() {
  changeLocale = useLocale().changeLocale
  return null
}

const horse = createDashboardLabFixtureData().horses[0]
beforeEach(() => {
  localStorage.clear()
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-GB'])
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
function switchLocale(locale: 'en' | 'pl') {
  const selector = screen.getByRole('combobox', {
    name: locale === 'pl' ? 'Language' : 'Język',
  })
  act(() => selector.focus())
  fireEvent.change(selector, { target: { value: locale } })
  return selector
}
it('keeps a dirty health dialog and its validation mounted while changing language', async () => {
  const save = vi.fn()
  render(
    <LocaleProvider>
      <LanguageSelector />
      <LocaleControl />
      <HorseHealthIssuesCardView
        horse={horse}
        issues={[]}
        canManage
        onAdd={save}
        onResolve={vi.fn()}
        onRemove={vi.fn()}
      />
    </LocaleProvider>,
  )
  fireEvent.click(
    screen.getAllByRole('button', { name: 'Add health issue' })[0],
  )
  const description = screen.getByLabelText<HTMLTextAreaElement>(
    'Description (optional)',
  )
  fireEvent.change(description, { target: { value: 'Kontrola lewego kopyta' } })
  fireEvent.click(screen.getByRole('button', { name: 'Add issue' }))
  await screen.findByText('Enter a title.')
  act(() => description.focus())
  await act(async () => changeLocale('pl'))
  await screen.findByText('Wpisz tytuł.')
  expect(description.isConnected).toBe(true)
  expect(description.value).toBe('Kontrola lewego kopyta')
  expect(
    screen.getByRole('dialog', { name: 'Nowy problem zdrowotny' }),
  ).toBeTruthy()
  expect(document.activeElement).toBe(description)
  expect(save).not.toHaveBeenCalled()
})
it('translates a failed health submission without clearing the draft or resubmitting', async () => {
  const save = vi.fn().mockRejectedValue(new Error('offline'))
  render(
    <LocaleProvider>
      <LanguageSelector />
      <HealthIssueForm onSubmit={save} />
    </LocaleProvider>,
  )
  const title = screen.getByLabelText<HTMLInputElement>('Issue title')
  fireEvent.change(title, { target: { value: 'Kontrola kopyta' } })
  fireEvent.click(screen.getByRole('button', { name: 'Add issue' }))
  await screen.findByText(
    'Couldn’t save the record. Your entries are still here. You’re offline, so nothing changed. Reconnect and try again.',
  )
  switchLocale('pl')
  expect(
    screen.getByText(
      'Nie udało się zapisać wpisu. Wpisane dane nadal tu są. Nie masz internetu, więc nic się nie zmieniło. Połącz się i spróbuj ponownie.',
    ),
  ).toBeTruthy()
  expect(title.value).toBe('Kontrola kopyta')
  expect(save).toHaveBeenCalledTimes(1)
})
it('refreshes medication date-order validation and keeps the original dates and status', async () => {
  const save = vi.fn()
  render(
    <LocaleProvider>
      <LanguageSelector />
      <MedicationRecordForm onSubmit={save} />
    </LocaleProvider>,
  )
  fireEvent.change(screen.getByLabelText('Medication'), {
    target: { value: 'Lek testowy' },
  })
  fireEvent.change(screen.getByLabelText('Dosage'), {
    target: { value: 'Według zaleceń' },
  })
  fireEvent.change(screen.getByLabelText('Start date'), {
    target: { value: '2026-09-29' },
  })
  const end = screen.getByLabelText<HTMLInputElement>('End date (optional)')
  fireEvent.change(end, { target: { value: '2026-09-28' } })
  fireEvent.click(screen.getByRole('button', { name: 'Add medication' }))
  await screen.findByText('End date cannot be before the start date.')
  switchLocale('pl')
  await screen.findByText('Data końca nie może być przed datą początku.')
  expect(end.value).toBe('2026-09-28')
  fireEvent.change(end, { target: { value: '2026-10-01' } })
  fireEvent.click(screen.getByRole('button', { name: 'Dodaj lek' }))
  await waitFor(() =>
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: '2026-09-29',
        endDate: '2026-10-01',
        status: 'active',
        medicationName: 'Lek testowy',
      }),
    ),
  )
})
it('keeps numeric units and draft measurements while translating range errors', async () => {
  const save = vi.fn()
  render(
    <LocaleProvider>
      <LanguageSelector />
      <WeightRecordForm onSubmit={save} />
    </LocaleProvider>,
  )
  const weight = screen.getByLabelText<HTMLInputElement>('Weight')
  fireEvent.change(weight, { target: { value: '-1' } })
  fireEvent.click(screen.getByRole('button', { name: 'Add weight' }))
  await screen.findByText('Weight must be greater than 0.')
  switchLocale('pl')
  await screen.findByText('Wpisz masę większą niż 0.')
  expect(weight.value).toBe('-1')
  fireEvent.change(weight, { target: { value: '520.5' } })
  fireEvent.click(screen.getByRole('button', { name: 'Dodaj pomiar' }))
  await waitFor(() =>
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ weight: 520.5, unit: 'kg' }),
    ),
  )
})
it('preserves multiline nutrition drafts and localizes list validation', async () => {
  const save = vi.fn()
  render(
    <LocaleProvider>
      <LanguageSelector />
      <NutritionLogForm horse={horse} onSubmit={save} />
    </LocaleProvider>,
  )
  fireEvent.change(screen.getByLabelText('What changed'), {
    target: { value: 'Zmiana planu' },
  })
  const list = screen.getByLabelText<HTMLTextAreaElement>(
    'Recommended after change',
  )
  const draft = 'Moczone siano\n' + 'a'.repeat(101)
  fireEvent.change(list, { target: { value: draft } })
  fireEvent.click(screen.getByRole('button', { name: 'Add nutrition log' }))
  await screen.findByText('Use up to 100 characters per item.')
  switchLocale('pl')
  await screen.findByText('Skróć pozycję (maks. 100 znaków).')
  expect(list.value).toBe(draft)
  expect(save).not.toHaveBeenCalled()
})
