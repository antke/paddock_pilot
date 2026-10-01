import { displayLocales } from 'shared/i18n/locale'
import type { Locale } from 'shared/i18n/locale'

type TextDisplayPart = string | number | null | undefined | false

export function formatMetaText(parts: Array<TextDisplayPart>) {
  return parts.filter(isDisplayPart).join(' · ')
}

export function formatLineText(parts: Array<TextDisplayPart>) {
  return parts.filter(isDisplayPart).join('\n')
}

export function formatCommaList(parts: Array<TextDisplayPart>) {
  return parts.filter(isDisplayPart).join(', ')
}

export function formatConjunctionList(
  parts: Array<TextDisplayPart>,
  locale: Locale = 'en',
) {
  return new Intl.ListFormat(displayLocales[locale], {
    style: 'long',
    type: 'conjunction',
  }).format(parts.filter(isDisplayPart).map(String))
}

function isDisplayPart(part: TextDisplayPart): part is string | number {
  return part !== null && part !== undefined && part !== false && part !== ''
}
