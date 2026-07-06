import { dashboardSectionClassName } from '#/components/dashboard/dashboardChrome'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '#/components/ui/navigation-menu'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { HorseMedicationRecordsCard } from './HorseMedicationRecordsCard'
import type { HorseDetailSectionProps } from './HorseDetail'
import { HorseNutritionCard } from './HorseNutritionCard'
import { HorseNutritionLogsCard } from './HorseNutritionLogsCard'
import { HorseWeightRecordsCard } from './HorseWeightRecordsCard'

type NutritionTab = 'nutrition' | 'weight' | 'medication'

type NutritionTabItem = {
  id: NutritionTab
  label: string
  title: string
  description: string
}

const nutritionTabs = [
  {
    id: 'nutrition',
    label: 'Nutrition',
    title: 'Nutrition',
    description:
      'Review the current feeding plan and nutrition change history.',
  },
  {
    id: 'weight',
    label: 'Weight',
    title: 'Weight',
    description: 'Track weight changes and body condition over time.',
  },
  {
    id: 'medication',
    label: 'Medication',
    title: 'Medication',
    description: 'Manage active and historical medication records.',
  },
] satisfies Array<NutritionTabItem>

const nutritionTabDetails = {
  nutrition: nutritionTabs[0],
  weight: nutritionTabs[1],
  medication: nutritionTabs[2],
} satisfies Record<NutritionTab, NutritionTabItem>

export function HorseNutritionSection({ horse }: HorseDetailSectionProps) {
  const [activeTab, setActiveTab] = useState<NutritionTab>('nutrition')
  const [headerAction, setHeaderAction] = useState<ReactNode>(null)
  const activeTabDetails = nutritionTabDetails[activeTab]

  return (
    <div className="grid gap-3">
      <NavigationMenu className="justify-start px-1">
        <NavigationMenuList className="flex-wrap justify-start gap-1">
          {nutritionTabs.map((tab) => (
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
          <div>
            <h2 className="text-2xl font-semibold leading-tight tracking-tight">
              {activeTabDetails.title}
            </h2>
            <p className="text-base leading-6 text-muted-foreground">
              {activeTabDetails.description}
            </p>
          </div>

          {headerAction}
        </header>

        {activeTab === 'nutrition' && (
          <div className="grid gap-5">
            <HorseNutritionCard horse={horse} />
            <HorseNutritionLogsCard
              horse={horse}
              onCreateActionChange={setHeaderAction}
            />
          </div>
        )}

        {activeTab === 'weight' && (
          <HorseWeightRecordsCard
            horse={horse}
            onCreateActionChange={setHeaderAction}
          />
        )}

        {activeTab === 'medication' && (
          <HorseMedicationRecordsCard
            horse={horse}
            onCreateActionChange={setHeaderAction}
          />
        )}
      </section>
    </div>
  )
}
