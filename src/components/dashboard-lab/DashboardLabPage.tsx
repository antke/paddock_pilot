import { NoStablesPrompt } from '#/components/stables/NoStablesPrompt'
import { LabPageHeader, LabPageShell } from '#/components/lab/LabChrome'
import { StableCommandCenter } from '#/components/dashboard/command-center/StableCommandCenter'
import { isDevAuthBypassEnabled } from '#/lib/devAuthBypass'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { createDashboardLabData } from './dashboardLabData'
import { createDashboardLabFixtureData } from './dashboardLabFixtures'

export function DashboardLabPage() {
  if (isDevAuthBypassEnabled()) {
    return <DashboardLabFixturePage />
  }

  return <DashboardLabLivePage />
}

function DashboardLabLivePage() {
  const { data: stables } = useSuspenseQuery(convexQuery(api.stables.list))
  const { data: events } = useSuspenseQuery(convexQuery(api.events.list))
  const activeStable = stables[0]

  if (!activeStable) {
    return (
      <NoStablesPrompt>
        Create a stable to try the dashboard lab layouts.
      </NoStablesPrompt>
    )
  }

  return (
    <DashboardLabData
      stables={stables}
      events={events}
      activeStable={activeStable}
    />
  )
}

function DashboardLabFixturePage() {
  const data = createDashboardLabFixtureData()

  return (
    <LabPageShell>
      <LabPageHeader
        title="Stable-first dashboard concepts"
        description="Dev fixture data is active for visual review."
      />

      <StableCommandCenter data={data} />
    </LabPageShell>
  )
}

function DashboardLabData({
  stables,
  events,
  activeStable,
}: {
  stables: Array<Doc<'stables'>>
  events: Array<Doc<'events'>>
  activeStable: Doc<'stables'>
}) {
  const { data: overview } = useSuspenseQuery(
    convexQuery(api.userCareOverview.getForCurrentUser, {
      stableId: activeStable._id,
    }),
  )
  const { data: horses } = useSuspenseQuery(
    convexQuery(api.horses.list, { stableId: activeStable._id }),
  )
  const data = createDashboardLabData({
    stable: activeStable,
    stables,
    events,
    horses,
    overview,
  })

  return (
    <LabPageShell>
      <LabPageHeader
        title="Stable-first dashboard concepts"
        description="Soft grouped dashboard layout for tuning the final dashboard chrome."
      />

      <StableCommandCenter data={data} />
    </LabPageShell>
  )
}
