import { StableEventsCalendar } from '#/components/stables/StableEventsCalendar'
import { StableHorseCards } from '#/components/stables/StableHorseCards'
import { StableUpcomingEventsCard } from '#/components/stables/StableUpcomingEvents'
import { buttonVariants } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Link } from '@tanstack/react-router'
import type { Doc } from 'convex/_generated/dataModel'
import {
  getCurrentMonthEventCount,
  getUpcomingEvents,
} from './stableDashboardDates'

type StableDashboardProps = {
  stable: Doc<'stables'>
  owner: Doc<'users'> | null
  horses: Array<Doc<'horses'>>
  events: Array<Doc<'events'>>
}

export function StableDashboard({
  stable,
  owner,
  horses,
  events,
}: StableDashboardProps) {
  const upcomingEventCount = getUpcomingEvents(events, new Date()).length
  const currentMonthEventCount = getCurrentMonthEventCount(events)

  return (
    <div className="grid gap-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-2">
          <h1 className="text-3xl font-semibold">{stable.name}</h1>
          <p className="text-sm text-muted-foreground">{stable.location}</p>
          {stable.description && <p>{stable.description}</p>}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/stables/$stableId/edit"
            params={{ stableId: stable._id }}
            className={buttonVariants({ variant: 'outline' })}
          >
            Edit
          </Link>
          <Link
            to="/stables/$stableId/settings"
            params={{ stableId: stable._id }}
            className={buttonVariants({ variant: 'outline' })}
          >
            Settings
          </Link>
          <Link
            to="/stables/$stableId/horses/create"
            params={{ stableId: stable._id }}
            className={buttonVariants({ variant: 'outline' })}
          >
            Add horse
          </Link>
          <Link
            to="/stables/$stableId/events/create"
            params={{ stableId: stable._id }}
            className={buttonVariants({ variant: 'outline' })}
          >
            Add event
          </Link>
          <Link
            to="/stables/$stableId/horses"
            params={{ stableId: stable._id }}
            className={buttonVariants({ variant: 'outline' })}
          >
            View horses
          </Link>
          <Link
            to="/stables/$stableId/events"
            params={{ stableId: stable._id }}
            className={buttonVariants({ variant: 'outline' })}
          >
            View events
          </Link>
          <Link
            to="/stables/$stableId/events/calendar"
            params={{ stableId: stable._id }}
            className={buttonVariants({ variant: 'outline' })}
          >
            Calendar
          </Link>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard title="Horses" value={`${horses.length}`} />
        <SummaryCard title="Upcoming events" value={`${upcomingEventCount}`} />
        <SummaryCard
          title="Events this month"
          value={`${currentMonthEventCount}`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stable summary</CardTitle>
          <CardDescription>Owner and stable details.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <DetailItem label="Owner" value={owner?.firstName ?? 'Unknown'} />
          <DetailItem label="Address" value={stable.location} />
        </CardContent>
      </Card>

      <section className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Horses</h2>
            <p className="text-sm text-muted-foreground">
              All horse profiles in this stable.
            </p>
          </div>
        </div>

        <StableHorseCards stableId={stable._id} horses={horses} />
      </section>

      <section className="grid gap-4">
        <div>
          <h2 className="text-xl font-semibold">Schedule</h2>
          <p className="text-sm text-muted-foreground">
            Browse the month and jump into the next scheduled events.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.75fr)]">
          <StableEventsCalendar events={events} />
          <StableUpcomingEventsCard stableId={stable._id} events={events} />
        </div>
      </section>
    </div>
  )
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
    </Card>
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
