import type { ComponentProps } from 'react'
import { PersonNameField } from '#/components/forms/PersonNameField'
import { useT } from '#/i18n/LocaleProvider'

/** Suggestions fill a display name; they never select an account or transfer ownership. */
export function HorseOwnerAutocomplete(
  props: ComponentProps<typeof PersonNameField>,
) {
  const t = useT()
  return (
    <PersonNameField
      {...props}
      triggerLabel={t('horseForm.showOwnerSuggestions')}
      emptyMessage={t('horseForm.noOwnerSuggestions')}
      placeholder={t('horseForm.ownerSuggestionPlaceholder')}
    />
  )
}
