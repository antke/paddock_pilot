import type { DashboardLabData } from '../dashboardLabTypes'
import { BarnBoardGrid } from './BarnBoardGrid'

type PrototypeProps = {
  data: DashboardLabData
  onActiveStableChange: (stableId: DashboardLabData['stable']['_id']) => void
}

export function StableCommandCenter({ data, onActiveStableChange }: PrototypeProps) {
  return (
    <BarnBoardGrid
      data={data}
      onActiveStableChange={onActiveStableChange}
      simplification="full"
    />
  )
}
