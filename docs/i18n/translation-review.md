# Polish wording review

Review log, 2026-09-29. The additional implementation correctness pass is complete.
The domain choices below remain suggestions for owner feedback; browser integration
and print sign-off are tracked separately in progress.md.

## Current choices that would benefit from feedback

| English concept               | Current Polish                            | Reason / alternative                                                                                                                                                                          |
| ----------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| yard / stable                 | stajnia                                   | Natural in this product; avoid the literal “podwórze”. Confirm whether some yard-wide facilities should instead be “ośrodek”.                                                                 |
| farrier                       | kowal                                     | Familiar equestrian term. “Podkuwacz” is an alternative, but can imply shoeing more narrowly than the service shown.                                                                          |
| trim / hoof trim              | werkowanie                                | Specific horse-care term used in the landing example. “Korekcja kopyt” is a more explanatory alternative.                                                                                     |
| stable member / stable people | osoba ze stajni / osoby w stajni          | Includes owners and other participants without implying a formal association membership. “Członek stajni” is shorter but less natural.                                                        |
| provider                      | specjalista                               | Directory categories are trainer, vet, farrier, dentist, physio, saddler, and other. “Specjaliści” fits these; the name field also permits business names. Reconsider if suppliers are added. |
| care gaps / cadence           | kompletność i regularność wpisów          | Pricing copy describes the records available to the app. It should not claim that a missing record proves a horse received no care.                                                           |
| preferred name                | Jak się do Ciebie zwracać                 | Clearer than a literal “preferowane imię”; the field accepts a display name, not necessarily a legal first name.                                                                              |
| analysis centre               | Centrum analiz                            | Product-feature label. Keep consistent when translating the analysis screens.                                                                                                                 |
| Make yourself at home         | Poczuj się jak u siebie                   | Preserves the welcoming tone; deliberately not a literal word-for-word translation.                                                                                                           |
| A little less admin…          | Mniej formalności. Więcej czasu w stajni. | Concise Polish landing headline with the same benefit and no added product claims.                                                                                                            |

Additional directory terminology for feedback:

- **Saddler → rymarz.** This names the craft/service. If the intended role is primarily
  assessing saddle fit, “saddle fitter” or “specjalista od dopasowania siodeł” may be
  more precise; the latter is much longer in the type selector.
- **Yard rules → regulamin stajni; turnout → padokowanie.** Both are used in stable
  settings. Confirm whether turnout should include pasture grazing more explicitly.
- **Members → osoby** in directories/settings, **member → członek** as an access-role
  badge. This keeps navigation natural while preserving the meaning of the role.
- **Operations → organizacja** in onboarding. The step collects contact details,
  opening hours and rules; a literal “operacje” would be misleading.

## Correctness decisions already made

- `pl-PL` dates use the appropriate Polish month case: “29 września 2026” versus
  standalone month/year “wrzesień 2026”. Covered by formatter tests.
- Plurals cover “1 koń”, “2 konie”, “5 koni”, “12 koni”, “22 konie”, and fractional
  counts (“1,5 konia” when the number itself is formatted for Polish). The plural
  rule test isolates grammatical selection; display-number localization is separate.
- Recurrence summaries distinguish “Co tydzień”, “Co 2 tygodnie”, “Co 5 tygodni”,
  and “Co 22 tygodnie”; monthly weekday ordinals agree with grammatical gender
  (“druga środa”, “ostatni poniedziałek”). Dedicated tests cover these cases.
- Names of people, horses, stables, and user-written event titles are preserved.
  We do not infer gender or automatically decline user-entered proper names.
- Participation emails use “potwierdza / odrzuca / wycofuje” to avoid guessing the
  actor's gender. Statuses retain their distinct meanings.
- Invitation expiry remains relative to creation: “14 dni od wystawienia”. It does
  not claim 14 days from delivery, which may be delayed.
- The Polish landing image description uses “maść izabelowata” for palomino.
- English withdrawal email grammar was corrected from “withdrawn” as a verb to
  “withdrew … from”. Status identifiers remain unchanged.

## Separate provider limitation

