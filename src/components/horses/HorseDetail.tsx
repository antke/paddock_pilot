import { getHorseDisplayName } from 'shared/horses/horseDisplayName'
import { useOwnershipCopy } from '#/components/ownership/ownershipCopy'
import { useT, useLocale } from '#/i18n/LocaleProvider'
import {
  ChartLineIcon,
  ClipboardTextIcon,
  ClockCounterClockwiseIcon,
  FilesIcon,
  FirstAidKitIcon,
  GrainsIcon,
  HorseIcon,
  PencilSimpleIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react'
import { EventIcon, TrainingIcon } from '#/components/icons/domain-icons'
import { getHorseBreedLabel } from 'shared/i18n/horseBreedLabels'
import {
  DashboardNavigation,
  DashboardNavigationLinkItem,
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
import { useCallback, useDeferredValue, useMemo, useRef } from 'react'
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
  /** Set for owners and carers inside a stable, whose full record lives on the personal page. */
  sharedViewStableName?: string
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
  sharedViewStableName,
  children,
}: HorseDetailProps) {
  const c = useOwnershipCopy()
  const t = useT()
  const { locale } = useLocale()
  const isSmallScreen = useSmallScreen()

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
  // The same section on the personal page, which lists every record.
  const allRecordsPath = [
    `/horses/${horse._id}`,
    pathAfterHorse === '/health' ? '/care' : pathAfterHorse,
  ].join('')
  const activeCategory = category ?? getHorseDetailCategory(pathAfterHorse)
  // Sections load with suspense queries. Deferring keeps the previous section
  // on screen until the next one is ready, instead of the whole-page loader.
  const shownCategory = useDeferredValue(activeCategory)
  const taskState = useTaskOriginState()
  const horseRoute = stableId
    ? '/stables/$stableId/horses/$horseId'
    : '/horses/$horseId'
  // Every section stays in one scrolling rail, so none hides behind a menu.
  const sectionLinks = [
    ...horseDetailTabs.map((id) => ({
      id,
      label: t(`horseDetail.${id}`),
      to: `${horseRoute}/${id}`,
      active: activeCategory === id,
    })),
    {
      id: 'analysis',
      label: t('navigation.analysis'),
      // Analysis and management live on the personal page only.
      to: '/horses/$horseId/analysis',
      active: pathAfterHorse.startsWith('/analysis'),
    },
    {
      id: 'manage',
      label: c.manage,
      to: '/horses/$horseId/manage',
      active: pathAfterHorse.startsWith('/manage'),
    },
    {
      id: 'timeline',
      label: t('horseDetail.timeline'),
      to: `${horseRoute}/timeline`,
      active: pathAfterHorse.startsWith('/timeline'),
    },
    {
      id: 'care-summary',
      label: t('horseDetail.summary'),
      to: `${horseRoute}/care-summary`,
      active: pathAfterHorse.startsWith('/care-summary'),
    },
  ] as const
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
          actions={
            !pathAfterHorse.startsWith('/edit') ? (
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
                    action="schedule"
                    className="min-h-11 whitespace-nowrap"
                  >
                    {t('eventEditor.addEvent')}
                  </ButtonLink>
                )}
                {canAddRecords && !isSmallScreen && (
                  <HorseAddRecordMenu
                    triggerRef={actionTrigger}
                    horseId={horse._id}
                    horseName={getHorseDisplayName(horse)}
                    stableId={stableId}
                  />
                )}
                {canManageHorse && (
                  <ButtonLink
                    to={
                      stableId
                        ? '/stables/$stableId/horses/$horseId/edit'
                        : '/horses/$horseId/edit'
                    }
                    params={{ horseId: horse._id, stableId: stableId ?? '' }}
                    state={taskState}
                    variant="outline"
                    action="edit"
                    aria-label={t('horseDetail.edit')}
                    className="min-h-11 whitespace-nowrap"
                  >
                    {t('common.edit')}
                  </ButtonLink>
                )}
              </>
            ) : undefined
          }
          // The round + menu already holds every header action on phones.
          phoneMenu={null}
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
          <div className="min-w-0 border-b border-border-subtle">
            <DashboardNavigation
              ariaLabel={t('horseDetail.sections', {
                name: getHorseDisplayName(horse),
              })}
              inset={false}
              overflow="scroll"
            >
              {sectionLinks.map(({ id, label, to, active }) => {
                const Icon = horseSectionIcons[id]
                return (
                  <DashboardNavigationLinkItem
                    key={id}
                    variant="section"
                    render={
                      <Link
                        resetScroll={false}
                        to={to}
                        params={{
                          horseId: horse._id,
                          stableId: stableId ?? '',
                        }}
                      />
                    }
                    active={active}
                  >
                    <Icon aria-hidden="true" />
                    {label}
                  </DashboardNavigationLinkItem>
                )
              })}
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
          aria-busy={shownCategory !== activeCategory || undefined}
          className="grid min-w-0 gap-[var(--app-section-gap)]"
        >
          {stableId &&
            sharedViewStableName &&
            !pathAfterHorse.startsWith('/edit') && (
              <p
                data-slot="horse-shared-view"
                className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground print:hidden"
              >
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <UsersThreeIcon
                    aria-hidden="true"
                    className="size-4 shrink-0"
                  />
                  <span className="[overflow-wrap:anywhere]">
                    {t('horseDetail.sharedView', {
                      name: sharedViewStableName,
                    })}
                  </span>
                </span>
                <Link
                  to={allRecordsPath}
                  // Text-height in the line; the overlay keeps a 44px tap target on touch screens.
                  className="app-control-focus relative rounded-control font-semibold text-primary underline-offset-4 hover:underline pointer-coarse:after:absolute pointer-coarse:after:-inset-y-3 pointer-coarse:after:inset-x-0 pointer-coarse:after:content-['']"
                >
                  {t('horseDetail.viewAllRecords')}
                </Link>
              </p>
            )}
          {shownCategory === 'profile' && (
            <HorseProfileSection
              stableId={stableId}
              horse={horse}
              events={events}
              canManageHorse={canManageHorse}
            />
          )}
          {shownCategory === 'activity' && (
            <HorseActivitySection
              stableId={stableId}
              horse={horse}
              events={events}
            />
          )}
          {shownCategory === 'training' && (
            <HorseTrainingSection
              stableId={stableId}
              horse={horse}
              data={trainingData}
              renderMobileActions={() => null}
            />
          )}
          {shownCategory === 'care' && (
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
          {shownCategory === 'nutrition' && (
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
          {shownCategory === 'documents' && (
            <HorseDocumentsSection
              stableId={stableId}
              horse={horse}
              events={events}
            />
          )}
          {!shownCategory && children}
        </div>
      </DashboardPage>
    </RecordCreateActionsProvider>
  )
}

const horseSectionIcons = {
  profile: HorseIcon,
  activity: EventIcon,
  training: TrainingIcon,
  care: FirstAidKitIcon,
  nutrition: GrainsIcon,
  documents: FilesIcon,
  analysis: ChartLineIcon,
  manage: UsersThreeIcon,
  timeline: ClockCounterClockwiseIcon,
  'care-summary': ClipboardTextIcon,
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
