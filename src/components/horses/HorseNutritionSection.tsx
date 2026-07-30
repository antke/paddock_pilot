import { DashboardSectionTabGroup } from '#/components/dashboard/DashboardNavigation'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
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
    <DashboardSectionTabGroup
      activeId={activeTab}
      items={nutritionTabs}
      onSelect={(nextTab) => {
        if (activeTab === nextTab) return
        setHeaderAction(null)
        setActiveTab(nextTab)
      }}
    >
      <DashboardSectionCard
        title={activeTabDetails.title}
        description={activeTabDetails.description}
        actions={headerAction}
        contentGap="loose"
      >
        {activeTab === 'nutrition' && (
          <>
            <HorseNutritionCard horse={horse} showHeader={false} />
            <HorseNutritionLogsCard
              horse={horse}
              onCreateActionChange={setHeaderAction}
            />
          </>
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
      </DashboardSectionCard>
    </DashboardSectionTabGroup>
  )
}
