import { useT } from '#/i18n/LocaleProvider'
import { DashboardTabbedCard } from '#/components/dashboard/DashboardTabbedCard'
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
  const t = useT()

  return (
    <DashboardTabbedCard
      activeId={activeId}
      ariaLabel={t('horseDetail.views')}
      items={items}
      onSelect={onSelect}
      actions={actions}
    >
      {children}
    </DashboardTabbedCard>
  )
}
