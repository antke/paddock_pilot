import { HistoricalHorseRecord } from './HistoricalHorseRecord'
import { RoutePending } from '#/components/layout/RoutePending'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { useId, useRef, useState } from 'react'
import { useMutation, useQuery, usePaginatedQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useNavigate } from '@tanstack/react-router'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { Button, ButtonLink } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Field, FieldGrid, FieldLabel } from '#/components/ui/field'
import { HorseNicknameField } from '#/components/forms/horse/HorseNicknameField'
import { InlineForm } from '#/components/forms/FormLayout'
import { FormSubmissionError } from '#/components/forms/FormSubmissionError'
import {
  DashboardItemCard,
  DashboardItemList,
  DashboardItemRecordContent,
} from '#/components/dashboard/DashboardItemCard'
import { ListFilterPanel } from '#/components/list-filtering/ListFilterPanel'
import { formatMediumTimestampDate } from '#/lib/dateDisplay'
import { useLocale, useT } from '#/i18n/LocaleProvider'
import { useOwnershipCopy } from './ownershipCopy'
import { useOwnershipErrorMessage } from './ownershipErrors'
import { useStableOwnershipCopy } from './stableOwnershipCopy'

export function StableOwnershipTools({
  stableId,
}: {
  stableId: Id<'stables'>
}) {
  const access = useQuery(api.stables.getAccess, { id: stableId })
  const c = useOwnershipCopy()
  if (access?.role !== 'owner') return null
  return (
    <DashboardSectionCard title={c.manage}>
      <div className="flex flex-wrap gap-3">
        <ButtonLink
          to="/stables/$stableId/horses/unclaimed"
          params={{ stableId }}
          variant="outline"
        >
          {c.newUnclaimed}
        </ButtonLink>
        <ButtonLink
          to="/stables/$stableId/horses/history"
          params={{ stableId }}
          variant="ghost"
        >
          {c.snapshot}
        </ButtonLink>
      </div>
    </DashboardSectionCard>
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
    <DashboardSectionCard title={c.newUnclaimed} description={c.claimHelp}>
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
  )
}
export function StableHorseHistory({ stableId }: { stableId: Id<'stables'> }) {
  const c = useOwnershipCopy()
  const copy = useStableOwnershipCopy()
  const { locale } = useLocale()
  const filterId = useId()
  const [horseId, setHorseId] = useState('')
  const [kind, setKind] = useState('')
  const {
    results: rows,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.horseTransitions.stableHistory,
    { stableId },
    { initialNumItems: 50 },
  )
  if (status === 'LoadingFirstPage') return <RoutePending />
  const horses = Array.from(
    new Map(rows.map((row) => [row.horseId, row.horseName])),
  ).sort((a, b) => a[1].localeCompare(b[1], locale))
  const kinds = Array.from(new Set(rows.map((row) => row.kind))).sort((a, b) =>
    copy.kindLabel(a).localeCompare(copy.kindLabel(b), locale),
  )
  const filteredRows = rows.filter(
    (row) =>
      (!horseId || row.horseId === horseId) && (!kind || row.kind === kind),
  )
  return (
    <DashboardSectionCard title={c.snapshot} description={c.snapshotHelp}>
      {!rows.length && (
        <DashboardEmptyState>{c.noSnapshots}</DashboardEmptyState>
      )}
      {rows.length > 0 && (
        <>
          <ListFilterPanel
            idPrefix={filterId}
            facets={[
              {
                id: 'horse',
                label: copy.horse,
                allLabel: copy.allHorses,
                options: horses.map(([value, label]) => ({ value, label })),
              },
              {
                id: 'kind',
                label: copy.kind,
                allLabel: copy.allKinds,
                options: kinds.map((value) => ({
                  value,
                  label: copy.kindLabel(value),
                })),
              },
            ]}
            selectedFacets={{ horse: horseId, kind }}
            onFacetChange={(facet, value) =>
              facet === 'horse' ? setHorseId(value) : setKind(value)
            }
          />
          {status !== 'Exhausted' && (
            <p className="text-sm text-muted-foreground">{copy.filtersHelp}</p>
          )}
          {(horseId || kind) && (
            <Button
              variant="ghost"
              onClick={() => {
                setHorseId('')
                setKind('')
              }}
            >
              {copy.clearFilters}
            </Button>
          )}
          {filteredRows.length === 0 && (
            <DashboardEmptyState>{copy.noMatches}</DashboardEmptyState>
          )}
        </>
      )}
      <DashboardItemList>
        {filteredRows.map((row) => {
          const data = row.data as Record<string, unknown>
          const history = data.history as Record<string, unknown> | undefined
          const title =
            data.title ??
            data.medicationName ??
            data.summary ??
            data.fileName ??
            history?.title ??
            (data.weight
              ? `${data.weight} ${data.unit}`
              : copy.kindLabel(row.kind))
          return (
            <DashboardItemCard key={row._id}>
              <DashboardItemRecordContent
                title={`${row.horseName} · ${String(title)}`}
                meta={[
                  <span key="kind">{copy.kindLabel(row.kind)}</span>,
                  <time
                    key="retained"
                    dateTime={new Date(row.createdAt).toISOString()}
                  >
                    {copy.retainedOn(
                      formatMediumTimestampDate(row.createdAt, locale),
                    )}
                  </time>,
                ]}
              >
                <HistoricalHorseRecord data={data} />
                {row.storageId && (
                  <a
                    href={`/api/documents/${row._id}`}
                    className="app-control-focus inline-flex min-h-11 items-center rounded-control py-2 underline underline-offset-4"
                  >
                    {String(data.fileName ?? c.open)}
                  </a>
                )}
              </DashboardItemRecordContent>
            </DashboardItemCard>
          )
        })}
      </DashboardItemList>
      {status !== 'Exhausted' && (
        <Button
          variant="outline"
          disabled={status === 'LoadingMore'}
          onClick={() => loadMore(50)}
        >
          {status === 'LoadingMore' ? copy.loading : c.loadMore}
        </Button>
      )}
    </DashboardSectionCard>
  )
}
