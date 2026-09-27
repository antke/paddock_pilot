---
name: Paddock Pilot — Dashboard containment study
description: Dashboard containment experiments and twelve reference studies within the existing Stable journal system.
---

# Dashboard containment study

## Overview

**Mode: Operate. Status: exploration; unapproved for production.**

This is a scoped surface record for the dashboard lab, not a replacement for the [canonical application design system](../../../DESIGN.md). The product remains a shared operational home for owners and members of small stables, as described in [PRODUCT.md](../../../PRODUCT.md).

The user found the previous L-shaped row borders and the overly open dashboard difficult to read after nested boxes were removed. These demos test a middle ground: enough containment to identify working areas and scan a busy yard, without framing every record inside another panel. The user prefers Soft sections and requested further demos of that approach. The consolidated candidate was approved as the application baseline. Its surface hierarchy is now owned by the global section, record and layout components; the earlier studies remain comparison experiments.

| Route                         | Experiment      | Built treatment and tradeoff                                                                                                                                                                                                |
| ----------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/dashboard-lab/1`            | Soft sections   | One lightly outlined panel per major section, with borderless records inside. Clear section boundaries, at the cost of more visible framing.                                                                                |
| `/dashboard-lab/2`            | Row bands       | Filled section headers and alternating record backgrounds. Strong row separation with open section edges; dense lists carry more tonal repetition. The horse roster uses one column.                                        |
| `/dashboard-lab/3`            | Focus rail      | One planning sheet groups today, the calendar and horses; a separate filled attention area sits alongside it. Fewer containers and stronger working-area separation, with subtler distinctions inside the planning sheet.   |
| `/dashboard-lab/current`      | Current layout  | Existing `StableCommandCenter` composition with the same data as the experiments. Comparison baseline only.                                                                                                                 |
| `/dashboard-lab/soft-headers` | Defined headers | Integrated muted header backgrounds and consistent section heading sizes strengthen section identity. Attention gets a restrained burgundy header tint. More explicit hierarchy, with greater visual weight in the headers. |
| `/dashboard-lab/soft-compact` | Compact rhythm  | Reduced section and row padding, with two columns of health summaries on desktop. More visible content with unchanged text sizes; narrower health entries are the tradeoff.                                                 |
| `/dashboard-lab/soft-gentle`  | Gentle contrast | Subtle outlines, generous spacing and a lightly tinted attention surface. Calmer framing, with a taller attention area.                                                                                                     |

### Twelve reference studies

The next exploration responds to the user's request for at least ten demos before rollout, drawing on five supplied dashboard images. Twelve combinations explore six findings: soft surface grouping, consistent record anatomy, section identity, selective emphasis, visual anchors and a warm canvas. Each route `/dashboard-lab/reference-01` through `/dashboard-lab/reference-12` offers a dashboard and full care-reminder list, with an expandable comparison matrix. Reference numbers below identify the supplied images; they do not imply a new brand direction.

| ID / theme (references)     | Surface / header    | Records / care grouping                                            | Dashboard / emphasis                                       | Tradeoff                                                      |
| --------------------------- | ------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------- |
| 01 Paper rooms (1, 5)       | Ivory / plain       | Roomy open rows / one list                                         | Balanced / status labels                                   | Calm baseline; taller lists.                                  |
| 02 Oat canvas (1, 4)        | Oat / plain         | Compact open rows, horse initials / one list                       | Balanced / status labels                                   | Clearer paper surfaces; less breathing room.                  |
| 03 Quiet headers (3, 5)     | Ivory / header wash | Compact open rows / one list                                       | Balanced / attention heading                               | Stronger identity; heavier headers.                           |
| 04 Readable lanes (1, 4)    | Ivory / plain       | Compact alternating fills, horse initials / one list               | Balanced / status labels                                   | Easier scanning; more repeating color.                        |
| 05 Care first (4)           | Oat / plain         | Compact open rows, horse initials / timing                         | Attention first / urgent summary                           | Care precedes the daily schedule.                             |
| 06 Daily plan (3, 5)        | Ivory / plain       | Roomy open rows, horse initials / timing                           | Full-width today and week / status labels                  | Horse and care sections sit lower.                            |
| 07 Horse by horse (2, 4)    | Oat / plain         | Compact alternating fills, horse initials / horse                  | Horse directory leads on desktop / status labels           | Horse context takes priority over chronology.                 |
| 08 Independent tasks (2, 5) | Oat / plain         | Roomy task cards / one list                                        | Balanced, open summary rows / status labels                | Clear action ownership; more space.                           |
| 09 Working ledger (2, 4)    | Ivory / header rule | Compact date, record and action columns with list rules / one list | Full-width today and week / status labels                  | Dense and utilitarian; long notes reduce compactness.         |
| 10 Shared journal (1, 5)    | Oat / header rule   | Roomy open rows / timing                                           | One planning sheet, separate attention / attention heading | Fewer containers; subtler internal boundaries.                |
| 11 Gentle emphasis (3, 5)   | Warm / plain        | Roomy open rows, horse initials / horse                            | Balanced / attention heading                               | Quiet outlines can be less distinct on low-contrast displays. |
| 12 Balanced synthesis (1–5) | Oat / header wash   | Compact alternating fills, horse initials / timing                 | Balanced / urgent summary                                  | More combined cues; compare with simpler 01.                  |

Timing groups separate overdue, upcoming and completed reminders. Horse initials are care-list anchors, not replacements for written horse names. These combinations are experiments to compare, not twelve approved application themes.

## Colors

All treatments inherit the application's semantic palette. Paper, surface, muted surface and border tokens provide grouping; evergreen actions, oat selection and burgundy destructive states retain their existing meanings. No new palette or token system is introduced.

## Typography

The study preserves the shared Alegreya headings, Alegreya Sans records and existing type hierarchy. Readability is explored through grouping and spacing rather than a new type scale.

## Layout

The experiments place today, the calendar and horses in an independently flowing main column, with attention in a separate column. This prevents a tall attention area from stretching the adjacent planning sections. At widths of at least 1100px, the grid uses a 1.65:1 split with a minimum attention width of 340px; below that it stacks in reading order.

The usual gap is 24px. Row bands and the focus sheet use 32px between their main sections. At widths below 640px, the main gaps reduce to 20px and contained sections use 18px padding. The focus sheet uses 28px padding at larger sizes; ordinary contained sections use 24px. These are local experiment values, not additions to the shared spacing contract.

Soft refinements use 24px section headings. Defined headers extend the header background to the section edges. Compact rhythm uses 20px section padding and gaps, with 10px vertical row padding; health summaries form two columns at 1100px and above. Gentle contrast uses 28px section padding and 16px vertical row padding. All three reduce section padding to 18px on mobile and preserve the shared horizontal calendar behavior.

Reference studies vary the desktop composition at 1100px: balanced columns, attention first, a full-width agenda, a horse directory, or one planning sheet. Study 07 returns to Today-first order on narrower screens. Care rows align date, record context and action; at 800px and below they stack, horse-initial anchors disappear, and study 08's two-column cards become one column. Compact studies use 20px section insets and 10px vertical record padding; comfortable studies use 24px and 16px. The wrapper and section insets reduce again on phones.

## Elevation & Depth

Grouping comes from surfaces, spacing and restrained section boundaries. No ambient shadow is added. Dashboard record borders are removed inside the experimental wrapper; hover uses a shared surface token. Reference study 09 deliberately retains quiet horizontal rules in its full care list, and study 08 gives independent care tasks their own surfaces. The row styling must preserve the shared keyboard-focus ring: a blanket row `box-shadow` override was removed after review because it hid that ring.

## Shapes

Soft sections use one-pixel outlines and 12px panel corners. The focus sheet and attention area also use 12px corners, while row-band headers use 8px corners and their record lanes remain square. Other experimental rows use 6px corners for hover feedback. Status remains expressed in the reused record content rather than an L-shaped border.

## Components

The study reuses `ActiveStableHeader`, `TodayBriefingCard`, `MiniCalendarCard`, `HorseRosterCard` and `PriorityQueueCard`. Domain behavior, actions and record destinations remain owned by those components. Calendar day selection and Show all were exercised in the demos; record links lead into the app. Demo navigation exposes the active route with `aria-current`.

For the earlier containment and soft-section demos, local development with the auth bypass uses the explicitly labelled, fictional Cedar Ridge Barn fixture: six horses, seven high-severity issues and eleven due reminders make grouping differences visible under load. Signed-in usage of those demos derives data from the active stable. Their options, including the baseline, receive the same data source.

All twelve reference studies always use that same fictional fixture. The care list supports local text search, All/Overdue/Upcoming/Completed filters, completion, reopening, undo of the latest completion, and reset of completion and filters. Notices use a status region, selected filters expose their pressed state, and empty search results explain recovery. Completion updates the preview's open counts and dashboard reminder summaries; it does not save care records. Studies 05 and 12 link their urgent summary to the overdue-filtered care preview. Dashboard record links still lead into the app.

Implementation lives in [DashboardContainmentStudy.tsx](../../../src/components/dashboard-lab/DashboardContainmentStudy.tsx), [dashboardContainmentStudy.css](../../../src/components/dashboard-lab/dashboardContainmentStudy.css), [dashboardContainmentFixtures.ts](../../../src/components/dashboard-lab/dashboardContainmentFixtures.ts), [DashboardLabPage.tsx](../../../src/components/dashboard-lab/DashboardLabPage.tsx) and the [versioned lab route](../../../src/routes/dashboard-lab/$version.tsx). Experimental CSS is scoped beneath `data-dashboard-study`; the baseline does not receive that wrapper.

Screenshot evidence is stored in [the dashboard containment review directory](../../../.impeccable/review/dashboard-containment/). Review covered these experiments, including a native keyboard check confirming the restored 3px focus ring. This is not a full-product accessibility assessment.

Reference-study configuration, explanations and source-image numbers live in [referenceStudies.ts](../../../src/components/dashboard-lab/referenceStudies.ts); [ReferenceStudiesPage.tsx](../../../src/components/dashboard-lab/ReferenceStudiesPage.tsx) owns the preview interactions. Surface overrides in [referenceStudies.css](../../../src/components/dashboard-lab/referenceStudies.css) are scoped to `.reference-surface`, with dedicated reference classes for the lab controls and care list. Production styles and behavior remain unchanged.

The independent finish review approved shipping the reference experiments after resolving study 08's action alignment and study 07's attention footer placement. [Reference-study evidence](../../../.impeccable/review/reference-studies/) includes 48 dashboard/care-list captures at desktop 1440px and phone 390px, lower-region checks, completed study 08, tablet 900px and dark study 12. Interaction checks covered completion, undo, empty search, reset, overdue filtering and keyboard focus; TypeScript, lint and six tests across three files passed. This verdict applies to the demos only. Sample data and selected viewport/state checks do not establish production approval or full-product accessibility.

## Do's and Don'ts

- **Do** compare all options with the same yard data, including narrow layouts and the expanded attention lists.
- **Do** preserve palette, typography, domain behavior and visible keyboard focus while evaluating containment.
- **Do** obtain the user's choice of direction before porting a treatment into shared primitives or production; then review its effects on other surfaces and states.
- **Don't** import study CSS into production. The approved section and record rules now live in root DESIGN.md and the shared application primitives.
- **Don't** promote an experiment into a global redesign, update the root design record, or regenerate the design sidecar before a direction is approved.

## Consolidated candidate

`/dashboard-lab/candidate` combines study 02's oat canvas and paper sections with study 04's shaded rows. It is a comparison preview, not a production rollout. The candidate replaces the combined Needs attention area with two independently contained sections: **Health issues** and **Care reminders**. Each initially previews three records. Health retains its own total and Show all control; Care opens the local full-reminder preview and reports the remaining count. The shared `HealthIssuesCard` and `CareRemindersSummaryCard` exports use the existing attention data logic; the existing `PriorityQueueCard` defaults to its combined composition for other callers.

The candidate simplifies the comparison controls to Candidate / Current UI and Dashboard / Care reminders. The dashboard baseline renders `StableCommandCenter`; the care baseline uses the existing flat record primitives with the same sample text and local actions. It compares presentation, not the full production Care page's permissions, creation, dismissal or removal flows. Local completion, reset, search and filters carry across comparison modes.

Candidate care records show consistent horse, date, title and action positions. Details is a native keyboard-accessible disclosure: opening the note gives that record a restrained outline and extra space. Ordinary rows retain alternating surface fills. The horse roster uses one column so shading consistently identifies a whole row. The independent attention sections stack below the main column on narrow screens.

Verification: desktop and phone captures in `.impeccable/review/consolidated-candidate/`; local health expansion, Care navigation, completion across comparison modes, undo, Details keyboard activation and empty search were exercised. The attention tests cover section isolation and the explicit empty health state in addition to existing combined behavior.

## Promotion to the application

The approved oat/paper hierarchy, alternating open rows and separate health/reminder sections are now shared application defaults. `Current UI` in the candidate comparison therefore renders the promoted production components. The candidate and numbered study CSS remains a historical reference; it is not a production styling dependency. Global tuning and functional exceptions are documented in the root `DESIGN.md`.
