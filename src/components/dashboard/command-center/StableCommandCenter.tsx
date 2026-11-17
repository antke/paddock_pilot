import type { DashboardCommandData } from './dashboardTypes'
import { BarnBoardGrid } from './BarnBoardGrid'
import type { ReactNode } from 'react'

type StableCommandCenterProps = {
  data: DashboardCommandData
  setupNotice?: ReactNode
  updates?: ReactNode
  /** Decisions waiting on the viewer, shown straight after urgent care. */
  pending?: ReactNode
}

export function StableCommandCenter({
  data,
  setupNotice,
  updates,
  pending,
}: StableCommandCenterProps) {
  return (
    <BarnBoardGrid
      data={data}
      setupNotice={setupNotice}
      updates={updates}
      pending={pending}
    />
  )
}
