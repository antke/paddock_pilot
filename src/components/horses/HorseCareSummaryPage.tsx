import {
  DetailGrid,
  DetailPrintField,
  DetailPrintListBlock,
} from '#/components/dashboard/DetailBlocks'
import {
  FeatureAccessBackLink,
  FeatureAccessPrompt,
} from '#/components/dashboard/FeatureAccessPrompt'
import { DashboardFeatureBadge } from '#/components/dashboard/DashboardBadges'
import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'
import { DashboardSectionDivider } from '#/components/dashboard/DashboardSectionCard'
import {
  PrintSummaryBodyText,
  PrintSummaryEmptyState,
  PrintSummaryHeader,
  PrintSummaryPage,
  PrintSummaryRecordHeader,
  PrintSummaryRecordPanel,
  PrintSummaryScreenOnly,
  PrintSummarySection,
} from '#/components/dashboard/PrintSummary'
import { calculateHorseAge } from 'shared/horses/horseAge'
import { RouteEntityNotFoundAlert } from '#/components/layout/RouteStatusAlert'
import { Button, ButtonLink } from '#/components/ui/button'
import {
  formatMediumDateKey,
  formatMediumTimestampDate,
} from '#/lib/dateDisplay'
import { formatCurrencyAmount, formatFileSize } from '#/lib/numberDisplay'
import { formatLineText, formatMetaText } from '#/lib/textDisplay'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import type { ReactNode } from 'react'
import { eventStatusLabels, eventTypeLabels } from 'shared/events/eventSchema'
import { stableDocumentTypeLabels } from 'shared/stables/stableDocumentSchema'

type HorseCareSummaryPageProps = {
  stableId: string
  horseId: Id<'horses'>
}

const sexLabels = {
  mare: 'Mare',
  gelding: 'Gelding',
  stallion: 'Stallion',
} satisfies Record<NonNullable<Doc<'horses'>['sex']>, string>

const shoeingStatusLabels = {
  barefoot: 'Barefoot',
  front_shoes: 'Front shoes',
  full_set: 'Full set',
} satisfies Record<NonNullable<Doc<'horses'>['shoeingStatus']>, string>

