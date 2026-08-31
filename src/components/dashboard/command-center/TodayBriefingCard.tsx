import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'
import type {
  DashboardCommandChrome,
  DashboardCommandData,
} from './dashboardTypes'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { DashboardSectionHeader } from '#/components/dashboard/DashboardSectionHeader'
import { EventRow } from '#/components/events/EventRow'
import { ButtonLink } from '#/components/ui/button'

type TodayBriefingCardProps = {
  className?: string
  data: DashboardCommandData
  chrome?: DashboardCommandChrome
}

export function TodayBriefingCard({
  className,
  data,
  chrome = 'cards',
}: TodayBriefingCardProps) {
  const events = data.todayEvents
  const recordChrome = 'soft' as const

  return (
    <DashboardSection
      chrome={chrome}
      className={className}
      padding={chrome === 'cards' ? 'roomy' : 'default'}
    >
      <DashboardSectionHeader
        title="Today"
        size="section"
        titleStyle="display"
        actions={
          <ButtonLink
            to="/stables/$stableId/events/create"
            params={{ stableId: data.stable._id }}
            action="create"
            size="sm"
            className="min-h-11"
          >
            Add event
          </ButtonLink>
        }
      />

      {events.length === 0 ? (
        <DashboardEmptyState
          chrome={recordChrome}
          className="h-full min-h-40 place-content-center justify-items-center px-6 py-8 text-center"
          title="A quieter day at the stable"
          titleClassName="text-xl font-semibold tracking-normal md:text-2xl"
          bodyClassName="max-w-xl text-base text-muted-foreground md:text-lg"
        >
          Nothing is scheduled right now. Take the extra breathing room and
          enjoy a slower day.
        </DashboardEmptyState>
      ) : (
        <DashboardItemList>
          {events.map((event) => (
            <EventRow
              key={event._id}
              event={event}
              chrome={recordChrome}
              accent="primary"
              variant="contextual"
            />
          ))}
        </DashboardItemList>
      )}
    </DashboardSection>
  )
}
