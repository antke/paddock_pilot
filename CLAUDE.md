# Paddock Pilot: agent guide

## Sources of truth (read, don't copy)
- **DESIGN.md** owns the app's visual system. Its YAML frontmatter holds the tokens
  (colors, typography roles, rounded, spacing, components); the prose holds the named
  rules. The impeccable skill reads and rewrites this file and checks code against it,
  so never restate its values here or in code comments. Cite a rule by name instead.
- **PRODUCT.md** owns audience and product context (impeccable format).
- **docs/design/landing/DESIGN.md** owns the public landing pages, not the app.
- **.cursorrules** owns Convex conventions.

## Which design skill
- Work inside the signed-in app (refine, extend, add a screen): `impeccable`. DESIGN.md
  is the brief and wins every conflict.
- `frontend-design` is for blank-slate surfaces only (landing studies, a new world).
  Its readability and copy advice applies everywhere, but its "AI tells" list does not
  override DESIGN.md: dot-separated meta lines, SeeAllLink's list icon, the
  paper/serif palette and Alegreya are deliberate here.

## Use the house component
| Need                        | Use                                                          |
|-----------------------------|--------------------------------------------------------------|
| Page + title                | `DashboardPage` (`width="narrow"` for route forms)           |
| Panel and its title         | `DashboardSectionCard` (`surface="canvas"` for a page's one list) |
| Group inside a panel        | `DashboardSubsection` / `DetailReferenceGroup`               |
| Heading row with actions    | `DashboardInlineHeader`                                      |
| Muted label / metadata      | `TextLabel`, `DashboardMetaList`                             |
| Read-only facts             | `DetailReferenceList` + `DetailReferenceField`, `DetailGrid` |
| Record rows                 | `DashboardItemCard`, `DashboardItemList`                     |
| Form field                  | `Field` > `FieldLabel` + control + `FieldDescription` + `FieldError` |
| Form sections               | `FormSection` (first one `collapsible={false}`), `FormOptionalTag` |
| Route form / submit row     | `RouteFormCard`, `FormSubmitActions`                         |
| Add / edit a record         | `CreateRecordDialog` / `EditRecordDialog`                    |
| Delete                      | `RecordRemoveAction`                                         |
| Create/edit/delete buttons  | `Button action="create" \| "edit" \| "delete"`                |
| List search + filters       | `ListFilterBar`                                              |
| "All …" link                | `SeeAllLink`                                                 |

If nothing fits, extend the closest primitive in `src/components/ui` or the owner above.
Don't style a one-off locally.

## Hierarchy and readability
- Describe text by its DESIGN.md typography role (`display`, `headline`, `title`, `body`,
  `record-body`, `control`, `action`, `label`), never by pixel size.
- Heading levels follow The Shared Type Rule and the Typography section: page, section,
  panel (serif), then nested group (sans). Never skip a level or write a raw `<h*>`.
- Feature code doesn't choose text sizes, weights or tracking. The primitive does.
  A missing role is a gap in the primitive, so fix it there.
- Labels sit above controls in sentence case. Required marks come from `required`,
  never from text. Placeholders are examples ("e.g. …").
- Rows and headers keep the order: identity, description, metadata, actions.

## Layout and actions
Follow DESIGN.md's named rules; the ones most often missed: Action Height, Alike Size,
Structure (borders), Canvas List, Section Ownership, Add / Add Weight, Pencil, Row Action.

## Verify UI changes
- `pnpm test` (includes `designSystemConformance.test.ts`)
- `pnpm test:forms:webkit` after shared form layout changes
- `node .browser-checks/alike-dimensions.mjs` after control or row changes
- `pnpm test:e2e` after changing who can do what (permissions, dates, ownership):
  multi-user journeys against a disposable Convex deployment. Setup: `e2e/README.md`
- Look at the result in light and dark, at desktop width and at 390px
