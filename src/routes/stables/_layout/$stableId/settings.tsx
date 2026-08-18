import { StableSettingsPage } from '#/components/stables/StableSettingsPage'
import type { StableSettingsTab } from '#/components/stables/StableSettingsPage'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/stables/_layout/$stableId/settings')({
  validateSearch: (
    search: Record<string, unknown>,
  ): { tab?: StableSettingsTab } => ({
    tab: isStableSettingsTab(search.tab) ? search.tab : undefined,
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId } = Route.useParams()
  const { tab } = Route.useSearch()

  const { data: settings } = useSuspenseQuery(
    convexQuery(api.stableMembers.listWithUsers, {
      stableId: stableId as Id<'stables'>,
    }),
  )
  const { data: deletedHorses } = useSuspenseQuery(
    convexQuery(api.horses.listDeleted, {
      stableId: stableId as Id<'stables'>,
    }),
  )
  const { data: horses } = useSuspenseQuery(
    convexQuery(api.horses.list, {
      stableId: stableId as Id<'stables'>,
    }),
  )
  const { data: auditEntries } = useSuspenseQuery(
    convexQuery(api.auditLogs.listForStable, {
      stableId: stableId as Id<'stables'>,
    }),
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

function isStableSettingsTab(value: unknown): value is StableSettingsTab {
  return (
    value === 'overview' ||
    value === 'members' ||
    value === 'providers' ||
    value === 'deleted-horses' ||
    value === 'activity'
  )
}
