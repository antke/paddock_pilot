import { Badge } from '#/components/ui/badge'
import { Link } from '@tanstack/react-router'
import { eventTypeLabels } from 'shared/events/eventSchema'
import { careReminderCategoryLabels } from 'shared/reminders/careReminderSchema'
import type { DashboardLabData } from '../dashboardLabTypes'
import { DashboardItemCardContent, dashboardItemCardClassName } from './DashboardItemCard'
import { ScrollableList } from '#/components/ui/scrollable-list'

type PriorityQueueCardProps = {
  data: DashboardLabData
  visibleItemLimit?: number
}

export function PriorityQueueCard({
  data,
  visibleItemLimit = 5,
}: PriorityQueueCardProps) {
  const rows = [
    ...data.dueReminders.map((reminder) => ({
      id: reminder.id,
      title: reminder.title,
      meta: `${reminder.overdue ? 'Overdue' : 'Due'} ${formatShortDate(reminder.dueDate)}`,
      tag: careReminderCategoryLabels[reminder.category],
      tone: reminder.overdue ? 'urgent' : 'due',
      to: '/stables/$stableId/reminders' as const,
      params: { stableId: reminder.stableId },
    })),
    ...data.upcomingEvents.map((event) => ({
      id: event.id,
      title: event.title,
      meta: `${formatShortDate(event.date)} at ${event.time}`,
      tag: eventTypeLabels[event.type],
      tone: 'planned',
      to: '/stables/$stableId/events/$eventId' as const,
      params: { stableId: event.stableId, eventId: event.id },
    })),
  ]

  return (
    <section className="rounded-panel border border-border-subtle bg-card/80 p-5 shadow-control">
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight">Priority queue</h2>
      </div>
      {rows.length === 0 ? (
        <p className="rounded-row border border-dashed border-border-subtle p-4 text-sm text-muted-foreground">
          Nothing urgent for this stable.
        </p>
      ) : (
        <ScrollableList itemCount={rows.length} visibleItemLimit={visibleItemLimit}>
          {rows.map((row) => (
            <Link
              key={`${row.tone}-${row.id}`}
              to={row.to}
              params={row.params}
              className={dashboardItemCardClassName({ density: 'compact', interactive: true })}
            >
              <DashboardItemCardContent
                title={row.title}
                meta={row.meta}
                density="compact"
                badges={
                  <Badge variant={row.tone === 'urgent' ? 'destructive' : 'outline'}>
                    {row.tag}
                  </Badge>
                }
              />
            </Link>
          ))}
        </ScrollableList>
      )}
    </section>
  )
}

const shortDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
})

function formatShortDate(date: string) {
  return shortDateFormatter.format(new Date(`${date}T00:00:00`))
}
