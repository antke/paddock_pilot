import { StableDashboardPageLab } from '#/components/page-lab/prototypes/StableDashboardPageLab'
import { StablesListPageLab } from '#/components/page-lab/prototypes/StablesListPageLab'
import { HorseListPageLab } from '#/components/page-lab/prototypes/HorseListPageLab'
import { HorseDetailPageLab } from '#/components/page-lab/prototypes/HorseDetailPageLab'
import { EventListPageLab } from '#/components/page-lab/prototypes/EventListPageLab'
import { EventDetailPageLab } from '#/components/page-lab/prototypes/EventDetailPageLab'
import { RemindersPageLab } from '#/components/page-lab/prototypes/RemindersPageLab'
import { DocumentsPageLab } from '#/components/page-lab/prototypes/DocumentsPageLab'
import { AnalysisPageLab } from '#/components/page-lab/prototypes/AnalysisPageLab'
import { SurfaceSystemPageLab } from '#/components/page-lab/prototypes/SurfaceSystemPageLab'
import {
  getPageLabPage,
  pageLabPages,
} from '#/components/page-lab/pageLabPages'
import type { PageLabPageId } from '#/components/page-lab/pageLabPages'
import {
  dashboardEmptyClassName,
  dashboardSectionClassName,
} from '#/components/dashboard/dashboardChrome'
import { Badge } from '#/components/ui/badge'
import { buttonVariants } from '#/components/ui/button'
import { Select } from '#/components/ui/select'
import { cn } from '#/lib/utils'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, Navigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useEffect, useState } from 'react'
import { createDashboardLabData } from '#/components/dashboard-lab/dashboardLabData'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'

type PageLabPageProps = {
  pageId: string
}

export function PageLabPage({ pageId }: PageLabPageProps) {
  const page = getPageLabPage(pageId)
  const { data: stables } = useSuspenseQuery(convexQuery(api.stables.list))
  const { data: events } = useSuspenseQuery(convexQuery(api.events.list))
  const [activeStableId, setActiveStableId] = useState<Doc<'stables'>['_id']>()
  const activeStable =
    stables.find((stable) => stable._id === activeStableId) ?? stables[0]

  useEffect(() => {
    if (stables.length === 0) {
      setActiveStableId(undefined)
      return
    }

    if (
      !activeStableId ||
      !stables.some((stable) => stable._id === activeStableId)
    ) {
      setActiveStableId(stables[0]._id)
    }
  }, [activeStableId, stables])

  if (!page) {
    return (
      <Navigate to="/page-lab/$page" params={{ page: 'stable-dashboard' }} />
    )
  }

  if (!activeStable) {
    return (
      <div className={dashboardEmptyClassName('cards')}>
        <p className="font-medium text-foreground">No stables yet</p>
        <p>Create a stable to use the page lab with real app data.</p>
        <Link to="/stables/create" className={cn(buttonVariants(), 'mt-4')}>
          Create stable
        </Link>
      </div>
    )
  }

  return (
    <PageLabData
      pageId={page.id}
      stables={stables}
      events={events}
      activeStable={activeStable}
      onActiveStableChange={setActiveStableId}
    />
  )
}

function PageLabData({
  pageId,
  stables,
  events,
  activeStable,
  onActiveStableChange,
}: {
  pageId: PageLabPageId
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
    <div className="mx-auto grid max-w-[92rem] gap-6">
      <PageLabControls
        pageId={pageId}
        data={data}
        onActiveStableChange={onActiveStableChange}
      />

      <PageLabPreviewSeparator />

      <div>
        <PageLabPrototype
          pageId={pageId}
          data={data}
          allEvents={events}
          onActiveStableChange={onActiveStableChange}
        />
      </div>
    </div>
  )
}

