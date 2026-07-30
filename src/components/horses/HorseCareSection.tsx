import {
  DetailGrid,
  DetailMetricBlock,
  DetailNoteBlock,
} from '#/components/dashboard/DetailBlocks'
import { DashboardSectionTabGroup } from '#/components/dashboard/DashboardNavigation'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
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
    <DashboardSectionTabGroup
      activeId={activeTab}
      items={careTabs}
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
        {activeTab === 'reminders' && (
          <>
            {(horse.vetName ||
              horse.vetPhone ||
              horse.farrierName ||
              horse.farrierPhone ||
              horse.emergencyNotes) && (
              <DashboardSection
                chrome="soft"
                title="Care contacts"
                as="h3"
                size="panel"
                gap="roomy"
                padding="none"
              >
                <DetailGrid breakpoint="xl" columns={4}>
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
                    <DetailNoteBlock label="Emergency notes" span="careWide">
                      {horse.emergencyNotes}
                    </DetailNoteBlock>
                  )}
                </DetailGrid>
              </DashboardSection>
            )}

            <HorseCareRemindersCard
              horse={horse}
              onCreateActionChange={setHeaderAction}
            />
          </>
        )}

        {activeTab === 'health' && (
          <HorseHealthIssuesCard
            horse={horse}
            onCreateActionChange={setHeaderAction}
          />
        )}
      </DashboardSectionCard>
    </DashboardSectionTabGroup>
  )
}

function CareContact({ label, value }: { label: string; value: string }) {
  return (
    <DetailMetricBlock
      label={label}
      value={value}
      valueClassName="text-sm font-medium leading-6 tracking-normal"
    />
  )
}
