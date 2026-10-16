import { MotionList } from '#/components/motion/MotionList'
import { getHorseDisplayName } from 'shared/horses/horseDisplayName'
import { useRef, useState } from 'react'
import { ActionFeedback } from '#/components/ui/action-feedback'
import { FormSubmissionError } from '#/components/forms/FormSubmissionError'
import { useT } from '#/i18n/LocaleProvider'
import { cn } from '#/lib/utils'
import type { Id } from 'convex/_generated/dataModel'
import type { FunctionReturnType } from 'convex/server'
import { useQuery, useMutation } from 'convex/react'
import { api } from 'convex/_generated/api'
import { Link } from '@tanstack/react-router'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { Button, ButtonLink } from '#/components/ui/button'
import { HorseAvatar } from '#/components/horses/HorseAvatar'
import { RoutePending } from '#/components/layout/RoutePending'
import { useOwnershipCopy } from './ownershipCopy'

export function PersonalHorses() {
  const c = useOwnershipCopy()
  const horses = useQuery(api.horses.listMine)
  if (horses === undefined) return <RoutePending />
  return (
    <DashboardPage>
      <DashboardPageHeader
        title={c.title}
        description={c.intro}
        actions={
          <div className="flex flex-wrap gap-2">
            <ButtonLink to="/horses/create" action="create">
              {c.add}
            </ButtonLink>
            <ButtonLink to="/horses/contacts" variant="ghost">
              {c.providers}
            </ButtonLink>
            <ButtonLink to="/horses/deleted" variant="ghost">
              {c.trash}
            </ButtonLink>
          </div>
        }
      />
      <PersonalHorseList horses={horses} />
    </DashboardPage>
  )
}
/** Complete personal roster, with compact rows for dashboard use. */
export function PersonalHorseList({
  horses,
  headingLevel = 2,
  compact = false,
}: {
  horses: FunctionReturnType<typeof api.horses.listMine>
  headingLevel?: 2 | 3
  compact?: boolean
}) {
  const c = useOwnershipCopy()
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <MotionList
      items={horses}
      getKey={(horse) => horse._id}
      empty={
        <DashboardEmptyState
          title={c.empty}
          actions={<ButtonLink to="/horses/create">{c.add}</ButtonLink>}
        >
          {c.emptyHelp}
        </DashboardEmptyState>
      }
      className={cn(
        compact ? 'grid gap-3 sm:grid-cols-2' : 'divide-y divide-border-subtle',
      )}
      renderItem={(horse) => (
        <Link
          key={horse._id}
          to="/horses/$horseId"
          params={{ horseId: horse._id }}
          className={cn(
            'flex min-w-0 items-center gap-4 rounded-row px-3 py-4 transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-primary',
            compact
              ? 'app-row min-h-20 px-4 py-3 active:bg-surface-muted'
              : 'min-h-24',
          )}
        >
          <HorseAvatar
            name={getHorseDisplayName(horse)}
            profileImageUrl={horse.profileImageUrl}
            size={compact ? 'md' : 'lg'}
          />
          <div className="min-w-0 flex-1">
            <Heading
              className={cn(
                '[overflow-wrap:anywhere]',
                compact ? 'text-base font-semibold' : 'font-display text-2xl',
              )}
            >
              {getHorseDisplayName(horse)}
            </Heading>
            <p
              className={cn(
                '[overflow-wrap:anywhere] text-muted-foreground',
                compact && 'text-sm',
              )}
            >
              {horse.access.stable?.name ?? c.personal}
            </p>
            <p
              className={cn(
                'text-sm text-muted-foreground',
                !compact && 'sm:hidden',
              )}
            >
              {horse.access.isOwner ? c.owned : c.shared}
            </p>
          </div>
          <span
            className={cn(
              'hidden text-sm text-muted-foreground',
              !compact && 'sm:block',
            )}
          >
            {horse.access.isOwner ? c.owned : c.shared}
          </span>
        </Link>
      )}
    />
  )
}

export function PersonalHorseTrash() {
  const t = useT()
  const restoring = useRef(false)
  const c = useOwnershipCopy()
  const horses = useQuery(api.horses.listMyDeleted)
  const restore = useMutation(api.horses.restoreHorse)
  const [pendingId, setPendingId] = useState<Id<'horses'> | null>(null)
  const [error, setError] = useState('')
  async function restoreHorse(id: Id<'horses'>) {
    if (restoring.current) return
    restoring.current = true
    setPendingId(id)
    setError('')
    try {
      await restore({ id })
    } catch {
      setError(c.failed)
    } finally {
      restoring.current = false
      setPendingId(null)
    }
  }
  return (
    <DashboardPage>
      <DashboardPageHeader title={c.trash} description={c.restoreHelp} />
      <FormSubmissionError message={error} />
      {!horses ? (
        <RoutePending />
      ) : (
        <MotionList
          items={horses}
          getKey={(horse) => horse._id}
          empty={<DashboardEmptyState>{c.emptyTrash}</DashboardEmptyState>}
          renderItem={(horse) => (
            <div
              key={horse._id}
              className="flex flex-wrap items-center justify-between gap-3 border-b py-4"
            >
              <div>
                <h2 className="font-display text-xl">
                  {getHorseDisplayName(horse)}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {horse.transitionId
                    ? c.moving
                    : `${c.purgeOn}: ${new Date(horse.purgeAt).toLocaleDateString()}`}
                </p>
              </div>
              <Button
                variant="outline"
                disabled={Boolean(pendingId || horse.transitionId)}
                aria-busy={pendingId === horse._id || undefined}
                onClick={() => void restoreHorse(horse._id)}
              >
                <ActionFeedback
                  pending={pendingId === horse._id}
                  label={c.restore}
                  pendingLabel={t('stableSetup.restoring')}
                />
              </Button>
            </div>
          )}
        />
      )}
    </DashboardPage>
  )
}
