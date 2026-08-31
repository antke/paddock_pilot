import { createDashboardLabData } from '#/components/dashboard-lab/dashboardLabData'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { FeatureAccessPrompt } from '#/components/dashboard/FeatureAccessPrompt'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import type { FunctionReturnType } from 'convex/server'
import { AnalysisCentre } from './AnalysisCentre'
import { useLocalDateContext } from '#/lib/useLocalDateContext'

type StableAnalysis = FunctionReturnType<typeof api.stableAnalysis.getForStable>
type UnlockedAnalysis = Extract<StableAnalysis, { hasAccess: true }>

type StableAnalysisPageProps = {
  stableId: string
}

export function StableAnalysisPage({ stableId }: StableAnalysisPageProps) {
  const localDateContext = useLocalDateContext()
  const { data: analysis } = useSuspenseQuery(
    convexQuery(api.stableAnalysis.getForStable, {
      stableId: stableId as Id<'stables'>,
      ...localDateContext,
    }),
  )

  if (!analysis.hasAccess) {
    return <LockedAnalysis />
  }

  return (
    <UnlockedAnalysisPage analysis={analysis} today={localDateContext.today} />
  )
}

function LockedAnalysis() {
  return (
    <DashboardPage>
      <DashboardPageHeader title="Analysis Centre" />

      <FeatureAccessPrompt
        title="Analysis Centre is a Premium feature"
        description="Upgrade to spot care gaps, health trends, missing follow-up notes, and upcoming service load across the stable."
      />
    </DashboardPage>
  )
}

function UnlockedAnalysisPage({
  analysis,
  today,
}: {
  analysis: UnlockedAnalysis
  today: string
}) {
  const stableId = analysis.stable._id
  const { data: events } = useSuspenseQuery(
    convexQuery(api.events.listForStable, { stableId }),
  )
  const { data: horses } = useSuspenseQuery(
    convexQuery(api.horses.list, { stableId }),
  )
  const { data: overview } = useSuspenseQuery(
    convexQuery(api.userCareOverview.getForCurrentUser, { stableId, today }),
  )
  const data = createDashboardLabData({
    stable: analysis.stable,
    stables: [analysis.stable],
    events,
    horses,
    overview,
  })

  return (
    <DashboardPage gap="loose">
      <AnalysisCentre data={data} stableAnalysis={analysis} />
    </DashboardPage>
  )
}
