import { getHorseDisplayName } from 'shared/horses/horseDisplayName'
import { useOwnershipCopy } from '#/components/ownership/ownershipCopy'
import { useT, useLocale } from '#/i18n/LocaleProvider'
import { ChartLineIcon } from '@phosphor-icons/react'
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
      hideTriggers: isSmallScreen,
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
          title={getHorseDisplayName(horse)}
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
                {!isSmallScreen && (
                  <ButtonLink
                    to="/horses/$horseId/analysis"
                    params={{ horseId: horse._id }}
                    variant="outline"
                    className="min-h-11 whitespace-nowrap"
                  >
                    <ChartLineIcon
                      data-icon="inline-start"
                      weight="bold"
                      aria-hidden="true"
                    />
                    {t('navigation.analysis')}
                  </ButtonLink>
                )}
                {canManageHorse && !pathAfterHorse.startsWith('/edit') && (
                  <ButtonLink
                    to="/horses/$horseId/edit"
                    params={{ horseId: horse._id }}
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
            <HorseAvatar
              name={getHorseDisplayName(horse)}
              profileImageUrl={horse.profileImageUrl}
              size="lg"
              className="size-16 sm:size-24"
            />
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
                  { path: 'manage', label: c.manage },
                  { path: 'timeline', label: t('horseDetail.timeline') },
                  { path: 'care-summary', label: t('horseDetail.summary') },
                ] as const
              ).map((item) => (
                <DashboardNavigationLinkItem
                  key={item.path}
                  itemClassName="hidden lg:block"
                  variant="section"
                  active={pathAfterHorse.startsWith(`/${item.path}`)}
                  render={
                    <Link
                      resetScroll={false}
                      to={
                        stableId && item.path !== 'manage'
                          ? `/stables/$stableId/horses/$horseId/${item.path}`
                          : `/horses/$horseId/${item.path}`
                      }
                      params={{ horseId: horse._id, stableId: stableId ?? '' }}
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
                {isSmallScreen && (
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
                )}
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
              activeTab={careView === 'health' ? 'health' : 'reminders'}
              onTabChange={(tab) => {
                void navigate({
                  to: stableId
                    ? '/stables/$stableId/horses/$horseId/care'
                    : '/horses/$horseId/care',
                  params: { horseId: horse._id, stableId: stableId ?? '' },
                  search: tab === 'health' ? { careView: 'health' } : {},
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
  if (pathAfterHorse === '/health') return 'nutrition'
  if (pathAfterHorse === '/nutrition') return 'nutrition'
  if (pathAfterHorse === '/documents') return 'documents'
  if (pathAfterHorse.startsWith('/profile') || pathAfterHorse === '') {
    return 'profile'
  }

  return undefined
}
