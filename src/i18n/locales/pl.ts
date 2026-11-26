import { stableUpdates } from './stableUpdates.pl'
import { horseComparison } from './horseComparison.pl'
import { serverErrors } from './serverErrors.pl'
import { actionErrors } from './actionErrors.pl'
import { uiRemainder } from './uiRemainder.pl'
import { analysisViews } from './analysisViews.pl'
import { trainingViews } from './trainingViews.pl'
import { eventEditor } from './eventEditor.pl'
import { trainingValidation } from './trainingValidation.pl'
import { eventValidation } from './eventValidation.pl'
import { eventForm } from './eventForm.pl'
import { eventViews } from './eventViews.pl'
import { reminders } from './reminders.pl'
import { horseHistory } from './horseHistory.pl'
import { documents } from './documents.pl'
import { careFilters } from './careFilters.pl'
import { careRecords } from './careRecords.pl'
import { careValidation } from './careValidation.pl'
import { horseDetail } from './horseDetail.pl'
import { horseDeletion } from './horseDeletion.pl'
import { horseForm } from './horseForm.pl'
import { horseValidation } from './horseValidation.pl'
import { training } from './training.pl'
import { listControls } from './listControls.pl'
import { horseList } from './horseList.pl'
import { stableAlerts } from './stableAlerts.pl'
import { careLabels } from './careLabels.pl'
import { dashboard } from './dashboard.pl'
import { calendar } from './calendar.pl'
import { stableSetup } from './stableSetup.pl'
import { stables } from './stables.pl'
import { events } from './events.pl'
import { invitationFlow } from './invitationFlow.pl'
import { onboarding } from './onboarding.pl'
import { navigationShell } from './navigationShell.pl'
import { landingDirections } from './landingDirections.pl'
import { publicLanding } from './publicLanding.pl'

