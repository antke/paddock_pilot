import { useLocale, useT } from '#/i18n/LocaleProvider'
import { useId, useLayoutEffect, useRef, useState } from 'react'
import type { FunctionReturnType } from 'convex/server'
import type { api } from 'convex/_generated/api'
import {
  DashboardItemList,
  DashboardItemRecordCard,
  DashboardItemRecordContent,
} from './DashboardItemCard'
import { DashboardSectionCard } from './DashboardSectionCard'
import { DashboardEmptyState } from './DashboardEmptyState'
import { Button } from '#/components/ui/button'
import { Spinner } from '#/components/ui/spinner'
import { formatEventDateTime } from '#/components/events/eventDisplay'

export type PendingHorseInvitation = FunctionReturnType<
  typeof api.events.listPendingHorseInvitations
>[number]
type InvitationId = PendingHorseInvitation['invitation']['_id']
type Decision = 'approve' | 'decline'
type Operation = {
  version: number
  pending?: Decision
  failed?: Decision
  acknowledged?: boolean
}

type PendingHorseInvitationListProps = {
  invitations: Array<PendingHorseInvitation>
  onApprove: (eventHorseId: InvitationId) => Promise<void>
  onDecline: (eventHorseId: InvitationId) => Promise<void>
  showWhenEmpty?: boolean
}

