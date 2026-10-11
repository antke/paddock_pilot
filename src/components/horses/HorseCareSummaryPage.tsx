import { getHorseDisplayName } from 'shared/horses/horseDisplayName'
import { ContactLink } from '#/components/ui/contact-link'
import { getHorseBreedLabel } from 'shared/i18n/horseBreedLabels'
import { useT, useLocale } from '#/i18n/LocaleProvider'
import {
  DetailReference,
  DetailReferenceField,
  DetailReferenceGroup,
  DetailReferenceList,
} from '#/components/dashboard/DetailReference'
import {
  DashboardItemCard,
  DashboardItemList,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import {
  PrintSummaryBodyText,
  PrintSummaryEmptyState,
  PrintSummaryHeader,
  PrintSummaryPage,
  PrintSummaryRecordHeader,
} from '#/components/dashboard/PrintSummary'
import { calculateHorseAge } from 'shared/horses/horseAge'
import { RouteEntityNotFoundAlert } from '#/components/layout/RouteStatusAlert'
import { Button } from '#/components/ui/button'
import {
  formatMediumDateKey,
  formatPartialDateKey,
  formatMediumTimestampDate,
} from '#/lib/dateDisplay'
import {
  formatCurrencyAmount,
  formatFileSize,
  formatDecimal,
} from '#/lib/numberDisplay'
import { formatLineText, formatMetaText } from '#/lib/textDisplay'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import type { ReactNode } from 'react'
import type { FunctionReturnType } from 'convex/server'

export type HorseCareSummaryData = FunctionReturnType<
  typeof api.horseCareSummary.getForHorse
>

type HorseCareSummaryPageProps = {
  stableId?: string
  horseId: Id<'horses'>
}

export function HorseCareSummaryPage({ horseId }: HorseCareSummaryPageProps) {
  const { data: summary } = useSuspenseQuery(
    convexQuery(api.horseCareSummary.getForHorse, { horseId }),
  )

  return <HorseCareSummaryView summary={summary} />
}

export function HorseCareSummaryView({
  summary,
  onPrint = () => window.print(),
}: {
  summary: HorseCareSummaryData
  onPrint?: () => void
}) {
  const t = useT()
  const { locale } = useLocale()

  if (!summary.horse) {
    return (
      <RouteEntityNotFoundAlert
        entity="horse"
        description={t('horseHistory.summaryGone')}
      />
    )
  }

  const { horse, stable } = summary
  const age = calculateHorseAge(horse.dateOfBirth) ?? horse.age
  const stableAddress = [
    stable?.addressLine1,
    stable?.addressLine2,
    stable?.postcode,
    stable?.country,
  ].filter(Boolean)

  return (
    <PrintSummaryPage>
      <PrintSummaryHeader
        as="h2"
        title={t('horseHistory.summaryTitle', {
          name: getHorseDisplayName(horse),
        })}
        description={formatMetaText([
          stable?.name,
          t('horseHistory.generated', {
            date: formatMediumTimestampDate(Date.now(), locale),
          }),
        ])}
        actions={
          <Button type="button" onClick={onPrint}>
            {t('horseHistory.print')}
          </Button>
        }
      />

      <DashboardSection aria-label={t('horseDetail.summary')}>
        <DetailReference>
          <SummarySection title={t('horseDetail.careInformation')}>
            <DetailReferenceList>
              <DetailReferenceField
                label={t('horseHistory.allergies')}
                value={summaryListValue(horse.allergies)}
                missingValue={t('horseDetail.notRecorded')}
                fullWidth
              />
              <DetailReferenceField
                label={t('horseHistory.emergencyNotes')}
                value={horse.emergencyNotes}
                multiline
                fullWidth
              />
              <DetailReferenceField
                label={t('horseHistory.shoeing')}
                value={
                  horse.shoeingStatus
                    ? t(`horseForm.${horse.shoeingStatus}`)
                    : undefined
                }
              />
              <DetailReferenceField
                label={t('horseHistory.dewormingNotes')}
                value={horse.dewormingNotes}
                multiline
                fullWidth
              />
            </DetailReferenceList>
          </SummarySection>
          <SummarySection title={t('horseHistory.activeHealth')}>
            <RecordList
              emptyLabel={t('horseHistory.healthEmpty')}
              records={summary.activeHealthIssues.map((issue) => ({
                id: issue._id,
                title: issue.title,
                meta: formatMetaText([
                  issue.severity
                    ? t(`careLabels.severity.${issue.severity}`)
                    : undefined,
                  formatMediumTimestampDate(issue.notedAt, locale),
                ]),
                body: issue.description,
              }))}
            />
          </SummarySection>
          <SummarySection title={t('horseHistory.activeMedication')}>
            <RecordList
              emptyLabel={t('horseHistory.medicationEmpty')}
              records={summary.activeMedicationRecords.map((record) => ({
                id: record._id,
                title: record.medicationName,
                meta: formatMetaText([
                  record.dosage,
                  record.frequency,
                  t('horseHistory.startDate', {
                    date: formatMediumDateKey(record.startDate, locale),
                  }),
                ]),
                body: formatLineText([record.reason, record.notes]),
              }))}
            />
          </SummarySection>

          <SummarySection title={t('horseHistory.contacts')}>
            <DetailReferenceList>
              <DetailReferenceField
                label={t('horseHistory.vet')}
                value={horse.vetName}
                missingValue={t('horseDetail.notRecorded')}
              />
              <DetailReferenceField
                label={t('horseHistory.vetPhone')}
                value={
                  horse.vetPhone ? (
                    <ContactLink kind="phone" value={horse.vetPhone} />
                  ) : undefined
                }
              />
              <DetailReferenceField
                label={t('horseHistory.farrier')}
                value={horse.farrierName}
                missingValue={t('horseDetail.notRecorded')}
              />
              <DetailReferenceField
                label={t('horseHistory.farrierPhone')}
                value={
                  horse.farrierPhone ? (
                    <ContactLink kind="phone" value={horse.farrierPhone} />
                  ) : undefined
                }
              />
              <DetailReferenceField
                label={t('horseHistory.stableContact')}
                value={stable?.contactName}
              />
              <DetailReferenceField
                label={t('horseHistory.stableContactPhone')}
                value={
                  stable?.contactPhone ? (
                    <ContactLink kind="phone" value={stable.contactPhone} />
                  ) : undefined
                }
              />
              <DetailReferenceField
                label={t('horseHistory.stableEmergency')}
                value={
                  stable?.emergencyPhone ? (
                    <ContactLink kind="phone" value={stable.emergencyPhone} />
                  ) : undefined
                }
                fullWidth
              />
              <DetailReferenceField
                label={t('horseHistory.stableAddress')}
                value={formatLineText(stableAddress)}
                multiline
                fullWidth
              />
            </DetailReferenceList>
          </SummarySection>

          <SummarySection title={t('horseHistory.nutritionProfile')}>
            {!horse.feedingRoutine &&
            !horse.nutritionNotes &&
            !horse.nutritionRecommended?.length &&
            !horse.nutritionAvoid?.length ? (
              <PrintSummaryEmptyState chrome="flat">
                {t('horseHistory.nutritionEmpty')}
              </PrintSummaryEmptyState>
            ) : (
              <DetailReferenceList>
                <DetailReferenceField
                  label={t('horseHistory.feedingRoutine')}
                  value={horse.feedingRoutine}
                  multiline
                  fullWidth
                />
                <DetailReferenceField
                  label={t('horseHistory.recommended')}
                  value={summaryListValue(horse.nutritionRecommended)}
                />
                <DetailReferenceField
                  label={t('horseHistory.avoid')}
                  value={summaryListValue(horse.nutritionAvoid)}
                />
                <DetailReferenceField
                  label={t('horseHistory.nutritionNotes')}
                  value={horse.nutritionNotes}
                  multiline
                  fullWidth
                />
              </DetailReferenceList>
            )}
          </SummarySection>

          <SummarySection title={t('horseDetail.horseDetails')}>
            {(horse.ownerName || stable?.name) && (
              <DetailReferenceList>
                <DetailReferenceField
                  label={t('horseHistory.owner')}
                  value={horse.ownerName}
                />
                <DetailReferenceField
                  label={t('horseHistory.stable')}
                  value={stable?.name}
                />
              </DetailReferenceList>
            )}
            <DetailReferenceList mobileColumns={2}>
              <DetailReferenceField
                label={t('horseHistory.age')}
                value={
                  age === undefined ? undefined : formatDecimal(age, locale)
                }
                missingValue={t('horseDetail.notRecorded')}
              />
              <DetailReferenceField
                label={t('horseHistory.birth')}
                value={
                  horse.dateOfBirth
                    ? formatPartialDateKey(horse.dateOfBirth, locale)
                    : undefined
                }
                missingValue={t('horseDetail.notRecorded')}
              />
              <DetailReferenceField
                label={t('horseHistory.breed')}
                value={
                  horse.breed
                    ? getHorseBreedLabel(horse.breed, locale)
                    : undefined
                }
              />
              <DetailReferenceField
                label={t('horseHistory.sex')}
                value={horse.sex ? t(`horseForm.${horse.sex}`) : undefined}
              />
              <DetailReferenceField
                label={t('horseHistory.color')}
                value={horse.color}
              />
              <DetailReferenceField
                label={t('horseHistory.height')}
                value={horse.height}
              />
              <DetailReferenceField
                label={t('horseHistory.discipline')}
                value={horse.discipline}
                fullWidth
              />
            </DetailReferenceList>
            {(horse.sire || horse.dam) && (
              <DetailReferenceList as="h4" title={t('horseDetail.parentage')}>
                <DetailReferenceField
                  label={t('horseHistory.sire')}
                  value={horse.sire}
                />
                <DetailReferenceField
                  label={t('horseHistory.dam')}
                  value={horse.dam}
                />
              </DetailReferenceList>
            )}
          </SummarySection>

          {(horse.passportNumber ||
            horse.microchipNumber ||
            horse.insuranceProvider ||
            horse.insurancePolicyNumber) && (
            <SummarySection title={t('horseDetail.identificationAndInsurance')}>
              <DetailReferenceList>
                <DetailReferenceField
                  label={t('horseHistory.passport')}
                  value={horse.passportNumber}
                />
                <DetailReferenceField
                  label={t('horseHistory.microchip')}
                  value={horse.microchipNumber}
                />
                <DetailReferenceField
                  label={t('horseHistory.insuranceProvider')}
                  value={horse.insuranceProvider}
                />
                <DetailReferenceField
                  label={t('horseHistory.insurancePolicy')}
                  value={horse.insurancePolicyNumber}
                />
              </DetailReferenceList>
            </SummarySection>
          )}
          <SummarySection title={t('horseHistory.recentWeights')}>
            <RecordList
              emptyLabel={t('horseHistory.weightEmpty')}
              records={summary.recentWeightRecords.map((record) => ({
                id: record._id,
                title: `${formatDecimal(record.weight, locale)} ${record.unit}`,
                meta: formatMetaText([
                  formatMediumTimestampDate(record.measuredAt, locale),
                  record.bodyConditionScore
                    ? `BCS ${formatDecimal(record.bodyConditionScore, locale)}/9`
                    : undefined,
                ]),
                body: record.notes,
              }))}
            />
          </SummarySection>

          <SummarySection title={t('horseHistory.recentCare')}>
            <RecordList
              emptyLabel={t('horseHistory.careEmpty')}
              records={summary.recentEvents.map(({ event, eventHorse }) => ({
                id: event._id,
                title: event.title,
                meta: formatMetaText([
                  t(`events.types.${event.type}`),
                  t(`calendar.${event.status ?? 'planned'}`),
                  formatMediumDateKey(event.date, locale),
                  event.providerName,
                  event.totalCost !== undefined
                    ? t('horseHistory.total', {
                        amount: formatCurrencyAmount(event.totalCost, locale),
                      })
                    : undefined,
                  event.costPerHorse !== undefined
                    ? t('horseHistory.perHorse', {
                        amount: formatCurrencyAmount(
                          event.costPerHorse,
                          locale,
                        ),
                      })
                    : undefined,
                ]),
                body: formatLineText([
                  event.notesAfterCompletion,
                  eventHorse?.requestedServiceNotes
                    ? t('horseHistory.requestedNotes', {
                        notes: eventHorse.requestedServiceNotes,
                      })
                    : undefined,
                  eventHorse?.completionNotes
                    ? t('horseHistory.outcomeNotes', {
                        notes: eventHorse.completionNotes,
                      })
                    : undefined,
                ]),
              }))}
            />
          </SummarySection>

          <SummarySection title={t('horseHistory.recentNutrition')}>
            <RecordList
              emptyLabel={t('horseHistory.nutritionChangesEmpty')}
              records={summary.recentNutritionLogs.map((log) => ({
                id: log._id,
                title: log.summary,
                meta: formatMediumTimestampDate(log.changedAt, locale),
                body: log.notes,
              }))}
            />
          </SummarySection>

          <SummarySection title={t('horseHistory.documents')}>
            <RecordList
              emptyLabel={t('horseHistory.documentsEmpty')}
              records={summary.documents.map((document) => ({
                id: document._id,
                title: document.fileName,
                meta: formatMetaText([
                  t(`documents.types.${document.type}`),
                  document.contentType,
                  document.size !== undefined
                    ? formatFileSize(document.size, locale)
                    : undefined,
                ]),
                body: document.notes,
              }))}
            />
          </SummarySection>
        </DetailReference>
      </DashboardSection>
    </PrintSummaryPage>
  )
}

function SummarySection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <DetailReferenceGroup as="h3" title={title} data-print-summary-section="">
      {children}
    </DetailReferenceGroup>
  )
}

function RecordList({
  emptyLabel,
  records,
}: {
  emptyLabel: string
  records: Array<{ id: string; title: string; meta?: string; body?: string }>
}) {
  if (records.length === 0) {
    return (
      <PrintSummaryEmptyState chrome="flat">
        {emptyLabel}
      </PrintSummaryEmptyState>
    )
  }

  return (
    <DashboardItemList role="list">
      {records.map((record) => (
        <DashboardItemCard
          key={record.id}
          role="listitem"
          data-print-summary-record=""
          className="grid gap-2 print:border print:border-black/30"
        >
          <PrintSummaryRecordHeader
            as="h4"
            title={record.title}
            description={record.meta}
            titleWeight="medium"
          />
          {record.body && (
            <PrintSummaryBodyText className="text-sm leading-6 wrap-anywhere">
              {record.body}
            </PrintSummaryBodyText>
          )}
        </DashboardItemCard>
      ))}
    </DashboardItemList>
  )
}

function summaryListValue(items?: string[]) {
  if (!items?.length) return undefined
  if (items.length === 1) return items[0]
  return (
    <ul className="grid list-disc gap-1 pl-5">
      {items.map((item, index) => (
        <li key={`${index}-${item}`}>{item}</li>
      ))}
    </ul>
  )
}
