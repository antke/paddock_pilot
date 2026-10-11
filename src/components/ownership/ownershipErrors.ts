import type { Locale } from 'shared/i18n/locale'
import { useLocale } from '#/i18n/LocaleProvider'

const messages = {
  en: {
    fallback:
      'The action could not be completed. Your entries are still here. Please try again.',
    email:
      'Enter the other person’s email address. You cannot invite your own account.',
    rate: 'Too many invitations were sent recently. Wait an hour before sending another.',
    changed:
      'The care plan changed while you were reviewing it. Check the updated appointments and task choices, then confirm again.',
    tasks:
      'A selected task is no longer available. Review the current task list and choose again.',
    account:
      'Use the account with the invited email address, then open this invitation again.',
    unavailable:
      'This invitation is no longer available. Ask the horse’s owner for a new invitation.',
    horse:
      'This horse is being updated or is no longer available. Return to My horses to check its status.',
    permission:
      'Your access no longer allows this action. Ask the horse’s owner or stable administrator to check your access.',
    contact:
      'Enter a contact name of up to 120 characters and a phone number of up to 50 characters.',
    contactMissing:
      'This contact is no longer available. Return to the contact list and choose another.',
    stable:
      'Join the destination stable before connecting your horse. Ask its administrator for an invitation.',
    different: 'Choose a stable other than the horse’s current stable.',
    age: 'Enter the horse’s name and an age between 0 and 100.',
  },
  pl: {
    fallback:
      'Nie udało się wykonać tej czynności. Wpisane dane nadal są dostępne. Spróbuj ponownie.',
    email:
      'Wpisz adres e-mail drugiej osoby. Nie możesz zaprosić własnego konta.',
    rate: 'Wysłano ostatnio zbyt wiele zaproszeń. Poczekaj godzinę przed wysłaniem kolejnego.',
    changed:
      'Plan opieki zmienił się podczas sprawdzania. Sprawdź aktualne wizyty i wybór zadań, a następnie potwierdź ponownie.',
    tasks:
      'Wybrane zadanie nie jest już dostępne. Sprawdź aktualną listę i wybierz ponownie.',
    account:
      'Użyj konta z zaproszonym adresem e-mail i ponownie otwórz zaproszenie.',
    unavailable:
      'To zaproszenie nie jest już dostępne. Poproś właściciela konia o nowe.',
    horse:
      'Dane konia są aktualizowane lub koń nie jest już dostępny. Sprawdź jego stan w sekcji Moje konie.',
    permission:
      'Twój dostęp nie pozwala już na tę czynność. Poproś właściciela konia lub administratora stajni o sprawdzenie uprawnień.',
    contact:
      'Wpisz nazwę kontaktu do 120 znaków i numer telefonu do 50 znaków.',
    contactMissing:
      'Ten kontakt nie jest już dostępny. Wróć do listy kontaktów i wybierz inny.',
    stable:
      'Dołącz do docelowej stajni, zanim połączysz z nią konia. Poproś administratora o zaproszenie.',
    different: 'Wybierz stajnię inną niż obecna stajnia konia.',
    age: 'Wpisz imię konia i wiek od 0 do 100 lat.',
  },
}

export function ownershipErrorMessage(error: unknown, locale: Locale) {
  const data =
    error && typeof error === 'object' && 'data' in error
      ? error.data
      : undefined
  const raw =
    typeof data === 'string'
      ? data
      : error instanceof Error
        ? error.message
        : ''
  const c = messages[locale]
  if (raw.includes('another person’s valid email')) return c.email
  if (raw.includes('wait before sending')) return c.rate
  if (
    raw.includes('Care plans changed') ||
    raw.includes('Review departure before')
  )
    return c.changed
  if (raw.includes('Invalid reminder selection')) return c.tasks
  if (
    raw.includes('invited email') ||
    raw.includes('not addressed to this account')
  )
    return c.account
  if (
    raw.includes('no longer available') ||
    raw.includes('request a new invitation') ||
    raw.includes('already been claimed')
  )
    return c.unavailable
  if (raw.includes('valid contact')) return c.contact
  if (raw.includes('Contact not found')) return c.contactMissing
  if (raw.includes('Choose a different stable')) return c.different
  if (raw.includes('valid age')) return c.age
  if (raw.includes('Horse is unavailable') || raw.includes('Horse not found'))
    return c.horse
  if (raw.includes('participant') || raw.includes('member of this stable'))
    return c.stable
  if (raw.includes('Not authorized') || raw.includes('Only the'))
    return c.permission
  return c.fallback
}

export function useOwnershipErrorMessage() {
  const { locale } = useLocale()
  return (error: unknown) => ownershipErrorMessage(error, locale)
}
