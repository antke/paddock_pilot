import { StableRouteLayoutView } from '#/components/layout/StableRouteLayoutView'
import { StableBreadcrumbs } from '#/components/layout/StableBreadcrumbs'
import { RouteStatusAlert } from '#/components/layout/RouteStatusAlert'
import { StableLocalNavigation } from '#/components/stables/StableLocalNavigation'
import { ButtonLink } from '#/components/ui/button'
import { useT } from '#/i18n/LocaleProvider'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import { useConvexAuth, useQuery } from 'convex/react'

export const Route = createFileRoute('/stables/_layout/$stableId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId } = Route.useParams()
  const t = useT()
  const { isAuthenticated } = useConvexAuth()
  // Same rule as the server's stable access check: owned or member, not archived.
  const stables = useQuery(api.stables.list, isAuthenticated ? {} : 'skip')
  if (stables && !stables.some((stable) => stable._id === stableId))
    return (
      <StableRouteLayoutView breadcrumbs={null}>
        <RouteStatusAlert
          title={t('stables.noAccessTitle')}
          description={t('stables.noAccessHelp')}
          actions={
            <ButtonLink to="/" variant="outline">
              {t('common.home')}
            </ButtonLink>
          }
        />
      </StableRouteLayoutView>
    )

  return (
    <StableRouteLayoutView
      breadcrumbs={<StableBreadcrumbs stableId={stableId} />}
    >
      <StableLocalNavigation stableId={stableId} />
      <Outlet />
    </StableRouteLayoutView>
  )
}
