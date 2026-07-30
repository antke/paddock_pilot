import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '#/components/ui/breadcrumb'
import { Link, useLocation } from '@tanstack/react-router'
import { HouseIcon } from '@phosphor-icons/react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { Fragment } from 'react'
import {
  createStableBreadcrumbItems,
  getStableRouteSegments,
} from './stableBreadcrumbTrail'
import type { StableBreadcrumbItem } from './stableBreadcrumbTrail'

type StableBreadcrumbsProps = {
  stableId: string
}

export function StableBreadcrumbs({ stableId }: StableBreadcrumbsProps) {
  const { pathname } = useLocation()
  const stableBasePath = `/stables/${stableId}`
  const pathAfterStable = pathname.slice(stableBasePath.length)
  const [feature, entityOrAction] = getStableRouteSegments(pathAfterStable)
  const horseId =
    feature === 'horses' && entityOrAction !== 'create'
      ? entityOrAction
      : undefined
  const eventId =
    feature === 'events' &&
    entityOrAction !== 'create' &&
    entityOrAction !== 'calendar'
      ? entityOrAction
      : undefined
  const horse = useQuery(api.horses.get, horseId ? { id: horseId } : 'skip')
  const event = useQuery(
    api.events.get,
    eventId ? { id: eventId as Id<'events'> } : 'skip',
  )
  const items = createStableBreadcrumbItems(pathAfterStable, {
    eventTitle: event?.title,
    horseName: horse?.name,
  })

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            render={<Link to="/" />}
            aria-label="Dashboard"
            title="Dashboard"
          >
            <HouseIcon aria-hidden="true" className="size-4" />
            <span className="sr-only">Dashboard</span>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {items.map((item) => (
          <Fragment key={`${item.destination ?? 'page'}-${item.label}`}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {item.destination ? (
                <StableBreadcrumbLink
                  item={item}
                  stableId={stableId}
                  horseId={horseId}
                  eventId={eventId}
                />
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function StableBreadcrumbLink({
  item,
  stableId,
  horseId,
  eventId,
}: {
  item: StableBreadcrumbItem
  stableId: string
  horseId?: string
  eventId?: string
}) {
  if (item.destination === 'horses') {
    return (
      <BreadcrumbLink
        render={<Link to="/stables/$stableId/horses" params={{ stableId }} />}
      >
        {item.label}
      </BreadcrumbLink>
    )
  }

  if (item.destination === 'horse' && horseId) {
    return (
      <BreadcrumbLink
        render={
          <Link
            to="/stables/$stableId/horses/$horseId/profile"
            params={{ stableId, horseId }}
          />
        }
      >
        {item.label}
      </BreadcrumbLink>
    )
  }

  if (item.destination === 'events') {
    return (
      <BreadcrumbLink
        render={<Link to="/stables/$stableId/events" params={{ stableId }} />}
      >
        {item.label}
      </BreadcrumbLink>
    )
  }

  if (item.destination === 'event' && eventId) {
    return (
      <BreadcrumbLink
        render={
          <Link
            to="/stables/$stableId/events/$eventId"
            params={{ stableId, eventId }}
          />
        }
      >
        {item.label}
      </BreadcrumbLink>
    )
  }

  return <BreadcrumbPage>{item.label}</BreadcrumbPage>
}
