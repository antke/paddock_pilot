import { useMemo } from 'react'
import { CaretDownIcon } from '@phosphor-icons/react'
import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from 'convex/_generated/api'
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
import { usePersonalTraining } from './usePersonalTraining'
import { PersonalHorseList } from './PersonalHorses'
import { useOwnershipCopy } from './ownershipCopy'

export function PersonalHome() {
  const t = useT()
  const c = useOwnershipCopy()
  const { locale } = useLocale()
  const { today } = useLocalDateContext()
  const small = useSmallScreen()
  const { data: events } = useQuery({
    ...convexQuery(api.events.list),
    throwOnError: true,
  })
  const training = usePersonalTraining()
  const horses = training?.roster
  const { data: overview } = useQuery({
    ...convexQuery(api.userCareOverview.getForCurrentUser, { today }),
    throwOnError: true,
  })
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

  const canCreate = horses.some((horse) => horse.access.canEditPersonalRecords)
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
    <DashboardPage>
      {small ? (
        <h1 className="sr-only">{t('navigation.home')}</h1>
      ) : (
        <DashboardPageHeader
          title={t('navigation.home')}
          description={formatLongDateKey(today, locale)}
          className="py-1 md:py-6"
          actions={
            <ButtonLink to="/horses/contacts" variant="ghost" size="sm">
              {c.providers}
            </ButtonLink>
          }
        />
      )}
      {small && <DashboardCreateMenu canCreateActivity={canCreate} />}
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
          {horses.length > 0 && (
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
            title={c.title}
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
              <PersonalHorseList horses={horses} headingLevel={3} compact />
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
            {horses.length > 0 && (
              <ButtonLink
                to="/horses/deleted"
                variant="link"
                className="min-h-11 justify-self-start px-0"
              >
                {c.trash}
              </ButtonLink>
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
