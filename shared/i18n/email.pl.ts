import type { EmailCopy } from './email.en'

export const emailPL = {
  invitationSubject: (stableName: string) =>
    `Zaproszenie do stajni ${stableName} w Paddock Pilot`,
  invitationPreheader: (stableName: string) =>
    `Dołącz do stajni ${stableName} i wspólnie organizuj codzienną opiekę.`,
  invitationHeading: 'Twoje miejsce w stajni.',
  invitationBody: (stableName: string) =>
    `Czeka na Ciebie zaproszenie do stajni ${stableName} w Paddock Pilot.`,
  invitationContext:
    'Bądź na bieżąco ze wspólnymi planami, opieką nad końmi i codziennym życiem stajni.',
  reviewInvitation: 'Zobacz zaproszenie',
  invitationNote:
    'Zaproszenie wygasa po 14 dniach od wystawienia. Jeśli nie oczekujesz zaproszenia, możesz zignorować tę wiadomość.',
  invitationText: (stableName: string, url: string) =>
    `Czeka na Ciebie zaproszenie do stajni ${stableName} w Paddock Pilot. Bądź na bieżąco ze wspólnymi planami, opieką nad końmi i codziennym życiem stajni.\n\nZobacz zaproszenie: ${url}\n\nZaproszenie wygasa po 14 dniach od wystawienia. Jeśli nie oczekujesz zaproszenia, możesz zignorować tę wiadomość.`,
  horseInvitationSubject: (eventTitle: string) =>
    `Zaproszenie koni na wydarzenie: ${eventTitle}`,
  horseInvitationPreheader: (eventTitle: string) =>
    `Sprawdź zaproszenie koni na wydarzenie: ${eventTitle}.`,
  horseInvitationHeading: 'Zaproszenie dla Twoich koni.',
  horseInvitationBody: (eventTitle: string) =>
    `Twoje konie zostały zaproszone na wydarzenie: ${eventTitle}.`,
  reviewEvent: 'Zobacz wydarzenie',
  horseInvitationNote:
    'Sprawdź wydarzenie, a następnie zaakceptuj lub odrzuć zaproszenie w panelu Paddock Pilot.',
  horseInvitationText: (horseNames: string, eventTitle: string, url: string) =>
    `Twoje konie (${horseNames}) zostały zaproszone na wydarzenie: ${eventTitle}. Sprawdź szczegóły i odpowiedz: ${url}`,
  participationHeading: 'Zmiana w planach.',
  openEvent: 'Otwórz wydarzenie',
  approvedSubject: (horseName: string, eventTitle: string) =>
    `Potwierdzono udział konia ${horseName}: ${eventTitle}`,
  declinedSubject: (horseName: string, eventTitle: string) =>
    `Odrzucono zaproszenie dla konia ${horseName}: ${eventTitle}`,
  withdrawnSubject: (horseName: string, eventTitle: string) =>
    `Wycofano udział konia ${horseName}: ${eventTitle}`,
  approvedPreheader: (horseName: string, eventTitle: string) =>
    `Koń ${horseName}: udział w wydarzeniu ${eventTitle} został potwierdzony.`,
  declinedPreheader: (horseName: string, eventTitle: string) =>
    `Koń ${horseName}: zaproszenie na wydarzenie ${eventTitle} zostało odrzucone.`,
  withdrawnPreheader: (horseName: string, eventTitle: string) =>
    `Koń ${horseName}: udział w wydarzeniu ${eventTitle} został wycofany.`,
  approvedBody: (actorName: string, horseName: string, eventTitle: string) =>
    `${actorName} potwierdza udział konia ${horseName} w wydarzeniu: ${eventTitle}.`,
  declinedBody: (actorName: string, horseName: string, eventTitle: string) =>
    `${actorName} odrzuca zaproszenie dla konia ${horseName} na wydarzenie: ${eventTitle}.`,
  withdrawnBody: (actorName: string, horseName: string, eventTitle: string) =>
    `${actorName} wycofuje udział konia ${horseName} w wydarzeniu: ${eventTitle}.`,
  eventChangedSubject: (eventTitle: string) =>
    `Zaktualizowano wydarzenie: ${eventTitle}`,
  eventChangedPreheader: (eventTitle: string) =>
    `Sprawdź zmiany w wydarzeniu: ${eventTitle}.`,
  eventChangedHeading: 'Zmiana w Twoim kalendarzu.',
  eventChangedBody: (eventTitle: string) =>
    `Zaktualizowano wydarzenie: ${eventTitle}.`,
  eventChangedText: (eventTitle: string, changes: string, url: string) =>
    `Zaktualizowano wydarzenie ${eventTitle}: ${changes}. Zobacz wydarzenie: ${url}`,
  membershipSubject: (stableName: string) => `Witamy w stajni ${stableName}`,
  membershipPreheader: (stableName: string) =>
    `Masz już dostęp do stajni ${stableName}.`,
  membershipHeading: 'Witamy w stajni.',
  membershipContext:
    'Otwórz stajnię, aby sprawdzić wspólne plany i informacje o opiece nad końmi.',
  openStable: 'Otwórz stajnię',
  membershipText: (stableName: string, url: string) =>
    `Masz już dostęp do stajni ${stableName}. Otwórz stajnię: ${url}`,
  acceptedSubject: (memberName: string, stableName: string) =>
    `Nowa osoba w stajni ${stableName}: ${memberName}`,
  acceptedPreheader: (memberName: string) =>
    `${memberName} akceptuje Twoje zaproszenie do stajni.`,
  acceptedHeading: 'Nowa osoba w stajni.',
  acceptedBody: (memberName: string, stableName: string) =>
    `${memberName} akceptuje zaproszenie do stajni ${stableName}.`,
  reviewMembers: 'Zobacz osoby w stajni',
  acceptedText: (memberName: string, stableName: string, url: string) =>
    `${memberName} akceptuje zaproszenie do stajni ${stableName}. Zobacz osoby w stajni: ${url}`,
  removedSubject: (stableName: string) =>
    `Zmiana dostępu do stajni ${stableName}`,
  removedPreheader: (stableName: string) =>
    `Twój dostęp do stajni ${stableName} został zakończony.`,
  removedHeading: 'Zmienił się Twój dostęp do stajni.',
  removedBody: (stableName: string) =>
    `Twój dostęp do stajni ${stableName} został zakończony. Nie masz już dostępu do jej wspólnej dokumentacji.`,
  removedNote: 'Jeśli to pomyłka, skontaktuj się z właścicielem stajni.',
  archivedSubject: (stableName: string) =>
    `Stajnia ${stableName} została zarchiwizowana`,
  archivedPreheader: (stableName: string) =>
    `Stajnia ${stableName} nie jest już dostępna w Paddock Pilot.`,
  archivedHeading: 'Twoja stajnia została zarchiwizowana.',
  archivedBody: (stableName: string) =>
    `Właściciel zarchiwizował stajnię ${stableName}. Nie jest ona już dostępna w Paddock Pilot.`,
  welcomeSubject: 'Witamy w Paddock Pilot',
  welcomePreheader:
    'Twoje konto jest gotowe. Czas dołączyć do wspólnej stajni.',
  welcomeHeading: 'Poczuj się jak u siebie.',
  welcomeGreeting: (displayName: string) => `Witaj, ${displayName}.`,
  welcomeBody:
    'Twoje konto Paddock Pilot jest gotowe. Dokończ konfigurację, aby zacząć organizować stajnię i opiekę nad końmi.',
  continueSetup: 'Kontynuuj konfigurację',
  welcomeText: (displayName: string, url: string) =>
    `Witaj, ${displayName}. Twoje konto Paddock Pilot jest gotowe. Kontynuuj konfigurację: ${url}`,
  deletedSubject: 'Twoje konto Paddock Pilot zostało usunięte',
  deletedPreheader: 'Potwierdzenie usunięcia Twojego konta Paddock Pilot.',
  deletedHeading: 'Twoje konto zostało usunięte.',
  deletedBody: (displayName: string) =>
    `${displayName}, Twoje konto Paddock Pilot zostało usunięte.`,
  deletedNote:
    'Jeśli usunięcie konta nie było Twoją decyzją, skontaktuj się z pomocą Paddock Pilot.',
  fallback: 'Jeśli przycisk nie działa, skopiuj ten link do przeglądarki:',
  footer: 'Dobra opieka to wspólny wysiłek.',
  footerNote: 'Wiadomość od Paddock Pilot dotycząca Twojego konta lub stajni.',
  memberFallback: 'Osoba ze stajni',
} satisfies EmailCopy