export function HorseCareSummaryPage({
  stableId,
  horseId,
}: HorseCareSummaryPageProps) {
  const { data: summary } = useSuspenseQuery(
    convexQuery(api.horseCareSummary.getForHorse, { horseId }),
  )

  if (!summary.horse) {
    return (
      <RouteEntityNotFoundAlert
        entity="horse"
        description="This care summary is no longer available."
      />
    )
  }

  if (!summary.hasAccess) {
    return (
      <FeatureAccessPrompt
        title="Care summary is a Personal Pro feature"
        description="Upgrade to create print-friendly horse summaries for vets, farriers, dentists, and emergency contacts."
        secondaryAction={
          <FeatureAccessBackLink
            to="/stables/$stableId/horses/$horseId"
            params={{ stableId, horseId }}
          >
            Back to horse
          </FeatureAccessBackLink>
        }
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
        title={`${horse.name} care summary`}
        badges={
          <PrintSummaryScreenOnly>
            <DashboardFeatureBadge variant="outline">
              Personal Pro
            </DashboardFeatureBadge>
          </PrintSummaryScreenOnly>
        }
        description={formatMetaText([
          stable.name,
          `Generated ${formatMediumTimestampDate(Date.now())}`,
        ])}
        actions={
          <>
            <Button type="button" onClick={() => window.print()}>
              Print summary
            </Button>
            <ButtonLink
              to="/stables/$stableId/horses/$horseId"
              params={{ stableId, horseId }}
              variant="outline"
            >
              Back to horse
            </ButtonLink>
          </>
        }
      />

      <SummarySection title="Profile and identification">
        <DetailGrid>
          <DetailPrintField label="Stable" value={stable.name} />
          <DetailPrintField label="Owner" value={horse.ownerName} />
          <DetailPrintField label="Age" value={`${age}`} />
          <DetailPrintField label="Breed" value={horse.breed} />
          <DetailPrintField
            label="Sex"
            value={horse.sex ? sexLabels[horse.sex] : undefined}
          />
          <DetailPrintField label="Color" value={horse.color} />
          <DetailPrintField label="Height" value={horse.height} />
          <DetailPrintField label="Discipline" value={horse.discipline} />
          <DetailPrintField label="Date of birth" value={horse.dateOfBirth} />
          <DetailPrintField
            label="Passport number"
            value={horse.passportNumber}
          />
          <DetailPrintField
            label="Microchip number"
            value={horse.microchipNumber}
          />
          <DetailPrintField
            label="Insurance provider"
            value={horse.insuranceProvider}
          />
          <DetailPrintField
            label="Insurance policy"
            value={horse.insurancePolicyNumber}
          />
          <DetailPrintField label="Sire" value={horse.sire} />
          <DetailPrintField label="Dam" value={horse.dam} />
          <DetailPrintField
            label="Shoeing status"
            value={
              horse.shoeingStatus
                ? shoeingStatusLabels[horse.shoeingStatus]
                : undefined
            }
          />
        </DetailGrid>
      </SummarySection>

      <SummarySection title="Emergency and care contacts">
        <DetailGrid>
          <DetailPrintField label="Vet" value={horse.vetName} />
          <DetailPrintField label="Vet phone" value={horse.vetPhone} />
          <DetailPrintField label="Farrier" value={horse.farrierName} />
          <DetailPrintField label="Farrier phone" value={horse.farrierPhone} />
          <DetailPrintField label="Stable contact" value={stable.contactName} />
          <DetailPrintField
            label="Stable contact phone"
            value={stable.contactPhone}
          />
          <DetailPrintField
            label="Stable emergency phone"
            value={stable.emergencyPhone}
          />
        </DetailGrid>
        {stableAddress.length > 0 && (
          <DetailPrintField
            label="Stable postal address"
            value={formatLineText(stableAddress)}
            multiline
          />
        )}
        {horse.emergencyNotes && (
          <DetailPrintField
            label="Emergency notes"
            value={horse.emergencyNotes}
            multiline
          />
        )}
        <DetailPrintField
          label="Deworming notes"
          value={horse.dewormingNotes}
          multiline
        />
        <DetailPrintListBlock
          label="Allergies or sensitivities"
          items={horse.allergies}
        />
      </SummarySection>

      <SummarySection title="Nutrition profile">
        <DetailPrintField
          label="Feeding routine"
          value={horse.feedingRoutine}
          multiline
        />
        <DetailPrintField
          label="Nutrition notes"
          value={horse.nutritionNotes}
          multiline
        />
        <DetailPrintListBlock
          label="Recommended"
          items={horse.nutritionRecommended}
        />
        <DetailPrintListBlock label="Avoid" items={horse.nutritionAvoid} />
      </SummarySection>

      <SummarySection title="Active health and medication">
        <RecordList
          emptyLabel="No active health issues."
          records={summary.activeHealthIssues.map((issue) => ({
            id: issue._id,
            title: issue.title,
            meta: formatMetaText([
              issue.severity,
              formatMediumTimestampDate(issue.notedAt),
            ]),
            body: issue.description,
          }))}
        />
        <DashboardSectionDivider />
        <RecordList
          emptyLabel="No active medication."
          records={summary.activeMedicationRecords.map((record) => ({
            id: record._id,
            title: record.medicationName,
            meta: formatMetaText([
              record.dosage,
              record.frequency,
              `Started ${formatMediumDateKey(record.startDate)}`,
            ]),
            body: formatLineText([record.reason, record.notes]),
          }))}
        />
      </SummarySection>

      <SummarySection title="Recent weight records">
        <RecordList
          emptyLabel="No weight records yet."
          records={summary.recentWeightRecords.map((record) => ({
            id: record._id,
            title: `${record.weight} ${record.unit}`,
            meta: formatMetaText([
              formatMediumTimestampDate(record.measuredAt),
              record.bodyConditionScore
                ? `BCS ${record.bodyConditionScore}/9`
                : undefined,
            ]),
            body: record.notes,
          }))}
        />
      </SummarySection>

      <SummarySection title="Recent care events">
        <RecordList
          emptyLabel="No recent events."
          records={summary.recentEvents.map(({ event, eventHorse }) => ({
            id: event._id,
            title: event.title,
            meta: formatMetaText([
              eventTypeLabels[event.type],
              eventStatusLabels[event.status ?? 'planned'],
              formatMediumDateKey(event.date),
              event.providerName,
              event.totalCost !== undefined
                ? `Total ${formatCurrencyAmount(event.totalCost)}`
                : undefined,
              event.costPerHorse !== undefined
                ? `${formatCurrencyAmount(event.costPerHorse)} per horse`
                : undefined,
            ]),
            body: formatLineText([
              event.notesAfterCompletion,
              eventHorse?.requestedServiceNotes
                ? `Requested: ${eventHorse.requestedServiceNotes}`
                : undefined,
              eventHorse?.completionNotes
                ? `Horse outcome: ${eventHorse.completionNotes}`
                : undefined,
            ]),
          }))}
        />
      </SummarySection>

      <SummarySection title="Recent nutrition changes">
        <RecordList
          emptyLabel="No nutrition change logs."
          records={summary.recentNutritionLogs.map((log) => ({
            id: log._id,
            title: log.summary,
            meta: formatMediumTimestampDate(log.changedAt),
            body: log.notes,
          }))}
        />
      </SummarySection>

      <SummarySection title="Documents">
        <RecordList
          emptyLabel="No documents linked to this horse."
          records={summary.documents.map((document) => ({
            id: document._id,
            title: document.fileName,
            meta: formatMetaText([
              stableDocumentTypeLabels[document.type],
              document.contentType,
              document.size !== undefined
                ? formatFileSize(document.size)
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
  return <PrintSummarySection title={title}>{children}</PrintSummarySection>
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
        <PrintSummaryRecordPanel key={record.id} stack="tight">
          <PrintSummaryRecordHeader
            as="h3"
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
