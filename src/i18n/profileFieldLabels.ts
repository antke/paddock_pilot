import type { Locale } from 'shared/i18n/locale'
import { localeInstances, resources } from './resources'

/** Labels in these query fields are system-generated, never user-written text. */
export function getProfileFieldLabel(field: string, locale: Locale = 'en') {
  const labels = resources.en.app.careLabels.profileField
  if (Object.hasOwn(labels, field)) {
    return localeInstances[locale].t(
      `careLabels.profileField.${field as keyof typeof labels}`,
    )
  }
  return field
}
