import { HorseInvitationInbox } from '#/components/events/HorseInvitationInbox'
import { useMemo } from 'react'
import { CaretDownIcon } from '@phosphor-icons/react'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardCreateMenu } from '#/components/dashboard/DashboardCreateMenu'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import {
  DashboardLayoutGrid,
  DashboardLayoutStack,
} from '#/components/dashboard/DashboardLayoutGrid'
import { createDashboardActivityData } from '#/components/dashboard/command-center/dashboardData'
import { TodayTrainingCard } from '#/components/dashboard/command-center/TodayTrainingCard'
import { TodayBriefingCard } from '#/components/dashboard/command-center/TodayBriefingCard'
import {
  HealthIssuesCard,
  CareRemindersSummaryCard,
} from '#/components/dashboard/command-center/PriorityQueueCard'
import { MobileHealthSummary } from '#/components/dashboard/command-center/MobileHealthSummary'
import { RoutePending } from '#/components/layout/RoutePending'
import { ButtonLink } from '#/components/ui/button'
import { useLocale, useT } from '#/i18n/LocaleProvider'
import { useSmallScreen } from '#/lib/useSmallScreen'
import { useLocalDateContext } from '#/lib/useLocalDateContext'
import { formatLongDateKey } from '#/lib/dateDisplay'
import { useDashboardData } from '#/components/dashboard/useDashboardData'
import { ActivityCalendarFilter } from '#/components/events/ActivityCalendarFilter'
import { DashboardHorseList } from '#/components/dashboard/DashboardHorseList'
import { useOwnershipCopy } from './ownershipCopy'

export function PersonalHome() {
  const t = useT()
  const c = useOwnershipCopy()
  const { locale } = useLocale()
  const { today } = useLocalDateContext()
  const small = useSmallScreen()
  const dashboard = useDashboardData(today)
  const { events, training, horses, overview } = dashboard.data ?? {}
  const activity = useMemo(
    () =>
      events && training
        ? createDashboardActivityData({
            events: events.filter((event) => event.type !== 'training'),
            training,
            todayKey: today,
            locale,
          })
        : undefined,
    [events, training, today, locale],
  )
  if (!horses || !activity || !overview) return <RoutePending />

  const canCreate = horses.some((horse) => horse.canRecord)
  const care = {
    overview,
    dueReminders: overview.dueReminders,
    attentionHorses: overview.attentionHorses,
  }
  const hasHealth = overview.summary.highSeverityIssueCount > 0
  const hasReminders = overview.dueReminders.length > 0
  const hasCare = hasHealth || hasReminders
  const reminders = hasReminders && (
    <CareRemindersSummaryCard
      data={care}
      visibleItemLimit={overview.dueReminders.length}
      chrome={small ? 'flat' : 'soft'}
    />
  )

  return (
    <DashboardPage aria-busy={dashboard.loading}>
      <DashboardPageHeader
        title={t('navigation.home')}
        description={small ? undefined : formatLongDateKey(today, locale)}
        className="py-1 md:py-6"
        actions={
          <ButtonLink to="/horses/contacts" variant="ghost" size="sm">
            {c.providers}
          </ButtonLink>
        }
      />
      <ActivityCalendarFilter
        stables={dashboard.stables}
        selected={dashboard.selected}
        onChange={dashboard.setSelected}
        loading={dashboard.loading}
      />
      {small && <DashboardCreateMenu canCreateActivity={canCreate} />}
      <HorseInvitationInbox />
      <DashboardLayoutGrid
        variant={hasCare ? 'commandCenter' : 'equal'}
        className={!hasCare ? 'lg:grid-cols-1' : undefined}
      >
        <DashboardLayoutStack>
          <MobileHealthSummary data={care} />
          {hasReminders && (
            <details className="group rounded-row bg-card px-4 xl:hidden">
              <summary className="app-control-focus flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 [&::-webkit-details-marker]:hidden">
                <span className="font-semibold">
                  {t('dashboard.reminders')} ·{' '}
                  {overview.summary.dueReminderCount}
                  {overview.summary.overdueReminderCount > 0 && (
                    <span className="ml-2 text-destructive">
                      {t('uiRemainder.overdue', {
                        count: overview.summary.overdueReminderCount,
                      })}
                    </span>
                  )}
                </span>
                <CaretDownIcon
                  aria-hidden="true"
                  className="shrink-0 group-open:rotate-180"
                />
              </summary>
              <CareRemindersSummaryCard
                data={care}
                visibleItemLimit={overview.dueReminders.length}
                chrome="flat"
              />
            </details>
          )}
          {(horses.length > 0 || activity.todayTraining.length > 0) && (
            <TodayTrainingCard
              data={activity}
              compact={small}
              canCreate={canCreate}
            />
          )}
          <TodayBriefingCard
            data={activity}
            compact={small}
            canCreate={canCreate}
            showWeek
          />
          <DashboardSection
            title={
              dashboard.data?.stableIds.length ? t('dashboard.horses') : c.title
            }
            titleStyle="display"
            headerLayout="inline"
            actions={
              !small &&
              horses.length > 0 && (
                <ButtonLink
                  to="/horses/create"
                  action="create"
                  variant="outline"
                  size="sm"
                  className="min-h-11"
                >
                  {c.add}
                </ButtonLink>
              )
            }
          >
            {horses.length ? (
              <DashboardHorseList horses={horses} />
            ) : (
              <DashboardEmptyState
                title={c.empty}
                chrome="flat"
                actions={
                  <ButtonLink to="/horses/create" action="create">
                    {c.add}
                  </ButtonLink>
                }
              >
                {c.emptyHelp}
              </DashboardEmptyState>
            )}
          </DashboardSection>
        </DashboardLayoutStack>
        {hasCare && (
          <DashboardLayoutStack as="aside" className="hidden xl:grid">
            {hasHealth && <HealthIssuesCard data={care} visibleItemLimit={3} />}
            {reminders}
          </DashboardLayoutStack>
        )}
      </DashboardLayoutGrid>
    </DashboardPage>
  )
}
