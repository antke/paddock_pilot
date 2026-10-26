import { Link } from '@tanstack/react-router'
import { HorseAvatar } from '#/components/horses/HorseAvatar'
import { getHorseDisplayName } from 'shared/horses/horseDisplayName'
import { useT } from '#/i18n/LocaleProvider'
import { ButtonLink } from '#/components/ui/button'
import { HorseCard, HorseCardLink } from '#/components/horses/HorseCard'
import { NoHorsesPrompt } from '#/components/horses/NoHorsesPrompt'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { Badge } from '#/components/ui/badge'
import { dashboardMobileRecordClassName } from '#/components/dashboard/dashboardChrome'
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
  compact?: boolean
}

export function HorseRosterCard({
  className,
  data,
  visibleItemLimit = 5,
  chrome = 'soft',
  compact = false,
}: HorseRosterCardProps) {
  const t = useT()

  const horses = data.horses.slice(0, visibleItemLimit)

  return (
    <DashboardSection
      chrome={chrome}
      className={cn('@container/horse-roster', className)}
      gap="compact"
      title={t('dashboard.horses')}
      size="panel"
      titleStyle="display"
      headerLayout="inline"
      actions={
        <>
          {!compact && data.horses.length > 0 && (
            <ButtonLink
              to="/stables/$stableId/horses/create"
              params={{ stableId: data.stable._id }}
              variant="outline"
              action="create"
              size="sm"
              className="min-h-11"
            >
              {t('dashboard.addHorse')}
            </ButtonLink>
          )}
        </>
      }
    >
      {data.horses.length > 0 ? (
        compact ? (
          <ul className="min-w-0 divide-y divide-border-subtle">
            {horses.map((horse) => (
              <li key={horse._id}>
                <CompactHorseRosterItem data={data} horse={horse} />
              </li>
            ))}
          </ul>
        ) : (
          <DashboardItemList
            gap="compact"
            className={compact ? 'max-md:gap-3' : undefined}
          >
            {horses.map((horse) => (
              <HorseRosterItem
                key={horse._id}
                data={data}
                horse={horse}
                compact={compact}
              />
            ))}
          </DashboardItemList>
        )
      ) : (
        <NoHorsesPrompt chrome="flat" />
      )}
      {data.horses.length > 0 && (
        <ButtonLink
          to="/stables/$stableId/horses"
          params={{ stableId: data.stable._id }}
          variant="link"
          className="min-h-11 justify-self-start px-0"
        >
          {t('dashboard.viewAllHorses')} ({data.horses.length})
        </ButtonLink>
      )}
    </DashboardSection>
  )
}

function HorseRosterItem({
  data,
  horse,
  compact,
}: {
  data: DashboardCommandData
  horse: DashboardCommandHorse
  compact: boolean
}) {
  const t = useT()

  if (horse.canRead === false)
    return (
      <HorseCard
        horse={horse}
        className={compact ? dashboardMobileRecordClassName : undefined}
      />
    )

  const attention = data.attentionHorses.find(
    (item) => item.horseId === horse._id,
  )
  return (
    <HorseCardLink
      horse={horse}
      className={compact ? dashboardMobileRecordClassName : undefined}
      listDensity={compact ? 'compact' : undefined}
      stableId={data.stable._id}
      horseId={horse._id}
      badges={
        attention ? (
          <Badge variant="warning">{t('dashboard.needsCare')}</Badge>
        ) : undefined
      }
    />
  )
}

function CompactHorseRosterItem({
  data,
  horse,
}: {
  data: DashboardCommandData
  horse: DashboardCommandHorse
}) {
  const t = useT()
  const attention = data.attentionHorses.some(
    (item) => item.horseId === horse._id,
  )
  const content = (
    <>
      <HorseAvatar
        name={getHorseDisplayName(horse)}
        profileImageUrl={horse.profileImageUrl}
        size="sm"
      />
      <span className="grid min-w-0 gap-1">
        <span className="line-clamp-2 text-base font-semibold leading-5 wrap-anywhere">
          {getHorseDisplayName(horse)}
        </span>
        <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-5 text-muted-foreground">
          {horse.ownerName && (
            <span className="min-w-0 wrap-anywhere">{horse.ownerName}</span>
          )}
          {attention && (
            <Badge variant="warning">{t('dashboard.needsCare')}</Badge>
          )}
        </span>
      </span>
    </>
  )
  const rowClass =
    'grid min-h-18 min-w-0 grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-3 py-3'
  return horse.canRead === false ? (
    <div className={rowClass}>{content}</div>
  ) : (
    <Link
      to="/stables/$stableId/horses/$horseId"
      params={{ stableId: data.stable._id, horseId: horse._id }}
      className={cn(
        rowClass,
        'app-control-focus rounded-control hover:bg-surface active:bg-surface-muted',
      )}
    >
      {content}
    </Link>
  )
}
