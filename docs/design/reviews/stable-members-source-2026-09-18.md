# Stable members and settings — source audit, 18 September 2026

The initial pass was a read-only, bounded Impeccable technical audit in Operate mode. It covers `StableMembersPage`, `StableMembersSettingsCard`, `StableInviteForm`, `StableMemberDetailsForm`, `StableInvitationsList`, `DeletedHorsesCard`, `StableArchiveCard`, their shared owners, the corresponding routes, and the current settings lab. The initial source findings below retain their original line references. A separately authorized bounded implementation followed; its changes and verification are recorded at the end. Browser behavior and backend mutations were not exercised by this agent.

## Verdict

The family already uses global controls, form fields, alerts, record rows, semantic colors and typography. The largest remaining risks are asynchronous interaction state, missing field/error relationships, and fixture fidelity. A blanket local-style cleanup would miss the important defects.

The bundled detector was run once on the seven requested component sources and returned `[]` (`/tmp/paddock-stable-members-detector.json`). That result does not cover asynchronous state or prove visual/accessibility quality. No whole-family numeric health score is claimed without rendered responsive, contrast and keyboard evidence.

## Prioritized findings

### P2 — Concurrent invitation actions erase each other's pending state

**Location:** `StableInvitationsList.tsx:46-49,60-93,113`; affects both settings Members and onboarding Invite team.

The entire list has one `pendingAction` containing `{ id, type }`, while `isPending` disables only the row matching that id. Starting a resend for A leaves B enabled. Starting B overwrites A's pending marker; A immediately appears idle. When either promise finishes, its `finally` clears the marker for the other still-pending operation. This is a deterministic state trace, not a browser timing claim.

Impact: inaccurate progress and re-enabled actions while work is still outstanding. Copy can expose an old invitation token during a resend; an extra resend can be attempted. Backend inspection prevents overstating the risk: `convex/stableInvitations.ts:266-321` enforces a cooldown and request limit, so this does **not** prove unlimited duplicate emails. The UI still loses its own pending truth.

Smallest fix: let each invitation row own its own pending action, or use an id-keyed pending map/ref. Clear only the operation that completed. Keep copy/resend/revoke mutually exclusive within one row; independent rows may remain usable. Verify two delayed promises settling in both orders and a failed first operation while a second remains pending. Suggested command: Impeccable harden.

### P2 — Destructive dialogs can be dismissed with Escape while the action is pending

**Locations:** `StableMembersSettingsCard.tsx:216` (`RemoveMemberButton`), `DeletedHorsesCard.tsx:124`, `StableArchiveCard.tsx:46`, and the uncontrolled revoke dialog in `StableInvitationsList.tsx:161`.

Cancel buttons become disabled while saving, but root `onOpenChange` accepts closure unconditionally, or is uncontrolled. The installed Base UI implementation in `node_modules/@base-ui/react/dialog/root/useDialogRoot.js` sets `escapeKey: isTopmost`; disabling the Cancel control does not disable Escape dismissal. No page-level code guards that request.

Impact: the user can dismiss the pending confirmation even though the already-submitted operation continues. This makes the disabled-cancel policy inconsistent and removes the visible progress surface; reopen/retry sequences need careful verification. It does not mean the server operation is canceled.

Smallest fix: use the same pending-aware open-state guard already implemented in `RecordRemoveAction`. Use that shared action outright for ordinary revoke/permanent-delete confirmations if their required descriptions and result handling fit. Member removal needs its reassignment field and can remain a specialized action, but should follow the same lifecycle. Archive has its own callback/result contract and can retain it. Verify Escape before submit, Escape while delayed, success closure, failure staying open and retry. Suggested command: Impeccable harden.

**False positive avoided:** shared `AlertDialogAction` is a normal `Button`, not an automatic close primitive. A failed action does not automatically close just because this component was used. Revoke currently relies on reactive invitation props changing to a non-actionable status to unmount its dialog; explicit controlled closure would make sample/slow-refresh outcomes easier to reason about, but this pass does not claim the dialog never closes in production.

### P2 — Member and invitation errors are visually present but not associated with their controls

**Locations:** `StableInviteForm.tsx:83-90`; `StableMemberDetailsForm.tsx:64-69,82-88,102-107`.

