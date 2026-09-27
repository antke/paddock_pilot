import { useState } from 'react'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  useLocation,
  useRouter,
} from '@tanstack/react-router'
import { StableRouteLayoutView } from '#/components/layout/StableRouteLayoutView'
import { StableBreadcrumbsView } from '#/components/layout/StableBreadcrumbs'
import { createStableBreadcrumbItems } from '#/components/layout/stableBreadcrumbTrail'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { Field, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'

const stableId = 'sample-stable'
const base = `/stables/${stableId}`
const paths = [
  { path: '', label: 'Stable overview' },
  { path: '/horses', label: 'Horse list' },
  { path: '/horses/create', label: 'Add horse' },
  { path: '/horses/deleted', label: 'Deleted horses' },
  { path: '/horses/sample-horse/profile', label: 'Horse profile' },
  { path: '/horses/sample-horse/care', label: 'Horse care' },
  { path: '/events', label: 'Event list' },
  { path: '/events/sample-event', label: 'Event detail' },
  { path: '/events/sample-event/edit', label: 'Edit event' },
  { path: '/settings', label: 'Settings' },
]
const labelSets = {
  standard: { horseName: 'Juniper', eventTitle: 'Autumn care visit' },
  unavailable: {},
  long: {
    horseName: 'Juniper of the North Meadow and the Old Orchard',
    eventTitle:
      'Autumn care visit for the horses at the north meadow and the old orchard',
  },
  unbroken: {
    horseName:
      'SampleRegisteredHorseNameABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    eventTitle:
      'SampleEventIdentifierABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  },
}

export function StableLayoutPageLab() {
  const enabled = useDevAuthBypassEnabled()
  if (!import.meta.env.DEV || !enabled)
    return (
      <DashboardEmptyState>
        Stable layout samples require development sample data.
      </DashboardEmptyState>
    )
  return <LocalStableLayoutRouter />
}
function LocalStableLayoutRouter() {
  const [router] = useState(() => {
    const root = createRootRoute({ component: LocalStableLayout })
    const localPath = createRoute({ getParentRoute: () => root, path: '$' })
    return createRouter({
      routeTree: root.addChildren([localPath]),
      history: createMemoryHistory({
        initialEntries: [`${base}/horses/sample-horse/care`],
      }),
    })
  })
  return <RouterProvider router={router} />
}
function LocalStableLayout() {
  const { pathname } = useLocation()
  const router = useRouter()
  const [labelMode, setLabelMode] = useState<keyof typeof labelSets>('standard')
  const path = pathname.startsWith(base) ? pathname.slice(base.length) : ''
  const labels = labelSets[labelMode]
  const title =
    createStableBreadcrumbItems(path, labels).at(-1)?.label ?? 'Overview'
  return (
    <div className="grid gap-6">
      <p className="text-sm text-muted-foreground">
        Local stable layout sample. Breadcrumb links navigate only inside this
        preview. No records are queried; the page body is a labeled placeholder.
      </p>
      <FieldGrid>
        <Field>
          <FieldLabel htmlFor="stable-layout-path">Sample page</FieldLabel>
          <Select
            id="stable-layout-path"
            value={pathname === '/' ? 'home' : path}
            onChange={(event) =>
              router.history.push(
                event.target.value === 'home'
                  ? '/'
                  : `${base}${event.target.value}`,
              )
            }
          >
            <option value="home">Dashboard destination</option>
            {paths.map((item) => (
              <option key={item.path} value={item.path}>
                {item.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="stable-layout-labels">
            Sample record labels
          </FieldLabel>
          <Select
            id="stable-layout-labels"
            value={labelMode}
            onChange={(event) =>
              setLabelMode(event.target.value as keyof typeof labelSets)
            }
          >
            <option value="standard">Resolved names</option>
            <option value="unavailable">Labels unavailable</option>
            <option value="long">Long multiword names</option>
            <option value="unbroken">Long unbroken identifiers</option>
          </Select>
        </Field>
      </FieldGrid>
      {pathname === '/' ? (
        <DashboardEmptyState title="Sample dashboard">
          The Dashboard breadcrumb stayed within this preview.
        </DashboardEmptyState>
      ) : (
        <StableRouteLayoutView
          breadcrumbs={
            <StableBreadcrumbsView
              stableId={stableId}
              pathAfterStable={path}
              labels={labels}
            />
          }
        >
          <DashboardPage>
            <DashboardPageHeader title={title} />
            <DashboardEmptyState>
              Sample page content. Use the breadcrumb links to inspect the
              parent and current-page states.
            </DashboardEmptyState>
          </DashboardPage>
        </StableRouteLayoutView>
      )}
    </div>
  )
}
