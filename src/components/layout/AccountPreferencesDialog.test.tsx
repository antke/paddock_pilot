// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { useEffect, useRef, useState } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import {
  GUEST_LOCALE_KEY,
  LocaleProvider,
  useLocale,
} from '#/i18n/LocaleProvider'
import { AccountPreferencesDialog } from './AccountPreferencesDialog'

let systemDark = false
let themeListeners: Set<() => void>

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem(GUEST_LOCALE_KEY, 'en')
  systemDark = false
  themeListeners = new Set()
  vi.stubGlobal('matchMedia', () => ({
    matches: systemDark,
    addEventListener: (_: string, callback: () => void) =>
      themeListeners.add(callback),
    removeEventListener: (_: string, callback: () => void) =>
      themeListeners.delete(callback),
  }))
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.unstubAllGlobals()
})

function PreferencesHarness({
  save,
}: {
  save?: (locale: 'en' | 'pl') => Promise<unknown>
}) {
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const { syncAccount } = useLocale()

  useEffect(() => {
    if (save) syncAccount({ id: 'account', locale: 'en', save })
  }, [save, syncAccount])

  return (
    <>
      <button ref={trigger} onClick={() => setOpen(true)}>
        Open account preferences
      </button>
      <AccountPreferencesDialog
        open={open}
        onOpenChange={setOpen}
        finalFocus={trigger}
      />
    </>
  )
}

it('offers labeled preferences, preserves theme changes and returns focus when closed', async () => {
  render(
    <LocaleProvider>
      <PreferencesHarness />
    </LocaleProvider>,
  )
  const trigger = screen.getByRole('button', {
    name: 'Open account preferences',
  })
  trigger.focus()
  fireEvent.click(trigger)

  const dialog = await screen.findByRole('dialog', { name: 'Preferences' })
  expect(dialog.getAttribute('data-mobile-fullscreen')).toBeNull()
  expect(screen.getByRole('combobox', { name: 'Language' })).toBeTruthy()
  expect(screen.getByRole('group', { name: 'Appearance' })).toBeTruthy()
  const theme = screen.getByRole('button', { name: /Theme mode: light/ })
  expect(theme.textContent).toBe('Light')
  fireEvent.click(theme)
  expect(localStorage.getItem('theme')).toBe('dark')
  expect(document.documentElement.classList.contains('dark')).toBe(true)
  expect(
    screen.getByRole('button', { name: /Theme mode: dark/ }).textContent,
  ).toBe('Dark')

  fireEvent.click(screen.getByRole('button', { name: 'Close' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  await waitFor(() => expect(document.activeElement).toBe(trigger))
  fireEvent.click(trigger)
  expect(
    await screen.findByRole('button', { name: /Theme mode: dark/ }),
  ).toBeTruthy()
})

it('keeps language saving, failure and retry available inside the dialog', async () => {
  let rejectSave: (error: Error) => void = () => {}
  const save = vi.fn<(locale: 'en' | 'pl') => Promise<unknown>>()
  save.mockImplementationOnce(
    () =>
      new Promise((_, reject) => {
        rejectSave = reject
      }),
  )
  save.mockResolvedValue(undefined)

  render(
    <LocaleProvider>
      <PreferencesHarness save={save} />
    </LocaleProvider>,
  )
  fireEvent.click(
    screen.getByRole('button', { name: 'Open account preferences' }),
  )
  fireEvent.change(await screen.findByRole('combobox', { name: 'Language' }), {
    target: { value: 'pl' },
  })
  expect(save).toHaveBeenCalledWith('pl')
  expect(screen.getByRole('dialog', { name: 'Preferencje' })).toBeTruthy()
  expect(screen.getByRole('group', { name: 'Wygląd' })).toBeTruthy()
  expect(
    screen.getByRole<HTMLSelectElement>('combobox', { name: 'Język' }).disabled,
  ).toBe(true)
  expect(screen.getByRole('status').textContent).toBe('Zapisywanie języka…')

  await act(async () => rejectSave(new Error('Connection unavailable')))
  expect(await screen.findByRole('alert')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Zapisz język ponownie' }))
  await waitFor(() => expect(screen.queryByRole('alert')).toBeNull())
  expect(save).toHaveBeenCalledTimes(2)
  expect(save).toHaveBeenLastCalledWith('pl')
})

it('follows system and cross-tab theme changes while preferences stay closed', () => {
  localStorage.setItem('theme', 'auto')
  render(<PreferencesHarness />)
  expect(screen.queryByRole('dialog')).toBeNull()
  act(() => {
    systemDark = true
    themeListeners.forEach((callback) => callback())
  })
  expect(document.documentElement.classList.contains('dark')).toBe(true)
  act(() =>
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'theme',
        newValue: 'light',
        storageArea: localStorage,
      }),
    ),
  )
  expect(document.documentElement.classList.contains('light')).toBe(true)
  expect(themeListeners.size).toBe(0)
  cleanup()
  expect(themeListeners.size).toBe(0)
})
