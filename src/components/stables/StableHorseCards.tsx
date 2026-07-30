import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'
import { HorseCardLink } from '#/components/horses/HorseCard'
import { NoHorsesPrompt } from '#/components/horses/NoHorsesPrompt'
import type { Doc } from 'convex/_generated/dataModel'

type StableHorseCardsProps = {
  stableId: string
  horses: Array<Doc<'horses'>>
}

export function StableHorseCards({ stableId, horses }: StableHorseCardsProps) {
  if (horses.length === 0) {
    return <NoHorsesPrompt stableId={stableId} />
  }

  return (
    <DashboardItemList gap="comfortable">
      {horses.map((horse) => (
        <HorseCardLink
          key={horse._id}
          horse={horse}
          stableId={stableId}
          horseId={horse._id}
        />
      ))}
    </DashboardItemList>
  )
}
