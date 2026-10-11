import { useEffect, useId, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { useMutation, useQuery } from 'convex/react'
import type { FunctionArgs } from 'convex/server'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { RoutePending } from '#/components/layout/RoutePending'
import { RecordRemoveAction } from '#/components/list-layout/RecordRemoveAction'
import { Button, ButtonLink } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Select } from '#/components/ui/select'
import { Field, FieldLabel } from '#/components/ui/field'
import { useT } from '#/i18n/LocaleProvider'
import { useOwnershipCopy } from './ownershipCopy'
import { useOwnershipErrorMessage } from './ownershipErrors'
import { useOwnershipRecoveryCopy } from './ownershipRecoveryCopy'

type Contact = Doc<'personalProviders'>
type SaveContact = (
  input: FunctionArgs<typeof api.personalProviders.save>,
) => Promise<unknown>
export function PersonalContacts() {
  const providers = useQuery(api.personalProviders.list)
  const save = useMutation(api.personalProviders.save)
  const remove = useMutation(api.personalProviders.remove)
  if (!providers) return <RoutePending />
  return (
    <PersonalContactsView providers={providers} save={save} remove={remove} />
  )
}
export function PersonalContactsView({
  providers,
  save,
  remove,
}: {
  providers: Array<Contact>
  save: SaveContact
  remove: (args: { id: Id<'personalProviders'> }) => Promise<unknown>
}) {
  const c = useOwnershipCopy()
  const r = useOwnershipRecoveryCopy()
  const addName = useRef<HTMLInputElement>(null)
  const [notice, setNotice] = useState('')
  return (
    <DashboardSectionCard
      title={c.providers}
      description={r.contactsHelp}
      actions={
        <ButtonLink to="/horses" variant="ghost">
          {r.backHorses}
        </ButtonLink>
      }
    >
      {notice && <p role="status">{notice}</p>}
      {providers.length ? (
        <ul className="app-record-list">
          {providers.map((provider) => (
            <ContactRow
              key={provider._id}
              provider={provider}
              save={save}
              remove={async () => {
                await remove({ id: provider._id })
                setNotice(r.deleted)
              }}
              removalFocusTarget={() => addName.current}
            />
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">{r.noContacts}</p>
      )}
      <section className="grid gap-4" aria-labelledby="new-care-contact">
        <h3 id="new-care-contact" className="text-lg font-semibold">
          {r.newContact}
        </h3>
        <ContactEditor save={save} nameRef={addName} />
      </section>
    </DashboardSectionCard>
  )
}
function ContactRow({
  provider,
  save,
  remove,
  removalFocusTarget,
}: {
  provider: Contact
  save: SaveContact
  remove: () => Promise<void>
  removalFocusTarget: () => HTMLElement | null
}) {
  const r = useOwnershipRecoveryCopy()
  const t = useT()
  const [editing, setEditing] = useState(false)
  const [notice, setNotice] = useState('')
  const editButton = useRef<HTMLButtonElement>(null)
  const wasEditing = useRef(false)
  useEffect(() => {
    if (!editing && wasEditing.current) editButton.current?.focus()
    wasEditing.current = editing
  }, [editing])
  return (
    <li className="app-record grid gap-3">
      {editing ? (
        <ContactEditor
          provider={provider}
          save={save}
          onCancel={() => setEditing(false)}
          onSaved={() => {
            setEditing(false)
            setNotice(r.updated)
          }}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 grid gap-1">
              <p className="break-words font-semibold">{provider.name}</p>
              <p className="text-sm text-muted-foreground">
                {t(`stables.providerTypes.${provider.type}`)}
              </p>
              {provider.phone && (
                <a
                  className="inline-flex min-h-11 items-center break-all underline underline-offset-4"
                  href={`tel:${provider.phone.replace(/[^+\d]/g, '')}`}
                >
                  {provider.phone}
                </a>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                ref={editButton}
                variant="outline"
                action="edit"
                onClick={() => {
                  setNotice('')
                  setEditing(true)
                }}
              >
                {r.edit}
              </Button>
              <RecordRemoveAction
                triggerLabel={r.delete}
                triggerAriaLabel={`${r.delete}: ${provider.name}`}
                cancelLabel={r.cancel}
                confirmLabel={r.delete}
                title={r.deleteTitle(provider.name)}
                description={r.deleteHelp}
                onConfirm={remove}
                removalFocusTarget={removalFocusTarget}
              />
            </div>
          </div>
          {notice && <p role="status">{notice}</p>}
        </>
      )}
    </li>
  )
}
function ContactEditor({
  provider,
  save,
  onSaved,
  onCancel,
  nameRef,
}: {
  provider?: Contact
  save: SaveContact
  onSaved?: () => void
  onCancel?: () => void
  nameRef?: RefObject<HTMLInputElement | null>
}) {
  const c = useOwnershipCopy()
  const r = useOwnershipRecoveryCopy()
  const t = useT()
  const formatError = useOwnershipErrorMessage()
  const id = useId()
  const localName = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (provider) localName.current?.focus()
  }, [provider?._id])
  const [name, setName] = useState(provider?.name ?? '')
  const [phone, setPhone] = useState(provider?.phone ?? '')
  const [type, setType] = useState<Contact['type']>(provider?.type ?? 'vet')
  const [pending, setPending] = useState(false)
  const pendingRef = useRef(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  return (
    <form
      className="grid gap-4"
      aria-label={provider ? r.edit : r.newContact}
      onSubmit={async (e) => {
        e.preventDefault()
        if (pendingRef.current) return
        pendingRef.current = true
        setPending(true)
        setError('')
        setNotice('')
        try {
          await save({ id: provider?._id, name, phone, type })
          if (!provider) {
            setName('')
            setPhone('')
            setType('vet')
            setNotice(r.saved)
          }
          onSaved?.()
        } catch (cause) {
          setError(formatError(cause))
        } finally {
          pendingRef.current = false
          setPending(false)
        }
      }}
    >
      <Field>
        <FieldLabel htmlFor={`${id}-name`}>
          {t('eventForm.providerName')}
        </FieldLabel>
        <Input
          ref={nameRef ?? localName}
          id={`${id}-name`}
          required
          maxLength={120}
          value={name}
          disabled={pending}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${id}-phone`}>{r.phoneOptional}</FieldLabel>
        <Input
          id={`${id}-phone`}
          type="tel"
          autoComplete="tel"
          maxLength={50}
          value={phone}
          disabled={pending}
          onChange={(e) => setPhone(e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${id}-type`}>{t('eventForm.type')}</FieldLabel>
        <Select
          id={`${id}-type`}
          value={type}
          disabled={pending}
          onChange={(e) => setType(e.target.value as Contact['type'])}
        >
          {(
            [
              'vet',
              'farrier',
              'dentist',
              'trainer',
              'physio',
              'saddler',
              'other',
            ] as const
          ).map((kind) => (
            <option key={kind} value={kind}>
              {t(`stables.providerTypes.${kind}`)}
            </option>
          ))}
        </Select>
      </Field>
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          disabled={pending}
          aria-busy={pending || undefined}
        >
          {pending ? r.saving : provider ? r.saveChanges : c.saveContact}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={onCancel}
          >
            {r.cancel}
          </Button>
        )}
      </div>
    </form>
  )
}
