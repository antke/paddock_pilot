import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '#/components/ui/navigation-menu'
import { Link, useLocation } from '@tanstack/react-router'

type StableFeatureNavigationProps = {
  stableId: string
}

export function StableFeatureNavigation({
  stableId,
}: StableFeatureNavigationProps) {
  const { pathname } = useLocation()
  const stableBasePath = `/stables/${stableId}`
  const pathAfterStable = pathname.slice(stableBasePath.length)
  const activeGroup = pathAfterStable.startsWith('/events') ||
    pathAfterStable.startsWith('/reminders')
    ? 'schedule'
    : pathAfterStable.startsWith('/horses') ||
        pathAfterStable.startsWith('/documents') ||
        pathAfterStable.startsWith('/analysis')
      ? 'records'
      : 'stable'

  return (
    <NavigationMenu className="ml-auto justify-end">
      <NavigationMenuList className="flex-wrap justify-end">
        <NavigationMenuItem>
          <NavigationMenuTrigger data-active={activeGroup === 'stable' || undefined}>
            Stable
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-52 gap-1">
              <NavigationMenuLink
                render={<Link to="/stables/$stableId" params={{ stableId }} />}
                closeOnClick
              >
                Overview
              </NavigationMenuLink>
              <NavigationMenuLink
                render={<Link to="/stables/$stableId/edit" params={{ stableId }} />}
                closeOnClick
              >
                Edit details
              </NavigationMenuLink>
              <NavigationMenuLink
                render={
                  <Link to="/stables/$stableId/settings" params={{ stableId }} />
                }
                closeOnClick
              >
                Settings
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger data-active={activeGroup === 'records' || undefined}>
            Records
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-56 gap-1">
              <NavigationMenuLink
                render={<Link to="/stables/$stableId/horses" params={{ stableId }} />}
                closeOnClick
              >
                Horses
              </NavigationMenuLink>
              <NavigationMenuLink
                render={
                  <Link to="/stables/$stableId/documents" params={{ stableId }} />
                }
                closeOnClick
              >
                Documents
              </NavigationMenuLink>
              <NavigationMenuLink
                render={
                  <Link to="/stables/$stableId/analysis" params={{ stableId }} />
                }
                closeOnClick
              >
                Analysis
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger data-active={activeGroup === 'schedule' || undefined}>
            Schedule
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-56 gap-1">
              <NavigationMenuLink
                render={<Link to="/stables/$stableId/events" params={{ stableId }} />}
                closeOnClick
              >
                All events
              </NavigationMenuLink>
              <NavigationMenuLink
                render={
                  <Link
                    to="/stables/$stableId/events/calendar"
                    params={{ stableId }}
                  />
                }
                closeOnClick
              >
                Calendar
              </NavigationMenuLink>
              <NavigationMenuLink
                render={
                  <Link to="/stables/$stableId/reminders" params={{ stableId }} />
                }
                closeOnClick
              >
                Reminders
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
