---
version: 1
slug: "src-routes-horses-horseid-manage-tsx"
primary_target: "src/routes/horses/$horseId/manage.tsx"
related_targets: ["src/components/ownership/HorseManagement.tsx","src/routes/horses/index.tsx","src/routes/horses/create.tsx","src/routes/horses/$horseId/edit.tsx","src/routes/horses/deleted.tsx","src/routes/onboarding.tsx","src/routes/horse-invitations/$token.tsx","src/components/ownership/PersonalHorses.tsx","src/components/ownership/PersonalHorseForm.tsx","src/components/ownership/PersonalOnboarding.tsx","src/components/ownership/HorseInvitation.tsx","src/routes/page-lab/ownership.tsx"]
---

# Horse ownership and placement

## Scope and visitor mode

Operate: `/horses/$horseId/manage`, with the personal horse collection, creation/editing, deletion recovery, onboarding entry and invitation response as related surfaces. The audience is an owner managing one horse and the people helping with its care. Product and access truth remain in `PRODUCT.md`; visual authority remains the existing Stable journal system in `DESIGN.md`.

## Job and content order

Help the owner understand where the horse is, who can help, and the consequences of the next change. Keep management in one readable column: current placement and departure review; people with access and invitations; separate ownership transfer; placement history when present; deletion last. Use backend capabilities to expose available actions, with the custodian claim flow occupying the access section when applicable.

The personal collection leads with horse identity, current placement and owned/shared context, followed by care and upcoming appointment occurrences. View all opens the personal Appointments route with search, filters and a month calendar; historical rows retain their frozen horse context. Creation and editing reuse the existing horse form. Entry and empty states lead directly to adding a horse; stable setup remains an available path. Invitation response states make acceptance, decline, processing and availability explicit.

## Chosen direction and memorable moment

Extend the incumbent app through shared sections, fields and actions. Keep the horse identity above the working content, sentence-case headings and wrapping controls. Preserve the same section order on phones. The memorable interaction is the expanded departure review inside current placement: the affected future appointments and selectable tasks are visible before confirmation. Access invitations and transfer invitations remain distinguishable; transfer copy explains the recipient's acceptance step.

## Constraints and evidence

Keep labels, keyboard focus, pending feedback and recoverable mutation failures. Shared Select controls own the field width and caret; long names and actions wrap without squeezing the control. Delete horse names the horse and 14-day deadline in a confirmation dialog, then links into the existing recovery route.

The DEV-only `/page-lab/ownership` fixture reuses `HorseManagementView`, `DepartureReviewView`, `PersonalContactsView`, `HorseInvitationView` and `PersonalAppointmentsView` with synthetic data and local callbacks. The 2026-10-07 implementation resolves the accepted critique’s deletion wording/protection, explicit move/access context, invitation recovery, full appointment browsing, local feedback and related copy issues. The browser pass inspected desktop management/calendar, 390px management/contact editing/appointment list/invitation recovery, and Polish management/deletion confirmation. A misplaced desktop carer-select caret was fixed in the bounded polish pass and visually confirmed.

The earlier `.impeccable/review/desktop.jpg` and `mobile.jpg` remain evidence of the original narrow review; they do not show this follow-up implementation. The backend was deployed to development `aware-llama-765` on 2026-10-07. The wider authenticated paths still need connected acceptance testing. Do not present the fixture as proof of live email, account switching, persistence or background transition completion.

## Unresolved decisions

No new visual direction is pending. The existing global sidecar predates current `DESIGN.md` tokens and remains outside this surface-only update; no global token or visual-system rewrite was made.
