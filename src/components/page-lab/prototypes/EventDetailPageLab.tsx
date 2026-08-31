import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardLayoutStack } from '#/components/dashboard/DashboardLayoutGrid'
import { EventDetail } from '#/components/events/EventDetail'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '#/components/ui/breadcrumb'
import { Link } from '@tanstack/react-router'

type EventDetailPageLabProps = {
  data: DashboardLabData
}

export function EventDetailPageLab({ data }: EventDetailPageLabProps) {
  const event = data.events[0]

  if (!event) {
    return (
      <DashboardEmptyState chrome="soft">
        No events added yet.
      </DashboardEmptyState>
    )
  }

  const horses = data.horses.filter((horse) =>
    event.horseIds.includes(horse._id),
  )

  return (
    <DashboardLayoutStack>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link to="/stables">Stables</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link
              to="/stables/$stableId"
              params={{ stableId: data.stable._id }}
            >
              Stable
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link
              to="/stables/$stableId/events"
              params={{ stableId: data.stable._id }}
            >
              Events
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{event.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <EventDetail
        stableId={data.stable._id}
        event={event}
        horses={horses}
        canManageEvent
        showServiceDetails={false}
      />
    </DashboardLayoutStack>
  )
}
