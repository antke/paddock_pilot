# Event list — dense, empty and filter transition confirmation

19 September2026. Parent browser inspection of actual `EventTable` through `/page-lab/event-list`. `EventListPageLab.tsx` now adds a DEV + fixture-only Sample schedule control: standard, busy50titles and empty. This expands the existing actual-view specimen; it does not change production event-list semantics or invoke a backend.

## Observed states

- At390, the busy sample displayed50results with no horizontal page overflow; document width stayed390. Long event titles clamped visually under the existing row treatment. The busy desktop1280 composition was also inspected.
- Searching No such sample appointment produced zero results. Switching the sample source to Empty retained Clear all while that filter remained active.
- Enter on Clear all removed the filter, revealed the actual empty title/description and returned focus to Search. Moving focus to Sample schedule and continuing by Tab allowed the inactive empty filter controls to disappear: no search input remained, and focus reached Add event.
- The sample was returned to Standard. No event link, Add event destination or live mutation was activated.

The active-filter→source-empty→Clear all path above is directly observed browser evidence. The separate source-disappearance case whose only retention reason is focus has regression evidence; this report does not reclassify it as a newly performed native browser observation.

## Captures

Real parent-inspected viewport captures:

- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/event-list-confirmation/dense-390.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/event-list-confirmation/empty-390.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/event-list-confirmation/dense-1280.jpg`

## Validation and scope

The existing six ListSourceTransitions tests pass (`/tmp/paddock-event-list-source-tests.log`); scoped ESLint passed and the specimen was formatted. No full-suite or production-build rerun is claimed by this report.

Owners: `src/components/events/EventList.tsx`, its shared filter/list owners, and `src/components/page-lab/prototypes/EventListPageLab.tsx`. This narrowly supersedes the [event-family report's](event-family-2026-09-18.md) outstanding empty/dense sample state and adds the specific filter transition above. It does not supersede other event-family limitations.

Authenticated queries/permissions, live reactive updates, actual event destinations, every filter combination, physical touch, assistive-technology speech, enlarged text, OS reduced motion and full contrast/performance remain separate boundaries. Clamped titles observed here are not proof of every full-title accessibility exposure. No whole route is marked complete.
