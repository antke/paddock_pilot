import { AttendingPeople } from './AttendingPeople'
import { useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { RoutePending } from '#/components/layout/RoutePending'
import { RouteEntityNotFoundAlert } from '#/components/layout/RouteStatusAlert'
import { BackLink } from '#/components/ui/back-action'
import { useLocale, useT } from '#/i18n/LocaleProvider'
import { formatEventDateTime } from './eventDisplay'

/** Activity-only projection: no horse profile links or broad edit controls. */
export function SharedActivityDetail({
  eventId,
  date,
}: {
  eventId: Id<'events'>
  date?: string
}) {
  const data = useQuery(api.activitySharing.detail, { eventId })
  const { locale } = useLocale()
  const t = useT()
  if (data === undefined) return <RoutePending />
  if (!data) return <RouteEntityNotFoundAlert entity="event" />
  const { event, horses, records } = data
  return (
    <DashboardPage>
      <DashboardPageHeader
        showWorkspace={false}
        title={event.title}
        backAction={
          <BackLink to={event.type === 'training' ? '/training' : '/events'} />
        }
        description={formatEventDateTime(
          date ?? event.date,
          event.time,
          undefined,
          locale,
        )}
      />
      <AttendingPeople eventId={eventId} />
      <DashboardSectionCard>
        <p>{horses.map((horse) => horse.name).join(' · ')}</p>
        {event.location && <p>{event.location}</p>}
        {event.description && (
          <p className="whitespace-pre-wrap">{event.description}</p>
        )}
        {event.training && (
          <p>
            {event.training.activities
              .map((activity) => t(`training.activities.${activity}`))
              .join(' · ')}
          </p>
        )}
        {records
          .filter((record) => !date || record.date === date)
          .map((record) => (
            <div key={record._id} className="grid gap-2">
              <p>
                {formatEventDateTime(
                  record.date,
                  event.time,
                  undefined,
                  locale,
                )}{' '}
                · {t(`training.status.${record.status}`)}
              </p>
              {record.outcome && (
                <p className="whitespace-pre-wrap">{record.outcome}</p>
              )}
            </div>
          ))}
      </DashboardSectionCard>
    </DashboardPage>
  )
}
