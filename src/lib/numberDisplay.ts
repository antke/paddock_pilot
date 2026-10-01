import { displayLocales } from '../../shared/i18n/locale'
import type { Locale } from '../../shared/i18n/locale'

const fileSizeFormatter = (locale: Locale) =>
  new Intl.NumberFormat(displayLocales[locale], {
    maximumFractionDigits: 1,
  })

const gbpCurrencyFormatter = (locale: Locale) =>
  new Intl.NumberFormat(displayLocales[locale], {
    style: 'currency',
    currency: 'GBP',
  })

export function formatFileSize(size: number, locale: Locale = 'en') {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) {
    return `${fileSizeFormatter(locale).format(size / 1024)} KB`
  }

  return `${fileSizeFormatter(locale).format(size / (1024 * 1024))} MB`
}

export function formatCurrencyAmount(value: number, locale: Locale = 'en') {
  return gbpCurrencyFormatter(locale).format(value)
}

export function formatDecimal(value: number, locale: Locale = 'en') {
  return new Intl.NumberFormat(displayLocales[locale], {
    maximumFractionDigits: 20,
  }).format(value)
}

export function formatCountLabel(count: number, singular: string) {
  return `${count} ${singular}${count === 1 ? '' : 's'}`
}
