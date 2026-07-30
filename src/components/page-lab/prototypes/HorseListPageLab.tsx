import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { HorseCardLink } from '#/components/horses/HorseCard'
import { NoHorsesPrompt } from '#/components/horses/NoHorsesPrompt'
import { ButtonLink } from '#/components/ui/button'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'

type HorseListPageLabProps = {
  data: DashboardLabData
}

export function HorseListPageLab({ data }: HorseListPageLabProps) {
  if (data.horses.length === 0) {
    return <NoHorsesPrompt stableId={data.stable._id} />
  }

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Horses"
        actions={
          <ButtonLink
            to="/stables/$stableId/horses/create"
            params={{ stableId: data.stable._id }}
            variant="secondary"
          >
            Add horse
          </ButtonLink>
        }
      />

      <DashboardSectionCard contentGap="comfortable">
        <DashboardItemList gap="comfortable">
          {data.horses.map((horse) => (
            <HorseCardLink
              key={horse._id}
              horse={horse}
              stableId={data.stable._id}
              horseId={horse._id}
            />
          ))}
        </DashboardItemList>
      </DashboardSectionCard>
    </DashboardPage>
  )
}