Controls set `aria-invalid`, but do not set `aria-describedby` or `aria-errormessage`; the corresponding `FieldError` has no id. The shared `FieldError` renders an alert but does not establish a label/control relationship automatically. A screen reader can hear a newly inserted error, yet returning to the invalid control does not identify the related message programmatically.

Smallest fix: generate a form-instance id prefix with `useId`, assign unique field and error ids, and associate each invalid control with its own error. Keep `Field`, `Input`, `Textarea`, error typography and border styles global. The member phone already uses `type="tel"`; preserve it. Test overlong display name/phone/emergency contact and invalid invitation email. The native email constraint may handle malformed syntax before the resolver, so test both normal browser submission and schema-only cases. Suggested command: Impeccable harden.

Exact `StableMemberDetailsForm` consumers: `StableMembersPage`, `StableMembersSettingsCard`, `StableWelcomePage`, and `OnboardingPage`. `StableInviteForm` is used by `StableMembersSettingsCard` and `onboarding/InviteTeamStep`. Each composition needs its own narrow and keyboard confirmation after a shared fix.

### P2 — Current settings lab cannot verify the production member/invitation/deleted-horse flows

**Location:** `page-lab/prototypes/SettingsPageLab.tsx`.

- Members uses a custom `SettingsPeopleCard`; Invite/Edit/Remove buttons have no handlers. It does not render `StableMembersSettingsCard`, `StableInviteForm`, `StableMemberDetailsForm` or `StableInvitationsList`.
- Deleted horses renders one static generic row without Restore or permanent-delete actions; it does not render `DeletedHorsesCard`.
- Archive renders the real `StableArchiveCard`, but `onArchive={() => true}` merely closes it; no pending/failure outcome is exercised or local archived result explained.
- Providers are owned by a separate concurrent audit and are intentionally not reviewed here.

This is a **prototype limitation**, not proof that the corresponding production controls fail. The gap matters because attractive lab screenshots could otherwise be credited as evidence for controls that were never rendered. Replace only these substitute sections with local callbacks driving the production view, using the small seams below. Suggested command: Impeccable audit, then harden where observed.

### P3 — The people/invitation/trash owners still force contained rows

**Locations:** `StablePersonCard.tsx:29-31`, `StableInvitationsList.tsx:116-120`, `DeletedHorsesCard.tsx:105-108` use `chrome="cards"` despite flat rows being the approved default.

This is repeated domain-owned styling, not route-local hex/font drift. A dense Members view will accumulate boundaries around every person, followed by another framed field panel when editing. It deserves a rendered comparison with the approved flat treatment, especially with long emergency details. The source alone does not justify deleting every frame: an open editor or important confirmation may need a boundary.

Smallest visual change if the browser review confirms over-framing: change `StablePersonCard` at its shared owner, and the invitation/trash row owner to flat; retain an explicit contained variant only for a demonstrated need. Do not paste border/background overrides into settings or members routes. Verify both directory and management compositions plus relevant style-lab examples. Suggested command: Impeccable distill, ending with polish.

## Additional risks to verify, not established route bugs

- **Form identity change:** `StableMemberDetailsForm` takes defaults once from `member` while submission reads the latest `member._id`. If a mounted form receives a different member, old values can be submitted to the new id. Current settings rows are keyed by membership id and unmount on switching edited rows, which limits that path; this report does not claim a demonstrated cross-member overwrite. A shared keyed inner form or explicit reset-on-identity policy would make the invariant clear. Include a rerender-to-another-member test if adding the production-view seam.
- **Interrupted edit:** clicking Edit on another member unmounts the current form without a dirty warning; the original row's Edit action also remains visible while editing. Determine whether that is acceptable for this short form. Current Cancel is intentional discard; do not infer every Cancel requires another dialog.
- **Permission failure copy:** settings uses owner-only `listWithUsers`; denied access is thrown into a generic query-error treatment telling the user to check connection. The gate is backend-enforced, but the explanation may be inaccurate for members opening a settings URL directly. Verify the authenticated denied route before choosing a specialized state.
- **Deleted-horse route error:** `/stables/$stableId/horses/deleted` lacks its own `errorComponent`, unlike members/settings. Verify the inherited error/retry surface rather than assuming missing recovery.
- **Long content:** long unbroken emails enter `DashboardMetaList` without a per-child break rule; invitation emails enter the shared record-title treatment. Test at 390px and text zoom before adding a global wrapping change.
- **Archive exception boundary:** `StableArchiveCard` uses `try/finally` without a catch. Its production `StableSettingsOverview.onArchive` catches failures and returns false, so normal backend failure is handled. A rejecting sample callback needs to follow this contract or test explicit error ownership; do not misreport the normal flow as unhandled.
- **Deletion deadline wording:** `purgeAt` is eligibility after 14 days, with a six-hour cron deleting in batches of 25. The UI's exact “Permanent deletion [date]” is a deadline cue, not proof of exact execution time. Preserve the warning to restore promptly; do not claim restoring after eligibility is guaranteed. `restoreHorse` currently permits restoration while the record still exists.

