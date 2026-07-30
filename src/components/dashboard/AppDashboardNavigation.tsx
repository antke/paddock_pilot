import {
  DashboardNavigation,
  DashboardNavigationMenuButton,
  DashboardNavigationMenuGroup,
} from './DashboardNavigation'
import { TextLabel } from '#/components/ui/text-label'
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
  const showStableSelector =
    stables.length > 0 && activeStableId && onActiveStableChange
  const activeStable = stables.find((stable) => stable._id === activeStableId)

  if (!showStableSelector) return null

  return (
    <DashboardNavigation align="end" inset={false}>
      <DashboardNavigationMenuGroup
        active
        label={activeStable?.name ?? 'Select stable'}
        contentWidth="md"
      >
        {stables.map((stable) => (
          <DashboardNavigationMenuButton
            key={stable._id}
            data-active={stable._id === activeStableId || undefined}
            onClick={() => onActiveStableChange(stable._id)}
            className="justify-between text-left"
          >
            <span className="line-clamp-1">{stable.name}</span>
            {stable._id === activeStableId && (
              <TextLabel size="nano" weight="semibold" tracking="wide">
                Active
              </TextLabel>
            )}
          </DashboardNavigationMenuButton>
        ))}
      </DashboardNavigationMenuGroup>
    </DashboardNavigation>
  )
}
