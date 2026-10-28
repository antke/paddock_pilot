# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary users are individual horse owners and owners and members of small stables, typically yards with fewer than ten horses. An individual owner can use the complete horse-care workflow without their stable using the app. Stable owners carry broad responsibility for the yard, while members contribute to day-to-day coordination and care.

Horse owners need a dependable history that stays with the horse when it changes stables. Stable participants also need a shared view of yard operations within their access rights. The product is not primarily aimed at large professional sport stables with dedicated operational staff.

## Product Purpose

Paddock Pilot gives horse owners one lasting home for horse information and gives small stables a shared place for yard coordination. It replaces fragmented calendars, messages, notebooks, whiteboards, and memory with accessible schedules, care records, reminders, service-provider information, and shared updates.

Success means owners and members can understand what needs attention, find the context required to act, divide responsibility, and coordinate care without relying on one person to carry the stable's operational memory.

## Positioning

Paddock Pilot combines personal horse care with shared coordination for small, community-run stables. Each horse has one owner and a continuing record independent of where it lives. Connecting a stable adds yard coordination; inviting a carer adds help without requiring stable membership. The same account and horse records work throughout those changes.

## Operating Context

- A yard commonly has fewer than ten horses; this describes the primary usage context rather than a confirmed product limit.
- Owners and members coordinate recurring horse care, stable events, shared appointments, and everyday yard work.
- Users need central access to calendars, messages or updates, horse and stable information, and details for vets and other local service providers.
- Care coordination spans planning the work, recording what happened, and handing useful context to the next person or provider.
- A horse has zero or one current stable placement; a user can belong to several stables. Moving a horse changes its placement, not its identity or history.
- Owners can invite viewer or editor carers independently of stable membership. A current stable admin sees explicitly shared horse records, while ordinary members see shared schedules/status and the basic roster unless separately granted personal horse access.
- Personal horse and care pages list owned horses and invited-carer horses and their records. Stable horse and care pages list their roster and shared records only, including for horse owners who also have private access. Home, Events and Training additionally let users combine their personal calendar with accessible stable calendars; accepted activity participants see their own narrow session view without horse access. My calendar stays active, and each page remembers its own stable filters. The dashboard applies its selection consistently to activity, care/reminder summaries and a deduplicated horse roster; basic roster visibility does not grant profile or clinical access. Global navigation uses fixed daily destinations and a Stables entry. A local stable switch opens stable management pages; navigation never changes existing grants. New care records in Personal default to private with explicit sharing; stable care creation defaults to shared. Stable-scoped page headings show “Page · Stable name”, including with navigation closed; general pages omit a workspace suffix. Combined Events and Training headings omit the workspace; the creation form has its own explicit stable audiences, independent of calendar filters.
- Personal and stable screens use the same canonical activities and results. Event and training creation reuses the calendar source toggles: My calendar is retained and users can share a single activity with several named stables. No selected stable means private to the horse’s owners and authorised carers. Cross-stable sharing requires owner/editor access to every horse; explicit session invitations grant participants a limited activity view. Existing stable-origin sharing remains governed by per-horse placement rules. Stable administrators and owner/editor carers add permitted horses directly; other members invite horses with explicit approval states. Other care forms retain their sharing controls. Staff creations for someone else’s horse are always shared. Sharing history uses a fixed cutoff and never enables future categories automatically.
- An owner, editor carer, or custodian can invite an account person by email as rider or instructor for one confirmed horse and one activity occurrence. Invitations appear in-app; this release sends no invitation email. An accepted rider can record their training session in the same horse training history the owner sees, without becoming a carer. Existing stable sharing still applies; free-text rider names never grant access. See `docs/features/activity-participation.md` for release boundaries.
- Stable owners have wider operational and administrative responsibility, while members contribute within their role and their relationship to horses and records.

## Capabilities and Constraints

- The existing web application includes authenticated accounts, stables, memberships and invitations; horse profiles and care records; events and calendars; reminders; documents; provider details; analysis; onboarding; activity records; and personal subscriptions.
- Horse ownership, carer grants, current placement and record provenance determine access. Stable membership alone does not grant access to private horse records. Enforcement belongs on the server.
- Ownership transfers and claims require the recipient's acceptance. A departing horse keeps its complete history; the former stable loses access to all horse records, including staff contributions. Independent personal carer grants remain separate.
- All users should retain access to the basic stable-coordination feature set. Subscriptions may unlock advanced or premium capabilities. Exact packaging and pricing remain product decisions rather than fixed commitments in this record.
- Centralised communication is a confirmed product need. The current repository demonstrates transactional email and shared records, but does not establish a complete general-purpose messaging model; future work must distinguish shared updates, notifications, and direct messaging rather than assuming they are interchangeable.

## Brand Commitments

- **Paddock Pilot** is the working product name. It may change in the distant future and must not be treated as permanently locked.
- English yard terminology is appropriate.
- No additional identity, voice, geographic, or aesthetic commitment has been established.

## Evidence on Hand

- Product and roadmap evidence: `PLAN.md`, `docs/feature-plan.md`, `docs/monetization-plan.md`, and `docs/access-control-matrix.md`.
- Existing implementation evidence: the route, component, and Convex modules under `src/` and `convex/`.
- Current product mark: `public/paddock-pilot-mark.svg`. It is usable evidence, not a permanent identity constraint.
- Current product demonstrations: `public/landing/stable-command-center.png`, `public/landing/horse-record.png`, and `public/landing/provider-visit.png`.
- No confirmed customer testimonials, case studies, press, adoption figures, or outcome benchmarks are present. Future work must not fabricate them.

## Product Principles

1. **Design for shared responsibility.** Support the owner as the accountable operator while making member contribution clear, useful, and expected.
2. **Keep one operational truth.** Calendars, care context, service information, and updates should be findable by the people who need them.
3. **Fit the reality of a small yard.** Prefer direct, practical coordination over enterprise administration and unnecessary process.
4. **Make basic coordination broadly accessible.** Core stable participation should remain useful without requiring every user to adopt premium capabilities.
5. **Preserve accountability with access.** Shared visibility should coexist with clear role, ownership, and record-level permissions.
