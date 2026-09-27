# Training log

Training log is a separate stable feature at `/stables/$stableId/training`, also available in a Training tab beside Activity on each horse's profile. The horse tab stays scoped to that horse in both week and month views, hides horse-selection controls, and preselects the horse when adding a session. Events retains appointments, care visits and competitions. Existing `type: training` records appear in Training log automatically; original IDs, notes and links remain valid. No destructive data migration is required. Records previously filed under `other` are not guessed or reclassified.

## Shared implementation

The event editor, horse selection, provider input, recurrence rules, calendar primitives and detail layout are reused. Training metadata extends the existing event document. `trainingRecords` stores one result for each event, horse and occurrence start date, including activities, duration, rider, focus, outcome, next focus, author and timestamps. A retry updates the same record rather than adding a duplicate.

The calendar offers Week (horse rows, day columns), Month and a mobile agenda. Horse multi-selection, activity and status filters apply to the calendar. The view preference is remembered locally. Colours encode activities and labelled icons encode status.

## Completion and access

Stable members can read stable training. Only a horse owner or stable admin can record its completion. Creating and editing a shared schedule retains event permissions and the existing invitation flow. A member cannot confirm another owner's horse by selecting Completed in the creation form; only confirmed horses receive initial records.

Recurring plans do not imply completed work. Initial completion applies only to the selected date. Past plans without a result show Needs confirmation. Legacy one-off completion is preserved; legacy recurring completion does not establish completion of individual dates. Earlier per-horse notes remain available in the session detail.

Recorded history survives withdrawal. Horses in deleted-horse storage are hidden and recoverable; permanent horse deletion removes their training records. Schedules with recorded history cannot be moved or have their recurrence rewritten; create a new schedule instead. Per-horse outcomes can still be corrected, with audit entries.

## Integration and verification

Training is excluded from ordinary event lists, care summaries and care-cadence calculations. Individual recorded sessions appear in the horse timeline. Stable and signed-in home dashboards show Today’s training, grouped by horse and limited to scheduled/completed sessions for the current local day. Cancelled/skipped sessions and horses without training are excluded. The dashboard reuses the calendar cards and the same occurrence/record projection. The basic training overview does not depend on premium analysis.

Automated coverage exercises recurrence isolation, ownership, retry safety, legacy history, domain separation, withdrawal retention, date windows, multi-horse filtering and view switching. `/page-lab/training` provides a preview with sample records and the production editor; saves there are local to that preview.

Further refinement can add structured exercise tags, horse-specific goals, future-only changes to a recurring schedule, and more advanced progress analysis. Current focus and next-focus inputs are free text.