Clerk widget localization is implemented. Clerk's documentation describes email/SMS
wording as dashboard-managed templates, separately from widget localization. We have
not configured those hosted templates or established per-recipient language selection
for Clerk-generated verification emails. App-generated transactional emails use the
new per-delivery locale. Clerk's hosted Account Portal also remains outside widget
localization; sign-in and sign-up links now stay on the app's own routes.

Sources checked 2026-09-29:
[Clerk localization](https://clerk.com/docs/guides/customizing-clerk/localization),
[Clerk email and SMS templates](https://clerk.com/docs/guides/customizing-clerk/email-sms-templates).

## Breed and training terminology checkpoint

- Built-in **Polish Sport Horse → Polski koń sportowy** and **Polish Warmblood →
  Polski koń półkrwi** keep distinct stored identifiers and labels. PZHK describes
  the historical “polski koń szlachetny półkrwi” name under today's sport-horse
  category. The app currently contains both English choices; merging those values
  would be a separate data decision, so the translation does not merge them.
- **Native cross → Mieszaniec ras rodzimych** is broad. Confirm whether this choice
  specifically means British native pony crosses; that would justify a narrower label.
- International breed names such as American Quarter Horse, Morgan, Shire and Selle
  Français are retained where they are used as proper breed names. Regional Polish
  names (małopolski, wielkopolski, śląski, huculski, konik polski, arden polski) follow
  PZHK usage. Unknown custom breeds remain verbatim.
- **Flatwork → Praca na płaskim**, **hacking → Jazda w terenie**, **groundwork → Praca
  z ziemi**, **lunging → Lonżowanie**. “Praca ujeżdżeniowa” is an alternative for
  flatwork, but can imply a narrower discipline. **Regular session → Zwykły trening**
  avoids assuming the rider trains alone. **Workshop / clinic → Warsztaty / klinika
  jeździecka** may read more naturally as “Szkolenie” for some audiences.

Sources checked for Polish breed names:
[PZHK breeding programs](https://www.pzhk.pl/hodowla/programy-hodowlane/),
[PZHK breed descriptions](https://www.pzhk.pl/hodowla/statystyka-hodowlana/).

## Care records and documents checkpoint

- **Severity → Nasilenie**, with **Niskie / Średnie / Wysokie** agreeing with that
  noun. **Resolved → Zakończony** describes the recorded problem's workflow status;
  it does not assert that the horse has been clinically cured.
- **Body condition score → Ocena kondycji BCS.** BCS and the existing nine-point
  scale are retained. “Ocena otłuszczenia” may be more precise for some audiences;
  confirm preferred terminology before release.
- **Medication → Lek** for the individual form field, **Leki** for the section,
  **course → kuracja** for the recorded course. User-entered dosage, drug names and
  instructions are not translated or altered.
- **Historical plan snapshot → Zapis planu z dnia zmiany.** This conveys a historical
  record, with explicit text that it does not change the current feeding plan.
- **Dismiss reminder → Pomiń; dismissed → Pominięto.** This is distinct from deleting
  the reminder. “Odrzuć” was avoided because it sounds like rejecting a request.
- Document type **Dental → Stomatologia** keeps the type broad enough for equine
  dental records. File names, uploaded file contents and linked record names remain
  verbatim. Deletion copy preserves the distinction between metadata and files.
- Native date-input popup language follows the browser/operating system. App labels
  and validation translate; browser-owned picker affordances are outside the app's
  message catalog.

## Analysis and recurrence review

- **Timeline blocks → wydarzenia** and **care signals → wpisy o opiece** describe the
  actual items rather than exposing chart implementation terminology.
- **Care cadence → regularność opieki**; expected interval uses **oczekiwana
  częstotliwość**, not “zalecana”, which could imply a treatment recommendation.
- **Nutrition correlations → zbieżność zmian żywienia z innymi wpisami** describes
  nearby records without implying cause and effect.
- **Horse outcome → podsumowanie udziału konia** preserves the per-horse event
  context. “Rezultat” is shorter but may suggest a competition result only.
- Training status **completed → ukończono** and general event **completed → zakończono**
  retain their separate workflow meanings. Stored identifiers remain unchanged.
- Base UI's hidden autocomplete dismiss buttons now follow the selected language via
  a scoped compatibility adapter. This is separate from the native date-picker limit.
