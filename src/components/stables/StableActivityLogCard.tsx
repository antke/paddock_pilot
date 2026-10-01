import { useLocale, useT } from '#/i18n/LocaleProvider'
import {
  DashboardItemCardContent,
  DashboardItemList,
  DashboardItemRecordCard,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { ScrollableList } from '#/components/ui/scrollable-list'
import { formatMediumTimestampDateTime } from '#/lib/dateDisplay'
import {
  formatAuditAction,
  formatAuditActor,
  formatStableAuditSummary,
} from './stableAuditDisplay'
import type { StableAuditEntry } from './stableSettingsTypes'

export function StableActivityLogCard({
  entries,
}: {
  entries: Array<StableAuditEntry>
}) {
  const t = useT()
  const { locale } = useLocale()
  return (
    <DashboardSectionCard
      title={t('audit.recent')}
      description={t('audit.recentHelp')}
      contentGap="compact"
    >
      {entries.length === 0 ? (
        <DashboardEmptyState chrome="flat" spacing="flush">
          {t('audit.empty')}
        </DashboardEmptyState>
      ) : (
        <ScrollableList
          ariaLabel={t('audit.list')}
          itemCount={entries.length}
          visibleItemLimit={8}
          estimatedItemHeightRem={4.75}
        >
          <DashboardItemList gap="flush">
            {entries.map((entry) => {
              const summary = formatStableAuditSummary(entry, locale)
              return (
                <DashboardItemRecordCard
                  key={entry._id}
                  chrome="flat"
                  density="compact"
                  interactive={false}
                >
                  <DashboardItemCardContent
                    title={formatAuditAction(entry.action, locale)}
                    titleSize="sm"
                    meta={
                      <>
                        <span>{formatAuditActor(entry.actor, locale)}</span>
                        <time
                          dateTime={new Date(entry.createdAt).toISOString()}
                        >
                          {formatMediumTimestampDateTime(
                            entry.createdAt,
                            locale,
                          )}
                        </time>
                        {summary && <span>{summary}</span>}
                      </>
                    }
                    metaSeparator="dot"
                  />
                </DashboardItemRecordCard>
              )
            })}
          </DashboardItemList>
        </ScrollableList>
      )}
    </DashboardSectionCard>
  )
}
