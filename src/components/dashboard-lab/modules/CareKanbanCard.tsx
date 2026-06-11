import { Badge } from '#/components/ui/badge'
import type { DashboardLabChrome, DashboardLabData } from '../dashboardLabTypes'
import {
  DashboardItemCardContent,
  dashboardItemCardClassName,
} from './DashboardItemCard'
import {
  dashboardInlinePanelClassName,
  dashboardSectionClassName,
} from './dashboardChrome'
import { ScrollableList } from '#/components/ui/scrollable-list'

type CareKanbanCardProps = {
  data: DashboardLabData
  visibleItemLimit?: number
  chrome?: DashboardLabChrome
}

export function CareKanbanCard({
  data,
  visibleItemLimit = 5,
  chrome = 'cards',
}: CareKanbanCardProps) {
  const lanes = [
    {
      title: 'Due today',
      count: data.dueReminders.filter((reminder) => reminder.overdue).length,
      items: data.dueReminders.filter((reminder) => reminder.overdue),
      empty: 'No overdue care.',
    },
    {
      title: 'Upcoming',
      count: data.upcomingEvents.length,
      items: data.upcomingEvents,
      empty: 'No planned care.',
    },
    {
      title: 'Flagged horses',
      count: data.attentionHorses.length,
      items: data.attentionHorses,
      empty: 'No horse alerts.',
    },
  ]

  return (
    <section className={dashboardSectionClassName(chrome)}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight">Care board</h2>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        {lanes.map((lane) => (
          <div
            key={lane.title}
            className={dashboardInlinePanelClassName(chrome)}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">{lane.title}</h3>
              <Badge variant="outline">{lane.count}</Badge>
            </div>
            {lane.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">{lane.empty}</p>
            ) : (
              <ScrollableList
                itemCount={lane.items.length}
                visibleItemLimit={visibleItemLimit}
                estimatedItemHeightRem={3.75}
              >
                {lane.items.map((item) => (
                  <div
                    key={getItemKey(item)}
                    className={dashboardItemCardClassName({
                      density: 'compact',
                      chrome,
                    })}
                  >
                    <DashboardItemCardContent
                      title={getItemTitle(item)}
                      meta={getItemMeta(item)}
                      density="compact"
                    />
                  </div>
                ))}
              </ScrollableList>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

type CareKanbanItem =
  | DashboardLabData['dueReminders'][number]
  | DashboardLabData['upcomingEvents'][number]
  | DashboardLabData['attentionHorses'][number]

function getItemKey(item: CareKanbanItem) {
  if ('horseId' in item && 'horseName' in item) return item.horseId
  return item.id
}

function getItemTitle(item: CareKanbanItem) {
  if ('horseName' in item && 'activeIssueCount' in item) return item.horseName
  return item.title
}

function getItemMeta(item: CareKanbanItem) {
  if ('dueDate' in item) return `Due ${item.dueDate}`
  if ('date' in item) return `${item.date} at ${item.time}`
  return `${item.activeIssueCount} active issues`
}
