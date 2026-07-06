import { StableCommandCenter } from '#/components/dashboard-lab/prototypes/StableCommandCenter'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'

type StableDashboardPageLabProps = {
  data: DashboardLabData
  onActiveStableChange: (stableId: DashboardLabData['stable']['_id']) => void
}

export function StableDashboardPageLab({
  data,
  onActiveStableChange,
}: StableDashboardPageLabProps) {
  return (
    <StableCommandCenter
      data={data}
      onActiveStableChange={onActiveStableChange}
    />
  )
}
