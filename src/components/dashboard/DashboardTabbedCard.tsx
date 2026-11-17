import type { ReactNode } from 'react'
import { DashboardSectionCard } from './DashboardSectionCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { SectionAddContext } from '#/components/list-layout/RecordDialog'

type Props<T extends string> = {
  activeId: T
  items: ReadonlyArray<{ id: T; label: string; description?: string }>
  onSelect: (id: T) => void
  ariaLabel: string
  actions?: ReactNode
  children: ReactNode
  /** `canvas` when the tabs are the page's main content (Canvas List Rule). */
  surface?: 'canvas' | 'panel'
}

/** Secondary navigation belongs to the panel it controls. */
export function DashboardTabbedCard<T extends string>({
  activeId,
  items,
  onSelect,
  ariaLabel,
  actions,
  children,
  surface = 'panel',
}: Props<T>) {
  return (
    <Tabs
      value={activeId}
      onValueChange={(value) => {
        const item = items.find((candidate) => candidate.id === value)
        if (item) onSelect(item.id)
      }}
    >
      <DashboardSectionCard
        surface={surface}
        contentLayout="block"
        headerClassName="@container/tabs-header"
        headerContent={
          <div className="flex min-w-0 flex-col gap-3 @lg/tabs-header:flex-row @lg/tabs-header:items-start @lg/tabs-header:gap-6">
            <TabsList
              variant="line"
              activateOnFocus
              aria-label={ariaLabel}
              className="w-full min-w-0 max-w-full justify-start gap-0 p-0 max-md:flex-wrap md:overflow-x-auto md:overscroll-x-contain md:[scrollbar-width:thin] @lg/tabs-header:flex-1 [&>[data-slot=tabs-trigger]]:max-md:px-2"
            >
              {items.map((item) => (
                <TabsTrigger key={item.id} value={item.id}>
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {actions && (
              <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 @lg/tabs-header:pt-1">
                <SectionAddContext.Provider value={true}>
                  {actions}
                </SectionAddContext.Provider>
              </div>
            )}
          </div>
        }
      >
        {items.map((item) => (
          <TabsContent
            key={item.id}
            value={item.id}
            className="grid min-w-0 gap-6"
          >
            {item.description && (
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            )}
            {activeId === item.id && children}
          </TabsContent>
        ))}
      </DashboardSectionCard>
    </Tabs>
  )
}
