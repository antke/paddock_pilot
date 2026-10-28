import { AttendingPeople } from '#/components/events/AttendingPeople'
import { formatEventTime } from '#/components/events/eventDisplay'
import { useQuery } from 'convex/react'
import { RoutePending } from '#/components/layout/RoutePending'
import { ActivitySharing } from '#/components/events/ActivitySharing'
import {
  ActivityPeople,
  MyActivityInvitations,
} from '#/components/events/ActivityPeople'
import { BackLink } from '#/components/ui/back-action'
import { EventParticipation } from '#/components/events/EventParticipation'
import { RecordAudienceLabel } from '#/components/sharing/RecordAudienceLabel'
import { TrainingCompletionSummary } from '#/components/training/TrainingCompletionSummary'
import { CreatorByline } from '#/components/events/CreatorByline'
import { getHorseDisplayName } from 'shared/horses/horseDisplayName'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { useT, useLocale } from '#/i18n/LocaleProvider'
import { formatShortDateKey } from '#/lib/dateDisplay'
import {
  Navigate,
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
} from '@tanstack/react-router'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { EventDetail } from '#/components/events/EventDetail'
import { RouteEntityNotFoundAlert } from '#/components/layout/RouteStatusAlert'
import { Field, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { EventEditAction } from '#/components/events/EventEditAction'
import { useSmallScreen } from '#/lib/useSmallScreen'
import { TrainingCompletionControl } from '#/components/training/TrainingCompletionControl'
import { TrainingRecordCard } from '#/components/training/TrainingRecordCard'
import { getTrainingEntries } from '#/components/training/trainingCalendarData'
import { isDateKey } from 'shared/training/trainingSchema'
import { useLocalDateContext } from '#/lib/useLocalDateContext'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/training/$eventId',
)({
  validateSearch: (search: Record<string, unknown>): { date?: string } => ({
    date:
      typeof search.date === 'string' && isDateKey(search.date)
        ? search.date
        : undefined,
  }),
  component: TrainingSession,
})
function TrainingSession() {
  const { stableId, eventId } = Route.useParams()
  const { date } = Route.useSearch()
  const shared = useQuery(api.activitySharing.detail, {
    eventId: eventId as Id<'events'>,
    stableId: stableId as Id<'stables'>,
  })
  if (shared === undefined) return <RoutePending />
  if (shared)
    return (
      <Navigate
        to="/events/$eventId"
        params={{ eventId }}
        search={{ date }}
        replace
      />
    )
  return <OriginalDetail />
}
function OriginalDetail() {
  const t = useT()
  const { locale } = useLocale()
  const smallScreen = useSmallScreen()

  const { stableId, eventId } = Route.useParams()
  const { date } = Route.useSearch()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { today } = useLocalDateContext()
  const { data } = useSuspenseQuery(
    convexQuery(api.events.getWithHorses, {
      id: eventId,
      stableId: stableId as Id<'stables'>,
    }),
  )
  const { data: permissions } = useSuspenseQuery(
    convexQuery(api.events.getPermissions, { id: eventId as Id<'events'> }),
  )
  const { data: training } = useSuspenseQuery(
    convexQuery(api.training.listForStable, {
      stableId: stableId as Id<'stables'>,
    }),
  )
  if (!data || data.event.type !== 'training')
    return <RouteEntityNotFoundAlert entity="event" />
  if (pathname.endsWith('/edit')) return <Outlet />
  const occurrenceDate = date ?? data.event.date
  const entries = getTrainingEntries({
    events: [data.event],
    records: training.records,
    horses: training.horses,
    start: occurrenceDate,
    end: occurrenceDate,
    today,
  }).filter((entry) => entry.occurrence.startDate === occurrenceDate)
  const completionEntry =
    entries.length === 1 &&
    entries[0].horse.canRecord &&
    occurrenceDate <= today
      ? entries[0]
      : undefined
  const editSearch = {
    date: occurrenceDate,
    horseId: entries.length === 1 ? entries[0].horse._id : undefined,
  }
  return (
    <DashboardPage>
      <DashboardPageHeader
        backAction={
          <BackLink to="/stables/$stableId/training" params={{ stableId }}>
            {t('trainingViews.back')}
          </BackLink>
        }
        title={data.event.title}
        description={
          <>
            <span className="block">
              {formatShortDateKey(occurrenceDate, locale)} ·{' '}
              {formatEventTime(data.event.time, locale)}
            </span>
          </>
        }
        actions={
          permissions?.canManageEvent && !smallScreen ? (
            <>
              {permissions?.canManageEvent && !smallScreen && (
                <EventEditAction
                  eventId={eventId}
                  stableId={stableId}
                  training
                  search={editSearch}
                />
              )}
            </>
          ) : undefined
        }
      />
      <div className="flex min-w-0 items-center justify-between gap-4">
        <div className="min-w-0">
          <CreatorByline name={data.createdByName} />
        </div>
        {completionEntry && (
          <TrainingCompletionControl entry={completionEntry} labelled />
        )}
      </div>
      {permissions?.canManageEvent && smallScreen && (
        <EventEditAction
          search={editSearch}
          eventId={eventId}
          stableId={stableId}
          training
          mobile
        />
      )}
      {data.event.recurrence && (
        <Field className="max-w-xs">
          <FieldLabel htmlFor="training-occurrence">
            {t('trainingViews.sessionDate')}
          </FieldLabel>
          <Input
            id="training-occurrence"
            type="date"
            value={occurrenceDate}
            onChange={(e) => {
              if (isDateKey(e.target.value))
                void navigate({
                  to: '/stables/$stableId/training/$eventId',
                  params: { stableId, eventId },
                  search: { date: e.target.value },
                  replace: true,
                })
            }}
          />
        </Field>
      )}
      {entries.length === 0 && (
        <p role="status">{t('trainingViews.noSession')}</p>
      )}
      {entries.map((entry) => (
        <RecordAudienceLabel
          key={entry.key}
          horseId={entry.horse._id}
          recordId={entry.occurrence.eventId}
          date={entry.occurrence.startDate}
        />
      ))}
      <TrainingCompletionSummary entries={entries} />
      {entries.map((entry) => (
        <TrainingRecordCard
          key={entry.key}
          entry={entry}
          showCompletion={entries.length > 1}
        />
      ))}
      {data.event.recurrence && !data.event.training && (
        <p className="text-sm text-muted-foreground">
          {t('trainingViews.legacyHelp')}
        </p>
      )}
      <EventParticipation eventId={eventId as Id<'events'>} />
      <ActivitySharing eventId={eventId as Id<'events'>} />
      <AttendingPeople eventId={eventId as Id<'events'>} />
      <ActivityPeople eventId={eventId as Id<'events'>} date={occurrenceDate} />
      <MyActivityInvitations eventId={eventId} />
      {data.pendingEventHorses.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {t('trainingViews.pending', {
            horses: data.pendingEventHorses
              .map(
                (row) =>
                  getHorseDisplayName(
                    training.horses.find((horse) => horse._id === row.horseId),
                  ) ?? t('trainingViews.horse'),
              )
              .join(', '),
          })}
        </p>
      )}
      {data.eventHorses.some(
        (row) => row.completionNotes || row.requestedServiceNotes,
      ) && (
        <details className="rounded-row bg-surface p-4">
          <summary className="app-disclosure-trigger cursor-pointer font-semibold">
            {t('trainingViews.earlierNotes')}
          </summary>
          <div className="mt-3 grid gap-3">
            {data.eventHorses
              .filter((row) => row.completionNotes || row.requestedServiceNotes)
              .map((row) => (
                <div key={row._id}>
                  <p className="font-semibold">
                    {getHorseDisplayName(
                      training.horses.find(
                        (horse) => horse._id === row.horseId,
                      ),
                    ) ?? t('trainingViews.horse')}
                  </p>
                  {row.requestedServiceNotes && (
                    <p>{row.requestedServiceNotes}</p>
                  )}
                  {row.completionNotes && <p>{row.completionNotes}</p>}
                </div>
              ))}
          </div>
        </details>
      )}
      <details className="rounded-row bg-card p-4">
        <summary className="app-control-focus min-h-11 cursor-pointer py-2 font-semibold">
          {t('trainingViews.sessionDetails')}
        </summary>
        <div className="mt-4 grid gap-4">
          <EventDetail
            stableId={stableId}
            event={{
              ...data.event,
              date: entries[0]?.occurrence.startDate ?? data.event.date,
              endDate: entries[0]
                ? entries[0].occurrence.durationDays > 1
                  ? entries[0].occurrence.endDate
                  : undefined
                : data.event.endDate,
            }}
            horses={data.horses}
            canManageEvent={permissions?.canManageEvent ?? false}
            showServiceDetails={false}
            showHeader={false}
            showHorses={false}
          />
        </div>
      </details>
    </DashboardPage>
  )
}
