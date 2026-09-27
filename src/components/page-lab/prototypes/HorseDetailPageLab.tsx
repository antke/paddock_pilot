import { HorseDetail } from '#/components/horses/HorseDetail'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { useState } from 'react'
import { Field, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { DetailStack } from '#/components/dashboard/DetailBlocks'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'

type HorseDetailPageLabProps = {
  data: DashboardLabData
}

export function HorseDetailPageLab({ data }: HorseDetailPageLabProps) {
  const fixtureMode = useDevAuthBypassEnabled()
  const [sample, setSample] = useState('standard')
  const originalHorse = data.horses[0]
  const horse =
    !originalHorse || !fixtureMode || sample === 'standard'
      ? originalHorse
      : sample === 'minimal'
        ? {
            _id: originalHorse._id,
            _creationTime: originalHorse._creationTime,
            stableId: originalHorse.stableId,
            ownerId: originalHorse.ownerId,
            name: 'Juniper',
            age: 9,
          }
        : {
            ...originalHorse,
            name: 'Juniper of the Northern Pastures and Cedar Ridge',
            ownerName: 'Alexandra and Christopher Montgomery',
            passportNumber: 'GBR-SAMPLE-4412-9876543210-REGISTERED-PASSPORT',
            insuranceProvider:
              'Sample Equine and Countryside Insurance Services',
            insurancePolicyNumber: 'SAMPLE-2026-000000123456789',
            sire: 'Northern Pastures Evening Star',
            dam: 'Cedar Ridge Morning Meadow',
            allergies: [
              'Dusty hay',
              'Bee stings',
              'Sample allergy: meadow grasses and mixed hay containing flowering clover during late summer turnout',
              'SampleUnbrokenAllergenIdentifierForWrappingVerificationABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            ],
            dewormingNotes:
              'Sample record: discuss the next worm count with the vet after turnout changes. Keep the result with the care record so every member can find it.',
          }

  if (!horse) {
    return (
      <DashboardEmptyState chrome="cards">
        No horses added yet.
      </DashboardEmptyState>
    )
  }

  const events = data.events.filter((event) =>
    event.horseIds.includes(horse._id),
  )

  return (
    <DetailStack gap="loose">
      {fixtureMode && (
        <Field>
          <FieldLabel htmlFor="horse-profile-sample">Sample profile</FieldLabel>
          <Select
            id="horse-profile-sample"
            value={sample}
            onChange={(event) => setSample(event.target.value)}
          >
            <option value="standard">Standard sample</option>
            <option value="detailed">Long name and detailed record</option>
            <option value="minimal">Minimal record · read-only</option>
          </Select>
        </Field>
      )}
      <HorseDetail
        stableId={data.stable._id}
        horse={horse}
        events={events}
        category="profile"
        canManageHorse={!fixtureMode || sample !== 'minimal'}
      />
    </DetailStack>
  )
}
