import { useId, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { Button, ButtonLink } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Select } from '#/components/ui/select'
import { Field, FieldLabel } from '#/components/ui/field'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '#/components/ui/alert-dialog'
import { UnsavedChangesGuard } from '#/components/forms/UnsavedChangesGuard'
import { RecordRemoveAction } from '#/components/list-layout/RecordRemoveAction'
import { useLocale } from '#/i18n/LocaleProvider'
import { formatMediumTimestampDate } from '#/lib/dateDisplay'
import type { ManagementProps } from './HorseManagement'
import { DepartureReview } from './DepartureReview'
import { useManagementCopy } from './managementCopy'
import { useOwnershipCopy } from './ownershipCopy'
import { useOwnershipErrorMessage } from './ownershipErrors'

export function HorseManagementView({
  horseId,
  data,
  stables,
  invite,
  updateCarer,
  revoke,
  connect,
  archive,
  renderDeparture,
}: ManagementProps) {
  const c = useOwnershipCopy()
  const m = useManagementCopy()
  const { locale } = useLocale()
  const errorMessage = useOwnershipErrorMessage()
  const { access } = data
  const [stableId, setStableId] = useState('')
  const [review, setReview] = useState(false)
  const [pending, setPending] = useState(false)
  const [placementMessage, setPlacementMessage] = useState('')
  const [placementError, setPlacementError] = useState('')
  const [accessMessage, setAccessMessage] = useState('')
  const [accessError, setAccessError] = useState('')
  const [accessPending, setAccessPending] = useState('')
  const busy = useRef(false)
  const reviewId = useId()
  const reviewButton = useRef<HTMLButtonElement>(null)
  const eligible = stables.filter((stable) => stable._id !== access.stable?._id)
  const destination = eligible.find((stable) => stable._id === stableId)
  const closeReview = () => {
    setReview(false)
    reviewButton.current?.focus()
  }
  const departureProps = {
    horseId,
    horseName: data.horseName,
    sourceStableName: access.stable?.name ?? c.personal,
    targetStableId: destination?._id,
    targetStableName: destination?.name,
    onCancel: closeReview,
    onPendingChange: setPending,
    onDone: () => {
      closeReview()
      setPlacementMessage(m.moveStarted(destination?.name ?? c.personal))
    },
  }
  async function changeAccess(
    id: string,
    action: () => Promise<unknown>,
    message: string,
  ) {
    if (busy.current) return
    busy.current = true
    setAccessPending(id)
    setAccessMessage('')
    setAccessError('')
    try {
      await action()
      setAccessMessage(message)
    } catch (error) {
      setAccessError(errorMessage(error))
      throw error
    } finally {
      busy.current = false
      setAccessPending('')
    }
  }
  return (
    <div className="grid min-w-0 w-full gap-6">
      {!access.canAddRecords && access.isOwner && (
        <p role="status">{c.moving}</p>
      )}
      <DashboardSectionCard title={c.stable}>
        <p className="font-medium">{access.stable?.name ?? c.personal}</p>
        {access.canMove && (
          <>
            <Field>
              <FieldLabel htmlFor="horse-stable">{m.moveTo}</FieldLabel>
              <Select
                id="horse-stable"
                value={stableId}
                disabled={pending}
                onChange={(event) => {
                  setStableId(event.target.value)
                  setReview(false)
                  setPlacementError('')
                  setPlacementMessage('')
                }}
              >
                <option value="">{m.personalOption}</option>
                {eligible.map((stable) => (
                  <option key={stable._id} value={stable._id}>
                    {stable.name}
                  </option>
                ))}
              </Select>
            </Field>
            {!eligible.length && (
              <div className="grid justify-items-start gap-2">
                <p className="text-sm text-muted-foreground">{m.noStable}</p>
                <ButtonLink to="/stables" variant="outline">
                  {c.stables}
                </ButtonLink>
              </div>
            )}
            {!access.stable && (
              <p className="text-sm text-muted-foreground">{c.connectHelp}</p>
            )}
            {placementError && (
              <p role="alert" className="text-sm text-destructive">
                {placementError}
              </p>
            )}
            {access.stable ? (
              <Button
                ref={reviewButton}
                className="justify-self-start"
                variant="outline"
                disabled={pending}
                aria-expanded={review}
                aria-controls={reviewId}
                onClick={() => setReview(!review)}
              >
                {review ? m.cancelReview : m.review}
              </Button>
            ) : (
              <Button
                className="justify-self-start"
                disabled={!destination || pending}
                aria-busy={pending || undefined}
                onClick={async () => {
                  if (!destination || busy.current) return
                  busy.current = true
                  setPending(true)
                  setPlacementError('')
                  setPlacementMessage('')
                  try {
                    await connect({ horseId, stableId: destination._id })
                    setPlacementMessage(m.connected(destination.name))
                    setStableId('')
                  } catch (error) {
                    setPlacementError(errorMessage(error))
                  } finally {
                    busy.current = false
                    setPending(false)
                  }
                }}
              >
                {pending ? m.connectPending : c.connect}
              </Button>
            )}
            <div id={reviewId} hidden={!review}>
              {review &&
                access.stable &&
                (renderDeparture ? (
                  renderDeparture(departureProps)
                ) : (
                  <DepartureReview {...departureProps} />
                ))}
            </div>
          </>
        )}
        {placementMessage && (
          <p role="status" className="text-sm">
            {placementMessage}
          </p>
        )}
      </DashboardSectionCard>

      <DashboardSectionCard title={c.carers}>
        <dl className="grid gap-4 text-sm">
          <div>
            <dt className="font-semibold">{m.owner}</dt>
            <dd>{data.ownerName || m.custodian}</dd>
            <dd className="mt-1 text-muted-foreground">{m.ownerHelp}</dd>
          </div>
          <div>
            <dt className="font-semibold">{m.stableAccess}</dt>
            <dd>
              {access.stable
                ? `${access.stable.name}${data.stableAdminName ? ` · ${data.stableAdminName}` : ''}`
                : m.personalAccess}
            </dd>
            {access.stable && (
              <dd className="mt-1 text-muted-foreground">
                {m.stableAccessHelp}
              </dd>
            )}
          </div>
          {!access.isOwner && access.carerRole && (
            <div>
              <dt className="font-semibold">{m.yourAccess}</dt>
              <dd>{access.carerRole === 'editor' ? c.editor : c.viewer}</dd>
            </div>
          )}
        </dl>
        {access.canManageAccess && (
          <>
            <h3 className="text-lg font-semibold">{m.invited}</h3>
            {accessMessage && (
              <p role="status" className="text-sm">
                {accessMessage}
              </p>
            )}
            {accessError && (
              <p role="alert" className="text-sm text-destructive">
                {accessError}
              </p>
            )}
            {!data.carers.length && (
              <p className="text-sm text-muted-foreground">{m.noCarers}</p>
            )}
            {data.carers.map((carer) => {
              const name = carer.name || carer.email
              return (
                <div
                  key={carer._id}
                  className="grid gap-3 rounded-row bg-surface-muted p-3"
                >
                  <span className="break-words font-medium">{name}</span>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="w-full sm:w-56">
                      <Select
                        aria-label={`${c.accessLevel}: ${name}`}
                        disabled={Boolean(accessPending)}
                        value={carer.role}
                        onChange={(event) =>
                          void changeAccess(
                            carer._id,
                            () =>
                              updateCarer({
                                id: carer._id,
                                role: event.target.value as 'viewer' | 'editor',
                              }),
                            m.accessSaved(name),
                          ).catch(() => {})
                        }
                      >
                        <option value="viewer">{c.viewer}</option>
                        <option value="editor">{c.editor}</option>
                      </Select>
                    </div>
                    <RecordRemoveAction
                      title={m.removeTitle(name)}
                      description={m.removeHelp}
                      triggerLabel={c.revoke}
                      triggerAriaLabel={`${c.revoke}: ${name}`}
                      cancelLabel={m.cancel}
                      confirmLabel={c.revoke}
                      disabled={Boolean(accessPending)}
                      onConfirm={() =>
                        changeAccess(
                          carer._id,
                          () => updateCarer({ id: carer._id }),
                          m.accessRemoved(name),
                        )
                      }
                    />
                  </div>
                  {accessPending === carer._id && (
                    <p role="status" className="text-sm">
                      {m.saving}
                    </p>
                  )}
                </div>
              )
            })}
            <InviteHorseAccessForm
              horseId={horseId}
              kind="carer"
              invite={invite}
            />
          </>
        )}
        {access.isCustodian && (
          <InviteHorseAccessForm
            horseId={horseId}
            kind="claim"
            invite={invite}
          />
        )}
        {(access.canManageAccess || access.isCustodian) &&
          data.invitations.some(
            (i) => i.status === 'pending' && i.expiresAt > Date.now(),
          ) && (
            <div className="grid gap-3">
              <h3 className="text-lg font-semibold">{c.pending}</h3>
              {data.invitations
                .filter(
                  (i) => i.status === 'pending' && i.expiresAt > Date.now(),
                )
                .map((invitation) => (
                  <div
                    key={invitation._id}
                    className="grid gap-2 rounded-row bg-surface-muted p-3"
                  >
                    <span className="break-all">{invitation.email}</span>
                    <p className="text-sm text-muted-foreground">
                      {invitation.kind === 'transfer'
                        ? c.transfer
                        : invitation.kind === 'claim'
                          ? c.claim
                          : invitation.role === 'editor'
                            ? c.editor
                            : c.viewer}
                    </p>
                    <Button
                      className="justify-self-start"
                      variant="outline"
                      disabled={Boolean(accessPending)}
                      aria-label={`${c.cancel}: ${invitation.email}`}
                      onClick={() =>
                        void changeAccess(
                          invitation._id,
                          () => revoke({ id: invitation._id }),
                          m.invitationCancelled(invitation.email),
                        ).catch(() => {})
                      }
                    >
                      {accessPending === invitation._id
                        ? m.cancelling
                        : c.cancel}
                    </Button>
                  </div>
                ))}
            </div>
          )}
        {access.isCustodian && !access.canManageAccess && accessMessage && (
          <p role="status">{accessMessage}</p>
        )}
        {access.isCustodian && !access.canManageAccess && accessError && (
          <p role="alert" className="text-destructive">
            {accessError}
          </p>
        )}
      </DashboardSectionCard>
      {access.canTransfer && (
        <DashboardSectionCard title={c.transfer}>
          <InviteHorseAccessForm
            horseId={horseId}
            kind="transfer"
            invite={invite}
          />
        </DashboardSectionCard>
      )}
      {data.placements.length > 0 && (
        <DashboardSectionCard title={c.placementHistory}>
          {data.placements.map((placement) => (
            <p key={placement._id} className="text-sm">
              {placement.stableName} ·{' '}
              {formatMediumTimestampDate(placement.startedAt, locale)} —{' '}
              {placement.endedAt
                ? formatMediumTimestampDate(placement.endedAt, locale)
                : c.active}
            </p>
          ))}
        </DashboardSectionCard>
      )}
      {access.canDelete && (
        <DeleteHorseAction
          horseId={horseId}
          horseName={data.horseName}
          archive={archive}
        />
      )}
    </div>
  )
}

