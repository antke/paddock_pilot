import { ContactLink } from '#/components/ui/contact-link'
import { useT } from '#/i18n/LocaleProvider'
import { PhoneIcon } from '@phosphor-icons/react'
import {
  DetailReference,
  DetailReferenceGroup,
  DetailReferenceList,
  DetailReferenceField,
} from '#/components/dashboard/DetailReference'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { HorseCareRemindersCard } from '../reminders/HorseCareRemindersCard'
import type { HorseDetailSectionProps } from './HorseDetail'
import { HorseHealthIssuesCard } from './HorseHealthIssuesCard'
import { HorseMedicationRecordsCard } from './HorseMedicationRecordsCard'
import { HorseDetailSectionTabs } from './HorseDetailSectionTabs'
import { HorseEditEntry } from './HorseEditEntry'

type CareTab = 'reminders' | 'health' | 'medication'

type SectionActionRenderer = (
  onCreateActionChange: (action: ReactNode | null) => void,
) => ReactNode

type HorseCareSectionViewProps = HorseDetailSectionProps & {
  activeTab?: CareTab
  onTabChange?: (tab: CareTab) => void
  renderReminders?: SectionActionRenderer
  renderHealthIssues?: SectionActionRenderer
  renderMedication?: SectionActionRenderer
}

export function HorseCareSection({
  horse,
  stableId,
  canManageHorse = false,
  activeTab: controlledTab,
  onTabChange,
  renderReminders,
  renderHealthIssues,
  renderMedication,
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
    {
      id: 'medication',
      label: t('careRecords.medication'),
      title: t('careRecords.medication'),
      description: t('careRecords.medicationHelp'),
    },
  ] as const

  const [localTab, setLocalTab] = useState<CareTab>('reminders')
  const activeTab = controlledTab ?? localTab
  const [headerAction, setHeaderAction] = useState<ReactNode>(null)

  const hasContacts = Boolean(
    horse.vetName || horse.vetPhone || horse.farrierName || horse.farrierPhone,
  )
  return (
    <>
      {(hasContacts || horse.emergencyNotes || canManageHorse) && (
        <DashboardSectionCard>
          <DetailReference>
            {(hasContacts || canManageHorse) && (
              <DetailReferenceGroup
                layout="stacked"
                title={t('careRecords.careContacts')}
                edit={
                  canManageHorse && (
                    <HorseEditEntry
                      appearance="icon"
                      horseId={horse._id}
                      stableId={stableId}
                      section="care"
                      label={t('horseDetail.editCareContacts')}
                    />
                  )
                }
              >
                <DetailReferenceList mobileColumns={2}>
                  <CareContact
                    label={t('careRecords.vet')}
                    name={horse.vetName}
                    phone={horse.vetPhone}
                  />
                  <CareContact
                    label={t('careRecords.farrier')}
                    name={horse.farrierName}
                    phone={horse.farrierPhone}
                  />
                </DetailReferenceList>
              </DetailReferenceGroup>
            )}
            {horse.emergencyNotes && (
              <DetailReferenceGroup
                layout="stacked"
                title={t('careRecords.emergencyNotes')}
                edit={
                  canManageHorse && (
                    <HorseEditEntry
                      appearance="icon"
                      horseId={horse._id}
                      stableId={stableId}
                      section="care"
                      label={t('horseDetail.editEmergencyNotes')}
                    />
                  )
                }
              >
                <p className="max-w-prose whitespace-pre-wrap text-lg leading-snug wrap-anywhere">
                  {horse.emergencyNotes}
                </p>
              </DetailReferenceGroup>
            )}
          </DetailReference>
        </DashboardSectionCard>
      )}
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
        {activeTab === 'reminders' &&
          (renderReminders ? (
            renderReminders(setHeaderAction)
          ) : (
            <HorseCareRemindersCard
              horse={horse}
              onCreateActionChange={setHeaderAction}
            />
          ))}
        {activeTab === 'health' &&
          (renderHealthIssues ? (
            renderHealthIssues(setHeaderAction)
          ) : (
            <HorseHealthIssuesCard
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
    </>
  )
}

function CareContact({
  label,
  name,
  phone,
}: {
  label: string
  name?: string
  phone?: string
}) {
  const t = useT()
  return (
    <DetailReferenceField
      label={label}
      missingValue={t('horseDetail.notRecorded')}
      value={
        name || phone ? (
          <div className="grid justify-items-start gap-1">
            {name && <span>{name}</span>}
            {phone && (
              <ContactLink
                kind="phone"
                value={phone}
                aria-label={`${label}: ${phone}`}
                className="inline-flex min-h-11 max-w-full items-center gap-2 py-2"
              >
                <PhoneIcon className="size-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0 wrap-anywhere">{phone}</span>
              </ContactLink>
            )}
          </div>
        ) : undefined
      }
    />
  )
}
