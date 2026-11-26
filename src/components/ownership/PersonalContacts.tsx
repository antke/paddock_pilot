import { FormSubmitActions } from '#/components/forms/FormSubmitActions'
import { ContactLink } from '#/components/ui/contact-link'
import { MotionList } from '#/components/motion/MotionList'
import { useEffect, useId, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { useMutation, useQuery } from 'convex/react'
import type { FunctionArgs } from 'convex/server'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { CreateRecordDialog } from '#/components/list-layout/CreateRecordDialog'
import { RoutePending } from '#/components/layout/RoutePending'
import { RecordRemoveAction } from '#/components/list-layout/RecordRemoveAction'
import { EditActionButton } from '#/components/ui/edit-action'
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
  const [notice, setNotice] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const directory = useRef<HTMLDivElement>(null)
  return (
    <DashboardPage>
      <DashboardPageHeader
        title={c.providers}
        description={r.contactsHelp}
        actions={
          <CreateRecordDialog
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            triggerLabel={r.addContact}
            title={r.newContact}
          >
            <ContactEditor
              save={save}
              onCancel={() => setIsCreateOpen(false)}
              onSaved={() => {
                setIsCreateOpen(false)
                setNotice(r.saved)
              }}
            />
          </CreateRecordDialog>
        }
      />
      <DashboardSectionCard
        ref={directory}
        tabIndex={-1}
        aria-label={c.providers}
        surface="canvas"
      >
        {notice && <p role="status">{notice}</p>}
        <MotionList
          items={providers}
          getKey={(provider) => provider._id}
          focusTarget={() => directory.current}
          empty={<p className="text-muted-foreground">{r.noContacts}</p>}
          renderItem={(provider) => (
            <ContactRow
              key={provider._id}
              provider={provider}
              save={save}
              remove={async () => {
                await remove({ id: provider._id })
                setNotice(r.deleted)
              }}
              removalFocusTarget={() => directory.current}
            />
          )}
        />
      </DashboardSectionCard>
    </DashboardPage>
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
    <div className="app-record grid gap-3">
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
                <ContactLink kind="phone" value={provider.phone} />
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <EditActionButton
                ref={editButton}
                label={r.editName(provider.name)}
                onClick={() => {
                  setNotice('')
                  setEditing(true)
                }}
              />
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
    </div>
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
          setError(formatError(r.contactSaveFailed, cause))
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
          aria-required="true"
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
      <FormSubmitActions
        isSubmitting={pending}
        onCancel={onCancel}
        cancelLabel={r.cancel}
        submitLabel={provider ? r.saveChanges : c.saveContact}
        submittingLabel={r.saving}
      />
    </form>
  )
}
