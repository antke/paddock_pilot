import {
  dashboardInlinePanelClassName,
  dashboardSectionClassName,
} from '#/components/dashboard/dashboardChrome'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '#/components/ui/navigation-menu'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { HorseCareRemindersCard } from '../reminders/HorseCareRemindersCard'
import type { HorseDetailSectionProps } from './HorseDetail'
import { HorseHealthIssuesCard } from './HorseHealthIssuesCard'

type CareTab = 'reminders' | 'health'

type CareTabItem = {
  id: CareTab
  label: string
  title: string
  description: string
}

const careTabs = [
  {
    id: 'reminders',
    label: 'Care reminders',
    title: 'Care reminders',
    description: 'Track due checks, reviews, and follow-ups for this horse.',
  },
  {
    id: 'health',
    label: 'Health issues',
    title: 'Health issues',
    description: 'Track active and resolved health notes for this horse.',
  },
] satisfies Array<CareTabItem>

const careTabDetails = {
  reminders: careTabs[0],
  health: careTabs[1],
} satisfies Record<CareTab, CareTabItem>

export function HorseCareSection({ horse }: HorseDetailSectionProps) {
  const [activeTab, setActiveTab] = useState<CareTab>('reminders')
  const [headerAction, setHeaderAction] = useState<ReactNode>(null)
  const activeTabDetails = careTabDetails[activeTab]

  return (
    <div className="grid gap-3">
      <NavigationMenu className="justify-start px-1">
        <NavigationMenuList className="flex-wrap justify-start gap-1">
          {careTabs.map((tab) => (
            <NavigationMenuItem key={tab.id}>
              <NavigationMenuLink
                render={<button type="button" />}
                data-active={activeTab === tab.id || undefined}
                onClick={() => {
                  if (activeTab === tab.id) return
                  setHeaderAction(null)
                  setActiveTab(tab.id)
                }}
              >
                {tab.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      <section className={dashboardSectionClassName('soft', 'grid gap-6')}>
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="grid gap-1.5">
            <h2 className="text-2xl font-semibold leading-tight tracking-tight">
              {activeTabDetails.title}
            </h2>
            <p className="text-base leading-6 text-muted-foreground">
              {activeTabDetails.description}
            </p>
          </div>

          {headerAction}
        </header>

        {activeTab === 'reminders' && (
          <div className="grid gap-5">
            {(horse.vetName ||
              horse.vetPhone ||
              horse.farrierName ||
              horse.farrierPhone ||
              horse.emergencyNotes) && (
              <section className="grid gap-5">
                <div className="grid gap-1">
                  <h2 className="text-2xl font-semibold leading-tight tracking-tight">
                    Care contacts
                  </h2>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {horse.vetName && (
                    <CareContact label="Vet" value={horse.vetName} />
                  )}
                  {horse.vetPhone && (
                    <CareContact label="Vet phone" value={horse.vetPhone} />
                  )}
                  {horse.farrierName && (
                    <CareContact label="Farrier" value={horse.farrierName} />
                  )}
                  {horse.farrierPhone && (
                    <CareContact
                      label="Farrier phone"
                      value={horse.farrierPhone}
                    />
                  )}
                  {horse.emergencyNotes && (
                    <div
                      className={dashboardInlinePanelClassName(
                        'soft',
                        'grid gap-2 p-5 sm:col-span-2 xl:col-span-4',
                      )}
                    >
                      <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Emergency notes
                      </span>
                      <p className="whitespace-pre-wrap text-sm leading-6">
                        {horse.emergencyNotes}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            <HorseCareRemindersCard
              horse={horse}
              onCreateActionChange={setHeaderAction}
            />
          </div>
        )}

        {activeTab === 'health' && (
          <HorseHealthIssuesCard
            horse={horse}
            onCreateActionChange={setHeaderAction}
          />
        )}
      </section>
    </div>
  )
}

function CareContact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-row bg-background/55 p-5">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-3 text-sm font-medium leading-6">{value}</div>
    </div>
  )
}
