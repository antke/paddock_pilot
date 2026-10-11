import { useLocale } from '#/i18n/LocaleProvider'

const en = {
  owner: 'Account owner',
  custodian: 'Managed by the stable until the owner accepts',
  stableAccess: 'Access through the current stable',
  stableAccessHelp:
    'This stable’s administrator can read the complete history and add stable care records. That access ends when the horse leaves, unless the administrator also has separately invited access.',
  ownerHelp:
    'Ownership changes only when a transfer invitation is accepted. Editing the profile’s owner display name does not change the account owner.',
  invited: 'Invited carers',
  noCarers: 'No invited carers yet.',
  yourAccess: 'Your access',
  personalAccess: 'No stable administrator has access through a placement.',
  moveTo: 'Where will this horse live?',
  noStable:
    'No other stable is available. Join a stable using an invitation from its administrator, or set up your own stable.',
  personalOption: 'Personal care — no connected stable',
  review: 'Review this move',
  cancelReview: 'Cancel review',
  from: 'From',
  to: 'To',
  cancel: 'Cancel',
  connectPending: 'Connecting stable…',
  connected: (name: string) =>
    `Connected to ${name}. The stable administrator can now read the horse’s history.`,
  moveConfirm: (name: string) => `Move to ${name}`,
  leaveConfirm: 'Leave for personal care',
  moveTitle: (name: string) => `Move ${name}`,
  moveStarted: (name: string) =>
    `The move to ${name} has started. History is being preserved; editing will be available when it finishes.`,
  tasksHelp:
    'Checked tasks continue in your personal care list, even if you are moving to another stable. Unchecked tasks are dismissed; their history is retained.',
  deleting: 'Deleting horse…',
  deleteTitle: (name: string) => `Delete ${name}?`,
  deleteHelp: (name: string, date: string) =>
    `${name} will leave the current stable and move to Deleted horses. You can restore the horse for 14 days, until ${date}. After that, the horse and its records are permanently removed. The former stable retains its own historical records.`,
  deleteFailed: 'The horse could not be deleted. Please try again.',
  deleted:
    'Horse moved to Deleted horses. Open that page to restore it during the next 14 days.',
  sending: 'Sending invitation…',
  saving: 'Saving access…',
  removing: 'Removing access…',
  cancelling: 'Cancelling invitation…',
  invitationSent: (email: string) =>
    `Invitation sent to ${email}. Access changes after they accept.`,
  accessSaved: (name: string) => `Access updated for ${name}.`,
  accessRemoved: (name: string) => `Access removed for ${name}.`,
  invitationCancelled: (email: string) => `Invitation cancelled for ${email}.`,
  removeTitle: (name: string) => `Remove access for ${name}?`,
  removeHelp:
    'Their invited access ends immediately. They may still have access as the current stable administrator. You can invite them again later.',
  transferSubmit: 'Send ownership transfer invitation',
  transferHelp:
    'You remain the owner until the recipient accepts. Acceptance transfers the complete horse history, ends your ownership and removes existing invited carers. The horse leaves its stable if the new owner is not a member there.',
}
const pl: typeof en = {
  owner: 'Właściciel w aplikacji',
  custodian: 'Stajnia zarządza koniem do czasu akceptacji przez właściciela',
  stableAccess: 'Dostęp wynikający z obecnej stajni',
  stableAccessHelp:
    'Administrator tej stajni może czytać pełną historię i dodawać stajenne wpisy opieki. Ten dostęp kończy się po wyprowadzce konia, chyba że administrator ma także osobne zaproszenie.',
  ownerHelp:
    'Własność zmienia się dopiero po przyjęciu zaproszenia do przekazania konia. Edycja nazwy właściciela w profilu konia nie przenosi własności na inne konto.',
  invited: 'Zaproszeni opiekunowie',
  noCarers: 'Nie zaproszono jeszcze opiekunów.',
  yourAccess: 'Twój dostęp',
  personalAccess:
    'Żaden administrator stajni nie ma dostępu wynikającego z pobytu konia.',
  moveTo: 'Gdzie będzie przebywać koń?',
  noStable:
    'Brak innej dostępnej stajni. Dołącz do stajni przez zaproszenie od administratora lub utwórz własną stajnię.',
  personalOption: 'Opieka indywidualna — bez połączonej stajni',
  review: 'Sprawdź tę wyprowadzkę',
  cancelReview: 'Anuluj sprawdzanie',
  from: 'Z',
  to: 'Do',
  cancel: 'Anuluj',
  connectPending: 'Łączenie ze stajnią…',
  connected: (name) =>
    `Połączono ze stajnią ${name}. Administrator może teraz czytać historię konia.`,
  moveConfirm: (name) => `Przenieś do stajni ${name}`,
  leaveConfirm: 'Przejdź do opieki indywidualnej',
  moveTitle: (name) => `Przenieś konia ${name}`,
  moveStarted: (name) =>
    `Rozpoczęto przenoszenie do: ${name}. Historia jest zachowywana; edycja będzie dostępna po zakończeniu.`,
  tasksHelp:
    'Zaznaczone zadania pozostaną na Twojej osobistej liście opieki, także po przeprowadzce do innej stajni. Pozostałe zadania zostaną odrzucone; ich historia zostanie zachowana.',
  deleting: 'Usuwanie konia…',
  deleteTitle: (name) => `Usunąć konia ${name}?`,
  deleteHelp: (name, date) =>
    `${name} opuści obecną stajnię i trafi do sekcji Usunięte konie. Możesz go przywrócić przez 14 dni, do ${date}. Po tym terminie koń i jego wpisy zostaną trwale usunięte. Poprzednia stajnia zachowa własne historyczne wpisy.`,
  deleteFailed: 'Nie udało się usunąć konia. Spróbuj ponownie.',
  deleted:
    'Koń trafił do sekcji Usunięte konie. Otwórz ją, aby przywrócić go w ciągu 14 dni.',
  sending: 'Wysyłanie zaproszenia…',
  saving: 'Zapisywanie dostępu…',
  removing: 'Odbieranie dostępu…',
  cancelling: 'Anulowanie zaproszenia…',
  invitationSent: (email) =>
    `Wysłano zaproszenie do ${email}. Dostęp zmieni się po akceptacji.`,
  accessSaved: (name) => `Zaktualizowano dostęp: ${name}.`,
  accessRemoved: (name) => `Odebrano dostęp: ${name}.`,
  invitationCancelled: (email) => `Anulowano zaproszenie dla ${email}.`,
  removeTitle: (name) => `Odebrać dostęp: ${name}?`,
  removeHelp:
    'Zaproszony dostęp wygaśnie natychmiast. Osoba może nadal mieć dostęp jako administrator obecnej stajni. Możesz zaprosić ją ponownie.',
  transferSubmit: 'Wyślij zaproszenie do przekazania własności',
  transferHelp:
    'Pozostajesz właścicielem do czasu akceptacji przez odbiorcę. Akceptacja przekazuje pełną historię konia, kończy Twoją własność i odbiera dostęp zaproszonym opiekunom. Koń opuszcza stajnię, jeśli nowy właściciel nie jest jej członkiem.',
}
export function useManagementCopy() {
  return useLocale().locale === 'pl' ? pl : en
}
