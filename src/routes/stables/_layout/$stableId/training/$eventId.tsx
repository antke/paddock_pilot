import {
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
import { ButtonLink } from '#/components/ui/button'
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
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { today } = useLocalDateContext()
  const { data } = useSuspenseQuery(
    convexQuery(api.events.getWithHorses, { id: eventId }),
  )
  const { data: permissions } = useSuspenseQuery(
    convexQuery(api.events.getPermissions, { id: eventId as Id<'events'> }),
  )
  const { data: training } = useSuspenseQuery(
    convexQuery(api.training.listForStable, {
      stableId: stableId as Id<'stables'>,
    }),
  )
  if (
    !data ||
    data.event.stableId !== stableId ||
    data.event.type !== 'training'
  )
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
  return (
    <DashboardPage>
      <ButtonLink
        to="/stables/$stableId/training"
        params={{ stableId }}
        variant="outline"
        className="justify-self-start"
      >
        Back to training log
      </ButtonLink>
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
      />
      <Field className="max-w-xs">
        <FieldLabel htmlFor="training-occurrence">
          Session date to record
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
      {data.event.recurrence && !data.event.training && (
        <p className="text-sm text-muted-foreground">
          This is a legacy recurring session. Its old shared status does not
          confirm individual dates. Review and record each horse’s session
          below.
        </p>
      )}
      {data.pendingEventHorses.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Awaiting participation confirmation:{' '}
          {data.pendingEventHorses
            .map(
              (row) =>
                training.horses.find((horse) => horse._id === row.horseId)
                  ?.name ?? 'Horse',
            )
            .join(', ')}
          . Their owners can respond from the dashboard.
        </p>
      )}
      {data.eventHorses.some(
        (row) => row.completionNotes || row.requestedServiceNotes,
      ) && (
        <details className="rounded-row bg-surface p-4">
          <summary className="cursor-pointer font-semibold">
            Earlier per-horse notes
          </summary>
          <div className="mt-3 grid gap-3">
            {data.eventHorses
              .filter((row) => row.completionNotes || row.requestedServiceNotes)
              .map((row) => (
                <div key={row._id}>
                  <p className="font-semibold">
                    {training.horses.find((horse) => horse._id === row.horseId)
                      ?.name ?? 'Horse'}
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
      {entries.length === 0 && (
        <p role="status">
          No session starts on this date. Choose a date in this session’s
          schedule.
        </p>
      )}
      {entries.map((entry) => (
        <TrainingRecordCard key={entry.key} entry={entry} />
      ))}
    </DashboardPage>
  )
}
