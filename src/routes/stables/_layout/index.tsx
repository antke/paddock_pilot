import {
  DashboardItemCardContent,
  DashboardItemList,
  DashboardItemRecordCard,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { NoStablesPrompt } from '#/components/stables/NoStablesPrompt'
import { ButtonLink } from '#/components/ui/button'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import { isEmpty } from 'lodash'
import { ArrowRightIcon } from '@phosphor-icons/react'

export const Route = createFileRoute('/stables/_layout/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: stables } = useSuspenseQuery(convexQuery(api.stables.list))

  if (isEmpty(stables)) {
    return <NoStablesPrompt />
  }

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="All stables"
        actions={<ButtonLink to="/stables/create">Create stable</ButtonLink>}
      />

      <DashboardSectionCard contentGap="comfortable">
        <DashboardItemList gap="flush">
          {stables.map((stable) => (
            <DashboardItemRecordCard
              key={stable._id}
              chrome="soft"
              actions={
                <ButtonLink
                  to="/stables/$stableId"
                  params={{ stableId: stable._id }}
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Open ${stable.name}`}
                >
                  <ArrowRightIcon />
                </ButtonLink>
              }
            >
              <DashboardItemCardContent
                title={stable.name}
                meta={stable.location}
              />
            </DashboardItemRecordCard>
          ))}
        </DashboardItemList>
      </DashboardSectionCard>
    </DashboardPage>
  )
}