## Smallest useful production-view fixture seams

Prefer thin connected wrappers plus exported callback-driven views. Do not import labs into production, mock Convex at runtime, bypass actual route authorization, or build another lookalike settings page.

| Existing owner | Minimum reusable seam | Sample cases |
| --- | --- | --- |
| `StableMemberDetailsForm` | Export a form view receiving `member`, `onSave(values): Promise<void>`, `onCancel`, `onSaved`; connected wrapper supplies mutation and real toast ownership. Key form state by member id. | Long/empty details; invalid lengths; pending; recoverable failure; successful local apply; cancellation; identity change. |
| `StableInviteForm` | Export real fields/form receiving `onInvite(values): Promise<result>`; connected wrapper owns email mutation/copy toast. A sample callback returns an explicitly fake token and a local-only status, never queues mail. | Invalid/valid email; pending; duplicate attempt; rejected request; closed/reopened dialog with truthful local result. |
| `StableInvitationsList` | Export a list/row view receiving `invitations`, `onResend(id)`, `onRevoke(id)`, `onCopy(token)`. Put pending state with the row that owns it. Production wrapper supplies API/copy operations. | Pending/expired/accepted/revoked; queued/sent/failed/skipped delivery; long address; empty; two concurrent rows settling out of order; revoke cancel/pending/failure/retry. |
| `StableMembersSettingsCard` | Keep members/horses/invitations data props; extract the presentation plus `onRemoveMember(id, reassignToUserId)` and editable/invite slots or typed callback props. Reuse the same forms above. Export the specialized reassignment action if helpful. | Owner-only row, ordinary member, member owning active and deleted horses, reassignment required, delayed failure/success, long horse list in narrow dialog. |
| `StableMembersPage` | Already receives stable/access/people/myDetails. Supply a real editable form slot or `onSaveDetails` through a pure view to avoid hooking Convex when opening the local specimen. | Owner, member, sparse profile, long names, missing photo, long emergency note, editing/read-only states. |
| `DeletedHorsesCard` | Export pure list/row receiving horses and `onRestore(id)`/`onPermanentlyDelete(id)`; keep pending/open state in the production row view. Thin connected wrapper owns mutations and real success toasts. | Empty, within retention, owner eligible, member cannot purge; restore pending/failure/success; purge cancel/pending/failure/success. Simulate only with disposable sample objects. |
| `StableArchiveCard` | Already callback-driven; no new visual copy needed. Keep its boolean-result contract. | `onArchive` delayed false then true; explicit local status; Escape guard; retry. No real archive request. |

A single registered sample page with scenario controls can render these same views using fictional `.example` emails and local arrays. To avoid an oversized “test dashboard,” group it as three scoped specimens: directory/member details; membership/invitations; recovery/archive. Each needs desktop/narrow screenshots and native keyboard checks; the settings lab may select the appropriate specimen via its existing tabs.

## Route / consumer map

