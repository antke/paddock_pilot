import { useT } from '#/i18n/LocaleProvider'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'

export function AnalysisPageHeader() {
  const t = useT()

  return (
    <div className="grid gap-2">
      <DashboardPageHeader title={t('analysisViews.title')} />
      <div role="note" className="text-sm text-muted-foreground">
        <p>{t('analysisViews.workInProgress')}</p>
      </div>
    </div>
  )
}
