import { StableEventsCalendar } from '#/components/stables/StableEventsCalendar'
import { StableDashboardAlerts } from '#/components/stables/StableDashboardAlerts'
import { StableHorseCards } from '#/components/stables/StableHorseCards'
import { StableUpcomingEventsCard } from '#/components/stables/StableUpcomingEvents'
import { buttonVariants } from '#/components/ui/button'
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
  const hasOperationalDetails = Boolean(
    stable.contactName ||
    stable.contactPhone ||
    stable.emergencyPhone ||
    stable.openingHours ||
    stable.yardRules,
  )
  const postalAddress = [
    stable.addressLine1,
    stable.addressLine2,
    stable.postcode,
    stable.country,
  ].filter(Boolean)

  return (
    <div className="grid gap-8">
      <header className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="grid max-w-3xl gap-2">
          <h1 className="text-3xl font-semibold">{stable.name}</h1>
          <p className="text-sm text-muted-foreground">{stable.location}</p>
          {stable.description && <p>{stable.description}</p>}
        </div>

        <div className="grid justify-start gap-3 lg:justify-items-end">
          <div className="flex flex-wrap gap-2 lg:justify-end">
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
              className={buttonVariants()}
            >
              Add event
            </Link>
          </div>
          <nav className="flex max-w-3xl flex-wrap gap-2 lg:justify-end">
            <Link
              to="/stables/$stableId/edit"
              params={{ stableId: stable._id }}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              Edit
            </Link>
            <Link
              to="/stables/$stableId/settings"
              params={{ stableId: stable._id }}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              Settings
            </Link>
            <Link
              to="/stables/$stableId/horses"
              params={{ stableId: stable._id }}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              Horses
            </Link>
            <Link
              to="/stables/$stableId/events"
              params={{ stableId: stable._id }}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              Events
            </Link>
            <Link
              to="/stables/$stableId/events/calendar"
              params={{ stableId: stable._id }}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              Calendar
            </Link>
            <Link
              to="/stables/$stableId/reminders"
              params={{ stableId: stable._id }}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              Reminders
            </Link>
            <Link
              to="/stables/$stableId/documents"
              params={{ stableId: stable._id }}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              Documents
            </Link>
            <Link
              to="/stables/$stableId/analysis"
              params={{ stableId: stable._id }}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              Analysis
            </Link>
          </nav>
        </div>
      </header>

      <div className="grid gap-3 border-y border-border-subtle py-5 md:grid-cols-3">
        <SummaryCard title="Horses" value={`${horses.length}`} />
        <SummaryCard title="Upcoming events" value={`${upcomingEventCount}`} />
        <SummaryCard
          title="Events this month"
          value={`${currentMonthEventCount}`}
        />
      </div>

      <StableDashboardAlerts stableId={stable._id} />

      <section className="grid gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Stable summary
          </h2>
          <p className="text-sm text-muted-foreground">
            Owner and stable details.
          </p>
        </div>
        <div className="grid items-start gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <DetailItem label="Owner" value={owner?.firstName ?? 'Unknown'} />
          <DetailItem label="Address" value={stable.location} />
          {postalAddress.length > 0 && (
            <LongDetailItem
              label="Postal address"
              value={postalAddress.join('\n')}
            />
          )}
          {stable.contactName && (
            <DetailItem label="Contact" value={stable.contactName} />
          )}
          {stable.contactPhone && (
            <DetailItem label="Contact phone" value={stable.contactPhone} />
          )}
          {stable.emergencyPhone && (
            <DetailItem label="Emergency phone" value={stable.emergencyPhone} />
          )}
          {hasOperationalDetails && stable.openingHours && (
            <LongDetailItem label="Opening hours" value={stable.openingHours} />
          )}
          {hasOperationalDetails && stable.yardRules && (
            <LongDetailItem label="Yard rules" value={stable.yardRules} />
          )}
        </div>
      </section>

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

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <StableEventsCalendar events={events} />
          <StableUpcomingEventsCard stableId={stable._id} events={events} />
        </div>
      </section>
    </div>
  )
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="grid gap-1 md:border-l md:border-border-subtle md:pl-5 first:md:border-l-0 first:md:pl-0">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-border-subtle pb-3 last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  )
}

function LongDetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-border-subtle pb-3 last:border-b-0 sm:col-span-2">
      <span className="text-muted-foreground">{label}</span>
      <p className="whitespace-pre-line">{value}</p>
    </div>
  )
}
