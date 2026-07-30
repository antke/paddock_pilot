import { DashboardLoadingState } from '#/components/dashboard/DashboardLoadingState'

export function RoutePending() {
  return (
    <DashboardLoadingState
      data-slot="route-pending"
      className="h-full min-h-[60dvh]"
      panelClassName="size-auto border-0 bg-transparent"
      spinnerClassName="size-10"
    />
  )
}
