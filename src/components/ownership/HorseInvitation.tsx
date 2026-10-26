import { BackLink } from '#/components/ui/back-action'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { FunctionReturnType } from 'convex/server'
import { useMutation, useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { RoutePending } from '#/components/layout/RoutePending'
import { Button, ButtonLink } from '#/components/ui/button'
import { DepartureChecklist } from './HorseManagement'
import { useOwnershipCopy } from './ownershipCopy'
import { useOwnershipErrorMessage } from './ownershipErrors'
import { useOwnershipRecoveryCopy } from './ownershipRecoveryCopy'

export function horseInvitationPath(token: string) {
  return `/horse-invitations/${encodeURIComponent(token)}`
}
type InvitationStatus = FunctionReturnType<
  typeof api.horseCollaboration.invitationStatus
>['status']
type InvitationData = NonNullable<
  FunctionReturnType<typeof api.horseCollaboration.invitation>
>
type Respond = (
  accept: boolean,
  selected: Array<Id<'careReminders'>>,
) => Promise<unknown>

export function HorseInvitation({
  token,
  accountActions,
}: {
  token: string
  accountActions?: ReactNode
}) {
  const state = useQuery(api.horseCollaboration.invitationStatus, { token })
  const data = useQuery(
    api.horseCollaboration.invitation,
    state?.status === 'ready' ? { token } : 'skip',
  )
  const respond = useMutation(api.horseCollaboration.respond)
  if (!state || (state.status === 'ready' && data === undefined))
    return <RoutePending />
  return (
    <HorseInvitationView
      key={token}
      status={state.status === 'ready' && !data ? 'unavailable' : state.status}
      data={data ?? undefined}
      accountActions={accountActions}
      onRespond={(accept, selected) =>
        respond({
          token,
          accept,
          departureRevision: data?.departure?.revision,
          carryReminderIds: selected,
        })
      }
    />
  )
}

export function HorseInvitationView({
  status,
  data,
  accountActions,
  onRespond,
}: {
  status: InvitationStatus
  data?: InvitationData
  accountActions?: ReactNode
  onRespond: Respond
}) {
  const c = useOwnershipCopy()
  const r = useOwnershipRecoveryCopy()
  const formatError = useOwnershipErrorMessage()
  const [selected, setSelected] = useState<Array<Id<'careReminders'>>>([])
  const [pending, setPending] = useState<'accept' | 'decline' | null>(null)
  const pendingRef = useRef(false)
  const [error, setError] = useState('')
  const [failedChoice, setFailedChoice] = useState<boolean>()
  const [response, setResponse] = useState<boolean>()
  const resultRef = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    if (response !== undefined) resultRef.current?.focus()
  }, [response])
  const recoveryStatus = response === false ? 'declined' : status
  if (recoveryStatus !== 'ready' || !data) {
    const messages = {
      wrong_account: [r.wrongAccount, r.wrongAccountHelp],
      expired: [r.expired, r.expiredHelp],
      revoked: [r.revoked, r.revokedHelp],
      declined: [r.declined, r.declinedHelp],
      unavailable: [r.unavailable, r.unavailableHelp],
      ready: [r.unavailable, r.unavailableHelp],
    }
    const [title, help] = messages[recoveryStatus]
    return (
      <div className="grid gap-3">
        <BackLink to="/horses">{r.backHorses}</BackLink>
        <DashboardSectionCard title={title}>
          <p role="status" tabIndex={-1} ref={resultRef}>
            {help}
          </p>
          <div className="flex flex-wrap gap-3">
            {recoveryStatus === 'wrong_account' && accountActions}
          </div>
        </DashboardSectionCard>
      </div>
    )
  }
  if (
    data.processing ||
    (response === true &&
      data.departure &&
      data.invitation.status !== 'accepted')
  )
    return (
      <div className="grid gap-3">
        <BackLink to="/horses">{r.backHorses}</BackLink>
        <DashboardSectionCard title={data.horseName}>
          <p role="status" tabIndex={-1} ref={resultRef}>
            {c.moving}
          </p>
        </DashboardSectionCard>
      </div>
    )
  if (data.invitation.status === 'accepted' || response === true)
    return (
      <DashboardSectionCard title={c.transferred}>
        <p role="status" tabIndex={-1} ref={resultRef}>
          {r.acceptedHelp}
        </p>
        <ButtonLink
          to="/horses/$horseId"
          params={{ horseId: data.invitation.horseId }}
        >
          {c.open}
        </ButtonLink>
      </DashboardSectionCard>
    )
  async function submit(accept: boolean) {
    if (pendingRef.current) return
    pendingRef.current = true
    setPending(accept ? 'accept' : 'decline')
    setError('')
    try {
      await onRespond(accept, selected)
      setResponse(accept)
    } catch (cause) {
      setError(formatError(cause))
      setFailedChoice(accept)
    } finally {
      pendingRef.current = false
      setPending(null)
    }
  }
  return (
    <DashboardSectionCard title={data.horseName} description={c.invitation}>
      <p>
        {data.invitation.kind === 'claim'
          ? c.claimHelp
          : data.invitation.kind === 'transfer'
            ? c.transferHelp
            : data.invitation.role === 'editor'
              ? c.editor
              : c.viewer}
      </p>
      {data.stableName && (
        <p>
          {c.stable}: {data.stableName}
        </p>
      )}
      {data.invitation.kind === 'claim' && <p>{c.membership}</p>}
      {data.departure && (
        <>
          <p>{c.departureHelp}</p>
          <DepartureChecklist
            preview={data.departure}
            selected={selected}
            onChange={setSelected}
            disabled={Boolean(pending)}
          />
        </>
      )}
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button
          disabled={Boolean(pending)}
          aria-busy={pending === 'accept' || undefined}
          onClick={() => void submit(true)}
        >
          {pending === 'accept'
            ? r.accepting
            : error && failedChoice === true
              ? r.retryAccept
              : c.accept}
        </Button>
        <Button
          variant="outline"
          disabled={Boolean(pending)}
          aria-busy={pending === 'decline' || undefined}
          onClick={() => void submit(false)}
        >
          {pending === 'decline'
            ? r.declining
            : error && failedChoice === false
              ? r.retryDecline
              : c.decline}
        </Button>
      </div>
    </DashboardSectionCard>
  )
}
