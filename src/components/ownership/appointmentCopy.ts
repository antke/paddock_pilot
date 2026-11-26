import { useLocale } from '#/i18n/LocaleProvider'

const en = {
  title: 'Events',
  intro: 'Events for your horses and stables, past ones too.',
  add: 'Add event',
  list: 'All events',
  listHelp:
    'Search all events, past ones too. Repeating events show once here; the calendar shows every date.',
  calendar: 'Calendar',
  views: 'Event views',
  viewAll: 'View all appointments',
  upcoming: 'Upcoming appointments',
  previewHelp:
    'Your next 12 appointments within 90 days, including ones under way.',
  emptyUpcoming: 'No appointments in the next 90 days.',
  empty: 'No events yet',
  emptyHelp: 'Add an event to plan a visit or log past care.',
}

const pl: typeof en = {
  title: 'Wydarzenia',
  intro: 'Wydarzenia Twoich koni i stajni, także te, które już były.',
  add: 'Dodaj wydarzenie',
  list: 'Wszystkie wydarzenia',
  listHelp:
    'Szukaj we wszystkich wydarzeniach, także dawnych. Powtarzające się są tu raz; kalendarz pokazuje każdy termin.',
  calendar: 'Kalendarz',
  views: 'Widoki wydarzeń',
  viewAll: 'Zobacz wszystkie wizyty',
  upcoming: 'Nadchodzące wizyty',
  previewHelp: 'Najbliższe 12 wizyt w ciągu 90 dni, w tym wizyty już trwające.',
  emptyUpcoming: 'Brak wizyt w ciągu najbliższych 90 dni.',
  empty: 'Nie ma jeszcze wydarzeń',
  emptyHelp:
    'Dodaj wydarzenie, żeby zaplanować opiekę lub zapisać dawną wizytę.',
}

export function useAppointmentCopy() {
  return useLocale().locale === 'pl' ? pl : en
}
