export const serverErrors = {
  futureTraining: 'Przyszłego treningu nie da się zakończyć.',
  chooseTrainingActivities: 'Wybierz, co robiliście na treningu.',
  trainingRequiresPermission:
    'Zakończony trening zapiszesz tylko dla koni, którymi zarządzasz. Usuń pozostałe konie lub zaplanuj trening.',
  eventNeedsOwnHorse: 'Dodaj co najmniej jednego swojego konia.',
  eventRetainsOwnHorse:
    'Zostaw w wydarzeniu co najmniej jednego swojego konia.',
  eventTypeLocked: 'Tu nie zmienisz wydarzenia w trening ani odwrotnie.',
  trainingScheduleLocked:
    'Ten trening ma już zapisany przebieg. Zostaw jego terminy, a na inne utwórz nowy trening.',
  trainingHorseLocked:
    'Ten koń ma już zapisany przebieg treningu, więc nie da się go usunąć.',
  trainingHorseConflict: 'Wybrany koń ma już zapisany trening w tej sesji.',
  trainingNotFound: 'Nie znaleziono treningu.',
  trainingHorseUnconfirmed: 'Ten koń nie ma potwierdzonego udziału w treningu.',
  trainingPermission:
    'Trening konia może zapisać tylko jego właściciel, opiekun z prawem edycji lub administrator stajni.',
  trainingOccurrence: 'Wybierz datę z harmonogramu tego treningu.',
  eventDeleteBlocked:
    'Jest już w historii niektórych koni albo bierze w nim udział koń innego właściciela, więc nie da się go usunąć. Zamiast usuwać, odwołaj.',
  eventClosed: 'To wydarzenie już się odbyło lub zostało odwołane.',
  stableHasUnclaimedHorses:
    'Część koni nadal nie ma tu właściciela. Zarchiwizujesz stajnię, gdy właściciele przyjmą zaproszenia albo gdy usuniesz te konie.',
} as const
