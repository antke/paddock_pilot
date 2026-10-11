import { useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocale, useT } from '#/i18n/LocaleProvider'
import { formatShortDate, formatShortDateKey } from '#/lib/dateDisplay'
import { DashboardSectionCard } from './DashboardSectionCard'
import { DashboardEmptyState } from './DashboardEmptyState'
import {
  DashboardItemBodyText,
  DashboardItemList,
  DashboardItemRecordCard,
} from './DashboardItemCard'
import { DashboardMetaList } from './DashboardMetaList'
import { DashboardActions } from './DashboardActions'
import { InlineForm } from '#/components/forms/FormLayout'
import { UnsavedChangesGuard } from '#/components/forms/UnsavedChangesGuard'
import { FormSubmitActions } from '#/components/forms/FormSubmitActions'
import { RouteStatusAlert } from '#/components/layout/RouteStatusAlert'
import { Button } from '#/components/ui/button'
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '#/components/ui/alert-dialog'

export type DashboardUpdate = {
  id: string
  body: string
  authorName?: string
  createdAt: number
  expiresOn?: string
  canManage: boolean
}
export type DashboardUpdateValues = { body: string; expiresOn?: string }

/** Shared dated-notice view. Data access and persistence live in the caller. */
export function DashboardUpdates({
  updates,
  preview = false,
  viewAll,
  loading = false,
  more,
  onSave,
  onRemove,
}: {
  updates: Array<DashboardUpdate>
  preview?: boolean
  viewAll?: ReactNode
  loading?: boolean
  more?: ReactNode
  onSave: (
    id: string | undefined,
    values: DashboardUpdateValues,
  ) => Promise<void>
  onRemove: (id: string) => Promise<void>
}) {
  const t = useT()
  const { locale } = useLocale()
  const [editing, setEditing] = useState<DashboardUpdate | 'new'>()
  const [removing, setRemoving] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [removeFailed, setRemoveFailed] = useState(false)
  const pending = useRef(false)
  const section = useRef<HTMLDivElement>(null)
  const finish = () => {
    setEditing(undefined)
    section.current?.focus()
  }
  if (preview && !updates.length) return null
  return (
    <DashboardSectionCard
      ref={section}
      tabIndex={-1}
      title={t('stableUpdates.title')}
      actions={
        preview
          ? viewAll
          : !editing && (
              <Button variant="outline" onClick={() => setEditing('new')}>
                {t('stableUpdates.add')}
              </Button>
            )
      }
      footer={more}
    >
      {editing && (
        <UpdateForm
          key={editing === 'new' ? 'new' : editing.id}
          initial={editing === 'new' ? undefined : editing}
          onCancel={finish}
          onSave={async (values) => {
            await onSave(editing === 'new' ? undefined : editing.id, values)
            finish()
          }}
        />
      )}
      {loading ? (
        <p role="status">{t('stableUpdates.loading')}</p>
      ) : updates.length === 0 ? (
        <DashboardEmptyState>{t('stableUpdates.empty')}</DashboardEmptyState>
      ) : (
        <DashboardItemList gap="compact">
          {updates.map((update) => (
            <DashboardItemRecordCard
              key={update.id}
              chrome="flat"
              density="compact"
              interactive={false}
              actions={
                !preview &&
                update.canManage && (
                  <DashboardActions>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={Boolean(editing)}
                      onClick={() => setEditing(update)}
                    >
                      {t('stableUpdates.edit')}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={Boolean(editing)}
                      onClick={() => {
                        setRemoveFailed(false)
                        setRemoving(update.id)
                      }}
                    >
                      {t('stableUpdates.remove')}
                    </Button>
                  </DashboardActions>
                )
              }
            >
              <div className="grid min-w-0 gap-2">
                <DashboardItemBodyText
                  className={
                    preview
                      ? 'line-clamp-3 whitespace-pre-line'
                      : 'whitespace-pre-line'
                  }
                >
                  {update.body}
                </DashboardItemBodyText>
                <DashboardMetaList separator="dot">
                  <span>
                    {update.authorName || t('stableUpdates.authorUnavailable')}
                  </span>
                  <time dateTime={new Date(update.createdAt).toISOString()}>
                    {formatShortDate(new Date(update.createdAt), locale)}
                  </time>
                  {!preview && update.expiresOn && (
                    <span>
                      {t('stableUpdates.through', {
                        date: formatShortDateKey(update.expiresOn, locale),
                      })}
                    </span>
                  )}
                </DashboardMetaList>
              </div>
            </DashboardItemRecordCard>
          ))}
        </DashboardItemList>
      )}
      <AlertDialog
        open={Boolean(removing)}
        onOpenChange={(open) => {
          if (!open && !pending.current) setRemoving(undefined)
        }}
      >
        <AlertDialogContent finalFocus={() => section.current}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('stableUpdates.removeTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('stableUpdates.removeDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {removeFailed && (
            <RouteStatusAlert
              tone="danger"
              title={t('stableUpdates.removeFailed')}
            />
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={async (event) => {
                event.preventDefault()
                if (!removing || pending.current) return
                pending.current = true
                setBusy(true)
                setRemoveFailed(false)
                try {
                  await onRemove(removing)
                  setRemoving(undefined)
                } catch {
                  setRemoveFailed(true)
                } finally {
                  pending.current = false
                  setBusy(false)
                }
              }}
            >
              {t('stableUpdates.remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardSectionCard>
  )
}

function UpdateForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: DashboardUpdateValues
  onSave: (values: DashboardUpdateValues) => Promise<void>
  onCancel: () => void
}) {
  const t = useT()
  const id = useId()
  const [body, setBody] = useState(initial?.body ?? '')
  const [expiresOn, setExpiresOn] = useState(initial?.expiresOn ?? '')
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const pending = useRef(false)
  const input = useRef<HTMLTextAreaElement>(null)
  return (
    <InlineForm
      onSubmit={async (event) => {
        event.preventDefault()
        if (pending.current) return
        if (!body.trim() || body.trim().length > 2000) {
          setInvalid(true)
          input.current?.focus()
          return
        }
        pending.current = true
        setBusy(true)
        setFailed(false)
        try {
          await onSave({ body: body.trim(), expiresOn: expiresOn || undefined })
        } catch {
          setFailed(true)
        } finally {
          pending.current = false
          setBusy(false)
        }
      }}
    >
      <UnsavedChangesGuard
        shouldBlock={() =>
          body !== (initial?.body ?? '') ||
          expiresOn !== (initial?.expiresOn ?? '')
        }
      />
      {failed && (
        <RouteStatusAlert tone="danger" title={t('stableUpdates.failed')} />
      )}
      <Field data-invalid={invalid}>
        <FieldLabel htmlFor={`${id}-body`}>
          {t('stableUpdates.body')}
        </FieldLabel>
        <Textarea
          ref={input}
          id={`${id}-body`}
          value={body}
          maxLength={2000}
          rows={4}
          disabled={busy}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-error` : undefined}
          onChange={(event) => {
            setBody(event.target.value)
            setInvalid(false)
          }}
        />
        {invalid && (
          <FieldError id={`${id}-error`}>
            {t('stableUpdates.invalidBody')}
          </FieldError>
        )}
      </Field>
      <Field>
        <FieldLabel htmlFor={`${id}-expiry`}>
          {t('stableUpdates.expires')}
        </FieldLabel>
        <Input
          id={`${id}-expiry`}
          type="date"
          value={expiresOn}
          onChange={(event) => setExpiresOn(event.target.value)}
          disabled={busy}
          aria-describedby={`${id}-expiry-help`}
        />
        <FieldDescription id={`${id}-expiry-help`}>
          {t('stableUpdates.expiryHelp')}
        </FieldDescription>
      </Field>
      <FormSubmitActions
        isSubmitting={busy}
        onCancel={onCancel}
        submitLabel={t('stableUpdates.save')}
        submittingLabel={t('stableUpdates.saving')}
      />
    </InlineForm>
  )
}