- `/stables/$stableId/members` → `StableMembersPage`, member self-details form and directory.
- `/stables/$stableId/settings?tab=members` → `StableSettingsPage` → `StableMembersSettingsCard` → member form, invite form, invitations and reassignment action.
- `/stables/$stableId/settings?tab=deleted-horses` and `/stables/$stableId/horses/deleted` → `DeletedHorsesCard`.
- `/stables/$stableId/settings` overview → `StableSettingsOverview` → `StableArchiveCard`.
- `/onboarding` stable-specific team/details steps → `InviteTeamStep`, `StableInviteForm`, `StableInvitationsList`, `StableMemberDetailsForm`.
- `/stables/$stableId/welcome` → `StableMemberDetailsForm` when the user edits their yard details.
- `/page-lab/settings` presently covers layout/static row appearance only for most of this scope; see limitations above.

## Positive findings and preserved boundaries

- All production mutation success feedback follows an awaited server call. No optimistic success was found in the inspected production handlers.
- Backend membership access and private detail visibility are explicit: public directory query omits private phone/emergency values, while owner management uses `assertCanManageMembers`.
- Removing a member with horses requires a reassignment target; the settings route includes both active and deleted horses, matching the backend reassignment query's scope.
- Form fields and action buttons disable while their own form is submitting; typed telephone input, global error styles and shared action spacing are retained.
- Permanent deletion has a separate confirmation and backend eligibility/owner checks. Archive explains that records remain but restoration requires support.
- No arbitrary app colors/fonts or substantial route-local CSS recipes were found in these sources. Remaining overrides largely express layout rather than duplicated design tokens.

## Next bounded pass

1. Add the minimal connected/view seams and clearly local outcome fixtures.
2. Correct invitation concurrency and dialog pending dismissal in the owning components, then associate form errors with controls.
3. Test deferred success/failure promises, repeat/interrupt actions, keyboard focus/return, narrow layouts and long data.
4. Compare the dense lists against the approved flat structure, then perform one Impeccable polish pass.
5. Keep authenticated role checks, actual mail delivery, restore/purge/archive and backend error verification explicitly open until controlled test accounts/data exist. Do not use real members or horse records for audit mutations.


## Authorized follow-up — member and invitation fixes

The parent authorized fixes in member/invitation owners and safe production-view seams. This follow-up leaves archive to the parent, deleted horses to its next pass, and does not change the approved palette, typography or row chrome.

### Implemented

- `StableInvitationsList`: each real invitation row now owns its pending operation. A synchronous ref guards re-entry; copy, resend and revoke lock together within one row, while another row remains independently usable. The revoke dialog is controlled, ignores close requests while pending, closes only after an acknowledged successful callback, and stays open on failure. Production mutation wrappers still own real success/error toasts and fresh invitation URLs.
- `StableMembersSettingsCard`: specialized member removal retains horse reassignment and now follows the same pending-aware dialog policy, with a synchronous re-entry guard. Successful removal closes after the mutation wrapper returns true; false leaves the dialog available for correction/retry.
- `StableMemberDetailsForm` and `StableInviteForm`: per-instance `useId` IDs connect each label, field and conditional error with `aria-describedby`. Invalid state remains explicit. Member forms are identity-keyed so changing member ID resets initial defaults instead of carrying a previous member's draft forward. Failed saves preserve values; successful callbacks acknowledge before closing/resetting.

### Pure production-view contracts

These exports render the same production fields/rows/dialogs without calling mutation hooks. Existing connected exports remain the route-facing defaults; no lab import enters production. Boolean callbacks must report their own failure and return false; true acknowledges completion. They must not return true before the intended write/local sample update has completed.

| Export | Required data and effects |
| --- | --- |
| `StableMemberDetailsFormView` | `member`, `onSave(values): Promise<boolean>`, `onCancel`, `onSaved` |
| `StableInviteFormView` | `onInvite(values): Promise<boolean>`, optional `onCreated` |
| `StableInvitationsListView` | `invitations`, `onResend(invitation): Promise<boolean>`, `onRevoke(invitation): Promise<boolean>`, `onCopy(token): Promise<void>` |
| `RemoveMemberButtonView` | `member`, `membership`, `members`, `horses`, `stableName`, `onRemove(reassignToUserId?): Promise<boolean>` |

The parent owns lab registration; these seams alone do not upgrade the existing substitute settings sample to production verification. `StableMembersPage`/`StableMembersSettingsCard` still compose connected forms, so a complete standalone page sample needs the suggested slots/views from the initial audit or focused specimens of these new pure exports. The Welcome audit agent was told the exact member form contract for its real local sample.

