import { useState } from 'react'
import { Field, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardLayoutStack } from '#/components/dashboard/DashboardLayoutGrid'
import { EventDetail } from '#/components/events/EventDetail'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '#/components/ui/breadcrumb'
import { Link, useSearch } from '@tanstack/react-router'

type EventDetailPageLabProps = {
  data: DashboardLabData
}

export function EventDetailPageLab({ data }: EventDetailPageLabProps) {
  const fixtureMode = useDevAuthBypassEnabled()
  const [sample, setSample] = useState('standard')
  const requestedEventId = (useSearch({ strict: false }) as { event?: string })
    .event
  const stableEvents = data.events.filter(
    (item) => item.stableId === data.stable._id,
  )
  const originalEvent =
    stableEvents.find((item) => item._id === requestedEventId) ??
    stableEvents[0]
  const event =
    !originalEvent || !fixtureMode || sample === 'standard'
      ? originalEvent
      : sample === 'minimal'
        ? {
            ...originalEvent,
            title: 'Sample yard visit',
            status: 'planned' as const,
            description: undefined,
            providerName: undefined,
            providerPhone: undefined,
            totalCost: undefined,
            costPerHorse: undefined,
            notesAfterCompletion: undefined,
            location: undefined,
            recurrence: undefined,
            horseIds: [],
          }
        : {
            ...originalEvent,
            title:
              'Sample autumn care review and follow-up with the visiting equine team',
            providerName:
              'Sample Northern Pastures Equine Veterinary and Rehabilitation Practice',
            providerPhone: '+48 555 010 200',
            totalCost: 1200,
            costPerHorse: 400,
            location:
              'North field shelter beside the main stable and rehabilitation arena',
            description:
              'Sample reference: VISIT-2026-ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ.\nPlease keep the visit notes with this event.',
            notesAfterCompletion:
              'Sample completion notes: discuss the next visit with the care team.',
            horseIds: data.horses.map((horse) => horse._id),
          }

  if (!event) {
    return (
      <DashboardEmptyState chrome="soft">
        No events added yet.
      </DashboardEmptyState>
    )
  }

  const horses = data.horses.filter((horse) =>
    event.horseIds.includes(horse._id),
  )

  return (
    <DashboardLayoutStack>
      {fixtureMode && (
        <Field>
          <FieldLabel htmlFor="event-detail-sample">Sample event</FieldLabel>
          <Select
            id="event-detail-sample"
            value={sample}
            onChange={(change) => setSample(change.target.value)}
          >
            <option value="standard">Standard sample</option>
            <option value="detailed">Long title and detailed record</option>
            <option value="minimal">Minimal record · read-only</option>
          </Select>
        </Field>
      )}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link to="/stables">Stables</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link
              to="/stables/$stableId"
              params={{ stableId: data.stable._id }}
            >
              Stable
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link
              to="/stables/$stableId/events"
              params={{ stableId: data.stable._id }}
            >
              Events
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{event.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <EventDetail
        stableId={data.stable._id}
        event={event}
        horses={horses}
        canManageEvent={!fixtureMode || sample !== 'minimal'}
        showServiceDetails={false}
      />
    </DashboardLayoutStack>
  )
}
