import { HorseDetail } from '#/components/horses/HorseDetail'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'

type HorseDetailPageLabProps = {
  data: DashboardLabData
}

export function HorseDetailPageLab({ data }: HorseDetailPageLabProps) {
  const horse = data.horses[0]

  if (!horse) {
    return (
      <DashboardEmptyState chrome="cards">
        No horses added yet.
      </DashboardEmptyState>
    )
  }

  const events = data.events.filter((event) =>
    event.horseIds.includes(horse._id),
  )

  return (
    <HorseDetail
      stableId={data.stable._id}
      horse={horse}
      events={events}
      canManageHorse
    />
  )
}
