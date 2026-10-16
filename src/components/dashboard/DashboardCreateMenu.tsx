import { EventIcon, TrainingIcon } from '#/components/icons/domain-icons'
import { Link } from '@tanstack/react-router'
import { HorseIcon } from '@phosphor-icons/react'
import {
  MobileActionMenu,
  MobileActionMenuItem,
} from '#/components/layout/MobileActionMenu'
import { useTaskOriginState } from '#/components/layout/mobileTaskNavigation'
import { useT } from '#/i18n/LocaleProvider'

/** Mobile creation stays within thumb reach while the dashboard remains readable. */
export function DashboardCreateMenu({
  stableId,
  canCreateActivity = true,
}: {
  stableId?: string
  canCreateActivity?: boolean
}) {
  const t = useT()
  const taskState = useTaskOriginState()
  return (
    <MobileActionMenu
      label={t(
        canCreateActivity ? 'dashboard.addActivity' : 'dashboard.addHorse',
      )}
    >
      {canCreateActivity && (
        <>
          <MobileActionMenuItem
            render={
              <Link
                to={
                  stableId
                    ? '/stables/$stableId/events/create'
                    : '/events/create'
                }
                params={{ stableId: stableId ?? '' }}
                state={taskState}
              />
            }
          >
            <EventIcon aria-hidden="true" className="size-5" />
            {t('dashboard.addEvent')}
          </MobileActionMenuItem>
          <MobileActionMenuItem
            render={
              <Link
                to={
                  stableId
                    ? '/stables/$stableId/training/create'
                    : '/events/create'
                }
                params={{ stableId: stableId ?? '' }}
                search={{
                  intent: 'record',
                  training: stableId ? undefined : true,
                }}
                state={taskState}
              />
            }
          >
            <TrainingIcon aria-hidden="true" className="size-5" />
            {t('trainingViews.recordCompleted')}
          </MobileActionMenuItem>
        </>
      )}
      <MobileActionMenuItem
        render={
          <Link
            to={
              stableId ? '/stables/$stableId/horses/create' : '/horses/create'
            }
            params={{ stableId: stableId ?? '' }}
            state={taskState}
          />
        }
      >
        <HorseIcon aria-hidden="true" className="size-5" />
        {t('dashboard.addHorse')}
      </MobileActionMenuItem>
    </MobileActionMenu>
  )
}