function PageLabControls({
  pageId,
  data,
  onActiveStableChange,
}: {
  pageId: PageLabPageId
  data: DashboardLabData
  onActiveStableChange: (stableId: DashboardLabData['stable']['_id']) => void
}) {
  const page = getPageLabPage(pageId)

  return (
    <header className="rounded-panel border border-primary/30 bg-primary/5 p-4 shadow-card md:p-5">
      <div className="grid gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="grid gap-2">
            <Badge variant="outline" className="w-fit bg-background/70">
              Lab controls
            </Badge>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                {page?.label}
              </h1>
              {page?.description && (
                <p className="text-sm text-muted-foreground">
                  {page.description}
                </p>
              )}
            </div>
          </div>

          <label className="grid min-w-60 gap-2 text-sm font-medium">
            Data stable
            <Select
              value={data.stable._id}
              onChange={(event) => {
                const selectedStable = data.stables.find(
                  (stable) => stable._id === event.currentTarget.value,
                )
                if (selectedStable) onActiveStableChange(selectedStable._id)
              }}
              className="bg-background"
            >
              {data.stables.map((stable) => (
                <option key={stable._id} value={stable._id}>
                  {stable.name}
                </option>
              ))}
            </Select>
          </label>
        </div>

        <div className="grid gap-2">
          <h2 className="text-sm font-semibold tracking-tight">Pages</h2>
          <PageLabNavigation activePageId={pageId} />
        </div>
      </div>
    </header>
  )
}

function PageLabNavigation({ activePageId }: { activePageId: PageLabPageId }) {
  return (
    <nav className="flex flex-wrap gap-2">
      {pageLabPages.map((page) => (
        <Link
          key={page.id}
          to="/page-lab/$page"
          params={{ page: page.id }}
          className={cn(
            'rounded-row border px-3 py-2 text-sm font-medium transition-colors',
            page.id === activePageId
              ? 'border-primary bg-primary text-primary-foreground shadow-control'
              : 'border-border-subtle bg-background/70 text-muted-foreground hover:bg-background hover:text-foreground',
          )}
        >
          <span>{page.label}</span>
          {'status' in page && page.status === 'ready' && (
            <span className="ml-2 text-[0.68rem] uppercase tracking-[0.18em] opacity-75">
              Ready
            </span>
          )}
        </Link>
      ))}
    </nav>
  )
}

function PageLabPreviewSeparator() {
  return (
    <div className="grid gap-3 pt-2" aria-hidden="true">
      <div className="h-1 rounded-full bg-primary" />
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="rounded-full border border-border-subtle bg-background px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Page preview
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
    </div>
  )
}

function PageLabPrototype({
  pageId,
  data,
  allEvents,
  onActiveStableChange,
}: {
  pageId: PageLabPageId
  data: DashboardLabData
  allEvents: Array<Doc<'events'>>
  onActiveStableChange: (stableId: DashboardLabData['stable']['_id']) => void
}) {
  if (pageId === 'stable-dashboard') {
    return (
      <StableDashboardPageLab
        data={data}
        onActiveStableChange={onActiveStableChange}
      />
    )
  }

  if (pageId === 'stables-list') {
    return <StablesListPageLab data={data} allEvents={allEvents} />
  }

  if (pageId === 'horse-list') {
    return <HorseListPageLab data={data} />
  }

  if (pageId === 'horse-detail') {
    return <HorseDetailPageLab data={data} />
  }

  if (pageId === 'event-list') {
    return <EventListPageLab data={data} />
  }

  if (pageId === 'event-detail') {
    return <EventDetailPageLab data={data} />
  }

  if (pageId === 'reminders') {
    return <RemindersPageLab data={data} />
  }

  if (pageId === 'documents') {
    return <DocumentsPageLab data={data} />
  }

  if (pageId === 'analysis') {
    return <AnalysisPageLabData data={data} />
  }

  if (pageId === 'surface-system') {
    return <SurfaceSystemPageLab />
  }

  const page = getPageLabPage(pageId)

  return (
    <section className={dashboardSectionClassName('cards')}>
      <Badge variant="outline">Queued prototype</Badge>
      <div className="grid gap-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          {page?.label} is ready for the next pass
        </h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          This page now has a lab slot, shared real-data context, and
          navigation. We can prototype it here, approve the direction, then
          apply the final version back to production.
        </p>
      </div>
    </section>
  )
}

function AnalysisPageLabData({ data }: { data: DashboardLabData }) {
  const { data: stableAnalysis } = useSuspenseQuery(
    convexQuery(api.stableAnalysis.getForStable, {
      stableId: data.stable._id,
    }),
  )

  return <AnalysisPageLab data={data} stableAnalysis={stableAnalysis} />
}
