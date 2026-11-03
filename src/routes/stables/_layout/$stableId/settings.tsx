import { useT } from '#/i18n/LocaleProvider'
import {
  isStableSettingsRelocatedTab,
  isStableSettingsTab,
  stableSettingsRelocatedTabs,
  StableSettingsPage,
} from '#/components/stables/StableSettingsPage'
import type {
  StableSettingsRelocatedTab,
  StableSettingsTab,
} from '#/components/stables/StableSettingsPage'
import { RouteQueryErrorAlert } from '#/components/layout/RouteStatusAlert'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/stables/_layout/$stableId/settings')({
  validateSearch: (
    search: Record<string, unknown>,
  ): { tab?: StableSettingsTab | StableSettingsRelocatedTab } => ({
    tab:
      isStableSettingsTab(search.tab) ||
      isStableSettingsRelocatedTab(search.tab)
        ? search.tab
        : undefined,
  }),
  // Members and Providers now live on People and Contacts. Replace the old
  // entry so browser Back returns to the page that linked here.
  beforeLoad: ({ params, search }) => {
    if (isStableSettingsRelocatedTab(search.tab)) {
      throw redirect({
        to: '/stables/$stableId/stable',
        params: { stableId: params.stableId },
        search: { tab: stableSettingsRelocatedTabs[search.tab] },
        replace: true,
      })
    }
  },
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
      initialTab={isStableSettingsTab(tab) ? tab : undefined}
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
  const t = useT()

  return (
    <RouteQueryErrorAlert
      reset={reset}
      title={t('stables.settingsLoadFailed')}
      description={t('stables.settingsLoadFailedHelp')}
    />
  )
}
