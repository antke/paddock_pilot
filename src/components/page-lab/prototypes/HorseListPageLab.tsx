import { HorseListPage } from '#/components/horses/HorseListPage'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'

type HorseListPageLabProps = {
  data: DashboardLabData
}

export function HorseListPageLab({ data }: HorseListPageLabProps) {
  return (
    <HorseListPage horses={data.horses} stableId={data.stable._id} />
  )
}
