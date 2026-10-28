export const eventEditor = {
  createIn: 'Udostępnianie',
  personal: 'Prywatna',
  personalHelp:
    'Widoczne tylko dla właścicieli wybranych koni i upoważnionych opiekunów. Nie jest udostępniane stajni.',
  stableHelp:
    'Wpis pojawi się w wybranych stajniach. Właściciele i uprawnieni opiekunowie zachowują dostęp. Członkowie widzą harmonogram i status, a administratorzy udostępnione szczegóły. Udostępnienie nie daje dostępu do innych wpisów konia.',
  requiresApproval: 'Wymaga akceptacji',
  approvalHelp:
    'Właściciel konia, opiekun z prawem edycji lub administrator stajni musi zaakceptować zaproszenie.',
  summary:
    'Konie dodane od razu: {{confirmed}} · Konie do zaproszenia: {{invited}}',
  switchTitle: 'Usunąć konie z tego wpisu?',
  switchHelp:
    'Te konie wymagają kalendarza stajni, który odznaczasz: {{horses}}. Pozostała część wpisu zostanie zachowana.',
  switchConfirm: 'Usuń konie i kontynuuj',
  keepSpace: 'Zachowaj wybrane kalendarze',
  createPrivateEvent: 'Utwórz prywatne wydarzenie',
  createPrivateTraining: 'Utwórz prywatny trening',
  createStable: 'Utwórz w: {{stable}}',
  recordPermission:
    'Ukończony trening możesz zapisać tylko dla koni, którymi możesz zarządzać. Usuń konie wymagające akceptacji lub zmień status na Planowany.',
  awaiting: 'Oczekuje na akceptację',
  participants: 'Udział koni',
  confirmed: 'Potwierdzony',
  declined: 'Odrzucony',
  withdrawn: 'Wycofany',
  invitationsLoading: 'Ładowanie zaproszeń dla koni…',
  invitationsFailed:
    'Nie udało się wczytać zaproszeń dla koni. Odśwież stronę, aby spróbować ponownie.',

  eventSavedSentence: 'Wydarzenie zapisane.',
  trainingSavedSentence: 'Trening zapisany.',
  eventSaveFailed:
    'Nie udało się zapisać wydarzenia. Wprowadzone dane zostały zachowane. Spróbuj ponownie.',
  trainingSaveFailed:
    'Nie udało się zapisać treningu. Wprowadzone dane zostały zachowane. Spróbuj ponownie.',
  trainingContinueFailed:
    'Trening został zapisany, ale nie udało się otworzyć jego strony. Otwórz trening, aby kontynuować. Nie trzeba ponownie zapisywać zmian.',
  eventContinueFailed:
    'Wydarzenie zostało zapisane, ale nie udało się otworzyć jego strony. Otwórz wydarzenie, aby kontynuować. Nie trzeba ponownie zapisywać zmian.',
  addEvent: 'Dodaj wydarzenie',
  editEvent: 'Edytuj wydarzenie',
  addTraining: 'Dodaj trening',
  editTraining: 'Edytuj trening',
  trainingSaved: 'Trening zapisany',
  eventSaved: 'Wydarzenie zapisane',
  openEvent: 'Otwórz wydarzenie',
  openTraining: 'Otwórz trening',
  openingTraining: 'Otwieranie treningu…',
  openingEvent: 'Otwieranie wydarzenia…',
  resetEvent: 'Zresetować zmiany wydarzenia?',
  resetTraining: 'Zresetować zmiany treningu?',
  resetHelp:
    'Niezapisane dane zostaną zastąpione wartościami z chwili otwarcia formularza.',
  reset: 'Zresetuj zmiany',
  createEvent: 'Utwórz wydarzenie',
  updateEvent: 'Zaktualizuj wydarzenie',
  createTraining: 'Utwórz trening',
  updateTraining: 'Zaktualizuj trening',
  creating: 'Tworzenie…',
  saving: 'Zapisywanie…',
} as const
