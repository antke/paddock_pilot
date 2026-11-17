import { ArrowRightIcon } from '@phosphor-icons/react'
import { useT, useLocale } from '#/i18n/LocaleProvider'
import { useState } from 'react'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { DashboardInlineHeader } from '#/components/dashboard/DashboardInlineHeader'
import { formatShortDateKey } from '#/lib/dateDisplay'
import type {
  DashboardCommandChrome,
  DashboardCareData,
} from './dashboardTypes'
import {
  DashboardItemBodyText,
  DashboardItemCardContent,
  DashboardItemList,
  DashboardItemLinkCard,
} from '#/components/dashboard/DashboardItemCard'
import { Button, ButtonLink } from '#/components/ui/button'
import { ScrollableList } from '#/components/ui/scrollable-list'
import { getDashboardAttention } from './dashboardAttention'
import { SeeAllLink } from './SeeAllLink'
import { cn } from '#/lib/utils'

type PriorityQueueCardProps = {
  className?: string
  data: DashboardCareData
  visibleItemLimit?: number
  chrome?: DashboardCommandChrome
  section?: 'combined' | 'health' | 'reminders'
  onViewReminders?: () => void
}

export function PriorityQueueCard({
  className,
  data,
  visibleItemLimit = 5,
  chrome = 'soft',
  section = 'combined',
  onViewReminders,
}: PriorityQueueCardProps) {
  const t = useT()

  const [expandedStableId, setExpandedStableId] = useState<string>()
  const contextId = data.stable?._id ?? 'personal'
  const expanded = expandedStableId === contextId
  const attention = getDashboardAttention(data)
  const healthHorses = expanded
    ? attention.healthHorses
    : attention.healthHorses.slice(0, visibleItemLimit)
  const reminders = attention.reminders.slice(0, visibleItemLimit)
  const remainingReminders = Math.max(
    0,
    attention.reminderCount - reminders.length,
  )
  // One or two health rows: hug the content; the rows' own inset already pads the bottom.
  const shortHealth =
    section === 'health' &&
    attention.healthHorses.length > 0 &&
    attention.healthHorses.length <= 2 &&
    attention.missingHealthIssueCount === 0

  return (
    <DashboardSection
      chrome={chrome}
      className={cn(shortHealth && 'gap-1 pb-2 md:pb-2', className)}
      gap="compact"
      padding={chrome === 'cards' ? 'roomy' : 'default'}
      title={
        section === 'health'
          ? t('dashboard.healthIssues')
          : section === 'reminders'
            ? t('dashboard.reminders')
            : t('dashboard.attention')
      }
      description={
        section === 'health'
          ? // One horse's row already states the count; the yard total only adds information across horses.
            attention.healthHorses.length > 1
            ? t('dashboard.yardIssues', { count: attention.healthIssueCount })
            : undefined
          : section === 'reminders'
            ? t('dashboard.remindersHelp')
            : t('dashboard.attentionHelp')
      }
      descriptionSize="sm"
      size="panel"
      headerLayout="inline"
      actions={
        section === 'health' || !data.stable ? undefined : onViewReminders ? (
          <Button
            variant="outline"
            size="sm"
            className="min-h-11"
            onClick={onViewReminders}
          >
            {t('dashboard.viewReminders')}
            <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
          </Button>
        ) : (
          <SeeAllLink
            to="/stables/$stableId/reminders"
            params={{ stableId: data.stable?._id ?? '' }}
          >
            {t('dashboard.viewReminders')}
          </SeeAllLink>
        )
      }
    >
      {section !== 'reminders' && attention.healthIssueCount > 0 && (
        <div className="grid gap-2">
          {section === 'combined' && (
            <DashboardInlineHeader
              as="h3"
              title={t('dashboard.healthIssues')}
              description={t('dashboard.issues', {
                count: attention.healthIssueCount,
              })}
            />
          )}
          <ScrollableList
            itemCount={healthHorses.length}
            visibleItemLimit={visibleItemLimit}
            estimatedItemHeightRem={5.5}
            ariaLabel={t('dashboard.healthHorses')}
            className="gap-0"
          >
            {healthHorses.map((horse) => (
              <DashboardItemLinkCard
                key={horse.horseId}
                to="/horses/$horseId/care"
                params={{ horseId: horse.horseId }}
                search={{ careView: 'health' }}
                accent="danger"
                density="compact"
                chrome="flat"
              >
                <DashboardItemCardContent
                  title={horse.horseName}
                  titleClassName="text-destructive"
                  meta={t('dashboard.issues', { count: horse.highIssueCount })}
                  density="compact"
                />
              </DashboardItemLinkCard>
            ))}
          </ScrollableList>
          {attention.healthHorses.length > visibleItemLimit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 whitespace-normal"
              aria-expanded={expanded}
              onClick={() =>
                setExpandedStableId(expanded ? undefined : contextId)
              }
            >
              {expanded
                ? t('dashboard.showFewer')
                : t('dashboard.showAllHealth', {
                    count: attention.healthHorses.length,
                  })}
            </Button>
          )}
          {attention.missingHealthIssueCount > 0 && (
            <DashboardEmptyState chrome="flat">
              {t('dashboard.missingIssues', {
                count: attention.missingHealthIssueCount,
              })}
              <ButtonLink
                to={data.stable ? '/stables/$stableId/horses' : '/horses'}
                params={{ stableId: data.stable?._id ?? '' }}
                variant="link"
              >
                {t('dashboard.viewHorses')}
              </ButtonLink>
            </DashboardEmptyState>
          )}
        </div>
      )}
      {section === 'health' && attention.healthIssueCount === 0 && (
        <DashboardEmptyState chrome={chrome}>
          {t('dashboard.noHealthIssues')}
        </DashboardEmptyState>
      )}
      {section !== 'health' &&
        (reminders.length > 0 ? (
          <div className="grid gap-2">
            {section === 'combined' && (
              <DashboardInlineHeader as="h3" title={t('dashboard.reminders')} />
            )}
            <DashboardItemList gap="compact">
              {reminders.map((reminder) => (
                <CareReminderLink key={reminder.id} reminder={reminder} />
              ))}
            </DashboardItemList>
          </div>
        ) : (
          <DashboardEmptyState chrome={chrome}>
            {t('dashboard.noReminders')}
          </DashboardEmptyState>
        ))}
      {section !== 'health' && remainingReminders > 0 && (
        <DashboardItemBodyText tone="muted">
          {t('dashboard.remainingReminders', { count: remainingReminders })}
        </DashboardItemBodyText>
      )}
    </DashboardSection>
  )
}

