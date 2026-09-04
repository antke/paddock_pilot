import {
  isStableSettingsTab,
  StableSettingsPage,
} from '#/components/stables/StableSettingsPage'
import type { StableSettingsTab } from '#/components/stables/StableSettingsPage'
import { RouteQueryErrorAlert } from '#/components/layout/RouteStatusAlert'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/stables/_layout/$stableId/settings')({
  validateSearch: (
    search: Record<string, unknown>,
  ): { tab?: StableSettingsTab } => ({
    tab: isStableSettingsTab(search.tab) ? search.tab : undefined,
  }),
  component: RouteComponent,
  errorComponent: StableSettingsError,
})

function RouteComponent() {
  const { stableId } = Route.useParams()
  const { tab } = Route.useSearch()

  const id = stableId as Id<'stables'>
  const { data: settings } = useSuspenseQuery(
    convexQuery(api.stableMembers.listWithUsers, { stableId: id }),
  )
  const { data: deletedHorses } = useSuspenseQuery(
    convexQuery(api.horses.listDeleted, { stableId: id }),
  )
  const { data: horses } = useSuspenseQuery(
    convexQuery(api.horses.list, { stableId: id }),
  )
  const { data: auditEntries } = useSuspenseQuery(
    convexQuery(api.auditLogs.listForStable, { stableId: id }),
  )

  return (
    <StableSettingsPage
      initialTab={tab}
      settings={{
        ...settings,
        horses: [...horses, ...deletedHorses],
        deletedHorses,
        auditEntries,
      }}
    />
  )
}

function StableSettingsError({ reset }: ErrorComponentProps) {
  return (
    <RouteQueryErrorAlert
      reset={reset}
      title="Stable settings couldn’t load"
      description="Check your connection, then try again. No stable settings have been changed."
    />
  )
}
