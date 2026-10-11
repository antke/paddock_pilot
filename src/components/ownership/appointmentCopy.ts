import { useLocale } from '#/i18n/LocaleProvider'

const en = {
  title: 'Events',
  intro: 'Events for your horses and stables, including past entries.',
  add: 'Add event',
  list: 'All events',
  listHelp:
    'Search all events, including past entries. Repeating events appear once here; the calendar shows each date.',
  calendar: 'Calendar',
  views: 'Event views',
  viewAll: 'View all appointments',
  upcoming: 'Upcoming appointments',
  previewHelp:
    'Your next 12 appointments in the next 90 days, including visits already in progress.',
  emptyUpcoming: 'No appointments in the next 90 days.',
  empty: 'No events yet',
  emptyHelp: 'Add an event to plan a visit or keep a record of past care.',
}

const pl: typeof en = {
  title: 'Wydarzenia',
  intro:
    'Wydarzenia dotyczące Twoich koni i stajni, także te, które już się odbyły.',
  add: 'Dodaj wydarzenie',
  list: 'Wszystkie wydarzenia',
  listHelp:
    'Wyszukuj wszystkie wydarzenia, także wcześniejsze. Wydarzenia cykliczne są tu pokazane raz; kalendarz pokazuje każdy termin.',
  calendar: 'Kalendarz',
  views: 'Widoki wydarzeń',
  viewAll: 'Zobacz wszystkie wizyty',
  upcoming: 'Nadchodzące wizyty',
  previewHelp: 'Najbliższe 12 wizyt w ciągu 90 dni, w tym wizyty już trwające.',
  emptyUpcoming: 'Brak wizyt w ciągu najbliższych 90 dni.',
  empty: 'Nie dodano jeszcze żadnych wydarzeń',
  emptyHelp:
    'Dodaj wydarzenie, aby zaplanować opiekę lub zapisać wcześniejszą wizytę.',
}

export function useAppointmentCopy() {
  return useLocale().locale === 'pl' ? pl : en
}