function InviteHorseAccessForm({
  horseId,
  kind,
  invite,
}: Pick<ManagementProps, 'horseId' | 'invite'> & {
  kind: 'carer' | 'claim' | 'transfer'
}) {
  const c = useOwnershipCopy()
  const m = useManagementCopy()
  const errorMessage = useOwnershipErrorMessage()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const busy = useRef(false)
  const acknowledged = useRef(false)
  const id = useId()
  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault()
        if (busy.current) return
        busy.current = true
        setPending(true)
        setError('')
        setMessage('')
        try {
          await invite({
            horseId,
            email,
            kind,
            role: kind === 'carer' ? role : undefined,
          })
          acknowledged.current = true
          setMessage(m.invitationSent(email))
          setEmail('')
        } catch (cause) {
          setError(errorMessage(cause))
        } finally {
          busy.current = false
          setPending(false)
        }
      }}
    >
      <UnsavedChangesGuard
        shouldBlock={() => !acknowledged.current && Boolean(email)}
      />
      <p className="text-sm text-muted-foreground">
        {kind === 'transfer'
          ? m.transferHelp
          : kind === 'claim'
            ? c.claimHelp
            : c.carersHelp}
      </p>
      <Field>
        <FieldLabel htmlFor={`${id}-email`}>{c.email}</FieldLabel>
        <Input
          id={`${id}-email`}
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          disabled={pending}
          value={email}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => {
            acknowledged.current = false
            setEmail(event.target.value)
            setMessage('')
          }}
        />
      </Field>
      {kind === 'carer' && (
        <Field>
          <FieldLabel htmlFor={`${id}-role`}>{c.accessLevel}</FieldLabel>
          <Select
            id={`${id}-role`}
            disabled={pending}
            value={role}
            onChange={(event) =>
              setRole(event.target.value as 'viewer' | 'editor')
            }
          >
            <option value="viewer">{c.viewer}</option>
            <option value="editor">{c.editor}</option>
          </Select>
        </Field>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button
        type="submit"
        className="justify-self-start"
        disabled={pending}
        aria-busy={pending || undefined}
      >
        {pending
          ? m.sending
          : kind === 'transfer'
            ? m.transferSubmit
            : c.invite}
      </Button>
      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
    </form>
  )
}

