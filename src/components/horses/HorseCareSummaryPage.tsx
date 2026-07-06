import { dashboardHeroClassName } from '#/components/dashboard/dashboardChrome'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Badge } from '#/components/ui/badge'
import { Button, buttonVariants } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Separator } from '#/components/ui/separator'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
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

const formatTimestamp = (timestamp: number) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
    new Date(timestamp),
  )

export function HorseCareSummaryPage({
  stableId,
  horseId,
}: HorseCareSummaryPageProps) {
  const { data: summary } = useSuspenseQuery(
    convexQuery(api.horseCareSummary.getForHorse, { horseId }),
  )

  if (!summary.horse) {
    return (
      <Alert>
        <AlertTitle>Horse not found</AlertTitle>
        <AlertDescription>
          This care summary is no longer available.
        </AlertDescription>
      </Alert>
    )
  }

  if (!summary.hasAccess) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Care summary is a Personal Pro feature</CardTitle>
            <Badge>Premium</Badge>
          </div>
          <CardDescription>
            Upgrade to create print-friendly horse summaries for vets, farriers,
            dentists, and emergency contacts.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link to="/pricing" className={buttonVariants()}>
            View plans
          </Link>
          <Link
            to="/stables/$stableId/horses/$horseId"
            params={{ stableId, horseId }}
            className={buttonVariants({ variant: 'outline' })}
          >
            Back to horse
          </Link>
        </CardContent>
      </Card>
    )
  }

  const { horse, stable } = summary
  const stableAddress = [
    stable.addressLine1,
    stable.addressLine2,
    stable.postcode,
    stable.country,
  ].filter(Boolean)

  return (
    <div className="grid gap-6 print:block print:text-black">
      <header className={dashboardHeroClassName('cards')}>
        <div className="flex flex-wrap items-start justify-between gap-4 print:block">
          <div className="grid gap-2">
            <div className="flex flex-wrap items-center gap-2 print:block">
              <h1 className="text-3xl font-semibold">
                {horse.name} care summary
              </h1>
              <Badge variant="outline" className="print:hidden">
                Personal Pro
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground print:text-black">
              {stable.name} · Generated {formatTimestamp(Date.now())}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 print:hidden">
            <Button type="button" onClick={() => window.print()}>
              Print summary
            </Button>
            <Link
              to="/stables/$stableId/horses/$horseId"
              params={{ stableId, horseId }}
              className={buttonVariants({ variant: 'outline' })}
            >
              Back to horse
            </Link>
          </div>
        </div>
      </header>

      <SummarySection title="Profile and identification">
        <DetailGrid>
          <DetailItem label="Stable" value={stable.name} />
          <DetailItem label="Owner" value={horse.ownerName} />
          <DetailItem label="Age" value={`${horse.age}`} />
          <DetailItem label="Breed" value={horse.breed} />
          <DetailItem
            label="Sex"
            value={horse.sex ? sexLabels[horse.sex] : undefined}
          />
          <DetailItem label="Color" value={horse.color} />
          <DetailItem label="Height" value={horse.height} />
          <DetailItem label="Discipline" value={horse.discipline} />
          <DetailItem label="Date of birth" value={horse.dateOfBirth} />
          <DetailItem label="Passport number" value={horse.passportNumber} />
          <DetailItem label="Microchip number" value={horse.microchipNumber} />
          <DetailItem
            label="Insurance provider"
            value={horse.insuranceProvider}
          />
          <DetailItem
            label="Insurance policy"
            value={horse.insurancePolicyNumber}
          />
          <DetailItem label="Sire" value={horse.sire} />
          <DetailItem label="Dam" value={horse.dam} />
          <DetailItem
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
          <DetailItem label="Vet" value={horse.vetName} />
          <DetailItem label="Vet phone" value={horse.vetPhone} />
          <DetailItem label="Farrier" value={horse.farrierName} />
          <DetailItem label="Farrier phone" value={horse.farrierPhone} />
          <DetailItem label="Stable contact" value={stable.contactName} />
          <DetailItem
            label="Stable contact phone"
            value={stable.contactPhone}
          />
          <DetailItem
            label="Stable emergency phone"
            value={stable.emergencyPhone}
          />
        </DetailGrid>
        {stableAddress.length > 0 && (
          <LongText
            label="Stable postal address"
            value={stableAddress.join('\n')}
          />
        )}
        {horse.emergencyNotes && (
          <LongText label="Emergency notes" value={horse.emergencyNotes} />
        )}
        <LongText label="Deworming notes" value={horse.dewormingNotes} />
        <ListBlock title="Allergies or sensitivities" items={horse.allergies} />
      </SummarySection>

      <SummarySection title="Nutrition profile">
        <LongText label="Feeding routine" value={horse.feedingRoutine} />
        <LongText label="Nutrition notes" value={horse.nutritionNotes} />
        <ListBlock title="Recommended" items={horse.nutritionRecommended} />
        <ListBlock title="Avoid" items={horse.nutritionAvoid} />
      </SummarySection>

      <SummarySection title="Active health and medication">
        <RecordList
          emptyLabel="No active health issues."
          records={summary.activeHealthIssues.map((issue) => ({
            id: issue._id,
            title: issue.title,
            meta: [issue.severity, formatTimestamp(issue.notedAt)]
              .filter(Boolean)
              .join(' · '),
            body: issue.description,
          }))}
        />
        <Separator />
        <RecordList
          emptyLabel="No active medication."
          records={summary.activeMedicationRecords.map((record) => ({
            id: record._id,
            title: record.medicationName,
            meta: [
              record.dosage,
              record.frequency,
              `Started ${record.startDate}`,
            ]
              .filter(Boolean)
              .join(' · '),
            body: [record.reason, record.notes].filter(Boolean).join('\n'),
          }))}
        />
      </SummarySection>

      <SummarySection title="Recent weight records">
        <RecordList
          emptyLabel="No weight records yet."
          records={summary.recentWeightRecords.map((record) => ({
            id: record._id,
            title: `${record.weight} ${record.unit}`,
            meta: [
              formatTimestamp(record.measuredAt),
              record.bodyConditionScore
                ? `BCS ${record.bodyConditionScore}/9`
                : undefined,
            ]
              .filter(Boolean)
              .join(' · '),
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
            meta: [
              eventTypeLabels[event.type],
              eventStatusLabels[event.status ?? 'planned'],
              event.date,
              event.providerName,
              event.totalCost !== undefined
                ? `Total ${formatCost(event.totalCost)}`
                : undefined,
              event.costPerHorse !== undefined
                ? `${formatCost(event.costPerHorse)} per horse`
                : undefined,
            ]
              .filter(Boolean)
              .join(' · '),
            body: [
              event.notesAfterCompletion,
              eventHorse?.requestedServiceNotes
                ? `Requested: ${eventHorse.requestedServiceNotes}`
                : undefined,
              eventHorse?.completionNotes
                ? `Horse outcome: ${eventHorse.completionNotes}`
                : undefined,
            ]
              .filter(Boolean)
              .join('\n'),
          }))}
        />
      </SummarySection>

      <SummarySection title="Recent nutrition changes">
        <RecordList
          emptyLabel="No nutrition change logs."
          records={summary.recentNutritionLogs.map((log) => ({
            id: log._id,
            title: log.summary,
            meta: formatTimestamp(log.changedAt),
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
            meta: [
              stableDocumentTypeLabels[document.type],
              document.contentType,
              document.size !== undefined
                ? formatFileSize(document.size)
                : undefined,
            ]
              .filter(Boolean)
              .join(' · '),
            body: document.notes,
          }))}
        />
      </SummarySection>
    </div>
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
    <Card className="bg-card/80 print:break-inside-avoid print:border-black/30 print:shadow-none">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">{children}</CardContent>
    </Card>
  )
}

function DetailGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>
}

function DetailItem({ label, value }: { label: string; value?: string }) {
  if (!value) return null

  return (
    <div className="grid gap-1">
      <span className="text-muted-foreground print:text-black/70">{label}</span>
      <span>{value}</span>
    </div>
  )
}

function LongText({ label, value }: { label: string; value?: string }) {
  if (!value) return null

  return (
    <div className="grid gap-1">
      <span className="text-muted-foreground print:text-black/70">{label}</span>
      <p className="whitespace-pre-wrap">{value}</p>
    </div>
  )
}

function ListBlock({ title, items }: { title: string; items?: Array<string> }) {
  if (!items?.length) return null

  return (
    <div className="grid gap-1">
      <span className="text-muted-foreground print:text-black/70">{title}</span>
      <ul className="list-disc pl-5">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
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
      <p className="text-muted-foreground print:text-black/70">{emptyLabel}</p>
    )
  }

  return (
    <div className="grid gap-3">
      {records.map((record) => (
        <div
          key={record.id}
          className="grid gap-1 rounded-row bg-background/55 p-5 print:border print:border-black/30"
        >
          <h3 className="font-medium">{record.title}</h3>
          {record.meta && (
            <p className="text-xs text-muted-foreground print:text-black/70">
              {record.meta}
            </p>
          )}
          {record.body && <p className="whitespace-pre-wrap">{record.body}</p>}
        </div>
      ))}
    </div>
  )
}

function formatCost(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'GBP',
  }).format(value)
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 102.4) / 10} KB`

  return `${Math.round(size / 104857.6) / 10} MB`
}
