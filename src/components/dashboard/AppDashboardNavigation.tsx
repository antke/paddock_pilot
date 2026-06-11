import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '#/components/ui/navigation-menu'
import type { Doc } from 'convex/_generated/dataModel'

type AppDashboardNavigationProps = {
  stables?: Array<Doc<'stables'>>
  activeStableId?: Doc<'stables'>['_id']
  onActiveStableChange?: (stableId: Doc<'stables'>['_id']) => void
}

export function AppDashboardNavigation({
  stables = [],
  activeStableId,
  onActiveStableChange,
}: AppDashboardNavigationProps = {}) {
  const showStableSelector = stables.length > 0 && activeStableId && onActiveStableChange
  const activeStable = stables.find((stable) => stable._id === activeStableId)

  if (!showStableSelector) return null

  return (
    <NavigationMenu className="justify-start lg:justify-end">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger data-active>
            {activeStable?.name ?? 'Select stable'}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-56 gap-1">
              {stables.map((stable) => (
                <NavigationMenuLink
                  key={stable._id}
                  render={<button type="button" />}
                  closeOnClick
                  data-active={stable._id === activeStableId || undefined}
                  onClick={() => onActiveStableChange(stable._id)}
                  className="justify-between text-left"
                >
                  <span className="line-clamp-1">{stable.name}</span>
                  {stable._id === activeStableId && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Active
                    </span>
                  )}
                </NavigationMenuLink>
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