export function HealthIssuesCard(
  props: Omit<PriorityQueueCardProps, 'section' | 'onViewReminders'>,
) {
  return <PriorityQueueCard {...props} section="health" />
}

export function CareRemindersSummaryCard(
  props: Omit<PriorityQueueCardProps, 'section'>,
) {
  return <PriorityQueueCard {...props} section="reminders" />
}

/** One due-care preview row: title, then due date, horse and category. */
export function CareReminderLink({
  reminder,
}: {
  reminder: ReturnType<typeof getDashboardAttention>['reminders'][number]
}) {
  const t = useT()
  const { locale } = useLocale()
  return (
    <DashboardItemLinkCard
      to={
        reminder.horseId && reminder.canReadHorse !== false
          ? '/horses/$horseId/care'
          : reminder.stableId
            ? '/stables/$stableId/reminders'
            : '/horses'
      }
      params={{
        horseId: reminder.horseId ?? '',
        stableId: reminder.stableId ?? '',
      }}
      search={{ reminderId: reminder.id }}
      accent={reminder.overdue ? 'danger' : 'warning'}
      density="compact"
      chrome="flat"
    >
      <DashboardItemCardContent
        titleClassName={reminder.overdue ? 'text-destructive' : undefined}
        title={reminder.title}
        meta={
          <>
            <span>
              {t(
                reminder.overdue
                  ? 'dashboard.overdueDate'
                  : 'dashboard.dueDate',
                {
                  date: formatShortDateKey(reminder.dueDate, locale),
                },
              )}
            </span>
            <span>{reminder.horseName}</span>
            <span>{t(`careLabels.category.${reminder.category}`)}</span>
          </>
        }
        metaSeparator="dot"
        density="compact"
      />
    </DashboardItemLinkCard>
  )
}
