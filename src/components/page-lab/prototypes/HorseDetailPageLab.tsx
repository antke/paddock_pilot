import { HorseDetail } from '#/components/horses/HorseDetail'
import { dashboardEmptyClassName } from '#/components/dashboard/dashboardChrome'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'

type HorseDetailPageLabProps = {
  data: DashboardLabData
}

export function HorseDetailPageLab({ data }: HorseDetailPageLabProps) {
  const horse = data.horses[0]

  if (!horse) {
    return (
      <div className={dashboardEmptyClassName('cards')}>
        <p>No horses added yet.</p>
      </div>
    )
  }

  const events = data.events.filter((event) =>
    event.horseIds.includes(horse._id),
  )

  return (
    <HorseDetail stableId={data.stable._id} horse={horse} events={events} />
  )
}
