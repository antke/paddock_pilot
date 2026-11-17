import { useClaimNavigationSection } from '#/components/layout/navigationSection'
import { AttendingPeople } from './AttendingPeople'
import { useMutation, useQuery } from 'convex/react'
import { useNavigate } from '@tanstack/react-router'
import { ConfirmActionButton } from '#/components/ui/confirm-action'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { RoutePending } from '#/components/layout/RoutePending'
import { RouteEntityNotFoundAlert } from '#/components/layout/RouteStatusAlert'
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
  useClaimNavigationSection(data?.event.training ? 'training' : undefined)
  const removeFromStable = useMutation(api.activitySharing.removeFromStable)
  const navigate = useNavigate()
  const { locale } = useLocale()
  const t = useT()
  if (data === undefined) return <RoutePending />
  if (!data) return <RouteEntityNotFoundAlert entity="event" />
  const { event, horses, records } = data
  const removableStableId =
    'removableStableId' in data ? data.removableStableId : undefined
  return (
    <DashboardPage width="narrow">
      <DashboardPageHeader
        showWorkspace={false}
        title={event.title}
        description={formatEventDateTime(
          date ?? event.date,
          event.time,
          undefined,
          locale,
        )}
        actions={
          removableStableId ? (
            <ConfirmActionButton
              label={t('eventViews.removeShare')}
              title={t('eventViews.removeShareNamed', { title: event.title })}
              description={t('eventViews.removeShareHelp')}
              cancelLabel={t('eventViews.keepEvent')}
              failedLabel={t('eventViews.lifecycleFailed')}
              onConfirm={async () => {
                await removeFromStable({ eventId, stableId: removableStableId })
                await navigate({ to: '/events' })
              }}
            />
          ) : undefined
        }
      />
      <AttendingPeople eventId={eventId} title={event.title} />
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
