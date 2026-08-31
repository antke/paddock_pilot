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
import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'

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
  const horses = data.horses.slice(0, visibleItemLimit)

  return (
    <DashboardSection
      chrome={chrome}
      className={cn('@container/horse-roster', className)}
      gap="compact"
      title="Horses"
      size="panel"
      titleStyle="display"
      actions={
        <>
          <ButtonLink
            to="/stables/$stableId/horses/create"
            params={{ stableId: data.stable._id }}
            action="create"
            size="sm"
            className="min-h-11"
          >
            Add horse
          </ButtonLink>
          <ButtonLink
            to="/stables/$stableId/horses"
            params={{ stableId: data.stable._id }}
            variant="outline"
            size="sm"
            className="min-h-11"
          >
            View all horses
          </ButtonLink>
        </>
      }
    >
      {data.horses.length > 0 ? (
        <DashboardItemList
          className="@min-[42rem]/horse-roster:grid-cols-2"
          gap="compact"
        >
          {horses.map((horse) => (
            <HorseRosterItem key={horse._id} data={data} horse={horse} />
          ))}
        </DashboardItemList>
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
