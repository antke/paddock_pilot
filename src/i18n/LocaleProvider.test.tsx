// @vitest-environment jsdom
import { useEffect } from 'react'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  GUEST_LOCALE_KEY,
  LocaleProvider,
  useLocale,
  useT,
} from './LocaleProvider'
import { LanguageSelector } from './LanguageSelector'
import { AccountProfileFormView } from '#/components/onboarding/AccountProfileForm'
import type { Locale } from '../../shared/i18n/locale'

function Account({
  id,
  locale,
  save,
}: {
  id: string | null
  locale?: Locale
  save: (locale: Locale) => Promise<unknown>
}) {
  const { syncAccount } = useLocale()
  useEffect(() => {
    syncAccount(id ? { id, locale, save } : null)
  }, [id, locale, save, syncAccount])
  return null
}
function Sample() {
  const t = useT()
  return (
    <>
      <LanguageSelector />
      <h1>{t('navigation.home')}</h1>
      <input aria-label="draft" />
    </>
  )
}
function deferred() {
  let resolve!: () => void
  let reject!: () => void
  const promise = new Promise<void>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
beforeEach(() => {
  localStorage.clear()
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-GB'])
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('locale preference lifecycle', () => {
  it('detects browser language, stores an explicit guest choice, and keeps dirty input', async () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['pl-PL'])
    const view = render(
      <LocaleProvider>
        <Sample />
      </LocaleProvider>,
    )
    expect(
      await screen.findByRole('heading', { name: 'Strona główna' }),
    ).toBeTruthy()
    fireEvent.change(screen.getByLabelText<HTMLInputElement>('draft'), {
      target: { value: 'Juniper' },
    })
    fireEvent.change(screen.getByRole<HTMLSelectElement>('combobox'), {
      target: { value: 'en' },
    })
    expect(screen.getByRole('heading', { name: 'Home' })).toBeTruthy()
    expect(screen.getByLabelText<HTMLInputElement>('draft').value).toBe(
      'Juniper',
    )
    expect(localStorage.getItem(GUEST_LOCALE_KEY)).toBe('en')
    expect(document.documentElement.lang).toBe('en')
    view.unmount()
    render(
      <LocaleProvider>
        <Sample />
      </LocaleProvider>,
    )
    expect(screen.getByRole('heading', { name: 'Home' })).toBeTruthy()
  })
  it('keeps an account change optimistic through stale data and offers retry on failure', async () => {
    const pending = deferred()
    const save = vi
      .fn()
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValue(undefined)
    render(
      <LocaleProvider>
        <Account id="A" locale="en" save={save} />
        <Sample />
      </LocaleProvider>,
    )
    fireEvent.change(screen.getByRole<HTMLSelectElement>('combobox'), {
      target: { value: 'pl' },
    })
    expect(screen.getByRole('heading', { name: 'Strona główna' })).toBeTruthy()
    expect(screen.getByRole<HTMLSelectElement>('combobox').disabled).toBe(true)
    expect(localStorage.getItem(GUEST_LOCALE_KEY)).toBeNull()
    await act(async () => pending.reject())
    expect(screen.getByRole('alert').textContent).toContain(
      'nie udało się zapisać',
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Zapisz język ponownie' }),
    )
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull())
    expect(save).toHaveBeenLastCalledWith('pl')
  })
  it('ignores a previous account request after switching accounts or signing out', async () => {
    const pending = deferred()
    const saveA = vi.fn(() => pending.promise)
    const saveB = vi.fn().mockResolvedValue(undefined)
    const content = (id: string | null, save: typeof saveA) => (
      <LocaleProvider>
        <Account id={id} locale="en" save={save} />
        <Sample />
      </LocaleProvider>
    )
    const view = render(content('A', saveA))
    fireEvent.change(screen.getByRole<HTMLSelectElement>('combobox'), {
      target: { value: 'pl' },
    })
    view.rerender(content('B', saveB))
    expect(screen.getByRole('heading', { name: 'Home' })).toBeTruthy()
    await act(async () => pending.reject())
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByRole<HTMLSelectElement>('combobox').disabled).toBe(false)
    view.rerender(content(null, saveB))
    expect(screen.getByRole('heading', { name: 'Home' })).toBeTruthy()
    expect(saveB).not.toHaveBeenCalled()
  })
  it('works when local storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    render(
      <LocaleProvider>
        <Sample />
      </LocaleProvider>,
    )
    fireEvent.change(screen.getByRole<HTMLSelectElement>('combobox'), {
      target: { value: 'pl' },
    })
    expect(screen.getByRole('heading', { name: 'Strona główna' })).toBeTruthy()
  })
  it('translates existing profile validation and preserves other unsaved fields', async () => {
    const onSave = vi.fn()
    render(
      <LocaleProvider>
        <LanguageSelector />
        <AccountProfileFormView
          initialValues={{ displayName: 'Antek', phone: '123' }}
          onSave={onSave}
          onSaved={() => {}}
        />
      </LocaleProvider>,
    )
    fireEvent.change(screen.getByLabelText('Preferred name'), {
      target: { value: '' },
    })
    fireEvent.change(screen.getByLabelText('Phone number'), {
      target: { value: '987' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }))
    expect(
      await screen.findByText('Add the name people should use.'),
    ).toBeTruthy()
    fireEvent.change(screen.getByRole<HTMLSelectElement>('combobox'), {
      target: { value: 'pl' },
    })
    expect(
      await screen.findByText('Wpisz, jak inni mają się do Ciebie zwracać.'),
    ).toBeTruthy()
    expect(
      screen.getByLabelText<HTMLInputElement>('Numer telefonu').value,
    ).toBe('987')
    expect(onSave).not.toHaveBeenCalled()
  })
})
