---
target: src/routes/stables/_layout/$stableId/index.tsx
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-18T16-52-29Z
slug: src-routes-stables-layout-stableid-index-tsx
---
### Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of system status | 2/4 | The page shows current records but does not provide one clear yard-level status or explain hidden list depth. |
| 2 | Match system / real world | 4/4 | “Today,” “Care board,” horses, reminders, and the seven-day view use natural yard language. |
| 3 | User control and freedom | 3/4 | Navigation is direct, but constrained lists obscure how much content remains and offer no explicit expansion control. |
| 4 | Consistency and standards | 4/4 | Shared dashboard primitives, semantic accents, typography, and card treatment are used consistently. |
| 5 | Error prevention | 3/4 | This is mostly a navigational surface; clear link destinations reduce mistakes, though priority duplication can send users down the wrong path. |
| 6 | Recognition rather than recall | 3/4 | Relevant records remain visible, but repeated information makes users compare panels to determine which copy is authoritative. |
| 7 | Flexibility and efficiency | 1/4 | There are no accelerators, personalization, or compact expert path; hidden-scroll lists add friction for frequent users. |
| 8 | Aesthetic and minimalist design | 2/4 | The visual system is coherent, but five substantial regions repeat the same reminders, events, and horses. |
| 9 | Error recovery | 2/4 | Empty states are friendly, but the dashboard itself offers little recovery guidance when underlying data is incomplete or unavailable. |
| 10 | Help and documentation | 1/4 | No contextual explanation clarifies how Today, Priority queue, Next 7 days, and Care board differ. |
| **Total** |  | **25/40** | **Acceptable — strong system, significant information-design cleanup needed** |

### Design Specificity Verdict

**Design review:** The dashboard is recognizably Paddock Pilot. Warm paper surfaces, condensed noticeboard headings, semantic rails, yard-specific language, and horse-centred records create an authored field-office character. It is not a generic SaaS dashboard.

The composition is less specific than the styling. “Today + roster + priority queue + calendar + three-column board” behaves like a conventional operations dashboard and re-presents the same small set of data several times. The tack-room noticeboard metaphor should produce one legible hierarchy of “now, next, and reference,” not several competing summaries.

**Deterministic scan:** The Impeccable detector returned **0 findings** across `src/components/dashboard/command-center`. That confirms the implementation avoids the detector’s known anti-patterns, but it does not invalidate the hierarchy and duplication issues found in the design review.

**Visual overlays:** No reliable user-visible overlay is available. The fixture server ran locally, but the isolated in-app browser could not reach the host’s `localhost` or `127.0.0.1`; both attempts returned connection refused. Source, fixture data, responsive classes, and component semantics were used as the fallback evidence.

### Overall Impression

The interface has a convincing visual voice and unusually good domain language. Its largest weakness is editorial: it treats every useful view as equally deserving of a full panel. For a stable with fewer than ten horses, that turns a reassuring shared noticeboard into a long command centre with duplicated obligations.

The strongest opportunity is to establish a clean sequence:

**What needs doing now → what is planned next → the horses and references behind the work.**

### What’s Working

- **The product has a real visual identity.** Stable Green, Oat Canvas, warm paper layers, flat borders, and condensed headings create the intended tack-room noticeboard without rustic decoration.
- **Operational records are reusable and legible.** Events, horses, badges, rails, and empty states share consistent primitives and semantic treatment.
- **The copy is human.** “A quieter day at the stable,” “Horse watchlist,” and “Nothing urgent for this stable” make routine data feel considerate rather than clinical.

### Priority Issues

#### [P1] The same work appears in too many places

**What:** Due reminders and upcoming events appear in Priority queue, Next 7 days, and Care board. Horses appear in the roster and again in the watchlist.

**Why it matters:** Owners and members must compare panels to work out whether they are seeing new information or another representation of the same information. Repetition weakens trust in what constitutes the stable’s operational truth.

**Fix:** Give every region one editorial job. Keep a single action queue for due or overdue work, a single planning view for scheduled events, and a single horse roster with care signals integrated into its rows. Remove or substantially reduce the redundant Care board/priority representation.

**Suggested command:** `$impeccable distill`

#### [P1] Fixed-height panels create hidden nested scrolling

