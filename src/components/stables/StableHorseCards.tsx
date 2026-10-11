import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'
import { HorseCard, HorseCardLink } from '#/components/horses/HorseCard'
import { NoHorsesPrompt } from '#/components/horses/NoHorsesPrompt'
import type { Doc } from 'convex/_generated/dataModel'

type StableHorseCardsProps = {
  stableId: string
  horses: Array<Doc<'horses'> & { canRead?: boolean }>
}

export function StableHorseCards({ stableId, horses }: StableHorseCardsProps) {
  if (horses.length === 0) {
    return <NoHorsesPrompt stableId={stableId} />
  }

  return (
    <DashboardItemList gap="comfortable">
      {horses.map((horse) =>
        horse.canRead === false ? (
          <HorseCard key={horse._id} horse={horse} />
        ) : (
          <HorseCardLink
            key={horse._id}
            horse={horse}
            stableId={stableId}
            horseId={horse._id}
          />
        ),
      )}
    </DashboardItemList>
  )
}
