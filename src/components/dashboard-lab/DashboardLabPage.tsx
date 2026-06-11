import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { buttonVariants } from '#/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useEffect, useState } from 'react'
import { createDashboardLabData } from './dashboardLabData'
import type { DashboardLabVersion } from './dashboardLabTypes'
import { BarnBoardGrid } from './prototypes/BarnBoardGrid'
import { MorningBriefing } from './prototypes/MorningBriefing'
import { OperationsMap } from './prototypes/OperationsMap'
import { StableCommandCenter } from './prototypes/StableCommandCenter'

type DashboardLabPageProps = {
  version: DashboardLabVersion
}

const labVersions = [
  { value: '1', label: 'Full detail' },
  { value: '2', label: 'Focused' },
  { value: '3', label: 'Essential' },
  { value: '4', label: 'Minimal' },
] satisfies Array<{ value: DashboardLabVersion; label: string }>

export function DashboardLabPage({ version }: DashboardLabPageProps) {
  const { data: stables } = useSuspenseQuery(convexQuery(api.stables.list))
  const { data: events } = useSuspenseQuery(convexQuery(api.events.list))
  const [activeStableId, setActiveStableId] = useState<Doc<'stables'>['_id']>()
  const activeStable = stables.find((stable) => stable._id === activeStableId) ?? stables[0]

  useEffect(() => {
    if (stables.length === 0) {
      setActiveStableId(undefined)
      return
    }

    if (!activeStableId || !stables.some((stable) => stable._id === activeStableId)) {
      setActiveStableId(stables[0]._id)
    }
  }, [activeStableId, stables])

  if (!activeStable) {
    return (
      <Alert>
        <AlertTitle>No stables yet</AlertTitle>
        <AlertDescription className="grid gap-4">
          <span>Create a stable to try the dashboard lab layouts.</span>
          <Link to="/stables/create" className={buttonVariants()}>
            Create stable
          </Link>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <DashboardLabData
      version={version}
      stables={stables}
      events={events}
      activeStable={activeStable}
      onActiveStableChange={setActiveStableId}
    />
  )
}

function DashboardLabData({
  version,
  stables,
  events,
  activeStable,
  onActiveStableChange,
}: {
  version: DashboardLabVersion
  stables: Array<Doc<'stables'>>
  events: Array<Doc<'events'>>
  activeStable: Doc<'stables'>
  onActiveStableChange: (stableId: Doc<'stables'>['_id']) => void
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
    <div className="mx-auto grid max-w-[88rem] gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Dashboard lab</p>
          <h1 className="text-2xl font-semibold tracking-tight">Stable-first dashboard concepts</h1>
          <p className="text-sm text-muted-foreground">
            Same Barn Board layout, from least simplified to most simplified.
          </p>
        </div>

        <Tabs value={version} className="w-full sm:w-auto">
          <TabsList className="w-full sm:w-fit">
            {labVersions.map((labVersion) => (
              <TabsTrigger
                key={labVersion.value}
                value={labVersion.value}
                render={
                  <Link
                    to="/dashboard-lab/$version"
                    params={{ version: labVersion.value }}
                  />
                }
              >
                {labVersion.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {version === '1' && (
        <StableCommandCenter data={data} onActiveStableChange={onActiveStableChange} />
      )}
      {version === '2' && (
        <BarnBoardGrid data={data} onActiveStableChange={onActiveStableChange} />
      )}
      {version === '3' && (
        <MorningBriefing data={data} onActiveStableChange={onActiveStableChange} />
      )}
      {version === '4' && (
        <OperationsMap data={data} onActiveStableChange={onActiveStableChange} />
      )}
    </div>
  )
}
