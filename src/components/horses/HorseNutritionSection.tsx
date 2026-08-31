import { useState } from 'react'
import type { ReactNode } from 'react'
import { HorseMedicationRecordsCard } from './HorseMedicationRecordsCard'
import type { HorseDetailSectionProps } from './HorseDetail'
import { HorseNutritionCard } from './HorseNutritionCard'
import { HorseNutritionLogsCard } from './HorseNutritionLogsCard'
import { HorseWeightRecordsCard } from './HorseWeightRecordsCard'
import { HorseDetailSectionTabs } from './HorseDetailSectionTabs'

type NutritionTab = 'nutrition' | 'weight' | 'medication'

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
] as const

export function HorseNutritionSection({ horse }: HorseDetailSectionProps) {
  const [activeTab, setActiveTab] = useState<NutritionTab>('nutrition')
  const [headerAction, setHeaderAction] = useState<ReactNode>(null)

  return (
    <HorseDetailSectionTabs
      activeId={activeTab}
      items={nutritionTabs}
      onSelect={(nextTab) => {
        if (activeTab === nextTab) return
        setHeaderAction(null)
        setActiveTab(nextTab)
      }}
      actions={headerAction}
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
    </HorseDetailSectionTabs>
  )
}
