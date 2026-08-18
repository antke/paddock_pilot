# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary users are owners and members of small stables, typically yards with fewer than ten horses. Stable owners carry broad responsibility for the yard, but regular members are active participants who are expected to contribute to day-to-day coordination and care.

Both roles need a dependable shared view of what is happening across the stable. The product is not primarily aimed at large professional sport stables with dedicated operational staff.

## Product Purpose

Paddock Pilot gives a small stable one shared operational home for horse and yard information. It should replace fragmented calendars, messages, notebooks, whiteboards, and memory with accessible schedules, care records, reminders, service-provider information, and shared updates.

Success means owners and members can understand what needs attention, find the context required to act, divide responsibility, and coordinate care without relying on one person to carry the stable's operational memory.

## Positioning

Paddock Pilot is a shared field office for small, community-run stables. It combines horse-centred care records with yard-wide coordination so the owner can remain accountable while members meaningfully share the work. This is distinct from a solo horse tracker and from enterprise stable-management software designed around dedicated staff.

## Operating Context

- A yard commonly has fewer than ten horses; this describes the primary usage context rather than a confirmed product limit.
- Owners and members coordinate recurring horse care, stable events, shared appointments, and everyday yard work.
- Users need central access to calendars, messages or updates, horse and stable information, and details for vets and other local service providers.
- Care coordination spans planning the work, recording what happened, and handing useful context to the next person or provider.
- Stable owners have wider operational and administrative responsibility, while members contribute within their role and their relationship to horses and records.

## Capabilities and Constraints

- The existing web application includes authenticated accounts, stables, memberships and invitations; horse profiles and care records; events and calendars; reminders; documents; provider details; analysis; onboarding; activity records; and personal subscriptions.
- Owners and members both require operational visibility. Administrative and write permissions remain scoped by stable role, record ownership, and relationship to the work; enforcement belongs on the server.
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
