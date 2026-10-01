import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { I18nextProvider, useTranslation } from 'react-i18next'
import { isLocale, resolveLocale } from '../../shared/i18n/locale'
import type { Locale } from '../../shared/i18n/locale'
import { localeInstances } from './resources'

export const GUEST_LOCALE_KEY = 'paddockPilot.guestLocale'
type Account = {
  id: string
  locale?: Locale
  save: (locale: Locale) => Promise<unknown>
}
type LocaleContextValue = {
  locale: Locale
  guestLocale: Locale
  ready: boolean
  saving: boolean
  saveFailed: boolean
  changeLocale: (locale: Locale) => Promise<void>
  syncAccount: (account: Account | null) => void
}
const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  guestLocale: 'en',
  ready: true,
  saving: false,
  saveFailed: false,
  changeLocale: async () => {},
  syncAccount: () => {},
})

export function LocaleProvider({
  children,
  initialLocale = 'en',
}: {
  children: ReactNode
  initialLocale?: Locale
}) {
  const [guestLocale, setGuestLocale] = useState(initialLocale)
  const [ready, setReady] = useState(false)
  const [account, setAccount] = useState<Account | null>(null)
  const accountRef = useRef<Account | null>(null)
  const generation = useRef(0)
  const pending = useRef(false)
  const [override, setOverride] = useState<{ id: string; locale: Locale }>()
  const [saving, setSaving] = useState(false)
  const [saveFailed, setSaveFailed] = useState(false)

  useEffect(() => {
    let stored: unknown
    try {
      stored = window.localStorage.getItem(GUEST_LOCALE_KEY)
    } catch {
      /* Private browsing. */
    }
    setGuestLocale(resolveLocale(stored, navigator.languages))
    setReady(true)
    const onStorage = (event: StorageEvent) => {
      if (event.key === GUEST_LOCALE_KEY) {
        setGuestLocale(resolveLocale(event.newValue, navigator.languages))
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const syncAccount = useCallback((next: Account | null) => {
    if (next?.id !== accountRef.current?.id) {
      generation.current += 1
      pending.current = false
      setOverride(undefined)
      setSaving(false)
      setSaveFailed(false)
    }
    accountRef.current = next
    setAccount(next)
    // Keep optimistic choice until the subscribed query acknowledges it.
    if (next)
      setOverride((current) =>
        current?.id === next.id && current.locale === next.locale
          ? undefined
          : current,
      )
  }, [])

  const locale = account
    ? ((override?.id === account.id ? override.locale : account.locale) ??
      guestLocale)
    : guestLocale

  const changeLocale = useCallback(async (next: Locale) => {
    if (!isLocale(next) || pending.current) return
    const target = accountRef.current
    if (!target) {
      setGuestLocale(next)
      try {
        window.localStorage.setItem(GUEST_LOCALE_KEY, next)
      } catch {
        /* Keep session preference. */
      }
      return
    }
    const currentGeneration = generation.current
    pending.current = true
    setOverride({ id: target.id, locale: next })
    setSaving(true)
    setSaveFailed(false)
    try {
      await target.save(next)
    } catch {
      if (generation.current === currentGeneration) setSaveFailed(true)
    } finally {
      if (generation.current === currentGeneration) {
        pending.current = false
        setSaving(false)
      }
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])
  const value = useMemo(
    () => ({
      locale,
      guestLocale,
      ready,
      saving,
      saveFailed,
      changeLocale,
      syncAccount,
    }),
    [locale, guestLocale, ready, saving, saveFailed, changeLocale, syncAccount],
  )

  return (
    <LocaleContext.Provider value={value}>
      <I18nextProvider i18n={localeInstances[locale]}>
        {children}
      </I18nextProvider>
    </LocaleContext.Provider>
  )
}

export const useLocale = () => useContext(LocaleContext)
export function useT() {
  const { locale } = useLocale()
  return useTranslation('app', { i18n: localeInstances[locale] }).t
}
