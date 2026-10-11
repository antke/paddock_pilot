import { useT } from '#/i18n/LocaleProvider'
import { useId } from 'react'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { ButtonLink } from '#/components/ui/button'
import { TrainingEntryLink } from '#/components/training/TrainingEntryLink'
import type { TrainingEntry } from '#/components/training/trainingCalendarData'
import type { DashboardActivityData } from './dashboardTypes'
import { useTaskOriginState } from '#/components/layout/mobileTaskNavigation'

export function TodayTrainingCard({
  data,
  compact = false,
  canCreate = true,
}: {
  data: DashboardActivityData
  compact?: boolean
  canCreate?: boolean
}) {
  const t = useT()
  const taskState = useTaskOriginState()

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
      title={<span id={headingId}>{t('dashboard.todayTraining')}</span>}
      titleStyle="display"
      headerLayout="inline"
      actions={
        !compact &&
        canCreate && (
          <>
            <ButtonLink
              to={
                data.stable
                  ? '/stables/$stableId/training/create'
                  : '/events/create'
              }
              params={{ stableId: data.stable?._id ?? '' }}
              search={{
                intent: 'record',
                training: data.stable ? undefined : true,
              }}
              state={taskState}
              action="record"
              size="sm"
              className="min-h-11"
            >
              {t('trainingViews.recordCompleted')}
            </ButtonLink>
          </>
        )
      }
    >
      {byHorse.size === 0 ? (
        <DashboardEmptyState chrome="flat" spacing="flush">
          {t('dashboard.noTraining')}
        </DashboardEmptyState>
      ) : compact ? (
        <div className="grid gap-3">
          {data.todayTraining?.slice(0, 2).map((entry) => (
            <TrainingEntryLink
              key={entry.key}
              entry={entry}
              stableId={data.stable?._id}
              variant="summary"
            />
          ))}
        </div>
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
                  stableId={data.stable?._id}
                  showHorseName={false}
                />
              ))}
            </section>
          ))}
        </div>
      )}
      <ButtonLink
        to={data.stable ? '/stables/$stableId/training' : '/training'}
        params={{ stableId: data.stable?._id ?? '' }}
        variant="link"
        className="min-h-11 justify-self-start px-0"
      >
        {t('dashboard.viewTraining')}
        {compact && (data.todayTraining?.length ?? 0) > 2
          ? ` (${data.todayTraining?.length})`
          : ''}
      </ButtonLink>
    </DashboardSection>
  )
}
