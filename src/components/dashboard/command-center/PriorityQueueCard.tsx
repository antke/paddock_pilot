import { useState } from 'react'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { DashboardInlineHeader } from '#/components/dashboard/DashboardInlineHeader'
import { formatShortDateKey } from '#/lib/dateDisplay'
import { formatCountLabel } from '#/lib/numberDisplay'
import { careReminderCategoryLabels } from 'shared/reminders/careReminderSchema'
import type {
  DashboardCommandChrome,
  DashboardCommandData,
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

type PriorityQueueCardProps = {
  className?: string
  data: DashboardCommandData
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
  const [expandedStableId, setExpandedStableId] = useState<string>()
  const expanded = expandedStableId === data.stable._id
  const attention = getDashboardAttention(data)
  const healthHorses = expanded
    ? attention.healthHorses
    : attention.healthHorses.slice(0, visibleItemLimit)
  const reminders = attention.reminders.slice(0, visibleItemLimit)
  const remainingReminders = Math.max(
    0,
    attention.reminderCount - reminders.length,
  )

  return (
    <DashboardSection
      chrome={chrome}
      className={className}
      gap="compact"
      padding={chrome === 'cards' ? 'roomy' : 'default'}
      title={
        section === 'health'
          ? 'Health issues'
          : section === 'reminders'
            ? 'Care reminders'
            : 'Needs attention'
      }
      description={
        section === 'health'
          ? `${formatCountLabel(attention.healthIssueCount, 'high-severity issue')} across the yard.`
          : section === 'reminders'
            ? 'Due and overdue care within the next 14 days.'
            : 'High-severity health issues and reminders due within 14 days.'
      }
      descriptionSize="sm"
      size="panel"
      actions={
        section === 'health' ? undefined : onViewReminders ? (
          <Button
            variant="outline"
            size="sm"
            className="min-h-11"
            onClick={onViewReminders}
          >
            View reminders
          </Button>
        ) : (
          <ButtonLink
            to="/stables/$stableId/reminders"
            params={{ stableId: data.stable._id }}
            variant="outline"
            size="sm"
            className="min-h-11"
          >
            View reminders
          </ButtonLink>
        )
      }
    >
      {section !== 'reminders' && attention.healthIssueCount > 0 && (
        <div className="grid gap-2">
          {section === 'combined' && (
            <DashboardInlineHeader
              as="h3"
              title="Health issues"
              description={formatCountLabel(
                attention.healthIssueCount,
                'high-severity issue',
              )}
            />
          )}
          <ScrollableList
            itemCount={healthHorses.length}
            visibleItemLimit={visibleItemLimit}
            estimatedItemHeightRem={5.5}
            ariaLabel="Horses with high-severity health issues"
            className="gap-0"
          >
            {healthHorses.map((horse) => (
              <DashboardItemLinkCard
                key={horse.horseId}
                to="/stables/$stableId/horses/$horseId/care"
                params={{ stableId: horse.stableId, horseId: horse.horseId }}
                search={{ careView: 'health' }}
                accent="danger"
                density="compact"
                chrome="flat"
              >
                <DashboardItemCardContent
                  title={horse.horseName}
                  meta={formatCountLabel(
                    horse.highIssueCount,
                    'high-severity issue',
                  )}
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
                setExpandedStableId(expanded ? undefined : data.stable._id)
              }
            >
              {expanded
                ? 'Show fewer horses'
                : `Show all ${attention.healthHorses.length} horses with health issues`}
            </Button>
          )}
          {attention.missingHealthIssueCount > 0 && (
            <DashboardEmptyState chrome="flat">
              {formatCountLabel(
                attention.missingHealthIssueCount,
                'additional high-severity issue',
              )}{' '}
              {attention.missingHealthIssueCount === 1 ? 'is' : 'are'} not
              included in this overview. The horse list opens all horse records,
              without identifying those missing issues.
              <ButtonLink
                to="/stables/$stableId/horses"
                params={{ stableId: data.stable._id }}
                variant="link"
              >
                View horses
              </ButtonLink>
            </DashboardEmptyState>
          )}
        </div>
      )}
      {section === 'health' && attention.healthIssueCount === 0 && (
        <DashboardEmptyState chrome={chrome}>
          No high-severity health issues.
        </DashboardEmptyState>
      )}
      {section !== 'health' &&
        (reminders.length > 0 ? (
          <div className="grid gap-2">
            {section === 'combined' && (
              <DashboardInlineHeader as="h3" title="Care reminders" />
            )}
            <DashboardItemList gap="compact">
              {reminders.map((reminder) => (
                <DashboardItemLinkCard
                  key={reminder.id}
                  to="/stables/$stableId/reminders"
                  params={{ stableId: reminder.stableId }}
                  accent={reminder.overdue ? 'danger' : 'warning'}
                  density="compact"
                  chrome="flat"
                >
                  <DashboardItemCardContent
                    title={reminder.title}
                    meta={
                      <>
                        <span>
                          {reminder.overdue ? 'Overdue' : 'Due'}{' '}
                          {formatShortDateKey(reminder.dueDate)}
                        </span>
                        <span>{reminder.horseName}</span>
                        <span>
                          {careReminderCategoryLabels[reminder.category]}
                        </span>
                      </>
                    }
                    metaSeparator="dot"
                    density="compact"
                  />
                </DashboardItemLinkCard>
              ))}
            </DashboardItemList>
          </div>
        ) : (
          <DashboardEmptyState chrome={chrome}>
            No reminders are due within 14 days.
          </DashboardEmptyState>
        ))}
      {section !== 'health' && remainingReminders > 0 && (
        <DashboardItemBodyText tone="muted">
          {formatCountLabel(remainingReminders, 'more reminder')} due within 14
          days. Open View reminders to see the full list.
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
