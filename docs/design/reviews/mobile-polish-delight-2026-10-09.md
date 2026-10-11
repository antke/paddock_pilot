# Mobile polish and interaction feedback

Implemented as two passes, preserving the established typography, palette and page organisation. No new runtime dependency, backend behaviour, permissions or data model changes.

## Pass 1: touch and entry

| Finding                                                          | Change                                                                                          | Shared coverage                                                  |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Autocomplete arrow was 32px; compact menus had no touch minimum  | 44px mobile/coarse-pointer controls and menu rows; suggestions bounded by available viewport    | Horse owner/breed/provider inputs, overflow and action menus     |
| Filter removal relied on an expanded target clipped by its badge | Physical 44px remove buttons within their own chip; long labels truncate                        | Search/filter lists across records, care, documents and analysis |
| Analysis and earlier-notes summaries had little clickable space  | Shared full-width mobile disclosure target and keyboard outline                                 | Analysis, training detail and record disclosures                 |
| Search/inline fields retained smaller text than route forms      | All mobile text-entry controls use 16px type                                                    | Inline, search, route and dialog forms                           |
| Dense calendar nesting can shrink day widths below 44px          | Compact selectable calendars recover surrounding mobile space to maintain a 318px working width | Events, training month and horse history calendars               |
| Stacked radio/checkbox rows could overlap expanded hit areas     | Reserve 44px row height around existing visual controls                                         | Recurrence options, analysis selections and shared form fields   |
| Some contact/document actions were only text-height              | Larger mobile contact targets and an explicit document action target                            | Care contacts, stable providers and retained documents           |

Desktop fine-pointer controls retain their established geometry. Dense timeline overview marks remain domain-specific controls rather than receiving overlapping expanded targets; their separate date/navigation controls remain available.

## Pass 2: feedback

Every action should respond immediately, and saved work should feel certain.

- Buttons: 120ms pressed colour feedback and a small depression; navigation and calendar selection stay anchored.
- Tabs/navigation: 160ms state feedback with existing selected styling.
- Floating action menu: plus rotates into its open state; anchored popup settles in over 220ms. Exits use 140ms.
- Dialogs: 200ms entrance; mobile full-screen forms preserve viewport sizing, scrolling, focus and existing keyboard handling.
- Disclosures: 180ms shared collapse timing. Native details use progressive enhancement, with instant fallback where unsupported.
- Confirmation: existing success-toast icons and the training record's acknowledged saved state receive a short check response. Existing mutation timing, errors and Undo behaviour are unchanged.
- Reduced motion: added spatial effects and confirmation animation are removed, while immediate state and success feedback remain visible.

## Verification

- 160 existing tests passed across 26 focused test files: shared UI, menus, navigation, filtering, calendars, training records, horse actions/owner suggestions, localisation, forms, analysis and onboarding/ownership.
- TypeScript, ESLint for affected TypeScript files, production build and whitespace checks passed.
- Rendered the actual shared components in an isolated local fixture, without authentication or backend requests. The temporary fixture and its server were removed afterward.
- Checked 320, 390, 412, 768 and 1440px widths; light/dark appearance and English/Polish shared controls.
- Measured 44px filter-remove buttons, autocomplete arrow, menu rows, tab minimums and disclosure height. Calendar day widths were at least 44.14px at 320px; no horizontal page overflow in the fixture.
- Desktop inputs measured 40px high with 15px text, and the autocomplete trigger remained 32px. Mobile inputs measured 44px high with 16px text.
- A mobile record dialog filled 390×844px; at the 768px boundary it returned to the 672px desktop dialog width.
- Verified menu Escape/focus restoration, reopening, opening a form from the action menu, native disclosure expansion, and fixture submission with confirmation and no remaining dialogs/menus.

### Remaining device/path verification

The app browser remained signed out. This is component-level rendered verification, not a completed signed-in walkthrough of every role and route. Actual Android/iOS keyboard behaviour and OS-level reduced-motion emulation were not exercised; existing viewport tests and the reduced-motion CSS paths were checked. Complete the signed-in personal/stable walkthrough and real-phone keyboard check before production sign-off.
