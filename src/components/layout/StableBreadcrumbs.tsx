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
  getStableBreadcrumbEntityIds,
} from './stableBreadcrumbTrail'
import type {
  StableBreadcrumbItem,
  StableBreadcrumbLabels,
} from './stableBreadcrumbTrail'

type StableBreadcrumbsProps = {
  stableId: string
}

export function StableBreadcrumbs({ stableId }: StableBreadcrumbsProps) {
  const { pathname } = useLocation()
  const stableBasePath = `/stables/${stableId}`
  const pathAfterStable = pathname.slice(stableBasePath.length)
  const { horseId, eventId } = getStableBreadcrumbEntityIds(pathAfterStable)
  const horse = useQuery(api.horses.get, horseId ? { id: horseId } : 'skip')
  const event = useQuery(
    api.events.get,
    eventId ? { id: eventId as Id<'events'> } : 'skip',
  )
  return (
    <StableBreadcrumbsView
      stableId={stableId}
      pathAfterStable={pathAfterStable}
      labels={{ eventTitle: event?.title, horseName: horse?.name }}
    />
  )
}

export function StableBreadcrumbsView({
  stableId,
  pathAfterStable,
  labels,
}: {
  stableId: string
  pathAfterStable: string
  labels?: StableBreadcrumbLabels
}) {
  const { horseId, eventId } = getStableBreadcrumbEntityIds(pathAfterStable)
  const items = createStableBreadcrumbItems(pathAfterStable, labels)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            render={<Link to="/" activeOptions={{ exact: true }} />}
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
  if (item.destination === 'training')
    return (
      <BreadcrumbLink
        render={<Link to="/stables/$stableId/training" params={{ stableId }} />}
      >
        {item.label}
      </BreadcrumbLink>
    )
  if (item.destination === 'trainingSession' && eventId)
    return (
      <BreadcrumbLink
        render={
          <Link
            to="/stables/$stableId/training/$eventId"
            params={{ stableId, eventId }}
          />
        }
      >
        {item.label}
      </BreadcrumbLink>
    )
  if (item.destination === 'horses') {
    return (
      <BreadcrumbLink
        render={
          <Link
            to="/stables/$stableId/horses"
            params={{ stableId }}
            activeOptions={{ exact: true }}
          />
        }
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
            activeOptions={{ exact: true }}
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
        render={
          <Link
            to="/stables/$stableId/events"
            params={{ stableId }}
            activeOptions={{ exact: true }}
          />
        }
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
            activeOptions={{ exact: true }}
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
