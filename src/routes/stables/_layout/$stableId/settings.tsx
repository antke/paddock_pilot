import {
  isStableSettingsTab,
  StableSettingsPage,
} from '#/components/stables/StableSettingsPage'
import type { StableSettingsTab } from '#/components/stables/StableSettingsPage'
import { RouteQueryErrorAlert } from '#/components/layout/RouteStatusAlert'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQueries } from '@tanstack/react-query'
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
  const [settingsQuery, deletedHorsesQuery, horsesQuery, auditEntriesQuery] =
    useSuspenseQueries({
      queries: [
        convexQuery(api.stableMembers.listWithUsers, { stableId: id }),
        convexQuery(api.horses.listDeleted, { stableId: id }),
        convexQuery(api.horses.list, { stableId: id }),
        convexQuery(api.auditLogs.listForStable, { stableId: id }),
      ],
    })
  const settings = settingsQuery.data
  const deletedHorses = deletedHorsesQuery.data
  const horses = horsesQuery.data
  const auditEntries = auditEntriesQuery.data

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
