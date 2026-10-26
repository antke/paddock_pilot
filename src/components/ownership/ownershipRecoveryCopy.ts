import { useLocale } from '#/i18n/LocaleProvider'

const en = {
  signInHelp:
    'Sign in or create an account using the email address that received this invitation. You will return here to review it before accepting.',
  signIn: 'Sign in',
  signUp: 'Create account',
  switchAccount: 'Use another account',
  refresh: 'Refresh invitation',
  retry: 'Try again',
  backHorses: 'Back to my horses',
  wrongAccount: 'Use the invited account',
  wrongAccountHelp:
    'This invitation was sent to a different email address. Switch to the account that received it, then return here.',
  expired: 'Invitation expired',
  expiredHelp:
    'Ask the person who invited you to send a new invitation. This link cannot give you access.',
  revoked: 'Invitation cancelled',
  revokedHelp:
    'The sender cancelled this invitation. Contact them if you still need access and ask for a new invitation.',
  declined: 'Invitation declined',
  declinedHelp:
    'No access was added. If you change your mind, ask the sender for a new invitation.',
  unavailable: 'Invitation unavailable',
  unavailableHelp:
    'This link is no longer valid, or the horse’s circumstances have changed. Ask the sender for a new invitation.',
  loadError: 'Could not load this invitation',
  loadErrorHelp:
    'Try loading it again. If you are signed in with a different email address, switch to the account that received the invitation.',
  accepting: 'Accepting invitation…',
  declining: 'Declining invitation…',
  retryAccept: 'Try accepting again',
  retryDecline: 'Try declining again',
  acceptedHelp:
    'Your invitation has been accepted. Open the horse to see the records available to you.',
  newContact: 'Add a care contact',
  contactsHelp: 'Keep the people who help care for your horses close at hand.',
  noContacts:
    'No care contacts yet. Add your vet, farrier or another care provider below.',
  edit: 'Edit contact',
  delete: 'Delete contact',
  deleteTitle: (name: string) => `Delete ${name}?`,
  deleteHelp:
    'This removes the saved contact from your contacts. Existing horse and appointment records keep their recorded details. This cannot be undone.',
  saved: 'Contact saved.',
  updated: 'Contact updated.',
  deleted: 'Contact deleted.',
  saving: 'Saving contact…',
  saveChanges: 'Save changes',
  cancel: 'Cancel',
  phoneOptional: 'Phone number (optional)',
  changeStart: 'Back to start options',
  chooseStep: 'Choose how to start',
  profileStep: 'Your profile',
  horseStep: 'Your first horse',
  stableStep: 'Your stable',
  stepsLabel: 'Getting started',
  profileHelp: 'How should other stable members recognise you?',
  continueHorse: 'Continue to horse',
  continueStable: 'Continue to stable',
  continueDestination: 'Save and continue',
  resumeHelp: 'Save your profile to continue to the page you opened.',
}
const pl: typeof en = {
  signInHelp:
    'Zaloguj się lub utwórz konto z adresem e-mail, na który wysłano zaproszenie. Wrócisz tutaj, aby sprawdzić je przed akceptacją.',
  signIn: 'Zaloguj się',
  signUp: 'Utwórz konto',
  switchAccount: 'Użyj innego konta',
  refresh: 'Odśwież zaproszenie',
  retry: 'Spróbuj ponownie',
  backHorses: 'Wróć do moich koni',
  wrongAccount: 'Użyj zaproszonego konta',
  wrongAccountHelp:
    'Zaproszenie wysłano na inny adres e-mail. Przełącz się na konto, które je otrzymało, i wróć tutaj.',
  expired: 'Zaproszenie wygasło',
  expiredHelp:
    'Poproś nadawcę o nowe zaproszenie. Ten link nie może już przyznać dostępu.',
  revoked: 'Zaproszenie anulowano',
  revokedHelp:
    'Nadawca anulował zaproszenie. Jeśli nadal potrzebujesz dostępu, skontaktuj się z nim i poproś o nowe.',
  declined: 'Zaproszenie odrzucono',
  declinedHelp:
    'Nie przyznano dostępu. Jeśli zmienisz zdanie, poproś nadawcę o nowe zaproszenie.',
  unavailable: 'Zaproszenie niedostępne',
  unavailableHelp:
    'Link jest już nieważny lub sytuacja konia się zmieniła. Poproś nadawcę o nowe zaproszenie.',
  loadError: 'Nie udało się wczytać zaproszenia',
  loadErrorHelp:
    'Spróbuj ponownie. Jeśli korzystasz z innego adresu e-mail, przełącz się na konto, które otrzymało zaproszenie.',
  accepting: 'Przyjmowanie zaproszenia…',
  declining: 'Odrzucanie zaproszenia…',
  retryAccept: 'Spróbuj przyjąć ponownie',
  retryDecline: 'Spróbuj odrzucić ponownie',
  acceptedHelp:
    'Zaproszenie zostało przyjęte. Otwórz konia, aby zobaczyć dostępne wpisy.',
  newContact: 'Dodaj kontakt',
  contactsHelp:
    'Miej pod ręką kontakty do osób pomagających w opiece nad końmi.',
  noContacts:
    'Nie masz jeszcze kontaktów. Dodaj poniżej weterynarza, kowala lub inną osobę pomagającą w opiece.',
  edit: 'Edytuj kontakt',
  delete: 'Usuń kontakt',
  deleteTitle: (name: string) => `Usunąć kontakt: ${name}?`,
  deleteHelp:
    'Kontakt zostanie usunięty z Twojej listy. Dotychczasowe wpisy i wizyty zachowają zapisane dane. Tej operacji nie można cofnąć.',
  saved: 'Kontakt zapisano.',
  updated: 'Kontakt zaktualizowano.',
  deleted: 'Kontakt usunięto.',
  saving: 'Zapisywanie kontaktu…',
  saveChanges: 'Zapisz zmiany',
  cancel: 'Anuluj',
  phoneOptional: 'Numer telefonu (opcjonalnie)',
  changeStart: 'Wróć do opcji rozpoczęcia',
  chooseStep: 'Wybór sposobu rozpoczęcia',
  profileStep: 'Twój profil',
  horseStep: 'Twój pierwszy koń',
  stableStep: 'Twoja stajnia',
  stepsLabel: 'Pierwsze kroki',
  profileHelp: 'Jak mają Cię rozpoznawać inni członkowie stajni?',
  continueHorse: 'Dalej: Twój koń',
  continueStable: 'Dalej: Twoja stajnia',
  continueDestination: 'Zapisz profil i kontynuuj',
  resumeHelp: 'Zapisz profil, aby przejść do otwartej strony.',
}
export function useOwnershipRecoveryCopy() {
  return useLocale().locale === 'pl' ? pl : en
}
