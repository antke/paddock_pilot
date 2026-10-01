import { useT } from '#/i18n/LocaleProvider'
import {
  DetailGrid,
  DetailTextBlock,
} from '#/components/dashboard/DetailBlocks'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { HorseCareRemindersCard } from '../reminders/HorseCareRemindersCard'
import type { HorseDetailSectionProps } from './HorseDetail'
import { HorseHealthIssuesCard } from './HorseHealthIssuesCard'
import { HorseDetailSectionTabs } from './HorseDetailSectionTabs'

type CareTab = 'reminders' | 'health'

type SectionActionRenderer = (
  onCreateActionChange: (action: ReactNode | null) => void,
) => ReactNode

type HorseCareSectionViewProps = HorseDetailSectionProps & {
  activeTab?: CareTab
  onTabChange?: (tab: CareTab) => void
  renderReminders?: SectionActionRenderer
  renderHealthIssues?: SectionActionRenderer
}

export function HorseCareSection({
  horse,
  activeTab: controlledTab,
  onTabChange,
  renderReminders,
  renderHealthIssues,
}: HorseCareSectionViewProps) {
  const t = useT()

  const careTabs = [
    {
      id: 'reminders',
      label: t('careRecords.reminders'),
      title: t('careRecords.reminders'),
      description: t('careRecords.remindersHelp'),
    },
    {
      id: 'health',
      label: t('careRecords.healthIssues'),
      title: t('careRecords.healthIssues'),
      description: t('careRecords.healthHelp'),
    },
  ] as const

  const [localTab, setLocalTab] = useState<CareTab>('reminders')
  const activeTab = controlledTab ?? localTab
  const [headerAction, setHeaderAction] = useState<ReactNode>(null)

  return (
    <HorseDetailSectionTabs
      activeId={activeTab}
      items={careTabs}
      onSelect={(nextTab) => {
        if (activeTab === nextTab) return
        setHeaderAction(null)
        if (onTabChange) onTabChange(nextTab)
        else setLocalTab(nextTab)
      }}
      actions={headerAction}
    >
      {activeTab === 'reminders' && (
        <>
          {(horse.vetName ||
            horse.vetPhone ||
            horse.farrierName ||
            horse.farrierPhone ||
            horse.emergencyNotes) && (
            <DashboardSection
              chrome="flat"
              title={t('careRecords.careContacts')}
              as="h3"
              size="compact"
              gap="compact"
            >
              <DetailGrid breakpoint="xl" columns={4} gap="default">
                {horse.vetName && (
                  <CareContact
                    label={t('careRecords.vet')}
                    value={horse.vetName}
                  />
                )}
                {horse.vetPhone && (
                  <CareContact
                    label={t('careRecords.vetPhone')}
                    value={horse.vetPhone}
                  />
                )}
                {horse.farrierName && (
                  <CareContact
                    label={t('careRecords.farrier')}
                    value={horse.farrierName}
                  />
                )}
                {horse.farrierPhone && (
                  <CareContact
                    label={t('careRecords.farrierPhone')}
                    value={horse.farrierPhone}
                  />
                )}
                {horse.emergencyNotes && (
                  <DetailTextBlock
                    label={t('careRecords.emergencyNotes')}
                    className="sm:col-span-2 xl:col-span-4"
                  >
                    {horse.emergencyNotes}
                  </DetailTextBlock>
                )}
              </DetailGrid>
            </DashboardSection>
          )}

          {renderReminders ? (
            renderReminders(setHeaderAction)
          ) : (
            <HorseCareRemindersCard
              horse={horse}
              onCreateActionChange={setHeaderAction}
            />
          )}
        </>
      )}

      {activeTab === 'health' &&
        (renderHealthIssues ? (
          renderHealthIssues(setHeaderAction)
        ) : (
          <HorseHealthIssuesCard
            horse={horse}
            onCreateActionChange={setHeaderAction}
          />
        ))}
    </HorseDetailSectionTabs>
  )
}

function CareContact({ label, value }: { label: string; value: string }) {
  return (
    <DetailTextBlock
      label={label}
      bodyClassName="font-medium [overflow-wrap:anywhere]"
    >
      {value}
    </DetailTextBlock>
  )
}
