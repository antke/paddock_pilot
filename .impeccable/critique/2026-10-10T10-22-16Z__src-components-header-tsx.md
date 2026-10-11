---
target: Desktop and mobile top navigation
total_score: 21
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 1
timestamp: 2026-10-10T10-22-16Z
slug: src-components-header-tsx
---
Method: dual-agent (A: navigation_design_critique · B: navigation_evidence_critique)

The main problem is that product identity, workspace selection, navigation and preferences compete without a clear order. Rearranging the existing buttons would help only partially. My recommendation is a restrained, visible desktop sidebar and a compact branded mobile header, retaining the mobile bottom navigation. A deliberate two-row header is the strongest lower-scope alternative.

Design specificity: Paddock Pilot's Alegreya typography, warm neutral surfaces and evergreen accents are distinctive and appropriate. The navigation organization could belong to almost any administrative tool. Preserve the visual identity and change how the controls are grouped.

This is a critique and comparison only. No production UI was changed. The main dev server was offline; both reviewers inspected actual shared components in an isolated browser preview with illustrative data. Real Clerk account behavior and authenticated persistence were not exercised.

## Priority findings

1. [P1] The same label changes meaning between devices. Desktop stable-context Today links to personal home (/), while mobile Today opens /stables/$stableId. The desktop stable overview consequently has no selected destination. Navigation should remain inside the selected workspace until the user explicitly switches. Fix this independently of the eventual visual direction. Evidence: src/components/Header.tsx:265 and src/components/layout/MobileNavigation.tsx:243. Suggested command: $impeccable shape.

2. [P2] There are competing workspace controls. Users with stable membership get the large mobile workspace selector plus another stable selector beside their avatar. On a personal page, one says Personal workspace while the other still identifies a preferred stable. Keep one workspace control, reflect the current route, and provide Personal plus named stables in the same picker. Evidence: src/integrations/clerk/header-user.tsx:65 and src/components/layout/MobileNavigation.tsx:54. Suggested command: $impeccable distill.

3. [P2] Mobile loses the product identity and spends too much space on context. The brand is explicitly hidden below the desktop breakpoint. A long stable name increased the phone header from 61px in personal mode to 86px; at 640px the mixed mobile/desktop controls produced a 102px header. Restore Paddock Pilot, shorten Personal workspace to Personal, and truncate stable names in a consistently sized control with their full name inside the picker. Evidence: src/components/Header.tsx:98. Suggested command: $impeccable adapt.

4. [P2] Desktop navigation and overflow menus flatten different responsibilities. Stable desktop has seven peer destinations, including personal My horses; mobile More contains eight ungrouped rows mixing stable records, personal records and profile. Desktop Calendar and mobile Events also name the same destination differently. Group daily work, supporting records and account preferences; use a stable destination order and one label per destination. Move language and appearance together into account preferences, or retain one compact language shortcut. Evidence: src/components/Header.tsx:215 and src/components/layout/MobileNavigation.tsx:342. Suggested command: $impeccable shape, then $impeccable layout.

## Strengths and limits

Keep the existing typography and palette, labeled mobile bottom navigation, active-state treatment, accessible sheet close controls and language-save recovery behavior. Actual phone header controls met the 44px touch floor; bottom destinations and sheet rows were larger. No settled horizontal overflow or control collision was observed at tested widths. This is primarily an information-architecture and emphasis problem, not a small-target problem.

The static detector returned zero findings across Header.tsx, MobileNavigation.tsx, AppShell.tsx, LanguageSelector.tsx and header-user.tsx. It does not evaluate route meaning or semantic grouping. Both independent reviews identified the scope and context duplication issues; browser measurements added the intermediate-width evidence. There were no detector false positives.

## Structural alternatives

Compact header: Brand and workspace at the left, then left-aligned daily destinations, account at the right. Least disruptive and preserves content width, but requires prioritizing the stable destinations and grouping secondary records under More. It will not support every existing link as a peer.

Two-row header: Brand, workspace and account on the first row; a consistent left-aligned destination row underneath. This deliberately separates context from location and accommodates longer localized labels. It consumes more vertical space. This is the strongest compromise if a sidebar feels too large a change.

