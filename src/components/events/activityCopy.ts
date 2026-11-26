import { useLocale } from '#/i18n/LocaleProvider'

const en = {
  calendars: 'Calendars to show',
  mine: 'My calendar',
  mineHelpLabel: 'About My calendar',
  mineHelp:
    'Your calendar is always included. Select stables to see their shared records too.',
  filterHelp:
    'Your activities and your horses’ records can also appear in a stable calendar. Selecting calendars does not change sharing.',
  participants: 'People taking part',
  participantHelp:
    'Invite someone to this horse’s session. After accepting, they can see this activity; a rider can record their ride. This does not give access to other horse records.',
  horse: 'Horse',
  email: 'Participant’s email',
  role: 'Role',
  rider: 'Rider',
  instructor: 'Instructor',
  invite: 'Invite to this session',
  invited: 'Awaiting acceptance',
  accepted: 'Accepted',
  declined: 'Declined',
  revoked: 'Removed',
  remove: 'Remove access',
  invitations: 'Activity invitations',
  accept: 'Accept',
  decline: 'Decline',
  myActivities: 'Activities I take part in',
  privacy:
    'Visible to you and the horse’s authorized owners/carers. Stable sharing follows the activity’s existing settings.',
  report: 'Record my ride',
  save: 'Save ride report',
  outcome: 'How did the ride go?',
  minutes: 'Duration (minutes)',
  saved: 'Ride recorded',
  inviteFailed: 'Couldn’t send the invitation.',
  removeFailed: 'Couldn’t remove access.',
  acceptFailed: 'Couldn’t accept the invitation.',
  declineFailed: 'Couldn’t decline the invitation.',
  reportFailed: 'Couldn’t save your ride.',
  leaveFailed: 'Couldn’t leave the activity',
  pending: 'Saving…',
  reported: 'A report has been recorded for this ride.',
  empty: 'No activities in the selected calendars.',
  inApp:
    'The invitation appears in their Events and Training pages when they sign in with this email.',
  noCalendars: 'Select a calendar to see activities.',
  future: 'You can record this ride on or after its scheduled day.',
  leave: 'Leave',
  leaveTitle: 'Leave this activity?',
  leaveHelp:
    'You will no longer see this session or be able to record the ride. Rides you already recorded stay with the horse.',
  stay: 'Stay',
  sessionChanged:
    'This session changed or was cancelled, so it can no longer be recorded. Contact the horse owner.',
} as const
const pl: Record<keyof typeof en, string> = {
  calendars: 'Pokaż kalendarze',
  mine: 'Mój kalendarz',
  mineHelpLabel: 'O moim kalendarzu',
  mineHelp:
    'Twój kalendarz jest zawsze widoczny. Wybierz stajnie, aby zobaczyć też udostępnione w nich wpisy.',
  filterHelp:
    'Twoje aktywności i wpisy Twoich koni mogą też być widoczne w kalendarzu stajni. Wybór kalendarzy nie zmienia udostępniania.',
  participants: 'Uczestnicy',
  participantHelp:
    'Zaproś osobę na ten termin z wybranym koniem. Po akceptacji zobaczy tę aktywność, a jeździec będzie mógł zapisać przejazd. Zaproszenie nie daje dostępu do pozostałej dokumentacji konia.',
  horse: 'Koń',
  email: 'E-mail uczestnika',
  role: 'Rola',
  rider: 'Jeździec',
  instructor: 'Instruktor',
  invite: 'Zaproś na ten termin',
  invited: 'Oczekuje na akceptację',
  accepted: 'Zaakceptowano',
  declined: 'Odrzucono',
  revoked: 'Usunięto',
  remove: 'Usuń dostęp',
  invitations: 'Zaproszenia do aktywności',
  accept: 'Akceptuj',
  decline: 'Odrzuć',
  myActivities: 'Aktywności z moim udziałem',
  privacy:
    'Widoczne dla Ciebie oraz upoważnionych właścicieli i opiekunów konia. Udostępnianie stajni zależy od ustawień aktywności.',
  report: 'Zapisz mój przejazd',
  save: 'Zapisz relację z przejazdu',
  outcome: 'Jak przebiegł przejazd?',
  minutes: 'Czas trwania (minuty)',
  saved: 'Przejazd zapisany',
  inviteFailed: 'Nie udało się wysłać zaproszenia.',
  removeFailed: 'Nie udało się usunąć dostępu.',
  acceptFailed: 'Nie udało się zaakceptować zaproszenia.',
  declineFailed: 'Nie udało się odrzucić zaproszenia.',
  reportFailed: 'Nie udało się zapisać przejazdu.',
  leaveFailed: 'Nie udało się zrezygnować z aktywności',
  pending: 'Zapisywanie…',
  reported: 'Ten przejazd ma już zapisaną relację.',
  empty: 'Brak aktywności w wybranych kalendarzach.',
  inApp:
    'Zaproszenie pojawi się na stronach Wydarzenia i Treningi po zalogowaniu na ten adres e-mail.',
  noCalendars: 'Wybierz kalendarz, aby zobaczyć aktywności.',
  future: 'Przejazd możesz zapisać w zaplanowanym dniu lub później.',
  leave: 'Zrezygnuj',
  leaveTitle: 'Zrezygnować z tej aktywności?',
  leaveHelp:
    'Nie zobaczysz już tego terminu i nie zapiszesz przejazdu. Zapisane przejazdy zostają w historii konia.',
  stay: 'Zostań',
  sessionChanged:
    'Ten termin zmienił się lub został odwołany, więc nie można go już zapisać. Skontaktuj się z właścicielem konia.',
}
export function useActivityCopy() {
  return useLocale().locale === 'pl' ? pl : en
}
