import { getHorseDisplayName } from 'shared/horses/horseDisplayName'
import { useOwnershipCopy } from '#/components/ownership/ownershipCopy'
import { useT, useLocale } from '#/i18n/LocaleProvider'
import { PencilSimpleIcon } from '@phosphor-icons/react'
import { getHorseBreedLabel } from 'shared/i18n/horseBreedLabels'
import {
  DashboardNavigation,
  DashboardNavigationLinkItem,
  DashboardNavigationMenuGroup,
  DashboardNavigationMenuLink,
} from '#/components/dashboard/DashboardNavigation'
import { DashboardEntityHero } from '#/components/dashboard/DashboardEntityHero'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { formatMetaText } from '#/lib/textDisplay'
import { useSmallScreen } from '#/lib/useSmallScreen'
import {
  Link,
  useLocation,
  useNavigate,
  useSearch,
  useRouter,
} from '@tanstack/react-router'
import type { Doc } from 'convex/_generated/dataModel'
import type { ReactNode } from 'react'
import { useCallback, useMemo, useRef } from 'react'
import { RecordCreateActionsProvider } from '#/components/list-layout/RecordCreateActionsContext'
import { HorseTrainingSection } from './HorseTrainingSection'
import type { HorseTrainingData } from './HorseTrainingSection'
import { HorseActivitySection } from './HorseActivitySection'
import { HorseCareSection } from './HorseCareSection'
import { HorseDocumentsSection } from './HorseDocumentsSection'
import { HorseNutritionSection } from './HorseNutritionSection'
import { HorseProfileSection } from './HorseProfileSection'
import { HorseAvatar } from './HorseAvatar'
import { HorseActionMenu } from './HorseActionMenu'
import { HorseAddRecordMenu } from './HorseAddRecordMenu'
import { useTaskOriginState } from '#/components/layout/mobileTaskNavigation'
import { ButtonLink } from '#/components/ui/button'
import { parseHorseCareSearch } from './horseCareSearch'
import { parseHorseNutritionSearch } from './horseNutritionSearch'
import { horseDetailTabs } from './horseDetailTabs'
import type { HorseDetailCategory } from './horseDetailTabs'

export type { HorseDetailCategory } from './horseDetailTabs'

export type HorseDetailHorse = Doc<'horses'> & {
  profileImageUrl?: string | null
}

type HorseDetailProps = {
  stableId?: string
  horse: HorseDetailHorse
  events: Array<Doc<'events'>>
  trainingData?: HorseTrainingData
  category?: HorseDetailCategory
  canManageHorse: boolean
  canAddRecords?: boolean
  children?: ReactNode
}

export type HorseDetailSectionProps = {
  stableId?: string
  horse: HorseDetailHorse
  events: Array<Doc<'events'>>
  /** Shows contextual entries into the shared horse editor. */
  canManageHorse?: boolean
}