Visible sidebar: Existing wordmark and workspace at the top, labeled daily destinations below, supporting stable records grouped separately, account/preferences at the bottom. Approximately 216–240px wide on desktop; mobile keeps its bottom navigation and gains a compact branded header. Best overall organization for the full stable feature set, but sacrifices content width and looks sparse for personal accounts. Recommended, with a collapse option for wide calendars and a deliberate intermediate-width layout.

Menu on demand: A compact branded header with a Menu button opening a drawer. Maximum content space and very quiet chrome, but every desktop destination change needs another step and features are harder to discover. It is suitable as the collapsed/tablet state, not the default for desktop daily work. An icon rail is another collapsed variant; keep short labels or offer an expanded default because the destinations are not all recognizable from icons.

Visible desktop navigation is also consistent with Nielsen Norman Group's findings: https://www.nngroup.com/articles/find-navigation-desktop-not-hamburger/.

The interactive comparison contains desktop and phone versions of the four alternatives. Page content is illustrative; it is not a dashboard-content redesign. Durable source: /Users/antek/.codex/visualizations/2026/10/05/01a10c1b-9b26-78c1-9afe-a53059f835e5/navigation-options.html.

## Mobile recommendation and language

Keep a compact row containing Paddock Pilot, Personal or the selected stable, and the account avatar. Use the existing brand mark at very narrow widths. Keep Home, Events and Training log at the bottom, plus the context-appropriate Horses/More destinations. Remove the separate gear and duplicate stable switcher. Retain contextual Back on detail pages and group More by scope. Do not introduce a second primary mobile navigation system.

Flags may accompany English and Polski, but should not replace those language names: a country is not a language. My preference is a globe/EN shortcut if language needs to stay immediately accessible; otherwise Language and Appearance belong together under the avatar. A neutral compact control will fit the established palette better than a large outlined form field. Native language names align with W3C guidance: https://www.w3.org/International/questions/qa-navigation-select.

## Heuristic assessment

Scores are design judgments, not usability-test results. All ten heuristics apply to this signed-in operating interface.

| Heuristic | Score / 4 | Main evidence |
|---|---:|---|
| System status | 2 | Stable overview lacks a desktop current marker |
| Real-world language | 2 | Workspace and ownership distinctions need interpretation |
| User control | 3 | Back and sheet close controls are established |
| Consistency | 2 | Destination names, order and scope differ |
| Error prevention | 2 | Today can unexpectedly leave the selected stable |
| Recognition | 2 | Mixed scopes require remembering context |
| Efficiency | 2 | Navigation and utilities are scattered |
| Minimalist design | 2 | Restrained styling, competing control groups |
| Error recovery | 3 | Language-save failure explains and offers retry |
| Help | 1 | Context guidance exists mainly inside menus |
| Total | 21/40 | Acceptable foundation; substantial improvements needed |

Cognitive load is high in the busiest stable navigation states: chunking, grouping, hierarchy and choice prioritization need work. Seven desktop peers and eight More rows are the relevant decision points. Personal mobile has a manageable primary set; its main problem is misplaced emphasis.

Persona checks: a distracted mobile owner needs immediate recognition of product and workspace; a first-time owner should not need to decode My horses versus stable Horses or Contacts versus My contacts; a screen-reader user needs the workspace trigger to announce the selected workspace, not just Change workspace. The emotional problem is uncertainty about where navigation will lead, despite the otherwise calm visual design.

Minor detail: the workspace sheet marks both the current stable and the parent Stables link aria-current=page. Give the actual current workspace the selected state, and keep its parent management link unselected.

## Conditions for a successful redesign

- One workspace control, whose visible and accessible names agree with the current route.
- The same destination label opens the same scope on desktop and phone.
- Paddock Pilot is identifiable on mobile, including detail pages with Back.
- Frequent destinations stay directly reachable; secondary items have meaningful groups.
- Verify 390px, 640px, 900px and desktop widths with long Polish names, no stable, stable membership and owner/member menus.
- Retain current touch floors, keyboard behavior, permissions, locale recovery, bottom safe-area spacing and route transitions.
