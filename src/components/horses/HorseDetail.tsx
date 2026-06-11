import { EventTable } from '#/components/events/EventList'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '#/components/ui/breadcrumb'
import { buttonVariants } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '#/components/ui/navigation-menu'
import { Link, useLocation } from '@tanstack/react-router'
import type { Doc } from 'convex/_generated/dataModel'
import { HorseDocumentsCard } from '../documents/HorseDocumentsCard'
import { HorseCareRemindersCard } from '../reminders/HorseCareRemindersCard'
import { HorseHealthIssuesCard } from './HorseHealthIssuesCard'
import { HorseMedicationRecordsCard } from './HorseMedicationRecordsCard'
import { HorseNutritionCard } from './HorseNutritionCard'
import { HorseNutritionLogsCard } from './HorseNutritionLogsCard'
import { HorseWeightRecordsCard } from './HorseWeightRecordsCard'

type HorseDetailHorse = Doc<'horses'> & {
  profileImageUrl?: string | null
}

type HorseDetailProps = {
  stableId: string
  horse: HorseDetailHorse
  events: Array<Doc<'events'>>
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

export function HorseDetail({ stableId, horse, events }: HorseDetailProps) {
  const { pathname } = useLocation()
  const horseBasePath = `/stables/${stableId}/horses/${horse._id}`
  const pathAfterHorse = pathname.slice(horseBasePath.length)
  const activeHorseSection = pathAfterHorse.startsWith('/care-summary')
    ? 'care-summary'
    : pathAfterHorse.startsWith('/timeline')
      ? 'timeline'
      : pathAfterHorse.startsWith('/edit')
        ? 'edit'
        : 'profile'

  return (
    <div className="grid gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link to="/stables">Stables</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link to="/stables/$stableId" params={{ stableId }}>
              Stable
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link to="/stables/$stableId/horses" params={{ stableId }}>
              Horses
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{horse.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-24 overflow-hidden rounded-lg border bg-muted">
            {horse.profileImageUrl ? (
              <img
                src={horse.profileImageUrl}
                alt={`${horse.name} profile`}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-2xl font-semibold text-muted-foreground">
                {horse.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <h1 className="text-2xl font-semibold">{horse.name}</h1>
          </div>
        </div>

        <NavigationMenu className="justify-start lg:justify-end">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger data-active>
                Horse
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid w-56 gap-1">
                  <NavigationMenuLink
                    render={
                      <Link
                        to="/stables/$stableId/horses/$horseId"
                        params={{ stableId, horseId: horse._id }}
                      />
                    }
                    data-active={activeHorseSection === 'profile' || undefined}
                    closeOnClick
                  >
                    Profile
                  </NavigationMenuLink>
                  <NavigationMenuLink
                    render={
                      <Link
                        to="/stables/$stableId/horses/$horseId/care-summary"
                        params={{ stableId, horseId: horse._id }}
                      />
                    }
                    data-active={
                      activeHorseSection === 'care-summary' || undefined
                    }
                    closeOnClick
                  >
                    Care summary
                  </NavigationMenuLink>
                  <NavigationMenuLink
                    render={
                      <Link
                        to="/stables/$stableId/horses/$horseId/timeline"
                        params={{ stableId, horseId: horse._id }}
                      />
                    }
                    data-active={activeHorseSection === 'timeline' || undefined}
                    closeOnClick
                  >
                    Timeline
                  </NavigationMenuLink>
                  <NavigationMenuLink
                    render={
                      <Link
                        to="/stables/$stableId/horses/$horseId/edit"
                        params={{ stableId, horseId: horse._id }}
                      />
                    }
                    data-active={activeHorseSection === 'edit' || undefined}
                    closeOnClick
                  >
                    Edit details
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <DetailItem label="Age" value={`${horse.age}`} />
          {horse.breed && <DetailItem label="Breed" value={horse.breed} />}
          {horse.sex && <DetailItem label="Sex" value={sexLabels[horse.sex]} />}
          {horse.color && <DetailItem label="Color" value={horse.color} />}
          {horse.height && <DetailItem label="Height" value={horse.height} />}
          {horse.discipline && (
            <DetailItem label="Discipline" value={horse.discipline} />
          )}
          {horse.dateOfBirth && (
            <DetailItem label="Date of birth" value={horse.dateOfBirth} />
          )}
          {horse.passportNumber && (
            <DetailItem label="Passport number" value={horse.passportNumber} />
          )}
          {horse.microchipNumber && (
            <DetailItem label="Microchip" value={horse.microchipNumber} />
          )}
          {horse.insuranceProvider && (
            <DetailItem label="Insurance" value={horse.insuranceProvider} />
          )}
          {horse.insurancePolicyNumber && (
            <DetailItem
              label="Insurance policy"
              value={horse.insurancePolicyNumber}
            />
          )}
        </CardContent>
      </Card>

      {(horse.sire ||
        horse.dam ||
        horse.shoeingStatus ||
        horse.dewormingNotes ||
        horse.allergies?.length) && (
        <Card>
          <CardHeader>
            <CardTitle>Additional profile</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            {horse.sire && <DetailItem label="Sire" value={horse.sire} />}
            {horse.dam && <DetailItem label="Dam" value={horse.dam} />}
            {horse.shoeingStatus && (
              <DetailItem
                label="Shoeing status"
                value={shoeingStatusLabels[horse.shoeingStatus]}
              />
            )}
            {horse.allergies?.length ? (
              <div className="grid gap-1 sm:col-span-2">
                <span className="text-muted-foreground">Allergies</span>
                <ul className="list-disc space-y-1 pl-5">
                  {horse.allergies.map((allergy) => (
                    <li key={allergy}>{allergy}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {horse.dewormingNotes && (
              <div className="grid gap-1 sm:col-span-2">
                <span className="text-muted-foreground">Deworming notes</span>
                <p className="whitespace-pre-wrap">{horse.dewormingNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(horse.vetName ||
        horse.vetPhone ||
        horse.farrierName ||
        horse.farrierPhone ||
        horse.emergencyNotes) && (
        <Card>
          <CardHeader>
            <CardTitle>Care contacts</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            {horse.vetName && <DetailItem label="Vet" value={horse.vetName} />}
            {horse.vetPhone && (
              <DetailItem label="Vet phone" value={horse.vetPhone} />
            )}
            {horse.farrierName && (
              <DetailItem label="Farrier" value={horse.farrierName} />
            )}
            {horse.farrierPhone && (
              <DetailItem label="Farrier phone" value={horse.farrierPhone} />
            )}
            {horse.emergencyNotes && (
              <div className="grid gap-1 sm:col-span-2">
                <span className="text-muted-foreground">Emergency notes</span>
                <p className="whitespace-pre-wrap">{horse.emergencyNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <HorseMedicationRecordsCard horse={horse} />

      <HorseCareRemindersCard horse={horse} />

      <HorseDocumentsCard horse={horse} />

      <HorseNutritionCard horse={horse} />

      <HorseNutritionLogsCard horse={horse} />

      <HorseWeightRecordsCard horse={horse} />

      <HorseHealthIssuesCard horse={horse} />

      <section className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-semibold">Events</h2>

          <Link
            to="/stables/$stableId/events/create"
            params={{ stableId }}
            className={buttonVariants({ variant: 'outline' })}
          >
            Add event
          </Link>
        </div>

        <EventTable
          stableId={stableId}
          events={events}
          emptyTitle="No events for this horse yet."
          emptyDescription="Create an event and select this horse to show it here."
        />
      </section>
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  )
}