function DeleteHorseAction({
  horseId,
  horseName,
  archive,
}: Pick<ManagementProps, 'horseId' | 'archive'> & { horseName: string }) {
  const c = useOwnershipCopy()
  const m = useManagementCopy()
  const { locale } = useLocale()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const [error, setError] = useState('')
  const busy = useRef(false)
  return (
    <DashboardSectionCard title={c.archive}>
      <p className="text-sm">{c.archiveHelp}</p>
      {deleted ? (
        <>
          <p role="status">{m.deleted}</p>
          <ButtonLink to="/horses/deleted">{c.trash}</ButtonLink>
        </>
      ) : (
        <AlertDialog
          open={open}
          onOpenChange={(value) => {
            if (!busy.current) {
              setOpen(value)
              setError('')
            }
          }}
        >
          <AlertDialogTrigger
            render={
              <Button className="justify-self-start" variant="destructive" />
            }
          >
            {c.archive}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{m.deleteTitle(horseName)}</AlertDialogTitle>
              <AlertDialogDescription>
                {m.deleteHelp(
                  horseName,
                  formatMediumTimestampDate(Date.now() + 14 * 86400000, locale),
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending}>
                {m.cancel}
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={pending}
                aria-busy={pending || undefined}
                onClick={async () => {
                  if (busy.current) return
                  busy.current = true
                  setPending(true)
                  setError('')
                  try {
                    await archive({ id: horseId })
                    setDeleted(true)
                    setOpen(false)
                  } catch {
                    setError(m.deleteFailed)
                    return
                  } finally {
                    busy.current = false
                    setPending(false)
                  }
                  // Deletion is acknowledged before navigation; a failed navigation must not repeat it.
                  try {
                    await navigate({ to: '/horses/deleted' })
                  } catch {
                    /* The recovery link remains available. */
                  }
                }}
              >
                {pending ? m.deleting : c.confirmArchive}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </DashboardSectionCard>
  )
}
