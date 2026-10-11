import type { DashboardCommandData } from './dashboardTypes'
import { BarnBoardGrid } from './BarnBoardGrid'
import type { ReactNode } from 'react'

type StableCommandCenterProps = {
  data: DashboardCommandData
  setupNotice?: ReactNode
  updates?: ReactNode
}

export function StableCommandCenter({
  data,
  setupNotice,
  updates,
}: StableCommandCenterProps) {
  return (
    <BarnBoardGrid data={data} setupNotice={setupNotice} updates={updates} />
  )
}
