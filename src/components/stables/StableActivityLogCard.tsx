import {
  DashboardItemCardContent,
  DashboardItemList,
  DashboardItemRecordCard,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { ScrollableList } from '#/components/ui/scrollable-list'
import { formatMediumTimestampDateTime } from '#/lib/dateDisplay'
import type { StableAuditEntry } from './stableSettingsTypes'

export function StableActivityLogCard({
  entries,
}: {
  entries: Array<StableAuditEntry>
}) {
  return (
    <DashboardSectionCard
      title="Recent changes"
      description="Important stable, membership and event changes, newest first."
      contentGap="compact"
    >
      {entries.length === 0 ? (
        <DashboardEmptyState chrome="soft" spacing="flush">
          No audited activity has been recorded yet.
        </DashboardEmptyState>
      ) : (
        <ScrollableList
          itemCount={entries.length}
          visibleItemLimit={8}
          estimatedItemHeightRem={4.75}
        >
          <DashboardItemList gap="compact">
            {entries.map((entry) => (
              <DashboardItemRecordCard
                key={entry._id}
                chrome="cards"
                density="compact"
                interactive={false}
              >
                <DashboardItemCardContent
                  title={formatAuditAction(entry.action)}
                  titleSize="sm"
                  meta={
                    <>
                      <span>{formatAuditActor(entry.actor)}</span>
                      <time dateTime={new Date(entry.createdAt).toISOString()}>
                        {formatMediumTimestampDateTime(entry.createdAt)}
                      </time>
                      {entry.summary && <span>{entry.summary}</span>}
                    </>
                  }
                  metaSeparator="dot"
                />
              </DashboardItemRecordCard>
            ))}
          </DashboardItemList>
        </ScrollableList>
      )}
    </DashboardSectionCard>
  )
}

function formatAuditAction(action: string) {
  const labels: Record<string, string> = {
    'stable.created': 'Stable created',
    'stable.updated': 'Stable details updated',
    'stable.archived': 'Stable archived',
    'member_invitation.created': 'Member invited',
    'member_invitation.resent': 'Member invitation resent',
    'member_invitation.revoked': 'Member invitation revoked',
    'member_invitation.accepted': 'Member invitation accepted',
    'member_invitation.activated': 'Member access activated',
    'member_invitation.accepted_pending_plan':
      'Member invitation accepted, awaiting plan',
    'member.removed': 'Member removed',
    'event.created': 'Event created',
    'event.updated': 'Event updated',
    'event_horse.approved': 'Horse invitation approved',
    'event_horse.declined': 'Horse invitation declined',
    'event_horse.withdrawn': 'Horse withdrawn from event',
  }

  const fallback = action.replaceAll(/[._]/g, ' ')
  return labels[action] ?? fallback.charAt(0).toUpperCase() + fallback.slice(1)
}

function formatAuditActor(actor: StableAuditEntry['actor']) {
  if (!actor) return 'Former user'
  return (
    actor.preferredName ||
    [actor.firstName, actor.lastName].filter(Boolean).join(' ')
  )
}
