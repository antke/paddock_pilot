import { useT } from '#/i18n/LocaleProvider'
import { useId } from 'react'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { ButtonLink } from '#/components/ui/button'
import { TrainingSessionLink } from '#/components/training/TrainingSessionLink'
import { groupTrainingSessions } from '#/components/training/trainingSessions'
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
  const sessions = groupTrainingSessions(data.todayTraining ?? [])

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
      {sessions.length === 0 ? (
        <DashboardEmptyState chrome="flat" spacing="flush">
          {t('dashboard.noTraining')}
        </DashboardEmptyState>
      ) : (
        <div
          className={
            compact ? 'grid gap-3' : 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3'
          }
        >
          {(compact ? sessions.slice(0, 2) : sessions).map((session) => (
            <TrainingSessionLink
              key={session.key}
              session={session}
              stableId={data.stable?._id}
              variant={compact ? 'summary' : 'record'}
            />
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
        {compact && sessions.length > 2 ? ` (${sessions.length})` : ''}
      </ButtonLink>
    </DashboardSection>
  )
}
