# Demo film: "Good care is a shared effort"

Product film for Paddock Pilot. Warm countryside editorial treatment, one horse (**Juniper**)
and one farrier visit throughout, every record fictional demo data.

## Files

`docs/paddock-pilot-demo-40s.mp4` — 40.0s, 1920×1080, 24fps, ~22 MB. Not referenced by the app or
the landing page; it is a review and marketing asset. The 5s sunset loop that preceded it was
rejected and has been deleted.

## Beat sheet

| Time | Beat | On-screen text |
|------|------|-----------------|
| 0–6s | Morning stable, then the objects a yard day runs on | "A lot goes into a good day at the yard." / "And it all starts with what you remember." |
| 6–12s | Stable dashboard resolves into the upcoming farrier appointment | "See what's coming up." |
| 12–21s | Juniper's profile, then the previous farrier record before this visit | "Know the care behind every horse." / "Last time · Farrier reset · 14 Sept, 08:15 · Completed" |
| 21–30s | The visit's completed record, then the same record from another member's view | "Keep everyone in the picture." / "Trim completed. Next visit to be arranged." |
| 30–35s | Return to the stable, phone put away | "Good care is a shared effort." |
| 35–40s | Closing card | "Paddock Pilot" / "Your stable, together." / "Create your stable. Add your horse. Invite your friends." |

Every interface frame in the film is a real component render, not a mock-up: the farrier
appointment, Juniper's profile and the completed record all come from the product's own
dashboard, horse detail and event detail screens. Nothing shown is invented functionality —
no chat, no automatic scheduling, no predictions. Interface geometry and labels are untouched.

## Fictional records used

Cedar Ridge Barn, with Juniper (owner Mae Turner, Dutch Warmblood), Atlas (Rae Monroe) and
Meadow (June Hale) from `src/components/dashboard-lab/dashboardLabFixtures.ts`.

- **Upcoming:** Farrier reset · hoof trimming · Sat 3 Oct, 08:15 · Ben Carter · Wash bay · 2 horses.
- **Previous:** Farrier reset · 14 Sept, 08:15 · Completed · Ben Carter · (555) 014-1902 · £95.00 per horse.
- **Completion note:** "Trim completed. Next visit to be arranged."

## Reproducing the record shots

The completed farrier record needs two pieces of lab scaffolding, both committed:

1. `lab-event-farrier-previous` in `src/components/dashboard-lab/dashboardLabFixtures.ts`
   (the completed counterpart to the existing planned farrier fixture), plus Juniper's
   `profileImageUrl` so the real `HorseAvatar` shows the horse.
2. The `?event=<eventId>` search-param override in
   `src/components/page-lab/prototypes/EventDetailPageLab.tsx`, so the lab can render a chosen
   event instead of always the first one:
   `/page-lab/event-detail?event=lab-event-farrier-previous`.

The lab routes are localhost-only (see `src/lib/devAuthBypass.ts`).

## Photography and provenance

Reuses the repository's own imagery from `public/landing-lab/`: `stable-aisle-1600.jpg`,
`field-office-panorama-1600.jpg`, `juniper-portrait-960.jpg`, and the
`public/paddock-pilot-mark.svg` mark. Provenance notes are the ones recorded in
[docs/design/landing/DESIGN.md](design/landing/DESIGN.md) — the hero photograph's license is
not established, and Juniper's replacement portrait was generated in-repo on 2026-09-17.

Palette and type are the shared design system: paper `#fcfbf8`, ink `#30372f`, evergreen
`#285b43`, burgundy `#962f43`, Alegreya and Alegreya Sans.