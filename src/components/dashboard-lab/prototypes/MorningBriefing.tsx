import type { DashboardLabData } from '../dashboardLabTypes'
import { BarnBoardGrid } from './BarnBoardGrid'

type PrototypeProps = {
  data: DashboardLabData
  onActiveStableChange: (stableId: DashboardLabData['stable']['_id']) => void
}

export function MorningBriefing({ data, onActiveStableChange }: PrototypeProps) {
  return (
    <BarnBoardGrid
      data={data}
      onActiveStableChange={onActiveStableChange}
      simplification="essential"
    />
  )
}
