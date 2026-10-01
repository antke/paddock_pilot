import { horseComparison } from './horseComparison.pl'
import { serverErrors } from './serverErrors.pl'
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

export const pl = {
  horseComparison,
  serverErrors,
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
      'Ważne zmiany dotyczące stajni, członkostwa i wydarzeń — od najnowszych.',
    empty: 'Nie zarejestrowano jeszcze żadnych zmian.',
    list: 'Ostatnie zmiany w stajni',
    stableCreated: 'Utworzono stajnię',
    stableUpdated: 'Zaktualizowano dane stajni',
    stableArchived: 'Zarchiwizowano stajnię',
    memberInvited: 'Zaproszono osobę',
    invitationResent: 'Ponownie wysłano zaproszenie',
    invitationRevoked: 'Cofnięto zaproszenie',
    invitationAccepted: 'Przyjęto zaproszenie',
    invitationDeclined: 'Odrzucono zaproszenie',
    accessActivated: 'Aktywowano dostęp do stajni',
    invitationPendingPlan: 'Przyjęto zaproszenie, oczekiwanie na plan',
    memberRemoved: 'Usunięto osobę ze stajni',
    eventCreated: 'Utworzono wydarzenie',
    eventUpdated: 'Zaktualizowano wydarzenie',
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
    nameMax: 'Nazwa nie może mieć więcej niż 50 znaków.',
    nameCharacters: 'Nazwa zawiera niedozwolone znaki.',
    locationMin: 'Lokalizacja musi mieć co najmniej 3 znaki.',
    locationMax: 'Lokalizacja nie może mieć więcej niż 50 znaków.',
    locationCharacters: 'Lokalizacja zawiera niedozwolone znaki.',
    descriptionMax: 'Skróć opis do 256 znaków.',
    shortTextMax: 'Skróć tekst do 100 znaków.',
    phoneMax: 'Skróć numer telefonu do 50 znaków.',
    noteMax: 'Skróć notatkę do 1000 znaków.',
    emergencyContactMax: 'Skróć dane kontaktu alarmowego do 500 znaków.',
  },
  invitations: {
    linkCopied: 'Skopiowano link do zaproszenia',
    copyFailed: 'Nie udało się skopiować linku do zaproszenia',
    created: 'Utworzono zaproszenie',
    queued: 'Wiadomość do {{email}} oczekuje na wysłanie.',
    copy: 'Kopiuj link',
    email: 'Adres e-mail',
    invite: 'Zaproś',
    inviting: 'Wysyłanie zaproszenia…',
    failed:
      'Nie udało się utworzyć zaproszenia. Sprawdź adres e-mail i spróbuj ponownie.',
    invalidEmail: 'Podaj prawidłowy adres e-mail.',
    language: 'Język zaproszenia',
    languageHelp:
      'Dla nowych odbiorców. Osoby z kontem otrzymują wiadomości w zapisanym języku.',
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
    trimDone: 'Werkowanie zakończone. Termin kolejnej wizyty do ustalenia.',
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
    errorDescription:
      'Nie udało się wczytać dostępnych planów. Spróbuj ponownie za chwilę.',
    retry: 'Wczytaj plany ponownie',
    description: 'Sprawdź dostępne plany i opcje płatności.',
    testingDescription:
      'Podczas testów każda osoba w stajni ma dostęp do funkcji aplikacji. Po uruchomieniu płatności plan premium zapewni dostęp do Centrum analiz. Wszystkie pozostałe obecne funkcje pozostaną częścią wersji podstawowej.',
    return: 'Wróć do zaproszenia',
    testingTitle: 'Dostęp testowy',
    testingAccess:
      'Płatności nie są włączone w tym środowisku. Osoby testujące mogą korzystać ze wszystkich obecnych funkcji Paddock Pilot bez wybierania planu i podawania danych do płatności.',
    included: 'W ramach dostępu',
    start: 'Rozpocznij konfigurację',
    care: 'Dokumentacja opieki',
    careDescription: 'Zapisuj przypomnienia, wizyty, notatki i wyniki.',
    team: 'Zespół stajni',
    teamDescription:
      'Organizuj współpracę właścicieli, specjalistów i pozostałych osób w stajni.',
    analysis: 'Centrum analiz',
    analysisDescription:
      'Sprawdzaj kompletność i regularność wpisów oraz drukuj podsumowania.',
  },
  profileForm: {
    saveFailedTitle: 'Nie udało się zapisać profilu',
    continue: 'Zapisz i kontynuuj',
    retryContinue: 'Spróbuj kontynuować ponownie',
    saving: 'Zapisywanie…',
    saveFailed:
      'Nie udało się zapisać profilu. Wpisane dane i wybrane zdjęcie zostały zachowane. Spróbuj ponownie.',
    continueFailed:
      'Profil został zapisany, ale nie udało się przejść dalej. Spróbuj kontynuować ponownie — profil i zdjęcie nie zostaną zapisane drugi raz.',
    shared:
      'Profil jest wspólny dla wszystkich stajni, które prowadzisz lub do których należysz.',
    preferredName: 'Jak się do Ciebie zwracać',
    phone: 'Numer telefonu',
    optional: 'Opcjonalnie',
    imageLabel: 'Zdjęcie profilowe (opcjonalne)',
    imageUpload: 'Dodaj zdjęcie profilowe',
    imageDescription:
      'Zdjęcie ułatwi innym osobom w stajni rozpoznanie Cię. Wybierz plik graficzny o rozmiarze do 5 MB.',
    imageHelp: 'Wybierz zdjęcie o rozmiarze do 5 MB.',
    nameRequired: 'Wpisz, jak inni mają się do Ciebie zwracać.',
    imageRequired: 'Wybierz plik graficzny.',
    imageTooLarge: 'Wybierz zdjęcie o rozmiarze nie większym niż 5 MB.',
  },
  upload: {
    about: 'Pomoc: {{label}}',
    remove: 'Usuń {{name}}',
    replace: 'Zmień plik {{name}}',
    dropImage: 'Przeciągnij tu zdjęcie lub wybierz plik',
    dropFile: 'Przeciągnij tu plik lub wybierz go z urządzenia',
    imageTypes: 'JPG, PNG lub WEBP',
    chooseFile: 'Wybierz plik z urządzenia',
    image: 'Zdjęcie',
    file: 'Plik',
  },
  recovery: {
    title: 'Nie udało się przygotować konta',
    description:
      'Nie udało się odświeżyć danych konta. Spróbuj ponownie, aby kontynuować. Jeśli problem się powtarza, odśwież stronę lub wyloguj się i zaloguj ponownie.',
    refreshing: 'Odświeżanie danych konta…',
    failed:
      'Nadal nie udało się odświeżyć danych konta. Spróbuj odświeżyć stronę lub zalogować się ponownie.',
    signOutFailed:
      'Nie udało się wylogować. Sprawdź połączenie i spróbuj ponownie lub odśwież stronę.',
    retrying: 'Ponawianie…',
    reload: 'Odśwież stronę',
    signOut: 'Wyloguj się',
    signingOut: 'Wylogowywanie…',
    retryFailed: 'Nie udało się ponowić operacji. Spróbuj jeszcze raz.',
    loadingPage: 'Wczytywanie strony…',
    stableTitle: 'Nie znaleziono stajni',
    horseTitle: 'Nie znaleziono konia',
    eventTitle: 'Nie znaleziono wydarzenia',
    stableDescription: 'Ta stajnia nie istnieje lub nie jest już dostępna.',
    horseDescription:
      'Ten koń nie istnieje w aplikacji lub nie jest już dostępny.',
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
  navigation: {
    primary: 'Nawigacja główna',
    public: 'Nawigacja strony',
    footer: 'Nawigacja w stopce',
    home: 'Strona główna',
    stables: 'Stajnie',
    plans: 'Plany',
    horses: 'Konie',
    care: 'Opieka',
    events: 'Wydarzenia',
    training: 'Dziennik treningów',
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
    description:
      'Przejrzysta dokumentacja koni i wspólna organizacja opieki w stajni.',
    copyright: '© {{year}} Paddock Pilot. Wszelkie prawa zastrzeżone.',
  },
  theme: {
    auto: 'Motyw: automatyczny (systemowy). Kliknij, aby włączyć jasny motyw.',
    light: 'Motyw: jasny. Kliknij, aby zmienić motyw.',
    dark: 'Motyw: ciemny. Kliknij, aby zmienić motyw.',
  },
  profile: {
    signInTitle: 'Zaloguj się, aby edytować swój profil',
    signInDescription:
      'Twój profil jest wspólny dla wszystkich stajni, które prowadzisz lub do których należysz.',
    title: 'Twój profil',
    details: 'Dane profilu',
    save: 'Zapisz profil',
    saved: 'Zaktualizowano profil',
    errorTitle: 'Nie udało się wczytać profilu',
    errorDescription:
      'Sprawdź połączenie i spróbuj ponownie. Twój profil nie został zmieniony.',
  },
  common: {
    close: 'Zamknij',
    keepEditing: 'Kontynuuj edycję',
    reset: 'Wyczyść',
    errorToast: 'Coś poszło nie tak.',
    validationToast: 'Sprawdź formularz',
    tryAgain: 'Spróbuj ponownie.',
    notifications: 'Powiadomienia',
    closeNotification: 'Zamknij powiadomienie',

    pageErrorTitle: 'Nie udało się wczytać strony',
    pageErrorDescription:
      'Spróbuj ponownie. Jeśli problem się powtarza, wróć na stronę główną.',
    retry: 'Spróbuj ponownie',
    home: 'Strona główna',
    cancel: 'Anuluj',
    save: 'Zapisz',
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
