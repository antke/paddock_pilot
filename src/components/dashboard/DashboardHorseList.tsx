import type { FunctionReturnType } from 'convex/server'
import type { api } from 'convex/_generated/api'
import { Link } from '@tanstack/react-router'
import { MotionList } from '#/components/motion/MotionList'
import { HorseAvatar } from '#/components/horses/HorseAvatar'
import { getHorseDisplayName } from 'shared/horses/horseDisplayName'
import { useOwnershipCopy } from '#/components/ownership/ownershipCopy'
import { useT } from '#/i18n/LocaleProvider'

export function DashboardHorseList({
  horses,
}: {
  horses: FunctionReturnType<typeof api.dashboard.view>['horses']
}) {
  const c = useOwnershipCopy()
  const t = useT()
  return (
    <MotionList
      items={horses}
      getKey={(horse) => horse._id}
      className="grid gap-3 sm:grid-cols-2"
      renderItem={(horse) => {
        const content = (
          <>
            <HorseAvatar
              name={getHorseDisplayName(horse)}
              profileImageUrl={horse.profileImageUrl}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold [overflow-wrap:anywhere]">
                {getHorseDisplayName(horse)}
              </h3>
              <p className="text-sm text-muted-foreground [overflow-wrap:anywhere]">
                {horse.stableName ?? c.personal}
              </p>
              <p className="text-sm text-muted-foreground">
                {horse.personal
                  ? horse.isOwner
                    ? c.owned
                    : c.shared
                  : t('navigationShell.stableHorses')}
              </p>
            </div>
          </>
        )
        const className =
          'app-row flex min-h-20 min-w-0 items-center gap-4 rounded-row px-4 py-3'
        return horse.canRead ? (
          <Link
            to={
              horse.personal
                ? '/horses/$horseId'
                : '/stables/$stableId/horses/$horseId'
            }
            params={{ horseId: horse._id, stableId: horse.stableId ?? '' }}
            className={`${className} app-control-focus transition-colors hover:bg-surface active:bg-surface-muted`}
          >
            {content}
          </Link>
        ) : (
          <div className={className}>{content}</div>
        )
      }}
    />
  )
}
