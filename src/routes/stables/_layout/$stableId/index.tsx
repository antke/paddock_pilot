import { StableDashboard } from '#/components/stables/StableDashboard'
import {
  RouteEntityNotFoundAlert,
  RouteQueryErrorAlert,
} from '#/components/layout/RouteStatusAlert'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQueries } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useLocalDateContext } from '#/lib/useLocalDateContext'

export const Route = createFileRoute('/stables/_layout/$stableId/')({
  component: RouteComponent,
  errorComponent: StableDashboardError,
})

function RouteComponent() {
  const { stableId } = Route.useParams()
  const stableDocumentId = stableId as Id<'stables'>
  const { today } = useLocalDateContext()
  const [
    { data: stable },
    { data: stables },
    { data: horses },
    { data: events },
    { data: overview },
  ] = useSuspenseQueries({
    queries: [
      {
        ...convexQuery(api.stables.get, { id: stableDocumentId }),
        staleTime: Infinity,
      },
      { ...convexQuery(api.stables.list), staleTime: Infinity },
      {
        ...convexQuery(api.horses.list, { stableId: stableDocumentId }),
        staleTime: Infinity,
      },
      {
        ...convexQuery(api.events.listForStable, {
          stableId: stableDocumentId,
        }),
        staleTime: Infinity,
      },
      {
        ...convexQuery(api.userCareOverview.getForCurrentUser, {
          stableId: stableDocumentId,
          today,
        }),
        staleTime: Infinity,
      },
    ],
  })

  if (!stable) {
    return <RouteEntityNotFoundAlert entity="stable" />
  }

  return (
    <StableDashboard
      stable={stable}
      stables={stables}
      horses={horses}
      events={events}
      overview={overview}
      todayKey={today}
    />
  )
}

function StableDashboardError({ reset }: ErrorComponentProps) {
  return (
    <RouteQueryErrorAlert
      reset={reset}
      title="The stable noticeboard couldn’t load"
      description="Check your connection, then try again. Your stable records have not been changed."
    />
  )
}
