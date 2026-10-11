import { useLocale, useT } from '#/i18n/LocaleProvider'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { Button } from '#/components/ui/button'
import {
  formatMediumTimestampDate,
  formatMediumDateKey,
} from '#/lib/dateDisplay'
import { formatDecimal } from '#/lib/numberDisplay'
import type { createStableHorseOverview } from './analysisHorseData'

type HorseOverview = ReturnType<typeof createStableHorseOverview>[number]

export function StableHistoryOverview({
  horses,
  onHorseSelect,
}: {
  horses: HorseOverview[]
  onHorseSelect: (horseId: string) => void
}) {
  const t = useT()
  const { locale } = useLocale()
  const date = (value: string) => formatMediumDateKey(value, locale)
  const training = horses.reduce(
    (sum, horse) => sum + horse.training.completedCount,
    0,
  )
  const known = horses.reduce(
    (sum, horse) => sum + horse.training.withDurationCount,
    0,
  )
  return (
    <DashboardSection
      title={t('analysisViews.yardQuestion')}
      description={t('analysisViews.horseOverviewHelp')}
      size="panel"
    >
      <div className="flex flex-wrap gap-x-8 gap-y-2 border-b border-border pb-5 text-sm tabular-nums">
        <p>
          {t('analysisViews.horsesMeasured', {
            measured: horses.filter((horse) => horse.periodWeight).length,
            total: horses.length,
          })}
        </p>
        <p>
          {training === 0 ? (
            t('horseComparison.noTraining')
          ) : (
            <>
              <strong>{training}</strong>{' '}
              {t('analysisViews.completedTraining').toLocaleLowerCase(locale)} ·{' '}
              {t('analysisViews.durationCoverage', { known, total: training })}
            </>
          )}
        </p>
      </div>
      <div className="grid gap-2">
        <h3 className="font-semibold">{t('analysisViews.horseOverview')}</h3>
        <div
          className="max-h-[34rem] overflow-y-auto overscroll-contain"
          role="region"
          aria-label={t('analysisViews.horseOverview')}
          tabIndex={0}
        >
          {horses.map((horse) => (
            <article
              key={horse.horseId}
              className="grid gap-3 border-b border-border py-5 last:border-b-0 md:grid-cols-[minmax(8rem,0.8fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.1fr)]"
            >
              <div>
                <Button
                  variant="link"
                  className="justify-start px-0 text-base"
                  onClick={() => onHorseSelect(horse.horseId)}
                >
                  {horse.horseName}
                </Button>
              </div>
              <div className="grid content-start gap-1 text-sm tabular-nums">
                <p className="text-xs text-muted-foreground">
                  {t('analysisViews.latestMeasurement')}
                </p>
                <p>
                  {horse.latestWeight?.latestWeight !== undefined
                    ? `${formatDecimal(horse.latestWeight.latestWeight, locale)} ${horse.latestWeight.unit} · ${formatMediumTimestampDate(horse.latestWeight.measuredAt, locale)}`
                    : t('analysisViews.noMeasurement')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('analysisViews.periodChange')}:{' '}
                  {horse.periodWeight?.change != null
                    ? `${horse.periodWeight.change > 0 ? '+' : ''}${formatDecimal(Math.round(horse.periodWeight.change * 10) / 10, locale)} ${horse.periodWeight.unit} · ${date(horse.periodWeight.firstDate)} – ${date(horse.periodWeight.lastDate)}`
                    : t('analysisViews.noComparableWeights')}
                </p>
              </div>
              <div className="grid content-start gap-1 text-sm tabular-nums">
                <p className="text-xs text-muted-foreground">
                  {t('analysisViews.completedTraining')}
                </p>
                <p>
                  {horse.training.completedCount === 0 ? (
                    t('horseComparison.noTraining')
                  ) : (
                    <>
                      {horse.training.completedCount} ·{' '}
                      {horse.training.recordedMinutes !== null
                        ? t('analysisViews.recordedMinutes', {
                            count: horse.training.recordedMinutes,
                          })
                        : t('analysisViews.unknownMinutes')}
                    </>
                  )}
                </p>
                {horse.training.completedCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {t('analysisViews.durationCoverage', {
                      known: horse.training.withDurationCount,
                      total: horse.training.completedCount,
                    })}
                  </p>
                )}
              </div>
              <div className="grid content-start gap-1 text-sm tabular-nums">
                <p className="text-xs text-muted-foreground">
                  {t('analysisViews.currentCareToday')}
                </p>
                {horse.currentCare ? (
                  <>
                    <p>
                      {t('analysisViews.recordedOpenHealth', {
                        count: horse.currentCare.activeIssueCount,
                      })}
                    </p>
                    <p>
                      {t('analysisViews.recordedOverdue', {
                        count: horse.currentCare.overdueReminderCount,
                      })}
                    </p>
                  </>
                ) : (
                  <p>{t('analysisViews.summaryUnavailable')}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {t('analysisViews.currentCareCaveat')}
      </p>
    </DashboardSection>
  )
}
