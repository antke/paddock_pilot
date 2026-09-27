# Detail blocks and card owners — source contracts, 19 September 2026

Bounded read-only inventory for C035 `dashboard/DetailBlocks.tsx` and C203 `ui/card.tsx`. This pass reads exports, actual callers, existing Style Lab specimens, tests and earlier reports. No UI changes, new tests, test execution or browser inspection. It supplies **source-contract evidence**, not blanket rendered verification or completion of either component row.

## Findings and evidence correction

- `DetailBlocks.tsx` exports **18 components, one runtime tone map and one type**. Every component has a current JSX consumer. There is no wholly dormant component export to remove; several optional variants are dormant.
- `ui/card.tsx` is **not a print-only dependency**. Its only direct importing owner is `DashboardSectionCard`, which always renders `Card` and conditionally renders Header, Content and Footer even in its default flat mode. There are 31 modules with direct `DashboardSectionCard` JSX usages, spanning production routes/components, Style Lab and Page Lab. That establishes broad reachability, not 31 independently verified layouts.
- No new confirmed functional defect emerged from this source pass. Long-token containment in detail values/lists is a specific remaining browser question, not evidence that all such content currently overflows. No broad restyling or new specimen page is justified.

## C035 export inventory

Paths below are relative to `src/components`. Caller lists are direct JSX usage, excluding prose mentions in Style Lab's ownership guidance.

| Export | Owner contract / actual callers | Limits and dormant options |
| --- | --- | --- |
| `DetailGrid` | Div grid, min-width zero; default two columns from sm and compact gap; configurable two/three/four columns, breakpoint and mobile column count. Style Lab palette/reference fields; HorseCareSummaryPage, HorseNutritionCard, HorseCareSection, HorseProfileSection, HorseWeightRecordsCard, StableIntroductionStep, InvitationPageView. | Used profiles intentionally retain two mobile columns for short facts. Not every breakpoint/column permutation is a rendered requirement; do not manufacture a matrix of unused combinations. |
| `DetailPanelGrid` | Balanced default uses a larger leading column and a minimum 20rem secondary column at lg. Equal variant uses equal columns. EventDetail uses balanced with/without provider details; HorseProfileSection and Style Lab use equal. | EventDetail's one-column override when no provider and tighter gap express domain composition. Balanced and equal are both active; narrow behavior belongs to these actual compositions. |
| `DetailStack` | Div grid; default, compact and loose gaps. Style Lab, member directory, profile and four existing Page Lab compositions use all three. | Pure spacing owner; observing one stack does not certify all nested content. |
| `DetailMetricBlock` | Labeled value inside shared DashboardInlinePanel. HorseWeightRecordsCard's latest-weight context uses compact size with explicit label options. | Larger default size is currently unused. It does not need a new preview merely to claim coverage. |
| `DetailPanel` | Flat default with quiet top divider; h3 default, configurable heading element; emphasis and compact spacing; shared chrome/span options. Profile uses h2/default, nutrition h3/compact, event detail h2/emphasis. | Nonflat chrome and several span options have no current calls. Earlier horse evidence covers profile default, not every option. |
| `DetailField` | Label/value spans in a min-width-zero grid. Readable variant is active in profile, event completion notes and Style Lab reference facts. Internal wrappers also use default and summary. | Direct framed, emphasis and default-indent branches are dormant. It is presentation rather than an input; no input-label association is expected. Long unbroken value handling is not proved by min-width zero alone. |
| `DetailDisplayField` | Suppresses undefined, null and empty-string values; delegates nonindented label/value rendering. StableSettingsOverview, StableIntroductionStep and InvitationPageView use it, including multiline postal address/rules and normal-weight values. | Numerical zero is not suppressed. Boolean rendering is not a verified product requirement: no inspected caller passes boolean facts. Do not add boolean display behavior speculatively. |
| `DetailSummaryField` | DisplayField with normal-weight value and divided summary treatment. StableMembersPage's own-details block; EventDetail's date/time/type/status/provider/cost/description. | Optional missing event values disappear intentionally. Native plain text remains readable; these are not form fields. |
| `DetailSummaryGrid` | Responsive two-column summary grid with one-column large-screen provider override. EventDetail is its sole direct caller. | Provider/no-provider and description spanning are the meaningful combinations, already available through the event specimen; arbitrary children combinations are not additional product states. |
| `DetailPrintField` | DisplayField with print text treatment and optional pre-wrap multiline value. HorseCareSummaryPage uses identifying, contact, routine and note values. | Screen content tests cannot establish pagination or print-engine CSS behavior. Preserve the separate print report's limitations. |
| `DetailPrintListBlock` | Empty/missing items suppress the entire block; otherwise native ul/li bullets and label. Care summary allergies/recommended/avoid; Style Lab's sample handoff list. | Style Lab screen sample is not print verification. |
| `DetailKeyValueList` | Div stack for compact secondary rows. AnalysisCentre selected-period summary and AnalysisHorseTab health frequency. | These current rows are numeric, not arbitrary long identifiers. No reason to add large wrapping fixtures to this owner for hypothetical usage. |
| `DetailKeyValueRow` | Flex label/value pair with optional semantic value tone. Analysis counts; landing product preview's Current/Order due values. | Landing supplies lighter value weight intentionally. Analysis urgent row's destructive emphasis corresponds to actual urgency. Muted value-tone option is unused. |
| `DetailTextBlock` | TextLabel plus whitespace-preserving paragraph, with explicit typography hooks. Nutrition current/history, care reference/emergency notes, horse timeline services, event service detail and pricing explanation. | HorseCareSection explicitly allows wrapping long reference facts. Other prose consumers need their actual text constraints; no blanket claim that all ReactNode content is semantically valid inside p. Current inspected bodies are prose. |
| `DetailListBlock` | Empty array suppresses block; otherwise labeled native bullet list. Nutrition logs and horse timeline snapshots. | Existing long-history specimen has multiline prose and longer list items. It is the appropriate owner-state sample; a second component gallery would duplicate it. |
| `DetailIconList` | Native ul/li; decorative icon is aria-hidden; semantic tone. HorseNutritionCard's Recommended/Avoid and Style Lab positive sample. | Positive/negative are active; default/muted have no current explicit consumer. Current nutrition semantics justify check/X; this is not random section decoration. Long-token list-item containment remains unobserved by this source pass. |
| `DetailListGrid` | Responsive paired list columns; nutrition log and horse timeline snapshots. | Both callers use default sm. md/lg options are dormant. |
| `DetailNoteBlock` | Labeled shared inset panel with preserved prose; HorseProfileSection deworming notes. | Its optional span is unused. Existing detailed profile includes this field; no new specimen is needed. |
| `detailToneTextClassNames` / `DetailTone` | Shared foreground, muted, destructive and primary mappings. Runtime map is consumed internally by row/icon owners; HorseNutritionCard imports the type for positive/negative care lists. | Style Lab names the map in guidance but does not render all entries. No new palette or manual color override is introduced. |

