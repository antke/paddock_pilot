import {
  DetailField,
  DetailGrid,
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
  const hasBreedingDetails = horse.sire || horse.dam || horse.shoeingStatus
  const hasCareNotes = horse.allergies?.length || horse.dewormingNotes
  const ageLabel = typeof age === 'number' ? `${age}` : 'Not recorded'

  return (
    <DashboardSectionCard title="Profile" size="panel" contentGap="loose">
      <DetailPanelGrid variant="equal">
        <DetailPanel title="At a glance" span="lg2">
          <DetailGrid columns={4} gap="default">
            <DetailField
              indent={false}
              label="Age"
              value={ageLabel}
              variant="readable"
            />
            {horse.breed && (
              <DetailField
                indent={false}
                label="Breed"
                value={horse.breed}
                variant="readable"
              />
            )}
            {horse.sex && (
              <DetailField
                indent={false}
                label="Sex"
                value={sexLabels[horse.sex]}
                variant="readable"
              />
            )}
            {horse.height && (
              <DetailField
                indent={false}
                label="Height"
                value={horse.height}
                variant="readable"
              />
            )}
            {horse.color && (
              <DetailField
                indent={false}
                label="Color"
                value={horse.color}
                variant="readable"
              />
            )}
            {horse.discipline && (
              <DetailField
                indent={false}
                label="Discipline"
                value={horse.discipline}
                variant="readable"
              />
            )}
            {horse.dateOfBirth && (
              <DetailField
                indent={false}
                label="Date of birth"
                value={horse.dateOfBirth}
                variant="readable"
              />
            )}
          </DetailGrid>
        </DetailPanel>

        {hasRegistrationDetails && (
          <DetailPanel title="Identification">
            <DetailGrid gap="default">
              {horse.passportNumber && (
                <DetailField
                  indent={false}
                  label="Passport number"
                  value={horse.passportNumber}
                  variant="readable"
                />
              )}
              {horse.microchipNumber && (
                <DetailField
                  indent={false}
                  label="Microchip"
                  value={horse.microchipNumber}
                  variant="readable"
                />
              )}
              {horse.insuranceProvider && (
                <DetailField
                  indent={false}
                  label="Insurance"
                  value={horse.insuranceProvider}
                  variant="readable"
                />
              )}
              {horse.insurancePolicyNumber && (
                <DetailField
                  indent={false}
                  label="Insurance policy"
                  value={horse.insurancePolicyNumber}
                  variant="readable"
                />
              )}
            </DetailGrid>
          </DetailPanel>
        )}

        {hasBreedingDetails && (
          <DetailPanel title="Lineage and routine">
            <DetailGrid gap="default">
              {horse.sire && (
                <DetailField
                  indent={false}
                  label="Sire"
                  value={horse.sire}
                  variant="readable"
                />
              )}
              {horse.dam && (
                <DetailField
                  indent={false}
                  label="Dam"
                  value={horse.dam}
                  variant="readable"
                />
              )}
              {horse.shoeingStatus && (
                <DetailField
                  indent={false}
                  label="Shoeing status"
                  value={shoeingStatusLabels[horse.shoeingStatus]}
                  variant="readable"
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
                  <TextLabel
                    size="sm"
                    weight="semibold"
                    className="text-primary"
                  >
                    Allergies
                  </TextLabel>
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
