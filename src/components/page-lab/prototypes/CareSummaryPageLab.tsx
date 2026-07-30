import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import {
  DetailDisplayField,
  DetailGrid,
} from '#/components/dashboard/DetailBlocks'
import {
  PrintSummaryBodyText,
  PrintSummaryHeader,
  PrintSummaryPage,
  PrintSummaryRecordHeader,
  PrintSummaryRecordPanel,
  PrintSummarySection,
} from '#/components/dashboard/PrintSummary'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { calculateHorseAge } from 'shared/horses/horseAge'

export function CareSummaryPageLab({ data }: { data: DashboardLabData }) {
  const horse = data.horses[0]

  if (!horse) return null
  const age = calculateHorseAge(horse.dateOfBirth) ?? horse.age

  return (
    <PrintSummaryPage>
      <PrintSummaryHeader
        title={`${horse.name} care summary`}
        description={`${data.stable.name} · Prepared for care handover`}
        badges={<Badge variant="outline">Personal Pro</Badge>}
        actions={
          <>
            <Button>Print summary</Button>
            <Button variant="outline">Back to horse</Button>
          </>
        }
      />

      <PrintSummarySection title="Profile and identification">
        <DetailGrid columns={3} breakpoint="sm">
          <DetailDisplayField label="Stable" value={data.stable.name} />
          <DetailDisplayField label="Owner" value={horse.ownerName} />
          <DetailDisplayField label="Age" value={age} />
          <DetailDisplayField label="Breed" value={horse.breed} />
          <DetailDisplayField label="Sex" value={horse.sex} />
          <DetailDisplayField label="Color" value={horse.color} />
          <DetailDisplayField label="Height" value={horse.height} />
          <DetailDisplayField label="Discipline" value={horse.discipline} />
          <DetailDisplayField label="Shoeing" value={horse.shoeingStatus} />
        </DetailGrid>
      </PrintSummarySection>

      <PrintSummarySection title="Emergency and care contacts">
        <DetailGrid>
          <DetailDisplayField label="Vet" value={horse.vetName} />
          <DetailDisplayField label="Vet phone" value={horse.vetPhone} />
          <DetailDisplayField label="Farrier" value={horse.farrierName} />
          <DetailDisplayField
            label="Farrier phone"
            value={horse.farrierPhone}
          />
          <DetailDisplayField
            label="Emergency notes"
            value={horse.emergencyNotes}
            span="sm2"
            multiline
          />
        </DetailGrid>
      </PrintSummarySection>

      <PrintSummarySection title="Nutrition profile">
        <DetailGrid>
          <DetailDisplayField
            label="Feeding routine"
            value={horse.feedingRoutine}
            multiline
          />
          <DetailDisplayField
            label="Nutrition notes"
            value={horse.nutritionNotes}
            multiline
          />
        </DetailGrid>
      </PrintSummarySection>

      <PrintSummarySection title="Active health and medication">
        <div className="grid gap-3 md:grid-cols-2">
          <PrintSummaryRecordPanel chrome="soft">
            <PrintSummaryRecordHeader
              title="Right fore lameness"
              description="Medium severity · Noted 8 Jul 2026"
            />
            <PrintSummaryBodyText>
              Monitor after turnout and record response to the new shoeing
              cycle.
            </PrintSummaryBodyText>
          </PrintSummaryRecordPanel>
          <PrintSummaryRecordPanel chrome="soft">
            <PrintSummaryRecordHeader
              title="Phenylbutazone"
              description="1 sachet daily · Active course"
            />
            <PrintSummaryBodyText>
              Give with the evening feed through 12 Jul.
            </PrintSummaryBodyText>
          </PrintSummaryRecordPanel>
        </div>
      </PrintSummarySection>
    </PrintSummaryPage>
  )
}
