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
] as const

export function HorseCareSection({ horse }: HorseDetailSectionProps) {
  const [activeTab, setActiveTab] = useState<CareTab>('reminders')
  const [headerAction, setHeaderAction] = useState<ReactNode>(null)

  return (
    <HorseDetailSectionTabs
      activeId={activeTab}
      items={careTabs}
      onSelect={(nextTab) => {
        if (activeTab === nextTab) return
        setHeaderAction(null)
        setActiveTab(nextTab)
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
              chrome="soft"
              title="Care contacts"
              as="h3"
              size="panel"
              gap="compact"
              padding="compact"
              tone="reference"
              className="rounded-row border"
            >
              <DetailGrid breakpoint="xl" columns={4} gap="default">
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
                  <DetailTextBlock
                    label="Emergency notes"
                    className="sm:col-span-2 xl:col-span-4"
                  >
                    {horse.emergencyNotes}
                  </DetailTextBlock>
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
