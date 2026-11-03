import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { useRef, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useNavigate } from '@tanstack/react-router'
import { FloatingCreateShortcut } from '#/components/layout/floatingActionsContext'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { Button, ButtonLink } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Field, FieldGrid, FieldLabel } from '#/components/ui/field'
import { HorseNicknameField } from '#/components/forms/horse/HorseNicknameField'
import { InlineForm } from '#/components/forms/FormLayout'
import { FormSubmissionError } from '#/components/forms/FormSubmissionError'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { useT } from '#/i18n/LocaleProvider'
import { useOwnershipCopy } from './ownershipCopy'
import { useOwnershipErrorMessage } from './ownershipErrors'
import { useStableOwnershipCopy } from './stableOwnershipCopy'

/** Owner-only horses-page header action: add a horse for an owner. */
export function StableOwnershipTools({
  stableId,
}: {
  stableId: Id<'stables'>
}) {
  const access = useQuery(api.stables.getAccess, { id: stableId })
  const c = useOwnershipCopy()
  const navigate = useNavigate()
  if (access?.role !== 'owner') return null
  return (
    <>
      <FloatingCreateShortcut
        label={c.newUnclaimed}
        onSelect={() =>
          void navigate({
            to: '/stables/$stableId/horses/unclaimed',
            params: { stableId },
          })
        }
      />
      <ButtonLink
        to="/stables/$stableId/horses/unclaimed"
        params={{ stableId }}
        action="create"
        variant="outline"
      >
        {c.newUnclaimed}
      </ButtonLink>
    </>
  )
}
export function UnclaimedHorseForm({ stableId }: { stableId: Id<'stables'> }) {
  const t = useT()
  const c = useOwnershipCopy()
  const copy = useStableOwnershipCopy()
  const errorMessage = useOwnershipErrorMessage()
  const add = useMutation(api.horseCollaboration.addUnclaimed)
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const [useNickname, setUseNickname] = useState(false)
  const [nicknameInvalid, setNicknameInvalid] = useState(false)
  const [age, setAge] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const submitting = useRef(false)
  return (
    <DashboardPage>
      <DashboardPageHeader title={c.newUnclaimed} description={c.claimHelp} />
      <DashboardSectionCard>
        <InlineForm
          onSubmit={async (e) => {
            e.preventDefault()
            if (submitting.current) return
            setNicknameInvalid(useNickname && !nickname.trim())
            if (useNickname && !nickname.trim()) return
            submitting.current = true
            setPending(true)
            setError('')
            try {
              const horseId = await add({
                stableId,
                name,
                nickname,
                useNickname,
                age: Number(age),
              })
              await navigate({
                to: '/horses/$horseId/manage',
                params: { horseId },
              })
            } catch (cause) {
              setError(errorMessage(cause))
            } finally {
              submitting.current = false
              setPending(false)
            }
          }}
        >
          <FieldGrid>
            <Field>
              <FieldLabel htmlFor="unclaimed-name">{c.name}</FieldLabel>
              <Input
                id="unclaimed-name"
                required
                maxLength={100}
                disabled={pending}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <HorseNicknameField
              value={nickname}
              onValueChange={(value) => {
                setNickname(value)
                setNicknameInvalid(false)
              }}
              checked={useNickname}
              onCheckedChange={(checked) => {
                setUseNickname(checked)
                setNicknameInvalid(false)
              }}
              disabled={pending}
              error={
                nicknameInvalid
                  ? {
                      type: 'required',
                      message: t('horseValidation.nicknameRequired'),
                    }
                  : undefined
              }
            />
          </FieldGrid>
          <Field>
            <FieldLabel htmlFor="unclaimed-age">{c.age}</FieldLabel>
            <Input
              id="unclaimed-age"
              required
              type="number"
              min={0}
              max={100}
              disabled={pending}
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </Field>
          <FormSubmissionError message={error} />
          <Button type="submit" disabled={pending} aria-busy={pending}>
            {pending ? copy.creating : c.createUnclaimed}
          </Button>
        </InlineForm>
      </DashboardSectionCard>
    </DashboardPage>
  )
}
/**
 * Former-stable horse records are intentionally unreadable: retained snapshots
 * belong to the horse, not the yard it left. Old links land on this truthful
 * explanation without querying any horse data.
 */
export function StableHorseHistoryUnavailable(_props: {
  stableId: Id<'stables'>
}) {
  const t = useT()
  return (
    <DashboardPage>
      <DashboardPageHeader title={t('stables.historyUnavailable')} />
      <DashboardEmptyState>
        {t('stables.historyUnavailableHelp')}
      </DashboardEmptyState>
    </DashboardPage>
  )
}
