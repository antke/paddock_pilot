import {
  DetailField,
  DetailGrid,
  DetailMetricBlock,
  DetailNoteBlock,
  DetailPanel,
  DetailPanelGrid,
  DetailStack,
} from '#/components/dashboard/DetailBlocks'
import { DashboardBadgeList } from '#/components/dashboard/DashboardBadgeList'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { TextLabel } from '#/components/ui/text-label'
import { calculateHorseAge } from 'shared/horses/horseAge'
import { HorseAllergyBadge } from './HorseBadges'
import { sexLabels, shoeingStatusLabels } from './HorseDetail'
import type { HorseDetailSectionProps } from './HorseDetail'

export function HorseProfileSection({ horse }: HorseDetailSectionProps) {
  const age = calculateHorseAge(horse.dateOfBirth) ?? horse.age
  const hasRegistrationDetails =
    horse.passportNumber ||
    horse.microchipNumber ||
    horse.insuranceProvider ||
    horse.insurancePolicyNumber
  const hasAtGlanceDetails =
    horse.color || horse.discipline || horse.dateOfBirth
  const hasBreedingDetails = horse.sire || horse.dam || horse.shoeingStatus
  const hasCareNotes = horse.allergies?.length || horse.dewormingNotes

  return (
    <DashboardSectionCard size="panel" contentGap="loose">
      <DetailGrid columns={4}>
        <DetailMetricBlock label="Age" value={`${age}`} />
        {horse.breed && <DetailMetricBlock label="Breed" value={horse.breed} />}
        {horse.sex && (
          <DetailMetricBlock label="Sex" value={sexLabels[horse.sex]} />
        )}
        {horse.height && (
          <DetailMetricBlock label="Height" value={horse.height} />
        )}
      </DetailGrid>

      <DetailPanelGrid>
        {hasAtGlanceDetails && (
          <DetailPanel title="At a glance">
            <DetailGrid>
              {horse.color && <DetailField label="Color" value={horse.color} />}
              {horse.discipline && (
                <DetailField label="Discipline" value={horse.discipline} />
              )}
              {horse.dateOfBirth && (
                <DetailField label="Date of birth" value={horse.dateOfBirth} />
              )}
            </DetailGrid>
          </DetailPanel>
        )}

        {hasRegistrationDetails && (
          <DetailPanel title="Identification">
            <DetailStack>
              {horse.passportNumber && (
                <DetailField
                  label="Passport number"
                  value={horse.passportNumber}
                />
              )}
              {horse.microchipNumber && (
                <DetailField label="Microchip" value={horse.microchipNumber} />
              )}
              {horse.insuranceProvider && (
                <DetailField
                  label="Insurance"
                  value={horse.insuranceProvider}
                />
              )}
              {horse.insurancePolicyNumber && (
                <DetailField
                  label="Insurance policy"
                  value={horse.insurancePolicyNumber}
                />
              )}
            </DetailStack>
          </DetailPanel>
        )}

        {hasBreedingDetails && (
          <DetailPanel title="Lineage & routine">
            <DetailGrid>
              {horse.sire && <DetailField label="Sire" value={horse.sire} />}
              {horse.dam && <DetailField label="Dam" value={horse.dam} />}
              {horse.shoeingStatus && (
                <DetailField
                  label="Shoeing status"
                  value={shoeingStatusLabels[horse.shoeingStatus]}
                />
              )}
            </DetailGrid>
          </DetailPanel>
        )}

        {hasCareNotes && (
          <DetailPanel title="Notes" span="lg2">
            <DetailStack gap="loose">
              {horse.allergies?.length ? (
                <DetailStack gap="compact">
                  <TextLabel>Allergies</TextLabel>
                  <DashboardBadgeList>
                    {horse.allergies.map((allergy) => (
                      <HorseAllergyBadge key={allergy} allergy={allergy} />
                    ))}
                  </DashboardBadgeList>
                </DetailStack>
              ) : null}
              {horse.dewormingNotes && (
                <DetailNoteBlock label="Deworming notes">
                  {horse.dewormingNotes}
                </DetailNoteBlock>
              )}
            </DetailStack>
          </DetailPanel>
        )}
      </DetailPanelGrid>
    </DashboardSectionCard>
  )
}
