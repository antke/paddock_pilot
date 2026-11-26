// Dlaczego akcja się nie udała i co zrobić dalej. Pod tytułem, który mówi, co się nie udało.
export const actionErrors = {
  offline:
    'Nie masz internetu, więc nic się nie zmieniło. Połącz się i spróbuj ponownie.',
  signedOut: 'Sesja wygasła. Zaloguj się ponownie i spróbuj jeszcze raz.',
  noAccess:
    'Nie masz już do tego uprawnień. Jeśli ich potrzebujesz, poproś administratora stajni.',
  stale:
    'Ktoś w międzyczasie to zmienił lub usunął. Odśwież stronę, żeby zobaczyć aktualny stan.',
  invalid: 'Część danych nie została przyjęta. Sprawdź je i spróbuj ponownie.',
  blocked:
    'Tego nie da się tu zrobić, więc nic się nie zmieniło. Jeśli to wygląda na błąd, zapytaj administratora stajni.',
  unknown:
    'Coś poszło nie tak po naszej stronie i nic się nie zmieniło. Spróbuj ponownie za chwilę.',
  offlineNoticeTitle: 'Nie masz internetu',
  offlineNoticeText: 'Zmiany zapiszą się, gdy połączenie wróci.',
} as const
