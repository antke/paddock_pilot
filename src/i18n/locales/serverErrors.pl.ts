export const serverErrors = {
  futureTraining: 'Nie można oznaczyć przyszłego treningu jako ukończonego.',
  chooseTrainingActivities:
    'Wybierz rodzaj pracy wykonywanej podczas treningu.',
  trainingRequiresPermission:
    'Ukończony trening możesz zapisać tylko dla koni, którymi możesz zarządzać. Usuń pozostałe konie lub zaplanuj trening.',
  eventNeedsOwnHorse:
    'Wydarzenie utworzone przez członka stajni musi obejmować co najmniej jednego z jego koni.',
  eventRetainsOwnHorse:
    'Wydarzenie zarządzane przez członka stajni musi nadal obejmować co najmniej jednego z jego koni.',
  eventTypeLocked:
    'W tym formularzu nie można zmienić wydarzenia w trening ani treningu w wydarzenie.',
  trainingScheduleLocked:
    'Ten trening ma już zapisany przebieg. Zachowaj jego harmonogram, a dla innych terminów utwórz nowy trening.',
  trainingHorseLocked:
    'Nie można usunąć konia z tego treningu, ponieważ zapisano już jego przebieg.',
  trainingHorseConflict: 'Wybrany koń ma już zapisany trening w tej sesji.',
  trainingNotFound: 'Nie znaleziono treningu.',
  trainingHorseUnconfirmed:
    'Udział tego konia w tym treningu nie został potwierdzony.',
  trainingPermission:
    'Trening konia może zapisać tylko jego właściciel lub administrator stajni.',
  trainingOccurrence: 'Wybierz datę z harmonogramu tego treningu.',
} as const