### Verification completed

`src/components/stables/StableMemberInteractions.test.tsx` passes seven jsdom cases:

1. Two independent resends remain accurately pending when the first row settles first.
2. The reverse completion order does not clear the other row; failed completion unlocks only its row. Repeated activation of a pending row does not duplicate its callback.
3. Revoke allows Escape while idle, rejects Escape during a deferred callback, keeps its dialog after false, and closes after successful retry.
4. Member removal keeps its pending dialog through Escape and false, then closes after successful retry.
5. All three member errors are linked to their controls; switching member identity resets the prior invalid draft.
6. Member save reports no completion before acknowledgement, preserves failed values, and invokes `onSaved` on successful retry.
7. Two invitation forms have unique IDs; invalid email has a linked error; failed invitation preserves its email and only an acknowledged success clears it.

Scoped ESLint passes for the four changed production files and this test. Full `tsc --noEmit` passes after removing unsupported Testing Library `exact` role-query options from the new tests. No backend write, real mail, clipboard write, or destructive action was performed. This is component-level behavioral evidence, not rendered mobile/dark/focus-ring/contrast verification.

### Consumers still requiring route verification

- Member details: `StableMembersPage`, `StableMembersSettingsCard`, `StableWelcomePage`, `OnboardingPage`.
- Invite creation and invitation row actions: `StableMembersSettingsCard`, `InviteTeamStep` (and their settings/onboarding routes).
- Member removal and horse reassignment: settings Members via `StableMembersSettingsCard` only.

Deleted-horse pending Escape protection remains an unfixed finding in this agent's scope. Archive protection is assigned to the parent; consult its report before crediting it. Forced contained rows, long-value wrapping, owner-only permission recovery, real invitation delivery/cooldown, clipboard outcomes and reassignment transactions still need their respective visual/backend evidence.

## Second authorized follow-up — actual settings composition and local specimen

This section supersedes the earlier note that the member settings lab still needs a composition seam. The original source findings remain historical evidence. Browser review belongs to the parent and is not credited here.

### Production ownership and layout

`StableMembersSettingsCard` now delegates to exported `StableMembersSettingsCardView`, which owns the real section/subsection/member-row composition, invite dialog, row editor state and focus behavior. Its dependencies are injected through `renderInviteForm`, `renderDetailsForm`, `renderRemoveMember`, and an `invitations` node. The default connected wrapper still supplies the real mutation-backed components; local specimens supply the same pure production fields/actions instead. No runtime mutation mock or lab import enters the production path.

The editor focuses the first field when opened. Save/cancel return focus to the correct row's Edit details button; successful-save return waits until the button is enabled again. Pending detail saves disable other edit/removal actions so the pending form cannot be silently replaced by editing a different row. The inline editor no longer adds a nested `FieldPanel`; its DOM wrapper only provides focus targeting.

`StablePersonCard` now uses the existing global flat row treatment rather than a separately framed card per member. This domain owner is shared by Members, member settings, and the style lab. It preserves a divider and consistent spacing; no route-specific typography/color overrides were added. Invitation rows use the same flat record treatment. Member names, invitation email titles, and person metadata explicitly permit unbroken values to wrap in their domain content slots. This is layout ownership rather than a new text style. Fifty-member rendering is covered by the local specimen; readability/scrolling at that density still needs parent browser review.

### Pending and failure behavior

`StableMemberDetailsFormView` and `StableInviteFormView` now accept optional `onPendingChange(boolean)`; their connected wrappers forward it. Both views synchronously guard repeated submissions, retain a separate pending flag while the acknowledged request remains outstanding, catch rejected callbacks, and render contextual inline errors for rejection or false. Failed values remain available for retry. Existing signatures otherwise remain compatible.

`CreateRecordDialog` gained optional `isPending = false`: pending dialogs reject dismissal and hide the Close control rather than presenting an affordance that does nothing. Member settings also uses a synchronous pending ref in its open-state guard. Successful invitation completion closes only after the callback resolves true.

