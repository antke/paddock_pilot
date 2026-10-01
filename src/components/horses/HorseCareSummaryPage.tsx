import { getHorseBreedLabel } from 'shared/i18n/horseBreedLabels'
import { useT, useLocale } from '#/i18n/LocaleProvider'
import {
  DetailGrid,
  DetailPrintField,
  DetailPrintListBlock,
} from '#/components/dashboard/DetailBlocks'
import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'
import { DashboardSectionDivider } from '#/components/dashboard/DashboardSectionCard'
import {
  PrintSummaryBodyText,
  PrintSummaryEmptyState,
  PrintSummaryHeader,
  PrintSummaryPage,
  PrintSummaryRecordHeader,
  PrintSummaryRecordPanel,
  PrintSummarySection,
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
  stableId: string
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
    stable.addressLine1,
    stable.addressLine2,
    stable.postcode,
    stable.country,
  ].filter(Boolean)

  return (
    <PrintSummaryPage>
      <PrintSummaryHeader
        as="h2"
        title={t('horseHistory.summaryTitle', { name: horse.name })}
        description={formatMetaText([
          stable.name,
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

      <SummarySection title={t('horseHistory.profile')}>
        <DetailGrid>
          <DetailPrintField
            label={t('horseHistory.stable')}
            value={stable.name}
          />
          <DetailPrintField
            label={t('horseHistory.owner')}
            value={horse.ownerName}
          />
          <DetailPrintField
            label={t('horseHistory.age')}
            value={age === undefined ? undefined : formatDecimal(age, locale)}
          />
          <DetailPrintField
            label={t('horseHistory.breed')}
            value={
              horse.breed ? getHorseBreedLabel(horse.breed, locale) : undefined
            }
          />
          <DetailPrintField
            label={t('horseHistory.sex')}
            value={horse.sex ? t(`horseForm.${horse.sex}`) : undefined}
          />
          <DetailPrintField
            label={t('horseHistory.color')}
            value={horse.color}
          />
          <DetailPrintField
            label={t('horseHistory.height')}
            value={horse.height}
          />
          <DetailPrintField
            label={t('horseHistory.discipline')}
            value={horse.discipline}
          />
          <DetailPrintField
            label={t('horseHistory.birth')}
            value={
              horse.dateOfBirth
                ? formatPartialDateKey(horse.dateOfBirth, locale)
                : undefined
            }
          />
          <DetailPrintField
            label={t('horseHistory.passport')}
            value={horse.passportNumber}
          />
          <DetailPrintField
            label={t('horseHistory.microchip')}
            value={horse.microchipNumber}
          />
          <DetailPrintField
            label={t('horseHistory.insuranceProvider')}
            value={horse.insuranceProvider}
          />
          <DetailPrintField
            label={t('horseHistory.insurancePolicy')}
            value={horse.insurancePolicyNumber}
          />
          <DetailPrintField label={t('horseHistory.sire')} value={horse.sire} />
          <DetailPrintField label={t('horseHistory.dam')} value={horse.dam} />
          <DetailPrintField
            label={t('horseHistory.shoeing')}
            value={
              horse.shoeingStatus
                ? t(`horseForm.${horse.shoeingStatus}`)
                : undefined
            }
          />
        </DetailGrid>
      </SummarySection>

      <SummarySection title={t('horseHistory.contacts')}>
        <DetailGrid>
          <DetailPrintField
            label={t('horseHistory.vet')}
            value={horse.vetName}
          />
          <DetailPrintField
            label={t('horseHistory.vetPhone')}
            value={horse.vetPhone}
          />
          <DetailPrintField
            label={t('horseHistory.farrier')}
            value={horse.farrierName}
          />
          <DetailPrintField
            label={t('horseHistory.farrierPhone')}
            value={horse.farrierPhone}
          />
          <DetailPrintField
            label={t('horseHistory.stableContact')}
            value={stable.contactName}
          />
          <DetailPrintField
            label={t('horseHistory.stableContactPhone')}
            value={stable.contactPhone}
          />
          <DetailPrintField
            label={t('horseHistory.stableEmergency')}
            value={stable.emergencyPhone}
          />
        </DetailGrid>
        {stableAddress.length > 0 && (
          <DetailPrintField
            label={t('horseHistory.stableAddress')}
            value={formatLineText(stableAddress)}
            multiline
          />
        )}
        {horse.emergencyNotes && (
          <DetailPrintField
            label={t('horseHistory.emergencyNotes')}
            value={horse.emergencyNotes}
            multiline
          />
        )}
        <DetailPrintField
          label={t('horseHistory.dewormingNotes')}
          value={horse.dewormingNotes}
          multiline
        />
        <DetailPrintListBlock
          label={t('horseHistory.allergies')}
          items={horse.allergies}
        />
      </SummarySection>

      <SummarySection title={t('horseHistory.nutritionProfile')}>
        {!horse.feedingRoutine &&
          !horse.nutritionNotes &&
          !horse.nutritionRecommended?.length &&
          !horse.nutritionAvoid?.length && (
            <PrintSummaryEmptyState>
              {t('horseHistory.nutritionEmpty')}
            </PrintSummaryEmptyState>
          )}
        <DetailPrintField
          label={t('horseHistory.feedingRoutine')}
          value={horse.feedingRoutine}
          multiline
        />
        <DetailPrintField
          label={t('horseHistory.nutritionNotes')}
          value={horse.nutritionNotes}
          multiline
        />
        <DetailPrintListBlock
          label={t('horseHistory.recommended')}
          items={horse.nutritionRecommended}
        />
        <DetailPrintListBlock
          label={t('horseHistory.avoid')}
          items={horse.nutritionAvoid}
        />
      </SummarySection>

      <SummarySection title={t('horseHistory.activeHealthMedication')}>
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
        <DashboardSectionDivider />
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
                    amount: formatCurrencyAmount(event.costPerHorse, locale),
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
    <PrintSummarySection as="h3" title={title}>
      {children}
    </PrintSummarySection>
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
    return <PrintSummaryEmptyState>{emptyLabel}</PrintSummaryEmptyState>
  }

  return (
    <DashboardItemList>
      {records.map((record) => (
        <PrintSummaryRecordPanel key={record.id} stack="tight" chrome="flat">
          <PrintSummaryRecordHeader
            as="h4"
            title={record.title}
            description={record.meta}
            descriptionSize="xs"
            titleWeight="medium"
          />
          {record.body && (
            <PrintSummaryBodyText>{record.body}</PrintSummaryBodyText>
          )}
        </PrintSummaryRecordPanel>
      ))}
    </DashboardItemList>
  )
}
