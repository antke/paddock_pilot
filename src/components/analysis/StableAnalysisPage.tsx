import { analysisSessionKey } from './analysisSessionState'
import type { ComparisonRange } from 'shared/analysis/horseComparison'
import type { ReactNode } from 'react'
import { HorseComparisonExplorer } from './HorseComparisonExplorer'
import { useT } from '#/i18n/LocaleProvider'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { createDashboardLabData } from '#/components/dashboard-lab/dashboardLabData'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { AnalysisPageHeader } from './AnalysisPageHeader'
import { FeatureAccessPrompt } from '#/components/dashboard/FeatureAccessPrompt'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import type { FunctionReturnType } from 'convex/server'
import { AnalysisCentre } from './AnalysisCentre'
import type { AnalysisScopeProps } from './AnalysisCentre'
import { useLocalDateContext } from '#/lib/useLocalDateContext'

export type StableAnalysis = FunctionReturnType<
  typeof api.stableAnalysis.getForStable
>
type UnlockedAnalysis = Extract<StableAnalysis, { hasAccess: true }>

type StableAnalysisPageProps = {
  stableId: string
} & AnalysisScopeProps

export function StableAnalysisPage({
  stableId,
  ...scope
}: StableAnalysisPageProps) {
  const localDateContext = useLocalDateContext()
  const { data: analysis } = useSuspenseQuery(
    convexQuery(api.stableAnalysis.getForStable, {
      stableId: stableId as Id<'stables'>,
      ...localDateContext,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  )

  if (!analysis.hasAccess) {
    return <StableAnalysisPageView analysis={analysis} />
  }

  return (
    <UnlockedAnalysisPage
      analysis={analysis}
      today={localDateContext.today}
      {...scope}
    />
  )
}

function LockedAnalysis() {
  const t = useT()

  return (
    <DashboardPage>
      <AnalysisPageHeader />

      <FeatureAccessPrompt
        title={t('analysisViews.premium')}
        description={t('analysisViews.premiumHelp')}
      />
    </DashboardPage>
  )
}

function UnlockedAnalysisPage({
  analysis,
  today,
  ...scope
}: {
  analysis: UnlockedAnalysis
  today: string
} & AnalysisScopeProps) {
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
    <StableAnalysisPageView
      analysis={analysis}
      persistenceKey={analysisSessionKey(stableId)}
      data={data}
      {...scope}
      renderHorseComparison={(horseId, range, onRangeChange) => (
        <HorseComparisonExplorer
          key={horseId}
          horseId={horseId}
          stableId={stableId}
          persistenceKey={analysisSessionKey(stableId, horseId)}
          range={range}
          onRangeChange={onRangeChange}
        />
      )}
    />
  )
}

export function StableAnalysisPageView({
  analysis,
  data,
  renderHorseComparison,
  persistenceKey,
  ...scope
}: {
  analysis: StableAnalysis
  data?: DashboardLabData
  persistenceKey?: string
  renderHorseComparison?: (
    horseId: string,
    range: ComparisonRange,
    onRangeChange: (range: ComparisonRange) => void,
  ) => ReactNode
} & AnalysisScopeProps) {
  if (!analysis.hasAccess) return <LockedAnalysis />
  if (!data) throw new Error('Unlocked analysis requires dashboard data')
  return (
    <DashboardPage gap="loose">
      <AnalysisCentre
        key={analysis.stable._id}
        data={data}
        stableAnalysis={analysis}
        persistenceKey={persistenceKey}
        renderHorseComparison={renderHorseComparison}
        {...scope}
      />
    </DashboardPage>
  )
}
