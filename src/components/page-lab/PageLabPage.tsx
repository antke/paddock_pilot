import { StableDashboardPageLab } from '#/components/page-lab/prototypes/StableDashboardPageLab'
import { StablesListPageLab } from '#/components/page-lab/prototypes/StablesListPageLab'
import { HorseListPageLab } from '#/components/page-lab/prototypes/HorseListPageLab'
import { HorseDetailPageLab } from '#/components/page-lab/prototypes/HorseDetailPageLab'
import { EventListPageLab } from '#/components/page-lab/prototypes/EventListPageLab'
import { EventDetailPageLab } from '#/components/page-lab/prototypes/EventDetailPageLab'
import { RemindersPageLab } from '#/components/page-lab/prototypes/RemindersPageLab'
import { DocumentsPageLab } from '#/components/page-lab/prototypes/DocumentsPageLab'
import { AnalysisCentre } from '#/components/analysis/AnalysisCentre'
import { SettingsPageLab } from '#/components/page-lab/prototypes/SettingsPageLab'
import { FormsPageLab } from '#/components/page-lab/prototypes/FormsPageLab'
import { CalendarPageLab } from '#/components/page-lab/prototypes/CalendarPageLab'
import { TimelinePageLab } from '#/components/page-lab/prototypes/TimelinePageLab'
import { CareSummaryPageLab } from '#/components/page-lab/prototypes/CareSummaryPageLab'
import {
  getPageLabPage,
  pageLabPages,
} from '#/components/page-lab/pageLabPages'
import type { PageLabPageId } from '#/components/page-lab/pageLabPages'
import { DashboardNavigation } from '#/components/dashboard/DashboardNavigation'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { DashboardValueBadge } from '#/components/dashboard/DashboardBadges'
import {
  LabPageHeader,
  LabPageShell,
  LabPreviewSeparator,
} from '#/components/lab/LabChrome'
import { NoStablesPrompt } from '#/components/stables/NoStablesPrompt'
import {
  NavigationMenuItem,
  NavigationMenuLink,
} from '#/components/ui/navigation-menu'
import { Field, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { isDevAuthBypassEnabled } from '#/lib/devAuthBypass'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, Navigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useEffect, useState } from 'react'
import { createDashboardLabData } from '#/components/dashboard-lab/dashboardLabData'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'

type PageLabPageProps = {
  pageId: string
}

export function PageLabPage({ pageId }: PageLabPageProps) {
  const page = getPageLabPage(pageId)

  if (isDevAuthBypassEnabled()) {
    if (!page) {
      return (
        <Navigate to="/page-lab/$page" params={{ page: 'stable-dashboard' }} />
      )
    }

    const data = createDashboardLabFixtureData()

    return (
      <LabPageShell width="wide">
        <PageLabControls
          pageId={page.id}
          data={data}
          onActiveStableChange={() => undefined}
        />

        <LabPreviewSeparator />

        <div>
          <PageLabReviewSurface
            pageId={page.id}
            data={data}
            allEvents={data.events}
          />
        </div>
      </LabPageShell>
    )
  }

  return <PageLabLivePage pageId={pageId} />
}

function PageLabLivePage({ pageId }: PageLabPageProps) {
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
      <NoStablesPrompt>
        Create a stable to use the page lab with real app data.
      </NoStablesPrompt>
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
    <LabPageShell width="wide">
      <PageLabControls
        pageId={pageId}
        data={data}
        onActiveStableChange={onActiveStableChange}
      />

      <LabPreviewSeparator />

      <div>
        <PageLabReviewSurface pageId={pageId} data={data} allEvents={events} />
      </div>
    </LabPageShell>
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
  return (
    <LabPageHeader
      variant="panel"
      actions={
        <Field className="min-w-60">
          <FieldLabel htmlFor="page-lab-stable">Data stable</FieldLabel>
          <Select
            id="page-lab-stable"
            value={data.stable._id}
            onChange={(event) => {
              const selectedStable = data.stables.find(
                (stable) => stable._id === event.currentTarget.value,
              )
              if (selectedStable) onActiveStableChange(selectedStable._id)
            }}
          >
            {data.stables.map((stable) => (
              <option key={stable._id} value={stable._id}>
                {stable.name}
              </option>
            ))}
          </Select>
        </Field>
      }
    >
      <PageLabNavigation activePageId={pageId} />
    </LabPageHeader>
  )
}

function PageLabNavigation({ activePageId }: { activePageId: PageLabPageId }) {
  return (
    <DashboardNavigation inset={false}>
      {pageLabPages.map((page) => (
        <NavigationMenuItem key={page.id}>
          <NavigationMenuLink
            data-active={page.id === activePageId || undefined}
            render={<Link to="/page-lab/$page" params={{ page: page.id }} />}
          >
            <span>{page.label}</span>
          </NavigationMenuLink>
        </NavigationMenuItem>
      ))}
    </DashboardNavigation>
  )
}

function PageLabReviewSurface({
  pageId,
  data,
  allEvents,
}: {
  pageId: PageLabPageId
  data: DashboardLabData
  allEvents: Array<Doc<'events'>>
}) {
  if (pageId === 'stable-dashboard') {
    return <StableDashboardPageLab data={data} />
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
    if (isDevAuthBypassEnabled()) {
      return (
        <AnalysisCentre
          data={data}
          stableAnalysis={{
            hasAccess: false,
            requiredPlan: 'personal_pro',
            stable: data.stable,
          }}
        />
      )
    }

    return <AnalysisPageLabData data={data} />
  }

  if (pageId === 'settings') {
    return <SettingsPageLab data={data} />
  }

  if (pageId === 'forms') {
    return <FormsPageLab data={data} />
  }

  if (pageId === 'calendar') {
    return <CalendarPageLab data={data} />
  }

  if (pageId === 'timeline') {
    return <TimelinePageLab data={data} />
  }

  if (pageId === 'care-summary') {
    return <CareSummaryPageLab data={data} />
  }

  const page = getPageLabPage(pageId)

  return (
    <DashboardSection
      chrome="cards"
      title={`${page?.label ?? 'Page'} is ready for implementation review`}
      description="This page has shared real-data context, navigation, and a reserved review surface. Use it to validate layout and component choices before applying the final route treatment."
      badges={<DashboardValueBadge>Review slot</DashboardValueBadge>}
      size="section"
      descriptionSize="sm"
    >
      <div />
    </DashboardSection>
  )
}

function AnalysisPageLabData({ data }: { data: DashboardLabData }) {
  const { data: stableAnalysis } = useSuspenseQuery(
    convexQuery(api.stableAnalysis.getForStable, {
      stableId: data.stable._id,
    }),
  )

  return <AnalysisCentre data={data} stableAnalysis={stableAnalysis} />
}