**What:** The top composition uses `xl:h-[min(70vh,48rem)]`; Today, Horses, and Priority queue then use constrained rows, `overflow-hidden`, `max-h-[80vh]`, and scrollbar-free internal lists.

**Why it matters:** Content depth becomes difficult to perceive. Keyboard and low-vision users can encounter links inside a region that is not itself labelled as scrollable, while pointer users only receive gradient fades as a cue. A yard with fewer than ten horses usually does not need dashboard virtualization.

**Fix:** Let stable-scale lists grow naturally where practical. Where truncation is intentional, show a fixed preview with a visible count and explicit “View all” action instead of a hidden internal scroll area.

**Suggested command:** `$impeccable adapt`

#### [P2] The arrival header says where the user is, not what matters

**What:** `ActiveStableHeader` renders only the stable name.

**Why it matters:** The first viewport lacks a concise status briefing. Users must scan several panels before learning whether the day is quiet, something is overdue, or a visit is approaching.

**Fix:** Turn the header into a calm yard briefing using existing data: stable name and location, today’s date, and at most two meaningful status signals. Keep the header compact and avoid another metrics strip.

**Suggested command:** `$impeccable layout`

#### [P2] Calendar selection is visual but not fully expressed semantically

**What:** The selected seven-day button changes visual classes, but it does not expose `aria-pressed`, `aria-expanded`, `aria-current`, or a relationship to the selected-day panel.

**Why it matters:** Screen-reader users cannot reliably tell which day is active or whether selecting it revealed content. The collapsed panel itself correctly uses `aria-hidden` and `inert`, so the missing state is concentrated in the trigger.

**Fix:** Expose selected/expanded state on each day button and connect it to a stable panel identifier. Preserve the existing visual treatment.

**Suggested command:** `$impeccable audit`

### Cognitive Load

Five of eight checks fail:

- **Single focus:** fails because several panels compete to define what needs attention.
- **Chunking:** fails at page level because reminders, events, and care signals recur across multiple large groups.
- **Grouping:** passes; individual panels and record types are grouped clearly.
- **Visual hierarchy:** fails because most major regions share similar card weight.
- **One thing at a time:** fails because action, planning, roster, and care summaries are presented simultaneously.
- **Minimal choices:** passes within individual action clusters; no local control group exceeds four choices.
- **Working memory:** passes because most record context remains visible.
- **Progressive disclosure:** fails because detailed queues and their summaries are all expanded together.

There is no single button group with more than four choices, but the page presents five similarly prominent destinations, which creates a broader “where should I look first?” decision.

### Emotional Journey

- **Arrival:** Warm and credible, but the stable-name-only header provides little reassurance.
- **Peak:** The Today section and its considerate empty state give the clearest sense of calm operational control.
- **Valley:** Priority queue, calendar, and Care board repeat obligations, creating the feeling that work is multiplying.
- **Ending:** The three-lane Care board is visually substantial but does not provide closure because much of its content has already appeared above.

### Persona Red Flags

**Alex, frequent coordinator:** Alex can open records quickly, but must scan duplicate event and reminder entries and deal with internally scrolling panels. There is no compact path that answers “what requires action?” in one place.

**Sam, keyboard/screen-reader user:** The component system provides semantic links and visible focus styles, but the seven-day selector does not announce selected or expanded state. Scrollable lists hide their scrollbars and lack a labelled region or explicit expansion control.

**Mae, small-stable owner:** Mae needs confidence that members are seeing one shared version of today’s work. Repeating the same reminder in Priority queue and Care board makes it unclear which panel should anchor a handoff or conversation.

### Minor Observations

- Several `size="sm"` actions are 32px high, below the preferred 44px mobile touch target, even though their horizontal padding is generous.
- Care-board lane descriptions use extra-small text and fixed minimum heights; this may become dense under zoom or longer translations.
- The dashboard’s friendly empty-state copy is strong, but multiple empty panels on a quiet day could make the page feel longer than the work it represents.
- The fixture’s realistic stable, horse, and provider data is excellent evidence for future visual QA.

### Questions to Consider

- Should the dashboard’s primary promise be “what needs doing now,” with planning and reference information deliberately quieter?
- Does the Care board earn its space if Priority queue and the horse roster already expose the same signals?
- Would a compact daily briefing feel more like a shared tack-room noticeboard than a sequence of equally weighted cards?
