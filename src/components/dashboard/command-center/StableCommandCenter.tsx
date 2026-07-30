import type { DashboardCommandData } from './dashboardTypes'
import { BarnBoardGrid } from './BarnBoardGrid'

type StableCommandCenterProps = {
  data: DashboardCommandData
}

export function StableCommandCenter({ data }: StableCommandCenterProps) {
  return <BarnBoardGrid data={data} />
}