export function HorseDetail({
  stableId: placementStableId,
  horse,
  events,
  category,
  trainingData,
  canManageHorse,
  canAddRecords = false,
  children,
}: HorseDetailProps) {
  const c = useOwnershipCopy()
  const t = useT()
  const { locale } = useLocale()
  const isSmallScreen = useSmallScreen()

  const categoryItems = horseDetailTabs.map((id) => ({
    id,
    label: t(`horseDetail.${id}`),
  }))

  const { pathname, state: locationState } = useLocation()
  const stableId = pathname.startsWith('/stables/')
    ? placementStableId
    : undefined
  const router = useRouter()
  const actionTrigger = useRef<HTMLButtonElement>(null)
  const consumeAction = useCallback(() => {
    const location = router.state.location
    router.history.replace(location.href, {
      ...location.state,
      horseCreateAction: undefined,
    })
  }, [router])
  const recordCreateActions = useMemo(
    () => ({
      ownsFloatingAction: isSmallScreen,
      requestedAction: locationState.horseCreateAction,
      consumeAction,
      returnFocus: () => actionTrigger.current,
    }),
    [isSmallScreen, locationState.horseCreateAction, consumeAction],
  )
  const search = useSearch({ strict: false })
  const navigate = useNavigate()
  const { careView } = parseHorseCareSearch(search)
  const { nutritionView } = parseHorseNutritionSearch(search)
  const horseBasePath =
    pathname.startsWith('/stables/') && stableId
      ? `/stables/${stableId}/horses/${horse._id}`
      : `/horses/${horse._id}`
  const pathAfterHorse = pathname.slice(horseBasePath.length)
  const activeCategory = category ?? getHorseDetailCategory(pathAfterHorse)
  const moreSectionActive = [
    '/timeline',
    '/care-summary',
    '/manage',
    '/analysis',
  ].some((path) => pathAfterHorse.startsWith(path))
  const taskState = useTaskOriginState()
  const avatar = (
    <HorseAvatar
      name={getHorseDisplayName(horse)}
      profileImageUrl={horse.profileImageUrl}
      size="lg"
      className="size-16 sm:size-24"
    />
  )
  const heroDescription = formatMetaText([
    horse.ownerName
      ? t('horseDetail.owner', { name: horse.ownerName })
      : undefined,
    horse.breed ? getHorseBreedLabel(horse.breed, locale) : undefined,
    horse.sex ? t(`horseForm.${horse.sex}`) : undefined,
  ])

  return (
    <RecordCreateActionsProvider value={recordCreateActions}>
      <DashboardPage>
        <DashboardEntityHero
          className="print:hidden"
          backAction={pathAfterHorse.startsWith('/edit') ? null : undefined}
          // The name returns to the horse's main profile section, like a home
          // link within the record. Ownership and placement already appear in
          // the description, so no workspace suffix is added.
          title={
            <Link
              to={
                stableId
                  ? '/stables/$stableId/horses/$horseId/profile'
                  : '/horses/$horseId/profile'
              }
              params={{ horseId: horse._id, stableId: stableId ?? '' }}
              resetScroll={false}
              className="app-control-focus rounded-control text-inherit no-underline hover:text-primary hover:no-underline"
            >
              {getHorseDisplayName(horse)}
            </Link>
          }
          description={heroDescription || undefined}
          actionsLayout="inline"
          actions={
            !isSmallScreen ? (
              <>
                {canManageHorse && (
                  <ButtonLink
                    to={
                      stableId
                        ? '/stables/$stableId/events/create'
                        : '/events/create'
                    }
                    params={{ stableId: stableId ?? '' }}
                    search={{ horseId: horse._id }}
                    variant="outline"
                    action="schedule"
                    className="min-h-11 whitespace-nowrap"
                  >
                    {t('eventEditor.addEvent')}
                  </ButtonLink>
                )}
                {canAddRecords && !pathAfterHorse.startsWith('/edit') && (
                  <HorseAddRecordMenu
                    triggerRef={actionTrigger}
                    horseId={horse._id}
                    horseName={getHorseDisplayName(horse)}
                    stableId={stableId}
                  />
                )}
                {canManageHorse && !pathAfterHorse.startsWith('/edit') && (
                  <ButtonLink
                    to={
                      stableId
                        ? '/stables/$stableId/horses/$horseId/edit'
                        : '/horses/$horseId/edit'
                    }
                    params={{ horseId: horse._id, stableId: stableId ?? '' }}
                    state={taskState}
                    variant="ghost"
                    action="edit"
                    className="min-h-11 whitespace-nowrap"
                  >
                    {t('horseDetail.edit')}
                  </ButtonLink>
                )}
              </>
            ) : undefined
          }
          leading={
            canManageHorse && !pathAfterHorse.startsWith('/edit') ? (
              <Link
                to={
                  stableId
                    ? '/stables/$stableId/horses/$horseId/edit'
                    : '/horses/$horseId/edit'
                }
                params={{ horseId: horse._id, stableId: stableId ?? '' }}
                search={{ section: 'photo' }}
                state={taskState}
                aria-label={t('horseDetail.changePhotoNamed', {
                  name: getHorseDisplayName(horse),
                })}
                title={t('horseDetail.changePhoto')}
                className="app-control-focus group/photo relative block rounded-row"
              >
                {avatar}
                <span
                  aria-hidden="true"
                  className="absolute -right-1.5 -bottom-1.5 grid size-7 place-items-center rounded-full border border-border bg-surface-elevated text-muted-foreground shadow-sm transition-colors group-hover/photo:border-primary group-hover/photo:text-foreground print:hidden"
                >
                  <PencilSimpleIcon weight="bold" className="size-3.5" />
                </span>
              </Link>
            ) : (
              avatar
            )
          }
        >
          <div className="min-w-0 border-t border-border-subtle pt-4">
            <DashboardNavigation
              ariaLabel={t('horseDetail.sections', {
                name: getHorseDisplayName(horse),
              })}
              inset={false}
              overflow="scroll"
            >
              {categoryItems.map((item) => (
                <DashboardNavigationLinkItem
                  key={item.id}
                  variant="section"
                  render={
                    <Link
                      resetScroll={false}
                      to={
                        stableId
                          ? `/stables/$stableId/horses/$horseId/${item.id}`
                          : `/horses/$horseId/${item.id}`
                      }
                      params={{ horseId: horse._id, stableId: stableId ?? '' }}
                    />
                  }
                  active={activeCategory === item.id}
                >
                  {item.label}
                </DashboardNavigationLinkItem>
              ))}
              {(
                [
                  { path: 'analysis', label: t('navigation.analysis') },
                  { path: 'manage', label: c.manage },
                  { path: 'timeline', label: t('horseDetail.timeline') },
                  { path: 'care-summary', label: t('horseDetail.summary') },
                ] as const
              )
                // Phones reach Analysis through More only.
                .filter((item) => !isSmallScreen || item.path !== 'analysis')
                .map((item) => (
                  <DashboardNavigationLinkItem
                    key={item.path}
                    itemClassName="hidden lg:block"
                    variant="section"
                    active={pathAfterHorse.startsWith(`/${item.path}`)}
                    render={
                      <Link
                        resetScroll={false}
                        to={
                          stableId &&
                          item.path !== 'manage' &&
                          item.path !== 'analysis'
                            ? `/stables/$stableId/horses/$horseId/${item.path}`
                            : `/horses/$horseId/${item.path}`
                        }
                        params={{
                          horseId: horse._id,
                          stableId: stableId ?? '',
                        }}
                      />
                    }
                  >
                    {item.label}
                  </DashboardNavigationLinkItem>
                ))}
              <DashboardNavigationMenuGroup
                itemClassName="lg:hidden"
                active={moreSectionActive}
                label={t('horseDetail.more')}
                contentWidth="sm"
                variant="section"
              >
                <DashboardNavigationMenuLink
                  active={pathAfterHorse.startsWith('/analysis')}
                  variant="section"
                  render={
                    <Link
                      resetScroll={false}
                      to="/horses/$horseId/analysis"
                      params={{ horseId: horse._id }}
                    />
                  }
                >
                  {t('navigation.analysis')}
                </DashboardNavigationMenuLink>
                <DashboardNavigationMenuLink
                  active={pathAfterHorse.startsWith('/manage')}
                  variant="section"
                  render={
                    <Link
                      resetScroll={false}
                      to="/horses/$horseId/manage"
                      params={{ horseId: horse._id }}
                    />
                  }
                >
                  {c.manage}
                </DashboardNavigationMenuLink>
                <DashboardNavigationMenuLink
                  active={pathAfterHorse.startsWith('/timeline')}
                  variant="section"
                  render={
                    <Link
                      resetScroll={false}
                      to={
                        stableId
                          ? '/stables/$stableId/horses/$horseId/timeline'
                          : '/horses/$horseId/timeline'
                      }
                      params={{ horseId: horse._id, stableId: stableId ?? '' }}
                    />
                  }
                >
                  {t('horseDetail.timeline')}
                </DashboardNavigationMenuLink>
                <DashboardNavigationMenuLink
                  active={pathAfterHorse.startsWith('/care-summary')}
                  variant="section"
                  render={
                    <Link
                      resetScroll={false}
                      to={
                        stableId
                          ? '/stables/$stableId/horses/$horseId/care-summary'
                          : '/horses/$horseId/care-summary'
                      }
                      params={{ horseId: horse._id, stableId: stableId ?? '' }}
                    />
                  }
                >
                  {t('horseDetail.summary')}
                </DashboardNavigationMenuLink>
              </DashboardNavigationMenuGroup>
            </DashboardNavigation>
          </div>
        </DashboardEntityHero>

        {isSmallScreen && !pathAfterHorse.startsWith('/edit') && (
          <HorseActionMenu
            triggerRef={actionTrigger}
            horseId={horse._id}
            horseName={getHorseDisplayName(horse)}
            canManageHorse={canManageHorse}
            canAddRecords={canAddRecords}
          />
        )}

        <div
          data-slot="horse-section-content"
          className="grid min-w-0 gap-[var(--app-section-gap)]"
        >
          {activeCategory === 'profile' && (
            <HorseProfileSection
              stableId={stableId}
              horse={horse}
              events={events}
              canManageHorse={canManageHorse}
            />
          )}
          {activeCategory === 'activity' && (
            <HorseActivitySection
              stableId={stableId}
              horse={horse}
              events={events}
            />
          )}
          {activeCategory === 'training' && (
            <HorseTrainingSection
              stableId={stableId}
              horse={horse}
              data={trainingData}
              renderMobileActions={() => null}
            />
          )}
          {activeCategory === 'care' && (
            <HorseCareSection
              stableId={stableId}
              horse={horse}
              events={events}
              canManageHorse={canManageHorse}
              activeTab={careView ?? 'reminders'}
              onTabChange={(tab) => {
                void navigate({
                  to: stableId
                    ? '/stables/$stableId/horses/$horseId/care'
                    : '/horses/$horseId/care',
                  params: { horseId: horse._id, stableId: stableId ?? '' },
                  search: tab === 'reminders' ? {} : { careView: tab },
                  replace: true,
                  resetScroll: false,
                })
              }}
            />
          )}
          {activeCategory === 'nutrition' && (
            <HorseNutritionSection
              stableId={stableId}
              horse={horse}
              events={events}
              canManageHorse={canManageHorse}
              activeTab={nutritionView ?? 'nutrition'}
              onTabChange={(tab) => {
                void navigate({
                  to: stableId
                    ? '/stables/$stableId/horses/$horseId/nutrition'
                    : '/horses/$horseId/nutrition',
                  params: { horseId: horse._id, stableId: stableId ?? '' },
                  search: tab === 'nutrition' ? {} : { nutritionView: tab },
                  replace: true,
                  resetScroll: false,
                })
              }}
            />
          )}
          {activeCategory === 'documents' && (
            <HorseDocumentsSection
              stableId={stableId}
              horse={horse}
              events={events}
            />
          )}
          {!activeCategory && children}
        </div>
      </DashboardPage>
    </RecordCreateActionsProvider>
  )
}

function getHorseDetailCategory(
  pathAfterHorse: string,
): HorseDetailCategory | undefined {
  if (pathAfterHorse === '/training') return 'training'
  if (pathAfterHorse === '/activity') return 'activity'
  if (pathAfterHorse === '/care') return 'care'
  if (pathAfterHorse === '/health') return 'care'
  if (pathAfterHorse === '/nutrition') return 'nutrition'
  if (pathAfterHorse === '/documents') return 'documents'
  if (pathAfterHorse.startsWith('/profile') || pathAfterHorse === '') {
    return 'profile'
  }

  return undefined
}
