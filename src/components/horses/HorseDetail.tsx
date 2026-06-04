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
import { Link } from '@tanstack/react-router'
import type { Doc } from 'convex/_generated/dataModel'

type HorseDetailHorse = Doc<'horses'> & {
  profileImageUrl?: string | null
}

type HorseDetailProps = {
  stableId: string
  horse: HorseDetailHorse
  events: Array<Doc<'events'>>
}

export function HorseDetail({ stableId, horse, events }: HorseDetailProps) {
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

        <Link
          to="/stables/$stableId/horses/$horseId/edit"
          params={{ stableId, horseId: horse._id }}
          className={buttonVariants({ variant: 'outline' })}
        >
          Edit horse
        </Link>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <DetailItem label="Age" value={`${horse.age}`} />
          {horse.breed && <DetailItem label="Breed" value={horse.breed} />}
        </CardContent>
      </Card>

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
