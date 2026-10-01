import { useT } from '#/i18n/LocaleProvider'
import { HorseListPage } from '#/components/horses/HorseListPage'
import { RouteQueryErrorAlert } from '#/components/layout/RouteStatusAlert'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/stables/_layout/$stableId/horses/')({
  component: RouteComponent,
  errorComponent: HorseListError,
})

function RouteComponent() {
  const { stableId } = Route.useParams()
  const { data: horses } = useSuspenseQuery(
    convexQuery(api.horses.list, { stableId: stableId as Id<'stables'> }),
  )

  return <HorseListPage horses={horses} stableId={stableId} />
}

function HorseListError({ reset }: ErrorComponentProps) {
  const t = useT()

  return (
    <RouteQueryErrorAlert
      reset={reset}
      title={t('horseDeletion.rosterFailed')}
      description={t('horseDeletion.rosterFailedHelp')}
    />
  )
}
