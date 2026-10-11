---
target: "New ownership UI: forms, settings and navigation"
total_score: 22
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 4
timestamp: 2026-10-07T10-26-45Z
slug: src-components-ownership
---
Method: dual-agent (A: `/root/ownership_ux_review` · B: `/root/ownership_browser_audit`)

The layout is readable, but **five usability issues need attention before release**. The independent design assessment scored the wider ownership flow **22/40 — Acceptable**, with substantial task-level improvements still needed.

The UI fits Paddock Pilot's established Stable journal design. Preserve its typography, paper surfaces and calm hierarchy. The opportunity is clearer decisions and complete navigation, not a replacement visual style.

| Heuristic | Score / 4 | Main observation |
|---|---:|---|
| System status | 2 | Generic feedback sits away from the action |
| Familiar language | 2 | Archive and Remove access describe deletion |
| Control and freedom | 2 | Missing back/cancel and recovery paths |
| Consistency | 3 | Strong reuse of shared components |
| Error prevention | 2 | Final decisions omit important context |
| Recognition over recall | 2 | Destination and inherited access are unclear |
| Efficiency | 2 | Personal appointment browsing is incomplete |
| Minimalist design | 3 | Calm, readable sections and mobile wrapping |
| Error recovery | 2 | Known failures become generic refresh advice |
| Contextual help | 2 | Good introductory help; gaps at difficult states |
| **Total** | **22/40** | **Acceptable; improve before release** |

**What works:** the inspected management screens remain readable at desktop and 390px phone width, including the long carer name. Labels, visible focus, keyboard-operated selects and reminder checkboxes work. Native email validation catches a malformed address. Reusing the existing horse/event editors preserves their stronger draft protection and validation. The departure checklist usefully exposes affected appointments and care tasks before commitment.

**Priority fixes:**

1. **P1 — Use honest deletion labels and protection.** “Archive horse” schedules permanent deletion after 14 days, which can mislead someone trying to retain a retired horse's history. “Remove access” on a care contact immediately deletes the contact. Rename the existing actions, use object-specific confirmation and Cancel, and provide Edit for contact corrections. Archive wording was browser-confirmed; contact behavior was source-reviewed. Evidence: [ownershipCopy.ts:78](/Users/antek/Documents/projects/paddock_pilot/src/components/ownership/ownershipCopy.ts:78), [PersonalContacts.tsx:102](/Users/antek/Documents/projects/paddock_pilot/src/components/ownership/PersonalContacts.tsx:102). Suggested playbooks: clarify, harden.

2. **P1 — Make moves and access explicit.** Selecting another stable still ends at “Confirm departure,” without repeating the destination. Moving directly between stables also omits the new administrator's full-history access explanation. “People with access” lists invited carers but omits access through the current stable. Show owner, stable-derived access and carers separately; summarize from/to, access changes and unchecked-task consequences before confirmation. Add Cancel and expanded-state semantics. Layout/copy were browser-confirmed; access omissions were checked in source. Evidence: [HorseManagement.tsx:108](/Users/antek/Documents/projects/paddock_pilot/src/components/ownership/HorseManagement.tsx:108). Suggested playbooks: clarify, harden.

3. **P1 — Complete the invitation journey.** The signed-out screen literally reads “Horse invitation / Email address / Sign in.” It needs an instruction to use the invited address. Return-to-invitation navigation, account switching and retry are not explicitly wired, and unavailable links offer no next step. Reuse the existing stable-invitation pattern. The signed-out prompt was browser-confirmed; actual post-login behavior remains untested. Evidence: [horse invitation route:17](/Users/antek/Documents/projects/paddock_pilot/src/routes/horse-invitations/$token.tsx:17). Suggested playbooks: onboard, harden.

4. **P1 — Give personal appointments a complete browsing path.** The home preview filters by the event's original date, so an ongoing recurring appointment that started earlier disappears. It also limits the data to 12 entries without View all, and there is no personal appointments list route. Add a complete destination and build the preview from upcoming occurrences. Rename the horse action that opens creation from “Upcoming appointments” to “Add appointment.” Source-confirmed; authenticated calendar behavior was not browser-tested. Evidence: [PersonalHorses.tsx:82](/Users/antek/Documents/projects/paddock_pilot/src/components/ownership/PersonalHorses.tsx:82), [HorseDetail.tsx:114](/Users/antek/Documents/projects/paddock_pilot/src/components/horses/HorseDetail.tsx:114). Suggested playbooks: shape, onboard.

5. **P2 — Keep feedback and recovery beside the action.** New ownership/contact forms reduce different failures to “Refresh the details and try again,” while management displays one generic Saved message at the top. Use specific pending/success/error messages, preserve entered values and offer a relevant retry. Add a way back from the initial personal/stable onboarding choice. The existing horse/event editors already handle much of this correctly. Evidence: [HorseManagement.tsx:75](/Users/antek/Documents/projects/paddock_pilot/src/components/ownership/HorseManagement.tsx:75), [PersonalOnboarding.tsx:14](/Users/antek/Documents/projects/paddock_pilot/src/components/ownership/PersonalOnboarding.tsx:14). Suggested playbook: harden.

**Cognitive load and emotional journey:** the five My horses header actions and the broad horse navigation add scanning work. The bigger burden is having to remember the chosen destination and infer consequences. The history-preservation promise and departure checklist reassure owners; a specific final summary and completion message would carry that reassurance through the decision.

**Persona checks:** Jordan, a first-time owner, could interpret Archive as safe long-term storage or mistake profile Owner name for account ownership. Sam, a keyboard/screen-reader user, gets labeled controls and keyboard operation, but the departure disclosure lacks expanded state and repeated removal actions lack person-specific names. Casey, a distracted phone user, gets readable wrapping but must remember the destination and can lose drafts when told to refresh.

**Smaller follow-ups:** use the chosen app locale for dates; replace stable-specific help in personal forms; explain how to connect when no eligible stable exists; show record type/filtering in former-horse history. Personal contact help currently promises updates that its copied contact details do not support—either support linked contacts or correct that copy. Dark mode, Polish wrapping, 200% zoom, contrast ratios and actual screen-reader speech still need verification.

**Evidence and limits:** the deterministic detector reported **0 findings**. That agrees with the clean layout but does not assess these navigation and wording failures; there were no detector false positives. Both reviewers independently inspected the production management/departure components through the labelled local sample on desktop and at 390px width. The real signed-out invitation prompt was inspected. Authenticated onboarding, contacts, claims, history and persistence remained source-only. No user records or invitations were changed. There is no live overlay: the browser tool exposes read-only evaluation, so screenshots, accessibility snapshots and DOM measurements were used instead.

Two product choices would guide the next implementation pass:

- **Horse retention:** rename the current operation to Delete horse (recommended narrow fix), or add a separate permanent, non-destructive archive?
- **Personal scheduling:** add one Appointments page across all owned/shared horses (recommended), or keep full browsing within each horse with explicit links from My horses?
