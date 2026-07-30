import { ButtonLink } from '#/components/ui/button'
import { HorseCardLink } from '#/components/horses/HorseCard'
import { NoHorsesPrompt } from '#/components/horses/NoHorsesPrompt'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { Badge } from '#/components/ui/badge'
import { cn } from '#/lib/utils'
import type {
  DashboardCommandChrome,
  DashboardCommandData,
  DashboardCommandHorse,
} from './dashboardTypes'
import { ScrollableList } from '#/components/ui/scrollable-list'

type HorseRosterCardProps = {
  className?: string
  data: DashboardCommandData
  visibleItemLimit?: number
  chrome?: DashboardCommandChrome
}

export function HorseRosterCard({
  className,
  data,
  visibleItemLimit = 5,
  chrome = 'cards',
}: HorseRosterCardProps) {
  return (
    <DashboardSection
      chrome={chrome}
      className={cn(
        '@container/horse-roster max-h-[80vh] min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden',
        className,
      )}
      gap="compact"
      title="Horses"
      size="panel"
      titleStyle="display"
      actions={
        <>
          <ButtonLink
            to="/stables/$stableId/horses/create"
            params={{ stableId: data.stable._id }}
            variant="secondary"
            size="sm"
          >
            Add horse
          </ButtonLink>
          <ButtonLink
            to="/stables/$stableId/horses"
            params={{ stableId: data.stable._id }}
            variant="outline"
            size="sm"
          >
            View all horses
          </ButtonLink>
        </>
      }
    >
      {data.horses.length > 0 ? (
        <ScrollableList
          className="@min-[42rem]/horse-roster:grid-cols-2"
          fillParent
          itemCount={data.horses.length}
          visibleItemLimit={visibleItemLimit}
          estimatedItemHeightRem={5.5}
        >
          {data.horses.map((horse) => (
            <HorseRosterItem key={horse._id} data={data} horse={horse} />
          ))}
        </ScrollableList>
      ) : (
        <NoHorsesPrompt stableId={data.stable._id} />
      )}
    </DashboardSection>
  )
}

function HorseRosterItem({
  data,
  horse,
}: {
  data: DashboardCommandData
  horse: DashboardCommandHorse
}) {
  const attention = data.attentionHorses.find(
    (item) => item.horseId === horse._id,
  )
  return (
    <HorseCardLink
      horse={horse}
      stableId={data.stable._id}
      horseId={horse._id}
      badges={
        attention ? <Badge variant="warning">Needs care</Badge> : undefined
      }
    />
  )
}