There are 22 direct importing modules for DetailBlocks, including Style Lab and four Page Lab compositions. The table accounts for their actual export use; guidance strings naming an export do not count as specimens.

## C203 export inventory and ownership

| Export | Actual ownership and semantics | Evidence limit |
| --- | --- | --- |
| `Card` | Div using global app-panel and semantic card background/foreground. DashboardSectionCard always owns it. | Flat domain treatment deliberately removes surface/radius/border/shadow and adjusts inset padding at the dashboard owner; it is not a rogue page-local override. Default panel surface has no explicit `surface="panel"` consumer found in current source. |
| `CardHeader` | Div grid with global spacing/inset; DashboardSectionCard mounts it for title, description, badges or actions. | Heading semantics come from DashboardSectionHeader, not this wrapper. |
| `CardContent` | Div inset; DashboardSectionCard mounts it only when children are not null/undefined, supplying named layout/gap options. | Content-only event sections and full form sections already exercise distinct active combinations. |
| `CardFooter` | Flex inset; DashboardSectionCard's optional footer. Actual supplied footers come from RouteFormCard and PricingPageView's testing-access/widget-failure cases. | These are active states, not unused exports. Their individual interactions have form/pricing evidence; that does not certify every possible footer child layout. |
| `CardTitle` | Div with shared text size/weight/tracking; no current import or JSX consumer. | Dormant, not automatically an h-element. No current hierarchy defect exists through an unused export. |
| `CardDescription` | Muted small div; no current import or JSX consumer. | Dormant. No need to add a manufactured product use or delete it in an audit. |

`designSystemConformance.test.ts` explicitly restricts direct ui/card imports to DashboardSectionCard. This tests source ownership, not pixel appearance, semantic hierarchy of arbitrary children, or contrast. No dedicated Card/DetailBlocks test file was found. That absence alone is not a reason to add class-string tests.

## Existing specimen and test evidence that can be reused

- Style Lab Foundation actually renders DetailGrid (four-column palette and three-column reference facts), DetailStack loose, DetailField readable, DetailPanelGrid equal, DetailIconList positive and DetailPrintListBlock. Its ownership prose names many additional exports without rendering them. Foundation's DashboardSectionCard exercises actual Card/Header/Content in flat mode.
- `HorseRecordsPageLab.test.tsx` mounts the actual record sections/header actions without connected mutation hooks. `HorseNutritionRecordsSample` already supplies longer nutrition history; this is composition/isolation evidence, not a CSS wrapping test.
- `HorseHistoryViews.test.tsx` verifies real history/summary identity, missing versus sparse states, filtering/chronology and print-boundary invocation. `CareSummaryPageLab.test.tsx` additionally retains all 24 document bodies, the oversized note and sample provenance. These are content/semantic checks; print-engine pagination remains separately qualified.
- Pricing's existing tests distinguish configured testing access from failed enabled widget and exercise retry. Invitation tests exercise callback lifecycle and acknowledgment. They render card/detail consumers but do not automatically establish all lower-owner variants.
- Earlier horse/profile, event-family, analysis, members and form reports remain the authoritative records of their specific rendered observations. This inventory adds no screenshots and does not broaden those claims.

## Bounded next step

Do not build another generic detail/card page. First reconcile these source contracts and active consumer references into the existing partial evidence rows. Card/Header/Content need not be described as print-only, while CardTitle/Description and unused variant options should explicitly remain dormant/source-inspected.

If additional rendered evidence is required, use the **existing** detailed horse profile, nutrition current/history and event-detail provider/no-provider specimens. The only targeted edge worth adding if absent is one valid long unbroken nutrition recommendation/avoid item and one long identifying value at 320px, because DetailIconList's flex child and DetailField's value do not independently establish an anywhere-wrap policy. Capture an actual containment problem before changing the shared owner. Ordinary long prose in an existing specimen is not proof of unbroken-token behavior. This is a bounded uncertainty, not a confirmed overflow finding or authorization to restyle all lists.

No application source, tests or ledgers changed in this pass. No checks were rerun while the parent performs final validation.