/** Query-free renderer. Successful rows disappear only after the callback acknowledges them. */
export function PendingHorseInvitationList({
  invitations,
  onApprove,
  onDecline,
  showWhenEmpty = false,
}: PendingHorseInvitationListProps) {
  const t = useT()
  const { locale } = useLocale()
  const listId = useId()
  const region = useRef<HTMLDivElement>(null)
  const rows = useRef(new Map<string, HTMLDivElement>())
  const inFlight = useRef(new Set<string>())
  const accepted = useRef(new Map<string, number>())
  const focusedInvitation = useRef<string | null>(null)
  const previousIds = useRef<Array<string>>([])
  const hasShownInvitations = useRef(invitations.length > 0)
  const [operations, setOperations] = useState<Record<string, Operation>>({})
  const [acknowledgement, setAcknowledgement] = useState<{
    item: PendingHorseInvitation
    decision: Decision
  }>()
  const visibleInvitations = invitations.filter(({ invitation }) => {
    const state = operations[invitation._id]
    return !(
      state?.acknowledged && state.version === invitationVersion(invitation)
    )
  })
  if (invitations.length > 0) hasShownInvitations.current = true

  useLayoutEffect(() => {
    const ids = visibleInvitations.map(({ invitation }) => invitation._id)
    const removedId = focusedInvitation.current
    if (removedId && !ids.includes(removedId as InvitationId)) {
      focusedInvitation.current = null
      // A delayed response must not steal focus from another control the user chose.
      if (document.activeElement === document.body) {
        const oldIndex = previousIds.current.indexOf(removedId)
        const nextIds = [
          ...ids.slice(Math.max(oldIndex, 0)),
          ...ids.slice(0, Math.max(oldIndex, 0)),
        ]
        const nextButton = nextIds
          .map((id) =>
            rows.current
              .get(id)
              ?.querySelector<HTMLButtonElement>('button:not(:disabled)'),
          )
          .find(Boolean)
        ;(nextButton ?? region.current)?.focus()
      }
    }
    previousIds.current = ids
  }, [visibleInvitations])

  const decide = async (item: PendingHorseInvitation, decision: Decision) => {
    const id = item.invitation._id
    const version = invitationVersion(item.invitation)
    if (inFlight.current.has(id) || accepted.current.get(id) === version) return
    inFlight.current.add(id)
    setOperations((state) => ({
      ...state,
      [id]: { version, pending: decision },
    }))
    setAcknowledgement(undefined)
    try {
      await (decision === 'approve' ? onApprove(id) : onDecline(id))
      accepted.current.set(id, version)
      setOperations((state) => ({
        ...state,
        [id]: { version, acknowledged: true },
      }))
      setAcknowledgement({ item, decision })
    } catch {
      setOperations((state) => ({
        ...state,
        [id]: { version, failed: decision },
      }))
    } finally {
      inFlight.current.delete(id)
    }
  }

  if (
    !showWhenEmpty &&
    !hasShownInvitations.current &&
    visibleInvitations.length === 0
  )
    return null

  return (
    <div
      ref={region}
      role="region"
      aria-label={t('events.horseInvitations')}
      tabIndex={-1}
      className="outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <DashboardSectionCard
        title={t('events.horseInvitations')}
        description={t('events.horseInvitationsHelp')}
        descriptionSize="sm"
      >
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={acknowledgement ? 'text-sm text-foreground' : 'sr-only'}
        >
          {acknowledgement &&
            t(
              acknowledgement.decision === 'approve'
                ? 'events.approvedAnnouncement'
                : 'events.declinedAnnouncement',
              {
                horse:
                  acknowledgement.item.horse?.name ?? t('events.horseFallback'),
                event:
                  acknowledgement.item.event?.title ??
                  t('events.eventAcknowledgementFallback'),
              },
            )}
        </p>
        {visibleInvitations.length === 0 ? (
          <DashboardEmptyState chrome="flat">
            {t('events.noHorseInvitations')}
          </DashboardEmptyState>
        ) : (
          <DashboardItemList role="list">
            {visibleInvitations.map((item) => {
              const { invitation, event, horse } = item
              const currentOperation = operations[invitation._id]
              const state =
                currentOperation?.version === invitationVersion(invitation)
                  ? currentOperation
                  : undefined
              const target = {
                horse: horse?.name ?? t('events.horseFallback'),
                event: event?.title ?? t('events.eventFallback'),
              }
              const errorId = `${listId}-${invitation._id}-error`
              return (
                <div
                  key={invitation._id}
                  role="listitem"
                  ref={(node) => {
                    if (node) rows.current.set(invitation._id, node)
                    else rows.current.delete(invitation._id)
                  }}
                  onFocusCapture={() => {
                    focusedInvitation.current = invitation._id
                  }}
                >
                  <DashboardItemRecordCard
                    chrome="flat"
                    interactive={false}
                    actionsPlacement="footer"
                    actionsClassName="ml-auto"
                    footer={
                      state?.failed ? (
                        <p
                          id={errorId}
                          role="alert"
                          className="text-sm text-destructive"
                        >
                          {t(
                            state.failed === 'approve'
                              ? 'events.approveFailed'
                              : 'events.declineFailed',
                          )}
                        </p>
                      ) : undefined
                    }
                    actions={
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={Boolean(state?.pending)}
                          aria-busy={state?.pending === 'decline' || undefined}
                          aria-label={t(
                            state?.pending === 'decline'
                              ? 'events.decliningInvitation'
                              : 'events.declineInvitation',
                            target,
                          )}
                          aria-describedby={state?.failed ? errorId : undefined}
                          onClick={() => void decide(item, 'decline')}
                        >
                          {state?.pending === 'decline' && (
                            <Spinner aria-hidden={true} />
                          )}{' '}
                          {state?.pending === 'decline'
                            ? t('events.declining')
                            : t('events.decline')}
                        </Button>
                        <Button
                          type="button"
                          disabled={Boolean(state?.pending)}
                          aria-busy={state?.pending === 'approve' || undefined}
                          aria-label={t(
                            state?.pending === 'approve'
                              ? 'events.approvingInvitation'
                              : 'events.approveInvitation',
                            target,
                          )}
                          aria-describedby={state?.failed ? errorId : undefined}
                          onClick={() => void decide(item, 'approve')}
                        >
                          {state?.pending === 'approve' && (
                            <Spinner aria-hidden={true} />
                          )}{' '}
                          {state?.pending === 'approve'
                            ? t('events.approving')
                            : t('events.approve')}
                        </Button>
                      </>
                    }
                  >
                    <DashboardItemRecordContent
                      title={t('events.invitedTitle', target)}
                      titleSize="dense"
                      meta={
                        event && (
                          <span>
                            {formatEventDateTime(
                              event.date,
                              event.time,
                              event.endDate,
                              locale,
                            )}
                          </span>
                        )
                      }
                    />
                  </DashboardItemRecordCard>
                </div>
              )
            })}
          </DashboardItemList>
        )}
      </DashboardSectionCard>
    </div>
  )
}

function invitationVersion(invitation: PendingHorseInvitation['invitation']) {
  return (
    invitation.invitedAt ?? invitation.updatedAt ?? invitation._creationTime
  )
}
