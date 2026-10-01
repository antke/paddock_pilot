import { useT } from '#/i18n/LocaleProvider'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { HorseMedicationRecordsCard } from './HorseMedicationRecordsCard'
import type { HorseDetailSectionProps } from './HorseDetail'
import { HorseNutritionCard } from './HorseNutritionCard'
import { HorseNutritionLogsCard } from './HorseNutritionLogsCard'
import { HorseWeightRecordsCard } from './HorseWeightRecordsCard'
import { HorseDetailSectionTabs } from './HorseDetailSectionTabs'

type NutritionTab = 'nutrition' | 'weight' | 'medication'

type SectionActionRenderer = (
  onCreateActionChange: (action: ReactNode | null) => void,
) => ReactNode

type HorseNutritionSectionViewProps = HorseDetailSectionProps & {
  renderLogs?: SectionActionRenderer
  renderWeight?: SectionActionRenderer
  renderMedication?: SectionActionRenderer
}

export function HorseNutritionSection({
  horse,
  renderLogs,
  renderWeight,
  renderMedication,
}: HorseNutritionSectionViewProps) {
  const t = useT()

  const nutritionTabs = [
    {
      id: 'nutrition',
      label: t('careRecords.nutrition'),
      title: t('careRecords.nutrition'),
      description: t('careRecords.nutritionHelp'),
    },
    {
      id: 'weight',
      label: t('careRecords.weight'),
      title: t('careRecords.weight'),
      description: t('careRecords.weightHelp'),
    },
    {
      id: 'medication',
      label: t('careRecords.medication'),
      title: t('careRecords.medication'),
      description: t('careRecords.medicationHelp'),
    },
  ] as const

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
          {renderLogs ? (
            renderLogs(setHeaderAction)
          ) : (
            <HorseNutritionLogsCard
              horse={horse}
              onCreateActionChange={setHeaderAction}
            />
          )}
        </>
      )}

      {activeTab === 'weight' &&
        (renderWeight ? (
          renderWeight(setHeaderAction)
        ) : (
          <HorseWeightRecordsCard
            horse={horse}
            onCreateActionChange={setHeaderAction}
          />
        ))}

      {activeTab === 'medication' &&
        (renderMedication ? (
          renderMedication(setHeaderAction)
        ) : (
          <HorseMedicationRecordsCard
            horse={horse}
            onCreateActionChange={setHeaderAction}
          />
        ))}
    </HorseDetailSectionTabs>
  )
}
