import { useId } from 'react'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { ButtonLink } from '#/components/ui/button'
import { TrainingEntryLink } from '#/components/training/TrainingEntryLink'
import type { TrainingEntry } from '#/components/training/trainingCalendarData'
import type { DashboardCommandData } from './dashboardTypes'

export function TodayTrainingCard({ data }: { data: DashboardCommandData }) {
  const headingId = useId()
  const byHorse = new Map<string, Array<TrainingEntry>>()
  for (const entry of data.todayTraining ?? []) {
    const sessions = byHorse.get(entry.horse._id) ?? []
    sessions.push(entry)
    byHorse.set(entry.horse._id, sessions)
  }

  return (
    <DashboardSection
      aria-labelledby={headingId}
      title={<span id={headingId}>Today’s training</span>}
      titleStyle="display"
      actions={
        <ButtonLink
          to="/stables/$stableId/training"
          params={{ stableId: data.stable._id }}
          variant="outline"
          size="sm"
          className="min-h-11"
        >
          View training log
        </ButtonLink>
      }
    >
      {byHorse.size === 0 ? (
        <DashboardEmptyState chrome="flat">
          No scheduled or completed training today.
        </DashboardEmptyState>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[...byHorse.values()].map((entries) => (
            <section
              key={entries[0].horse._id}
              className="grid content-start gap-2"
            >
              <h3 className="text-base font-semibold">
                {entries[0].horse.name}
              </h3>
              {entries.map((entry) => (
                <TrainingEntryLink
                  key={entry.key}
                  entry={entry}
                  stableId={data.stable._id}
                  showHorseName={false}
                />
              ))}
            </section>
          ))}
        </div>
      )}
    </DashboardSection>
  )
}
