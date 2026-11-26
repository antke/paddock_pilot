export const eventEditor = {
  createIn: 'Udostępnianie',
  personal: 'Prywatna',
  personalHelp:
    'Widzą to tylko właściciele tych koni i upoważnieni opiekunowie. Stajnia tego nie widzi.',
  stableHelp:
    'Wpis pojawi się w wybranych stajniach. Właściciele i upoważnieni opiekunowie nadal go widzą. Członkowie widzą termin i status, a administratorzy udostępnione szczegóły. Nie daje to dostępu do innych wpisów konia.',
  requiresApproval: 'Wymaga akceptacji',
  approvalHelp:
    'Właściciel konia, opiekun z prawem edycji lub administrator stajni musi zaakceptować zaproszenie.',
  summary: 'Dodane od razu: {{confirmed}} · Do zaproszenia: {{invited}}',
  switchTitle: 'Usunąć konie z tego wpisu?',
  switchHelp:
    'Te konie potrzebują kalendarza stajni, który odznaczasz: {{horses}}. Reszta wpisu się nie zmieni.',
  switchConfirm: 'Usuń konie i kontynuuj',
  keepSpace: 'Zachowaj wybrane kalendarze',
  createPrivateEvent: 'Utwórz prywatne wydarzenie',
  createPrivateTraining: 'Utwórz prywatny trening',
  createStable: 'Utwórz w: {{stable}}',
  recordPermission:
    'Zakończony trening zapiszesz tylko dla koni, którymi zarządzasz. Usuń konie, które wymagają akceptacji, albo zmień status na Planowany.',
  awaiting: 'Oczekuje na akceptację',
  participants: 'Konie',
  confirmed: 'Potwierdzony',
  declined: 'Odrzucony',
  withdrawn: 'Wycofany',
  invitationsLoading: 'Ładowanie zaproszeń dla koni…',
  invitationsFailed:
    'Nie udało się wczytać zaproszeń dla koni. Odśwież stronę.',

  eventSavedSentence: 'Wydarzenie zapisane.',
  trainingSavedSentence: 'Trening zapisany.',
  eventSaveFailed: 'Nie udało się zapisać wydarzenia. Twoje dane nadal tu są.',
  trainingSaveFailed: 'Nie udało się zapisać treningu. Twoje dane nadal tu są.',
  trainingContinueFailed:
    'Trening zapisany, ale nie udało się otworzyć jego strony. Otwórz go, żeby kontynuować. Nie musisz zapisywać ponownie.',
  eventContinueFailed:
    'Wydarzenie zapisane, ale nie udało się otworzyć jego strony. Otwórz je, żeby kontynuować. Nie musisz zapisywać ponownie.',
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
  resetEvent: 'Odrzucić zmiany wydarzenia?',
  resetTraining: 'Odrzucić zmiany treningu?',
  resetHelp:
    'Formularz wróci do stanu z chwili otwarcia. Niezapisane zmiany przepadną.',
  createEvent: 'Utwórz wydarzenie',
  updateEvent: 'Zapisz zmiany',
  createTraining: 'Utwórz trening',
  updateTraining: 'Zapisz zmiany',
  creating: 'Tworzenie…',
  saving: 'Zapisywanie…',
} as const