`RemoveMemberButtonView` catches rejection as well as false, retains its dialog and reassignment choice, and renders an inline retry message. The row-owned invitation view catches rejected resend/revoke/copy callbacks, renders contextual errors, and places revoke failure inside the open dialog. Production clipboard failures still toast and then propagate into the row's inline error. Success notification remains after the real mutation or clipboard promise.

`CreateRecordDialog` defaults preserve its existing users: `CareRemindersCard`, `DocumentsCard`, `StableDesignGuidelines`, `HorseWeightRecordsCard`, `HorseNutritionLogsCard`, `HorseMedicationRecordsCard`, `HorseHealthIssuesCard`, and `StableProvidersCard`. Only member settings opts into this new pending flag in this change; those other consumers are not credited with pending-lifecycle verification.

### Safe local sample

New `src/components/page-lab/prototypes/MembersSettingsPageLab.tsx`, exported as `MembersSettingsPageLab({ data, embedded = false })`. `embedded` suppresses its outer h1 for the settings lab. Development sample gating matches existing page labs. It renders the actual production composition and pure components, without a Convex provider or mutation hook.

Available cases:

- Three members with long name/email/emergency details; 50 members; owner-only with no invitations.
- Pending queued mail, pending failed mail, expired, accepted, accepted awaiting activation, declined and revoked invitations. Delivery states include queued/sent/failed/skipped.
- Response delays of 0.1, 1.2 or 6 seconds; next-request success, false failure, or rejected promise. The failure preset applies once, then retry succeeds.
- Real field validation, local member edit, invitation creation, resend/token refresh, revoke and member removal.
- Removal of Sample Rae requires reassignment of two sample horses; successful reassignment updates local ownership so removing the new owner subsequently displays those two horses.
- Copy explicitly simulates the operation and displays an example.test sample URL in the status text. The clipboard is not written. No email, account, live access or live horse is affected.

Controls that replace the sample or change its outcome/delay disable while any local request is pending. No update is applied before the simulated response acknowledges success. Parent owns route registration and settings embedding.

### Verification completed and remaining

Thirteen tests pass across `StableMemberInteractions.test.tsx`, `MembersSettingsPageLab.test.tsx`, and `designSystemConformance.test.ts`. The four new sample tests verify: 50-row/status/empty/embedded behavior; editor focus, rejected-save preservation and success/cancel focus return; invite Escape/Close protection through rejection and retry; and required horse reassignment plus failure/success ownership transfer. Existing concurrent invitation tests still exercise both completion orders. The revoke test now explicitly asserts its inline failure alert.

Scoped ESLint passes across changed production/sample files and the new sample test. Full `tsc --noEmit` passes. A final small correction rendered the revoke failure message inside the dialog and passed the targeted tests/conformance again. No browser dimensions, screenshots, computed contrast, native Tab sequence, reduced-motion behavior, real mail/copy, authorization outcome or database transaction was verified by this agent. Parent browser evidence must identify what it actually covers before promoting any route to verified.

## Browser-driven correction — removal focus and complete email identifiers

The parent's browser pass found two defects that source/component coverage had not caught: successful member removal unmounted the focused row/dialog and left focus on BODY, and the long invitation email inherited the generic title's two-line clamp, hiding its domain on mobile.

`StableMembersSettingsCardView` now provides a persistent named Members group with `tabIndex={-1}` and passes an optional `removalFocusTarget` callback into the real removal view. `RemoveMemberButtonView` provides `finalFocus` to the actual dialog. After acknowledged removal it prefers the surviving target; for cancel it preserves the connected original trigger. The success flag is necessary because a successful local state update may still leave the old trigger momentarily connected during dismissal. Base UI resolves a non-tabbable group to its first tabbable descendant, so the actual local test verifies focus on the surviving Invite member button rather than BODY; cancellation is separately checked to return to the original Remove button.

Invitation titles now use the existing `titleClassName` slot with `line-clamp-none wrap-anywhere`. The full email address is the identifier needed to judge Copy/Resend/Revoke, so truncating it was a functional readability defect. This change adds no new color/type style or generic-card override.

Both targeted suites pass (11 cases), scoped ESLint passes, and full TypeScript check passes after these changes. The parent owns browser recapture and verifies actual mobile wrapping/focus; these results alone do not claim that recapture has passed.
