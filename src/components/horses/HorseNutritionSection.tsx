import { useT } from '#/i18n/LocaleProvider'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { HorseMedicationRecordsCard } from './HorseMedicationRecordsCard'
import type { HorseDetailSectionProps } from './HorseDetail'
import { HorseNutritionCard } from './HorseNutritionCard'
import { HorseNutritionLogsCard } from './HorseNutritionLogsCard'
import { HorseWeightRecordsCard } from './HorseWeightRecordsCard'
import { HorseDetailSectionTabs } from './HorseDetailSectionTabs'
import { DashboardSubsection } from '#/components/dashboard/DashboardSectionCard'

type NutritionTab = 'nutrition' | 'weight' | 'medication'

type SectionActionRenderer = (
  onCreateActionChange: (action: ReactNode | null) => void,
) => ReactNode

type HorseNutritionSectionViewProps = HorseDetailSectionProps & {
  activeTab?: NutritionTab
  onTabChange?: (tab: NutritionTab) => void
  renderLogs?: SectionActionRenderer
  renderWeight?: SectionActionRenderer
  renderMedication?: SectionActionRenderer
}

export function HorseNutritionSection({
  horse,
  activeTab: controlledTab,
  onTabChange,
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
    },
    {
      id: 'weight',
      label: t('careRecords.weight'),
      title: t('careRecords.weight'),
    },
    {
      id: 'medication',
      label: t('careRecords.medication'),
      title: t('careRecords.medication'),
    },
  ] as const

  const [localTab, setLocalTab] = useState<NutritionTab>('nutrition')
  const activeTab = controlledTab ?? localTab
  const [headerAction, setHeaderAction] = useState<ReactNode>(null)

  return (
    <HorseDetailSectionTabs
      activeId={activeTab}
      items={nutritionTabs}
      onSelect={(nextTab) => {
        if (activeTab === nextTab) return
        setHeaderAction(null)
        if (onTabChange) onTabChange(nextTab)
        else setLocalTab(nextTab)
      }}
      actions={headerAction}
    >
      {activeTab === 'nutrition' && (
        <>
          <HorseNutritionCard horse={horse} showHeader={false} />
          <DashboardSubsection title={t('careRecords.nutritionHistory')}>
            {renderLogs ? (
              renderLogs(setHeaderAction)
            ) : (
              <HorseNutritionLogsCard
                horse={horse}
                onCreateActionChange={setHeaderAction}
              />
            )}
          </DashboardSubsection>
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
