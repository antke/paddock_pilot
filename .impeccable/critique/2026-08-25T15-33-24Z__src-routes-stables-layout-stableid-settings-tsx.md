---
target: src/routes/stables/_layout/$stableId/settings.tsx
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
timestamp: 2026-08-25T15-33-24Z
slug: src-routes-stables-layout-stableid-settings-tsx
---
Method: dual-agent (A: settings_design_review · B: settings_detector_review)

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of system status | 3 | Mutations generally report status, but the activity history was too dense to scan. |
| 2 | Match with the real world | 4 | Yard, member, provider, and archive language is clear. |
| 3 | User control and freedom | 2 | Provider removal was immediate and long-form reset discarded work without confirmation. |
| 4 | Consistency and standards | 3 | Shared primitives are used, but static settings rows used a visually blended treatment. |
| 5 | Error prevention | 2 | Provider deletion and long-form discard needed stronger safeguards. |
| 6 | Recognition rather than recall | 3 | The tab model is understandable, but tabs were not addressable in the URL. |
| 7 | Flexibility and efficiency | 2 | Large activity histories and provider/member sets had limited density management. |
| 8 | Aesthetic and minimalist design | 3 | Warm system character is coherent; several descriptions and invitation badges were redundant. |
| 9 | Error recovery | 2 | Route-level query failures lacked local recovery states. |
| 10 | Help and documentation | 2 | Settings guidance exists, but owner/member operational boundaries remain implicit. |
| **Total** |  | **26/40** | **Needs focused refinement** |

## Design Specificity Verdict

The warm Paddock Pilot system is recognisable and coherent, but the settings information architecture still resembles a generic administration surface. The strongest product-specific elements are the yard vocabulary and shared provider/member records. The biggest opportunity is to separate everyday yard coordination from infrequent owner administration without weakening the existing permission model.

The deterministic detector reported no style, layout, or typography anti-patterns and no hard-coded colour violations in the scanned boundary. It did identify a source-level performance concern: independent suspense queries could serialize. Browser inspection found correct heading order, tab semantics, labelled controls, light/dark contrast, and no document overflow.

## Overall Impression

The foundation is strong, but interaction safety and record distinction lag behind the rest of the product. The highest-value improvement is to make settings feel like a dependable operational tool: clearly separated records, recoverable actions, persistent navigation state, and bounded dense lists.

## What's Working

- Shared typography, tokens, section cards, fields, dialogs, and buttons already carry most of the surface.
- Archive and member-removal flows explain consequences and preserve retry state.
- Profile and stable-specific member details are conceptually separated.

## Priority Issues

1. **[P1] Provider removal is immediate**
   - **Why it matters:** A stray click permanently removes a shared operational contact.
   - **Fix:** Route removal through a canonical confirmation with pending and retry states.
   - **Suggested command:** `$impeccable harden`

2. **[P1] The edit-stable form has unsafe discard behaviour and distant actions**
   - **Why it matters:** A long form can lose work without warning, and completion actions disappear below the fold.
   - **Fix:** Keep actions reachable, disable no-op submission, and confirm discarding dirty values.
   - **Suggested command:** `$impeccable layout`

3. **[P1] Providers are operational data inside owner-only administration**
   - **Why it matters:** Regular members may need contact details while coordinating care.
   - **Fix:** Make an explicit product decision about whether providers need a read-only operational destination; do not silently broaden permissions.
   - **Suggested command:** `$impeccable clarify`

4. **[P2] Settings navigation and activity density reduce efficiency**
   - **Why it matters:** Tabs cannot be linked directly, mobile wrapping obscures hierarchy, and up to 100 similar activity rows become difficult to scan.
   - **Fix:** Synchronize the active tab with the URL, use a single-line scrollable tab rail, and cap the activity viewport with exact timestamps.
   - **Suggested command:** `$impeccable adapt`

5. **[P2] Static records and profile copy are visually repetitive**
   - **Why it matters:** Borderless rows blend together, while repeated headings and helper text add cognitive load.
   - **Fix:** Use the canonical bordered static-record treatment and remove duplicate copy and routine badges.
   - **Suggested command:** `$impeccable distill`

## Persona Red Flags

- **Small stable owner:** Removing a provider was too easy, and the long edit form did not protect unsaved work. The activity log also made it difficult to isolate a recent membership or event change.
- **Regular stable member:** The distinction between the shared member directory, personal yard details, and owner-only member management was understandable only after reading several descriptions. Provider access remains a product-boundary question.
- **Mobile yard user:** The five settings tabs wrapped into multiple rows, making the active section less predictable and consuming valuable vertical space.

## Minor Observations

- The invitation email field relied on placeholder text instead of a visible label.
- Every invitation repeated the only supported role badge.
- The dashboard's pending-invitation link did not open the relevant settings tab.
- Query routes lacked local retry states.

## Questions to Consider

- Should provider contacts remain owner-only, or does the yard need a read-only shared directory?
- Is the activity log an audit record for owners, or an operational feed for the whole stable?
- Which settings are genuinely frequent enough to deserve first-class navigation outside administration?
