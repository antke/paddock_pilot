import { EventIcon, TrainingIcon } from '#/components/icons/domain-icons'
import { Link } from '@tanstack/react-router'
import {
  AddressBookIcon,
  BarnIcon,
  FirstAidKitIcon,
  HorseIcon,
  ListBulletsIcon,
  PhoneIcon,
  StackIcon,
} from '@phosphor-icons/react'
import {
  MobileActionMenu,
  MobileActionMenuGroup,
  MobileActionMenuItem,
  MobileActionMenuSeparator,
} from '#/components/layout/MobileActionMenu'
import { useTaskOriginState } from '#/components/layout/mobileTaskNavigation'
import { useOwnershipCopy } from '#/components/ownership/ownershipCopy'
import { useT } from '#/i18n/LocaleProvider'

/** Stables listed by name in Go to before the list collapses to Stables. */
const directStableLimit = 3

const itemIconClassName = 'size-5 shrink-0'

/**
 * The phone quick menu: the places people reach for most often from Home,
 * then creation. The menu opens upward, so Add, the most used group, sits
 * nearest the thumb; stable records stay one tap away from the personal view.
 */
export function DashboardCreateMenu({
  stableId,
  stableName,
  stables = [],
  canCreateActivity = true,
}: {
  stableId?: string
  /** Sub-heads the stable's shortcuts inside Go to, so its rows can stay short. */
  stableName?: string
  /** The viewer's stables, offered by name in Go to from the personal view. */
  stables?: ReadonlyArray<{ _id: string; name: string }>
  canCreateActivity?: boolean
}) {
  const t = useT()
  const c = useOwnershipCopy()
  const taskState = useTaskOriginState()

  return (
    <MobileActionMenu label={t('dashboard.quickMenu')}>
      <MobileActionMenuGroup label={t('dashboard.quickGoTo')}>
        {stableId ? (
          <>
            {/* The personal list is not a stable page, so it leads, above the stable's own shortcuts. */}
            <MobileActionMenuItem render={<Link to="/horses" />}>
              <StackIcon aria-hidden="true" className={itemIconClassName} />
              {c.title}
            </MobileActionMenuItem>
            <MobileActionMenuGroup label={stableName} nested>
              <MobileActionMenuItem
                render={
                  <Link to="/stables/$stableId/horses" params={{ stableId }} />
                }
              >
                <ListBulletsIcon
                  aria-hidden="true"
                  className={itemIconClassName}
                />
                {t('navigationShell.stableHorses')}
              </MobileActionMenuItem>
              <MobileActionMenuItem
                render={
                  <Link
                    to="/stables/$stableId/reminders"
                    params={{ stableId }}
                  />
                }
              >
                <FirstAidKitIcon
                  aria-hidden="true"
                  className={itemIconClassName}
                />
                {t('dashboard.reminders')}
              </MobileActionMenuItem>
              <MobileActionMenuItem
                render={
                  <Link
                    to="/stables/$stableId/stable"
                    params={{ stableId }}
                    search={{ tab: 'contacts' }}
                  />
                }
              >
                <AddressBookIcon
                  aria-hidden="true"
                  className={itemIconClassName}
                />
                {t('dashboard.contacts')}
              </MobileActionMenuItem>
            </MobileActionMenuGroup>
          </>
        ) : (
          <>
            <MobileActionMenuItem render={<Link to="/horses" />}>
              <ListBulletsIcon
                aria-hidden="true"
                className={itemIconClassName}
              />
              {c.title}
            </MobileActionMenuItem>
            {stables.length <= directStableLimit ? (
              stables.map((stable) => (
                <MobileActionMenuItem
                  key={stable._id}
                  render={
                    <Link
                      to="/stables/$stableId"
                      params={{ stableId: stable._id }}
                    />
                  }
                >
                  <BarnIcon aria-hidden="true" className={itemIconClassName} />
                  <span className="min-w-0 truncate">{stable.name}</span>
                </MobileActionMenuItem>
              ))
            ) : (
              <MobileActionMenuItem render={<Link to="/stables" />}>
                <BarnIcon aria-hidden="true" className={itemIconClassName} />
                {t('navigation.stables')}
              </MobileActionMenuItem>
            )}
            <MobileActionMenuItem render={<Link to="/horses/contacts" />}>
              <PhoneIcon aria-hidden="true" className={itemIconClassName} />
              {c.providers}
            </MobileActionMenuItem>
          </>
        )}
      </MobileActionMenuGroup>
      <MobileActionMenuSeparator />

      <MobileActionMenuGroup label={t('dashboard.quickAdd')}>
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
              <EventIcon aria-hidden="true" className={itemIconClassName} />
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
              <TrainingIcon aria-hidden="true" className={itemIconClassName} />
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
          <HorseIcon aria-hidden="true" className={itemIconClassName} />
          {t('dashboard.addHorse')}
        </MobileActionMenuItem>
      </MobileActionMenuGroup>
    </MobileActionMenu>
  )
}
