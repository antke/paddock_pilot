---
version: 1
slug: "src-components-forms-event-eventeditor-tsx"
primary_target: "src/components/forms/event/EventEditor.tsx"
related_targets: ["src/components/forms/event/EventCreationEditor.tsx","src/components/forms/event/EventFormFields.tsx","src/components/dashboard/PendingHorseInvitationList.tsx"]
---

# Event and training destination

## Scope and visitor mode

Operate: event and training creation, with existing-record editing and horse invitation responses as related behavior. Owners, authorised carers and stable participants need to know where a record will appear and whether adding a horse requires approval. Product and permission truth remain in `PRODUCT.md`; visual authority remains the established Stable journal system in `DESIGN.md`.

This is a narrow extension of the incumbent form, with no approved composition reference and no new visual world, tokens or global component rules.

## Job and content order

Lead creation with the labeled Create in selector: Personal followed by named stables available to the user. Keep its visibility explanation permanently visible and programmatically associated with the selector. Personal means private to the horse's owners and authorised carers; stable creation is shared. Creation owns this destination choice; editing retains the existing audience.

Show permission-aware horses for the current destination, using the shared Requires approval badge and explanatory copy for invitation-only choices. Keep horse selection and mandatory inputs in the always-visible first form section, with optional details following the existing disclosure pattern. A selected-horse summary distinguishes directly added horses from invitations. The submit label repeats the destination, naming the stable or identifying a private event/training record.

Event creation can select Training and reveal the existing training fields. Completed training cannot include invitation-only horses. Stable administrators and owner/editor carers can add permitted horses directly; other eligible stable members invite horses through explicit approval states. Server permissions remain authoritative, including rejection of admin-only horse access when editing a private record.

## Chosen direction and memorable moment

Extend the journal through shared fields, select, badge, form actions and alert dialog primitives. Preserve sentence-case labels, semantic theme colors, readable helper text and the incumbent responsive form layout. Do not turn the destination into a separate dashboard or introduce a second visual hierarchy.

The key interaction is a destination switch that would remove selected horses: name the affected horses before confirmation. Cancel keeps the current destination and draft. Confirm changes the destination and removes incompatible horses while retaining the rest of the draft. Provider options follow the destination. Keep selected counts and destination-aware submission text aligned with the current choice.

Related invitation rows use the existing flat record list with horse/event identity, date and separate Approve and Decline actions. Preserve pending feedback, duplicate prevention, recoverable errors, accessible action names, live acknowledgements and focus recovery after a successful row disappears. Organizer edits retain pending invitation rows instead of silently dropping them.

## Constraints and evidence

Preserve labeled keyboard controls, associated visibility guidance, unsaved-draft protection, disabled/pending states and recoverable save failures. Keep approval status explicit in text as well as badge styling. Existing shared primitives own light/dark styling, focus and narrow-screen behavior.

The 2026-10-25 implementation review resolved both reported code findings: private editing rejects a horse available only through stable-administrator access, and organizer editing retains pending invitation rows. The static detector returned no output/findings. These are code-level observations, not evidence of rendered layout or live end-to-end behavior.

After T3 preview timeouts, the repository WebKit workflow passed local Page Lab checks at 1280px English and 390px Polish: destination filtering, cancel/confirm draft preservation, keyboard horse selection, training selection, submit clickability and no horizontal overflow. Screenshots in `.impeccable/review/event-destinations/` were inspected. Only the development-only TanStack launcher was hidden because it covered the mobile submit control; its unrelated inspector error remains recorded separately. Run `node scripts/check-event-destinations.mjs` against the local dev server. Connected creation/edit/invitation browser flows remain unverified; backend tests cover distinct roles.

## Unresolved decisions

No new visual direction is pending. Connected browser verification remains outstanding as described above; local rendered verification passed. This surface record does not certify global design migration or alter root `DESIGN.md`, `PRODUCT.md` or the design sidecar.
