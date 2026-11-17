import { ContactLink } from '#/components/ui/contact-link'
import { useT } from '#/i18n/LocaleProvider'
import { PhoneIcon } from '@phosphor-icons/react'
import {
  DetailReference,
  DetailReferenceGroup,
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
    },
    {
      id: 'health',
      label: t('careRecords.healthIssues'),
      title: t('careRecords.healthIssues'),
    },
    {
      id: 'medication',
      label: t('careRecords.medication'),
      title: t('careRecords.medication'),
    },
  ] as const

  const [localTab, setLocalTab] = useState<CareTab>('reminders')
  const activeTab = controlledTab ?? localTab
  const [headerAction, setHeaderAction] = useState<ReactNode>(null)

  const hasContacts = Boolean(
    horse.vetName || horse.vetPhone || horse.farrierName || horse.farrierPhone,
  )
  const showContacts = hasContacts || canManageHorse
  return (
    <>
      {(showContacts || horse.emergencyNotes) && (
        <DashboardSectionCard>
          <DetailReference className="gap-6">
            {showContacts && (
              <DetailReferenceGroup
                layout="stacked"
                titleStyle="panel"
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
                {/* One row per contact: a reference strip, not a second main panel. */}
                <dl className="grid min-w-0 gap-3 sm:gap-1">
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
                </dl>
              </DetailReferenceGroup>
            )}
            {horse.emergencyNotes && (
              <DetailReferenceGroup
                layout="stacked"
                // Without contacts the notes open the panel.
                titleStyle={showContacts ? 'nested' : 'panel'}
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
                <p className="max-w-prose whitespace-pre-wrap text-base leading-6 font-medium wrap-anywhere">
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
    // Phones put the label above, so the name and phone keep one aligned row.
    <div className="grid min-w-0 items-baseline gap-x-4 sm:grid-cols-[5.5rem_minmax(0,1fr)]">
      <dt className="text-sm leading-5 text-muted-foreground sm:leading-11">
        {label}
      </dt>
      <dd className="flex min-w-0 flex-wrap items-center gap-x-4 text-base">
        {name || phone ? (
          <>
            {name && (
              <span className="min-w-0 font-medium wrap-anywhere">{name}</span>
            )}
            {phone && (
              <ContactLink
                kind="phone"
                value={phone}
                aria-label={`${label}: ${phone}`}
                className="gap-2"
              >
                <PhoneIcon className="size-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0 wrap-anywhere">{phone}</span>
              </ContactLink>
            )}
          </>
        ) : (
          <span className="text-muted-foreground sm:leading-11">
            {t('horseDetail.notRecorded')}
          </span>
        )}
      </dd>
    </div>
  )
}
