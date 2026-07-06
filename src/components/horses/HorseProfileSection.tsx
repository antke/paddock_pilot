import { dashboardSectionClassName } from '#/components/dashboard/dashboardChrome'
import type { ReactNode } from 'react'
import { sexLabels, shoeingStatusLabels } from './HorseDetail'
import type { HorseDetailSectionProps } from './HorseDetail'

export function HorseProfileSection({ horse }: HorseDetailSectionProps) {
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
    <section className={dashboardSectionClassName('cards', 'grid gap-6')}>
      <div className="grid gap-2">
        <h2 className="text-xl font-semibold tracking-tight">Profile</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ProfileMetric label="Age" value={`${horse.age}`} />
        {horse.breed && <ProfileMetric label="Breed" value={horse.breed} />}
        {horse.sex && (
          <ProfileMetric label="Sex" value={sexLabels[horse.sex]} />
        )}
        {horse.height && <ProfileMetric label="Height" value={horse.height} />}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        {hasAtGlanceDetails && (
          <ProfilePanel title="At a glance">
            <div className="grid gap-3 sm:grid-cols-2">
              {horse.color && (
                <ProfileField label="Color" value={horse.color} />
              )}
              {horse.discipline && (
                <ProfileField label="Discipline" value={horse.discipline} />
              )}
              {horse.dateOfBirth && (
                <ProfileField label="Date of birth" value={horse.dateOfBirth} />
              )}
            </div>
          </ProfilePanel>
        )}

        {hasRegistrationDetails && (
          <ProfilePanel title="Identification">
            <div className="grid gap-3">
              {horse.passportNumber && (
                <ProfileField
                  label="Passport number"
                  value={horse.passportNumber}
                />
              )}
              {horse.microchipNumber && (
                <ProfileField label="Microchip" value={horse.microchipNumber} />
              )}
              {horse.insuranceProvider && (
                <ProfileField
                  label="Insurance"
                  value={horse.insuranceProvider}
                />
              )}
              {horse.insurancePolicyNumber && (
                <ProfileField
                  label="Insurance policy"
                  value={horse.insurancePolicyNumber}
                />
              )}
            </div>
          </ProfilePanel>
        )}

        {hasBreedingDetails && (
          <ProfilePanel title="Lineage & routine">
            <div className="grid gap-3 sm:grid-cols-2">
              {horse.sire && <ProfileField label="Sire" value={horse.sire} />}
              {horse.dam && <ProfileField label="Dam" value={horse.dam} />}
              {horse.shoeingStatus && (
                <ProfileField
                  label="Shoeing status"
                  value={shoeingStatusLabels[horse.shoeingStatus]}
                />
              )}
            </div>
          </ProfilePanel>
        )}

        {hasCareNotes && (
          <ProfilePanel title="Notes" className="lg:col-span-2">
            <div className="grid gap-4">
              {horse.allergies?.length ? (
                <div className="grid gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Allergies
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {horse.allergies.map((allergy) => (
                      <span
                        key={allergy}
                        className="rounded-full border border-border-subtle bg-background/70 px-3 py-1 text-sm"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {horse.dewormingNotes && (
                <div className="grid gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Deworming notes
                  </span>
                  <p className="whitespace-pre-wrap rounded-row bg-background/55 p-5 text-sm leading-6">
                    {horse.dewormingNotes}
                  </p>
                </div>
              )}
            </div>
          </ProfilePanel>
        )}
      </div>
    </section>
  )
}

function ProfileMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-row bg-background/55 p-5">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-3 text-xl font-semibold tracking-tight">{value}</div>
    </div>
  )
}

function ProfilePanel({
  title,
  className,
  children,
}: {
  title: string
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={[
        'grid content-start gap-4 rounded-row bg-background/55 p-5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  )
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 pl-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium leading-6">{value}</span>
    </div>
  )
}
