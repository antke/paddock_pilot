---
target: navigation refactor (horse profile, stables list, home, reminders)
total_score: 27
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 4
timestamp: 2026-11-02T16-03-36Z
slug: src-components-horses-horsedetail-tsx
---

# Navigation refactor critique (uncommitted, 69 files)

Method: dual-agent (A: a181c089cff25dd50 · B: ac2fc576b52ef6599). Score 27/40.
P1: stables list name-only link (StableCard.tsx StableGatewayCard); Horses hidden in More (stableDestinations.ts:71); five edit entries on horse profile; Change photo caption shifts hero (16px desktop, 24px phone, title pushed 40px right).
P2: reminder "Complete and schedule next" always visible (+52px row on phone, wraps to 2nd line); Edit care information label/location mismatch; edit links indented 9-29px off value column; phone Home shows filled Add event + FAB (TodayBriefingCard !compact removed); 4-button desktop hero with Add record; Change status min-h-11 stretches status cell; stables row actions aligned to location line.
P3: hero Edit horse/Analysis ignore stableId; DropdownMenuLinkItem half adopted.
Detector: 0 findings across 45 files.
