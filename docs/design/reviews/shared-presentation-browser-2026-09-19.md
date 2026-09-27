# Shared presentation browser confirmation

19 September 2026. Bounded follow-up to the presentation-component and metric/progress source reviews. This checks real shared owners in local samples, not authenticated data or backend persistence. The approved app palette and typography are unchanged.

## Findings and changes

The Style Lab's Juniper selection specimen had `checked` plus a no-op callback. Space focused the native input but could not change selection. This was a specimen defect, not a demonstrated production HorseSelectionCard defect. The specimen now keeps local state. Two consecutive Space presses changed it to unchecked and checked, retained input focus, and showed the shared whole-row focus ring.

The previously corrected allergy wrapping, avatar fallback and metric-strip divider rules lacked rendered edge-state evidence. Existing labs now expose these cases without adding feature-local styling:

- Horse detail's detailed sample includes a long multiword allergy and an unbroken sample identifier.
- Members directory offers explicitly labelled avatar samples: a missing local image, a replacement local app-mark image and the supplementary Unicode name `𠮷野 花子`.
- Style Lab has three-column/six-item and four-column/eight-item metric strips, so row boundaries can be inspected rather than inferred from compiled CSS.

Only these existing lab/specimen files changed in this increment. The shared presentation fixes themselves predate this pass. No real record was saved, removed or sent.

## Browser observations

### Horse profile

At 390px, the actual HorseProfileSection/HorseAllergyBadge composition displayed the full multiword allergy in a 358px-wide, 40.66px-high badge and the unbroken identifier in a 358px-wide, 57.98px-high badge. Both computed normal whitespace and `overflow-wrap: anywhere`; the document stayed 390px wide. The light screenshot shows every allergy and the following notes without clipping.

At 1280px the document stayed 1280px wide. Both long samples fit on single lines within the Notes section; the unbroken sample moved to the following badge row. Identification values, long insurance details and notes remained contained. The notes computed Alegreya Sans at 17px.

A dark 390px observation retained the 390px document width and readable neutral badge treatment. Its screenshot only includes the beginning of the last allergy and is supplemental theme evidence, not a full-section screenshot.

### Member identities

The real StableMembersPage/StablePersonCard/UserAvatar composition showed `MT` after the deliberately missing local photo failed, with a 36×36px avatar footprint. Changing the sample image to `/paddock-pilot-mark.svg` on the same row loaded an image with natural width 150 and empty decorative alt text; the footprint stayed 36×36px. Other rows retained `AM` and the intact `𠮷花` initials.

At 320px in dark mode, all three identity rows remained within the viewport; document width was 320px. Repeating available → broken returned Mae's initials. The local app mark is explicitly identified as sample imagery, not a person's actual portrait. The normal directory scenarios remain available.

### Metric strips

Measured the rendered default breakpoint/inset configuration:

| Viewport | Three-column strip      | Four-column strip      | Divider result                                                                                      |
| -------- | ----------------------- | ---------------------- | --------------------------------------------------------------------------------------------------- |
| 320px    | One column              | One column             | Every item has 0px left border and padding                                                          |
| 768px    | Three columns, two rows | Two columns, four rows | First item of every row has 0px border/padding; subsequent columns have 1px border and 20px padding |
| 1365px   | Three columns, two rows | Four columns, two rows | The divider resets at each row start, including item 5 of the four-column strip                     |

Document widths matched all three viewports. Screenshots and the saved measurements confirm the previously source-only parent-owned divider correction. This is a shared specimen check; dormant legacy consumers are not reclassified as live routes. The optional `md` breakpoint and compact inset were not visually exercised in this pass.

### Keyboard and dialog checks

- Horse-sex radio group: ArrowDown from Mare selected Gelding, moved focus to it and updated the roving tab index. The extra native inputs seen in the DOM snapshot have `aria-hidden="true"` and `tabindex="-1"`; they are form plumbing, not a verified duplicate-accessibility defect.
- Shared Add care record dialog: opening focused Title. Shift+Tab from Title settled on Close; Tab from Close settled on Title. Escape removed the dialog and restored its trigger. Immediate reads briefly observed Base UI focus guards and the closing transition; settled observations confirmed the final states.
- The corrected horse checkbox responds to repeated Space and has a visible full-row keyboard ring. This does not replace long-name/disabled selection testing in every consuming form.

## Evidence

Artifacts directory: `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/shared-presentation/`.

- `horse-allergies-390.jpg`, `horse-allergies-1280.jpg`
- `horse-allergies-390-dark.jpg` — partial section, as qualified above
- `members-avatar-1280.jpg`, `members-avatar-320-dark.jpg`
- `metrics-320.jpg`, `metrics-768.jpg`, `metrics-1365.jpg`
- `metric-measurements.json`
- `horse-selector-keyboard-1365.jpg`

All are actual browser captures. The palm graphic in the header is the development-only TanStack Devtools launcher, not product decoration. No screenshots were retouched. One avatar selection was reset by hot reload during fixture editing; the sequence was repeated after source freeze.

## Checks and remaining scope

Eight existing focused tests pass across MembersDirectoryPageLab, UserAvatar and PresentationComponents. Scoped formatting and lint pass. Full TypeScript checking and the production build pass. The Impeccable detector returned no findings for the three changed specimen files; the whitespace check also passes. The 542-test/110-file full-suite result belongs to the earlier checkpoint and was not rerun for this specimen increment.

Remaining: authenticated consumers and real permissions/persistence, full assistive-technology testing, enlarged text, OS reduced motion, exhaustive contrast/performance, disabled/long-name selection consumers, alternate metric configuration and actual print pagination. No complete project-wide accessibility or visual claim is made from these observations.

The browser was left in Light at its normal 1280×720 viewport on `/style-lab#metric-strip-specimen`; temporary viewport overrides were reset.
