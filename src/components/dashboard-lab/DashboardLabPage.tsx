import { ReferenceStudiesPage } from './ReferenceStudiesPage'
import { getReferenceStudy } from './referenceStudies'
import { NoStablesPrompt } from '#/components/stables/NoStablesPrompt'
import { LabPageHeader, LabPageShell } from '#/components/lab/LabChrome'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'
import { useLocalDateContext } from '#/lib/useLocalDateContext'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { createDashboardLabData } from './dashboardLabData'
import { createDashboardContainmentFixture } from './dashboardContainmentFixtures'
import {
  DashboardContainmentNavigation,
  DashboardContainmentStudy,
  isSoftSectionStudy,
} from './DashboardContainmentStudy'

export function DashboardLabPage({ version = '1' }: { version?: string }) {
  const devAuthBypassEnabled = useDevAuthBypassEnabled()
  const referenceStudy = getReferenceStudy(version)
  if (referenceStudy) return <ReferenceStudiesPage study={referenceStudy} />

  if (devAuthBypassEnabled) {
    return <DashboardLabFixturePage version={version} />
  }

  return <DashboardLabLivePage version={version} />
}

function DashboardLabLivePage({ version }: { version: string }) {
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
      version={version}
      stables={stables}
      events={events}
      activeStable={activeStable}
    />
  )
}

function DashboardLabFixturePage({ version }: { version: string }) {
  const data = createDashboardContainmentFixture()

  return (
    <LabPageShell>
      <LabPageHeader
        title={
          isSoftSectionStudy(version)
            ? 'Soft sections — refinements'
            : 'Dashboard grouping demos'
        }
        description="Compare the same busy, fictional yard across each version. Calendar days and Show all work; record links lead to the app."
      >
        <DashboardContainmentNavigation version={version} />
      </LabPageHeader>

      <DashboardContainmentStudy data={data} version={version} />
    </LabPageShell>
  )
}

function DashboardLabData({
  version,
  stables,
  events,
  activeStable,
}: {
  version: string
  stables: Array<Doc<'stables'>>
  events: Array<Doc<'events'>>
  activeStable: Doc<'stables'>
}) {
  const { today } = useLocalDateContext()
  const { data: overview } = useSuspenseQuery(
    convexQuery(api.userCareOverview.getForCurrentUser, {
      stableId: activeStable._id,
      today,
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
        title={
          isSoftSectionStudy(version)
            ? 'Soft sections — refinements'
            : 'Dashboard grouping demos'
        }
        description="Compare the same active stable data across each version."
      >
        <DashboardContainmentNavigation version={version} />
      </LabPageHeader>

      <DashboardContainmentStudy data={data} version={version} />
    </LabPageShell>
  )
}