export const pl = {
  landingDirections,
  publicLanding,
  navigationShell,
  stableUpdates,
  horseComparison,
  serverErrors,
  actionErrors,
  uiRemainder,
  analysisViews,
  trainingViews,
  eventEditor,
  trainingValidation,
  eventValidation,
  eventForm,
  eventViews,
  reminders,
  horseHistory,
  documents,
  careFilters,
  careRecords,
  careValidation,
  horseDetail,
  horseDeletion,
  horseForm,
  horseValidation,
  training,
  listControls,
  horseList,
  stableAlerts,
  careLabels,
  dashboard,
  calendar,
  stableSetup,
  invitationFlow,
  events,
  stables,
  breadcrumbs: {
    dashboard: 'Panel główny',
    navigation: 'Ścieżka nawigacji',
    more: 'Więcej',
    activity: 'Aktywność',
    training: 'Trening',
    care: 'Opieka',
    careSummary: 'Podsumowanie opieki',
    documents: 'Dokumenty',
    editHorse: 'Edytuj konia',
    nutrition: 'Żywienie',
    timeline: 'Historia',
    overview: 'Przegląd',
    horses: 'Konie',
    addHorse: 'Dodaj konia',
    deletedHorses: 'Usunięte konie',
    horse: 'Koń',
    trainingLog: 'Dziennik treningów',
    addSession: 'Dodaj trening',
    session: 'Trening',
    editSession: 'Edytuj trening',
    events: 'Wydarzenia',
    calendar: 'Kalendarz',
    addEvent: 'Dodaj wydarzenie',
    event: 'Wydarzenie',
    editEvent: 'Edytuj wydarzenie',
    analysis: 'Analizy',
    editStable: 'Edytuj stajnię',
    people: 'Osoby w stajni',
    settings: 'Ustawienia',
    gettingStarted: 'Pierwsze kroki',
  },
  audit: {
    recent: 'Ostatnie zmiany',
    recentHelp:
      'Ważne zmiany w stajni, osobach i wydarzeniach — od najnowszych.',
    empty: 'Nie ma jeszcze zmian.',
    list: 'Ostatnie zmiany w stajni',
    stableCreated: 'Utworzono stajnię',
    stableUpdated: 'Zmieniono dane stajni',
    stableArchived: 'Zarchiwizowano stajnię',
    memberInvited: 'Zaproszono osobę',
    invitationResent: 'Ponownie wysłano zaproszenie',
    invitationRevoked: 'Cofnięto zaproszenie',
    invitationAccepted: 'Przyjęto zaproszenie',
    invitationDeclined: 'Odrzucono zaproszenie',
    accessActivated: 'Włączono dostęp do stajni',
    invitationPendingPlan: 'Przyjęto zaproszenie, czeka na plan',
    memberRemoved: 'Usunięto osobę ze stajni',
    eventCreated: 'Utworzono wydarzenie',
    eventUpdated: 'Zmieniono wydarzenie',
    horseApproved: 'Zaakceptowano zaproszenie dla konia',
    horseDeclined: 'Odrzucono zaproszenie dla konia',
    horseWithdrawn: 'Wycofano konia z wydarzenia',
    changed: 'Zmieniono wpis',
    formerUser: 'Były użytkownik',
    legacyMemberRemoved: 'Usunięto osobę {{id}}',
  },
  onboarding,
  stableValidation: {
    nameMin: 'Nazwa musi mieć co najmniej 3 znaki.',
    nameMax: 'Skróć nazwę (maks. 50 znaków).',
    nameCharacters: 'Nazwa zawiera niedozwolone znaki.',
    locationMin: 'Lokalizacja musi mieć co najmniej 3 znaki.',
    locationMax: 'Skróć lokalizację (maks. 50 znaków).',
    locationCharacters: 'Lokalizacja zawiera niedozwolone znaki.',
    descriptionMax: 'Skróć opis do 256 znaków.',
    shortTextMax: 'Skróć tekst do 100 znaków.',
    phoneMax: 'Skróć numer telefonu do 50 znaków.',
    noteMax: 'Skróć notatkę do 1000 znaków.',
    emergencyContactMax: 'Skróć kontakt alarmowy do 500 znaków.',
  },
  invitations: {
    linkCopied: 'Skopiowano link do zaproszenia',
    copyFailed: 'Nie udało się skopiować linku do zaproszenia',
    created: 'Utworzono zaproszenie',
    queued: 'Wyślemy wiadomość do {{email}}.',
    copy: 'Kopiuj link',
    email: 'Adres e-mail',
    invite: 'Zaproś',
    inviting: 'Wysyłanie zaproszenia…',
    failed: 'Nie udało się wysłać zaproszenia.',
    invalidEmail: 'Wpisz poprawny e-mail.',
    language: 'Język zaproszenia',
    languageHelp:
      'Dla nowych osób. Kto ma już konto, dostanie e-maile w swoim języku.',
  },
  landing: {
    hero1: 'Mniej formalności.',
    hero2: 'Więcej czasu',
    hero3: 'w stajni.',
    intro:
      'Wspólne miejsce na plany stajni, dokumentację koni i codzienną opiekę. Żeby każdy wiedział, co się dzieje.',
    createAccount: 'Załóż konto',
    yardPhoto:
      'Kasztanowaty koń spogląda znad bramy stajni w wieczornym świetle.',
    careTitle: 'Opieka nad Juniper',
    example: 'Przykład',
    visitStatus: 'Status przykładowej wizyty',
    planned: 'Zaplanowana',
    completed: 'Zakończona',
    farrier: 'Wizyta kowala',
    visitTime: 'Czwartek · 10:30',
    trimDone: 'Werkowanie zrobione. Kolejną wizytę trzeba umówić.',
    farrierName: 'Sam Taylor, kowal.',
    sharedTitle1: 'Dobra opieka to',
    sharedTitle2: 'wspólny wysiłek.',
    sharedDescription:
      'Koniec z szukaniem w starych wiadomościach, notatnikach i karteczkach. Wszystko, czego potrzebujesz, masz w jednym miejscu. Zostaje więcej czasu na to, co ważne.',
    horseRecord: 'Przykładowa karta konia',
    horseBreadcrumb: 'Konie / Juniper',
    horsePhoto:
      'Juniper — koń maści izabelowatej, o złocistej sierści i jasnej grzywie.',
    startTitle1: 'Poczuj się',
    startTitle2: 'jak u siebie.',
    startDescription: 'Utwórz stajnię, dodaj konia i zaproś znajomych.',
    siteDescription:
      'Dokumentacja opieki nad końmi, przypomnienia, harmonogramy i kontakty do specjalistów — w jednym miejscu dla Twojej stajni.',
  },
  pricing: {
    options: 'Dostępne plany',
    errorTitle: 'Nie udało się wczytać planów',
    errorDescription: 'Spróbuj ponownie za chwilę.',
    retry: 'Wczytaj plany ponownie',
    description: 'Plany i opcje płatności.',
    testingDescription:
      'Na czas testów każdy w stajni ma dostęp do wszystkiego. Gdy ruszą płatności, plan premium doda Centrum analiz. Reszta zostanie w wersji podstawowej.',
    return: 'Wróć do zaproszenia',
    testingTitle: 'Dostęp testowy',
    testingAccess:
      'Płatności są tu wyłączone. Testerzy mogą korzystać ze wszystkich funkcji bez wybierania planu i podawania danych do płatności.',
    included: 'W pakiecie',
    start: 'Zacznij konfigurację',
    care: 'Dokumentacja opieki',
    careDescription: 'Zapisuj przypomnienia, wizyty, notatki i wyniki.',
    team: 'Zespół stajni',
    teamDescription:
      'Właściciele, specjaliści i reszta stajni w jednym miejscu.',
    analysis: 'Centrum analiz',
    analysisDescription:
      'Sprawdzaj kompletność i regularność wpisów oraz drukuj podsumowania.',
  },
  profileForm: {
    continue: 'Zapisz i kontynuuj',
    retryContinue: 'Spróbuj ponownie',
    saving: 'Zapisywanie…',
    saveFailed:
      'Nie udało się zapisać profilu. Wpisane dane i zdjęcie nadal tu są.',
    continueFailed:
      'Profil zapisany, ale nie udało się przejść dalej. Spróbuj ponownie — nie zapiszemy profilu ani zdjęcia drugi raz.',
    shared: 'Ten sam profil we wszystkich Twoich stajniach.',
    preferredName: 'Jak się do Ciebie zwracać',
    phone: 'Numer telefonu',
    imageLabel: 'Zdjęcie profilowe',
    imageUpload: 'Dodaj zdjęcie profilowe',
    imageDescription:
      'Dzięki zdjęciu inni w stajni łatwiej Cię rozpoznają. Plik do 5 MB.',
    nameRequired: 'Wpisz, jak inni mają się do Ciebie zwracać.',
    imageRequired: 'Wybierz zdjęcie.',
    imageTooLarge: 'Wybierz zdjęcie do 5 MB.',
    imageHint: 'JPG, PNG lub WEBP, do 5 MB',
  },
  upload: {
    selected: 'Wybrano · jeszcze nie zapisano',
    selectedNamed: 'Wybrano {{name}}. Zapisz, żeby go dołączyć.',
    releaseToSelect: 'Upuść plik tutaj',
    chooseImage: 'Wybierz zdjęcie',
    chooseFileLabel: 'Wybierz plik',
    about: 'Pomoc: {{label}}',
    remove: 'Usuń {{name}}',
    replace: 'Zmień plik {{name}}',
    dropImage: 'Przeciągnij tu zdjęcie lub wybierz plik',
    dropFile: 'Przeciągnij tu plik lub wybierz go z urządzenia',
    imageTypes: 'JPG, PNG lub WEBP',
    replaceImage: 'Zmień zdjęcie',
    addPhoto: 'Dodaj zdjęcie',
    changePhoto: 'Zmień zdjęcie',
    currentImage:
      'Obecne zdjęcie. Wybierz lub przeciągnij nowe, żeby je zmienić.',
    chooseFile: 'Wybierz plik z urządzenia',
    image: 'Zdjęcie',
    file: 'Plik',
  },
  recovery: {
    title: 'Nie udało się przygotować konta',
    description:
      'Nie udało się odświeżyć danych konta. Spróbuj ponownie. Jeśli to się powtarza, odśwież stronę albo wyloguj się i zaloguj jeszcze raz.',
    refreshing: 'Odświeżanie danych konta…',
    failed:
      'Nadal nie udało się odświeżyć danych konta. Spróbuj odświeżyć stronę lub zalogować się ponownie.',
    signOutFailed:
      'Nie udało się wylogować. Sprawdź połączenie i spróbuj ponownie lub odśwież stronę.',
    retrying: 'Ponawianie…',
    reload: 'Odśwież stronę',
    signOut: 'Wyloguj się',
    signingOut: 'Wylogowywanie…',
    retryFailed: 'Nie udało się ponownie wczytać strony.',
    loadingPage: 'Wczytywanie strony…',
    stableTitle: 'Nie znaleziono stajni',
    horseTitle: 'Nie znaleziono konia',
    eventTitle: 'Nie znaleziono wydarzenia',
    stableDescription: 'Ta stajnia nie istnieje lub nie jest już dostępna.',
    horseDescription: 'Ten koń nie istnieje lub nie jest już dostępny.',
    eventDescription: 'To wydarzenie nie istnieje lub nie jest już dostępne.',
  },
  language: {
    label: 'Język',
    description:
      'Wybierz język aplikacji i wiadomości e-mail od Paddock Pilot.',
    saving: 'Zapisywanie języka…',
    saveFailed:
      'Język zmieniono na tym urządzeniu, ale nie udało się zapisać go na koncie. Spróbuj ponownie.',
    retry: 'Zapisz język ponownie',
  },
  currency: {
    label: 'Waluta',
    description:
      'Używana przy kosztach. Odpowiada Twojemu krajowi, dopóki nie wybierzesz jej tutaj.',
    saveFailed: 'Nie udało się zapisać waluty',
  },
  navigation: {
    accountPreferences: 'Preferencje',
    stable: 'Stajnia',
    today: 'Dzisiaj',
    calendar: 'Kalendarz',

    primary: 'Nawigacja główna',
    public: 'Nawigacja strony',
    footer: 'Nawigacja w stopce',
    home: 'Strona główna',
    stables: 'Stajnie',
    plans: 'Plany',
    horses: 'Konie',
    care: 'Opieka',
    events: 'Wydarzenia',
    training: 'Treningi',
    documents: 'Dokumenty',
    analysis: 'Analizy',
    signIn: 'Zaloguj się',
    create: 'Załóż konto',
    createAccount: 'Załóż konto',
    skip: 'Przejdź do treści',
    brandHome: 'Paddock Pilot — strona główna',
    profile: 'Twój profil',
    manageStables: 'Zarządzaj stajniami',
    billing: 'Plany i płatności',
    activeStable: 'Wybrana stajnia',
    selectStable: 'Wybierz stajnię',
    activeStableName: 'Wybrana stajnia: {{name}}',
    overview: 'Przegląd stajni',
    people: 'Osoby w stajni',
    gettingStarted: 'Pierwsze kroki',
    settings: 'Ustawienia stajni',
  },
  footer: {
    description: 'Przejrzyste karty koni i wspólna opieka w stajni.',
    copyright: '© {{year}} Paddock Pilot. Wszelkie prawa zastrzeżone.',
  },
  theme: {
    auto: 'Motyw: systemowy. Kliknij, żeby włączyć jasny.',
    light: 'Motyw: jasny. Kliknij, żeby zmienić.',
    dark: 'Motyw: ciemny. Kliknij, żeby zmienić.',
  },
  profile: {
    notifications: 'Przypomnienia e-mail',
    notificationsDescription:
      'Wybierz, jakie wiadomości e-mail wysyła Ci Paddock Pilot.',
    digestLabel: 'Codzienne podsumowanie opieki',
    digestDescription:
      'Jeden e-mail około 09:00 ({{timezone}}), gdy w którejś z Twoich stajni jest opieka do wykonania lub zaległa. Domyślnie wyłączone; przypomnienia zawsze znajdziesz w Opiece.',
    digestSaved: 'Zapisano ustawienie e-mail',
    digestError: 'Nie udało się zapisać ustawienia e-mail',
    signInTitle: 'Zaloguj się, żeby edytować profil',
    signInDescription:
      'Twój profil jest ten sam we wszystkich Twoich stajniach.',
    title: 'Twój profil',
    detailsDescription:
      'Tak widzą Cię i kontaktują się z Tobą inni w Twoich stajniach.',
    save: 'Zapisz profil',
    saved: 'Profil zapisany',
    errorTitle: 'Nie udało się wczytać profilu',
    errorDescription:
      'Sprawdź połączenie i spróbuj ponownie. Twój profil się nie zmienił.',
  },
  common: {
    aboutField: 'Pomoc: {{label}}',
    unsavedTitle: 'Wyjść bez zapisywania?',
    unsavedHelp:
      'Zmiany nie są zapisane. Zostań i dokończ albo wyjdź i je odrzuć.',
    leaveWithoutSaving: 'Wyjdź bez zapisywania',
    close: 'Zamknij',
    keepEditing: 'Edytuj dalej',
    reset: 'Wyczyść',
    discardChanges: 'Odrzuć zmiany',
    errorToast: 'Coś poszło nie tak.',
    validationToast: 'Sprawdź formularz',
    tryAgain: 'Spróbuj ponownie.',
    notifications: 'Powiadomienia',
    closeNotification: 'Zamknij powiadomienie',

    pageErrorTitle: 'Nie udało się wczytać strony',
    pageErrorDescription:
      'Spróbuj ponownie. Jeśli to się powtarza, wróć na stronę główną.',
    retry: 'Spróbuj ponownie',
    copied: 'Skopiowano',
    copying: 'Kopiowanie…',
    home: 'Strona główna',
    cancel: 'Anuluj',
    edit: 'Edytuj',
    add: 'Dodaj',
    all: 'Wszystkie',
    actions: 'Działania',
    save: 'Zapisz',
    saved: 'Zapisano',
    loading: 'Wczytywanie…',
    notFoundTitle: 'Nie znaleziono strony',
    notFoundDescription: 'Ta strona nie istnieje lub została przeniesiona.',
  },
  counts: {
    horses_one: '{{count}} koń',
    horses_few: '{{count}} konie',
    horses_many: '{{count}} koni',
    horses_other: '{{count}} konia',
  },
} as const
