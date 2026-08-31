import { DashboardSectionTabGroup } from '#/components/dashboard/DashboardNavigation'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import type { ReactNode } from 'react'

export type HorseDetailSectionTabItem<TTabId extends string> = {
  id: TTabId
  label: string
  title: string
  description: string
}

type HorseDetailSectionTabsProps<TTabId extends string> = {
  activeId: TTabId
  actions?: ReactNode
  children: ReactNode
  items: ReadonlyArray<HorseDetailSectionTabItem<TTabId>>
  onSelect: (id: TTabId) => void
}

export function HorseDetailSectionTabs<TTabId extends string>({
  activeId,
  actions,
  children,
  items,
  onSelect,
}: HorseDetailSectionTabsProps<TTabId>) {
  const activeItem = items.find((item) => item.id === activeId) ?? items[0]

  return (
    <DashboardSectionTabGroup
      activeId={activeId}
      ariaLabel={`${activeItem.title} views`}
      items={items}
      onSelect={onSelect}
    >
      <DashboardSectionCard
        title={activeItem.title}
        description={activeItem.description}
        actions={actions}
        contentGap="loose"
      >
        {children}
      </DashboardSectionCard>
    </DashboardSectionTabGroup>
  )
}
