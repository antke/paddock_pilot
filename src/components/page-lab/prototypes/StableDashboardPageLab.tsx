import { StableCommandCenter } from '#/components/dashboard/command-center/StableCommandCenter'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'

type StableDashboardPageLabProps = {
  data: DashboardLabData
}

export function StableDashboardPageLab({ data }: StableDashboardPageLabProps) {
  return <StableCommandCenter data={data} />
}
