import { useT } from '#/i18n/LocaleProvider'
import { DashboardLoadingState } from '#/components/dashboard/DashboardLoadingState'

export function RoutePending() {
  const t = useT()
  return (
    <DashboardLoadingState
      data-slot="route-pending"
      label={t('recovery.loadingPage')}
      className="h-full min-h-[60dvh]"
      panelClassName="size-auto border-0 bg-transparent"
      spinnerClassName="size-10"
    />
  )
}
