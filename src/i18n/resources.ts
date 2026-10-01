import { createInstance } from 'i18next'
import { en } from './locales/en'
import { pl } from './locales/pl'
import type { Locale } from '../../shared/i18n/locale'

export const resources = { en: { app: en }, pl: { app: pl } } as const

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'app'
    resources: { app: typeof en }
    returnNull: false
    enableSelector: false
  }
}

// Immutable language-specific instances: never change a shared server language.
function createLocaleInstance(locale: Locale) {
  const instance = createInstance()
  void instance.init({
    resources,
    lng: locale,
    fallbackLng: 'en',
    supportedLngs: ['en', 'pl'],
    defaultNS: 'app',
    initAsync: false,
    returnNull: false,
    interpolation: { escapeValue: false },
  })
  return instance
}
export const localeInstances = {
  en: createLocaleInstance('en'),
  pl: createLocaleInstance('pl'),
}
