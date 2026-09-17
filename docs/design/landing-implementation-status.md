# Landing rescue implementation

## Latest refinement — photographic opening

User requested a full-width stable photograph, a separate substantial product section, removal of suns, a shared heading alignment, and the exact invitation “Create your stable, add your horse and invite your friends.” Implemented all five. This supersedes the earlier journal composition and two-ornament notes below.

The opening uses the existing warm yard image across the viewport with a contrast overlay. The second green section now contains one coherent horse-profile/care-record representation, retaining the working local status controls. Both narrative headings use the same1280px inner grid. No new eyebrow copy or payment/testing reassurance.

Native visual checks completed at390,820,1280 and1728px. No horizontal overflow; heading left edges matched exactly:22,41,64 and224px respectively. Phone controls verified. Eleven relevant tests passed; TypeScript, scoped ESLint, formatting and production build passed. Delivered design documentation was updated from the final code. No deployment.

## Earlier implementation record

## Current stage

The user selected **A / Field journal** and requested removal of all decorative eyebrows and redundant sublabels. The selected design now powers signed-out `/`. The comparison route preserves B; A now previews the full selected page.

Implemented: editorial hero with one local care example, a short evergreen shared-care section, a cream signup invitation, compact public header and quiet footer. Removed the audience sentence, “One record, there for the next person.” caption, and Notes/Provider sublabels. “Example” remains to identify fictional data. Two small sun motifs are the only ornament. No screenshot gallery, feature trios, plan cards or filler FAQs.

Marketing styles are scoped and intentionally light. Authenticated home, onboarding, providers and all other routes preserve their existing application shell and theme. The signed-out shell change is covered by seven tests.

## Validation

- Full suite: **40 files, 190 tests passed** (2026-09-17).
- Production build, repository ESLint, TypeScript and changed-file formatting passed. The preview route update was included in the final build and typecheck.
- Parent visually inspected the complete page at 1280 × 720: document width/scrollWidth 1280/1280, height about 1521px. Hero, two lower sections and footer were visible through viewport captures. The prior hero-only mobile composition had also been inspected at 390px before selection.
- Primary text/button contrast 10.17:1; supporting text 6.88:1; button hover 6.95:1; reverse body 8.76:1; clay focus against paper 4.54:1.
- Local planned/completed demo verified in earlier native browser inspection and current interaction tests. Signup/sign-in use existing TanStack routes; Plans uses `/pricing`. No real record writes.
- Billing-disabled testing reassurance is conditional and tested for both flag values. Product schema supports the displayed visit, statuses, provider and completion note. Shared-care copy makes no blanket editing-permission claim.
- Detector ran once over completed landing targets. Warnings concern Fraunces popularity and differences from the global app token system; these are intentional in the user-selected marketing direction. A scoped design record now documents the actual new system. Do not describe this as zero detector findings.

## Review scope and remaining check

Independent reviewer found no material defect in supplied source: requested removals, page hierarchy, two ornaments, mobile reflow rules, scoped styling and local state confirmed. **This is source review, not visual approval.** Its screenshot gate returned `recapture`: persisted screenshots could not be obtained through available native capture tools. The earlier native full-page mobile capture was malformed. An adapted independent browser review also failed after a bounded recovery; parent navigation then timed out as well.

Browser recovered on continuation. Parent inspected the complete page at 390px through native viewport captures: document width/scrollWidth 390/390, height1834px; compact header, readable record, photo, both lower sections and footer confirmed. Both demo states work. Plans link opened the existing pricing page and its testing-access section. Signup and sign-in navigation opened the existing Clerk forms; no form was filled or submitted. An adapted independent native review returned **ship for mobile** after inspecting its own390px rendering of the full page; no material findings. Desktop was visually reviewed by the parent and source-reviewed independently. The formal persisted-screenshot gate was substituted with direct native visual inspection because capture persistence was unavailable; this is not claimed as independent desktop visual approval. No deployment was performed.

## Design and provenance

Delivered local system: `docs/design/landing/DESIGN.md`. Brief: `docs/landing-redesign-prompt.md`. User references: `docs/design/landing-moodboard/`. Font source and OFL are recorded in `public/fonts/fraunces/`. The photograph reuses existing optimized repository assets; external source/license provenance was not established and is documented as such.

User-pinned warm country direction and selected A govern future refinement. Do not reintroduce eyebrow text or redundant marketing sublabels. Preserve the authenticated app design; any app-wide refresh is separate work.

Unrelated preexisting changes to `.env.example`, README and email provider files belong to other work and are preserved.

## Completion audit

- User selected A after two code-led first-screen compositions; selected composition preserved.
- Three page movements and quiet footer implemented; one readable HTML example, one photo, two small ornaments; no rejected dashboard-gallery content.
- Desktop1280 and mobile390 inspected with no overflow; both care-example states confirmed.
- Existing signup, sign-in and Plans routes navigate; keyboard activation of the skip link reached #country-main; shell tests protect signed-in and other routes.
- Latest user copy correction applied: “No more searching through old messages, notebooks or post-it notes. Everything you need is in one place, so you can spend more time on what matters.” Focused landing tests3/3 pass after this text-only update; updated paragraph visually confirmed at desktop1280 and mobile390.
- Independent mobile visual review: ship; independent source review found no material defect; parent desktop visual review completed. Scope limitations documented above.
- Local delivered design record and font/photo provenance notes saved. App-wide design untouched.
- No deployment requested or performed. Further aesthetic refinements remain user-directed.
