import {
  DashboardNavigation,
  DashboardNavigationLinkItem,
  DashboardNavigationMenuGroup,
  DashboardNavigationMenuLink,
} from '#/components/dashboard/DashboardNavigation'
import { DashboardEntityHero } from '#/components/dashboard/DashboardEntityHero'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { Link, useLocation } from '@tanstack/react-router'
import type { Doc } from 'convex/_generated/dataModel'
import { HorseActivitySection } from './HorseActivitySection'
import { HorseCareSection } from './HorseCareSection'
import { HorseDocumentsSection } from './HorseDocumentsSection'
import { HorseNutritionSection } from './HorseNutritionSection'
import { HorseProfileSection } from './HorseProfileSection'
import { HorseAvatar } from './HorseAvatar'

export type HorseDetailHorse = Doc<'horses'> & {
  profileImageUrl?: string | null
}

export type HorseDetailCategory =
  | 'profile'
  | 'activity'
  | 'care'
  | 'nutrition'
  | 'documents'

type HorseDetailProps = {
  stableId: string
  horse: HorseDetailHorse
  events: Array<Doc<'events'>>
  category?: HorseDetailCategory
  canManageHorse: boolean
}

export type HorseDetailSectionProps = {
  stableId: string
  horse: HorseDetailHorse
  events: Array<Doc<'events'>>
}

export const sexLabels = {
  mare: 'Mare',
  gelding: 'Gelding',
  stallion: 'Stallion',
} satisfies Record<NonNullable<Doc<'horses'>['sex']>, string>

export const shoeingStatusLabels = {
  barefoot: 'Barefoot',
  front_shoes: 'Front shoes',
  full_set: 'Full set',
} satisfies Record<NonNullable<Doc<'horses'>['shoeingStatus']>, string>

const categoryItems = [
  { id: 'profile', label: 'Profile' },
  { id: 'activity', label: 'Activity' },
  { id: 'care', label: 'Care' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'documents', label: 'Documents' },
] satisfies Array<{ id: HorseDetailCategory; label: string }>

export function HorseDetail({
  stableId,
  horse,
  events,
  category,
  canManageHorse,
}: HorseDetailProps) {
  const { pathname } = useLocation()
  const horseBasePath = `/stables/${stableId}/horses/${horse._id}`
  const pathAfterHorse = pathname.slice(horseBasePath.length)
  const activeCategory = category ?? getHorseDetailCategory(pathAfterHorse)
  const moreSectionActive = ['/timeline', '/care-summary', '/edit'].includes(
    pathAfterHorse,
  )

  return (
    <DashboardPage>
      <DashboardEntityHero
        title={horse.name}
        leading={
          <HorseAvatar
            name={horse.name}
            profileImageUrl={horse.profileImageUrl}
            size="lg"
          />
        }
        actions={
          <DashboardNavigation align="end" inset={false}>
            {categoryItems.map((item) => (
              <DashboardNavigationLinkItem
                key={item.id}
                variant="section"
                render={
                  <Link
                    to={`/stables/$stableId/horses/$horseId/${item.id}`}
                    params={{ stableId, horseId: horse._id }}
                  />
                }
                active={activeCategory === item.id}
              >
                {item.label}
              </DashboardNavigationLinkItem>
            ))}
            <DashboardNavigationMenuGroup
              active={moreSectionActive}
              label="More"
              contentWidth="sm"
              triggerClassName="h-10 px-3.5 font-display text-sm font-black uppercase leading-none tracking-normal"
            >
              <DashboardNavigationMenuLink
                className="font-display text-xs font-bold uppercase tracking-wide"
                render={
                  <Link
                    to="/stables/$stableId/horses/$horseId/timeline"
                    params={{ stableId, horseId: horse._id }}
                  />
                }
              >
                Timeline
              </DashboardNavigationMenuLink>
              <DashboardNavigationMenuLink
                className="font-display text-xs font-bold uppercase tracking-wide"
                render={
                  <Link
                    to="/stables/$stableId/horses/$horseId/care-summary"
                    params={{ stableId, horseId: horse._id }}
                  />
                }
              >
                Care summary
              </DashboardNavigationMenuLink>
              {canManageHorse && (
                <DashboardNavigationMenuLink
                  className="font-display text-xs font-bold uppercase tracking-wide"
                  render={
                    <Link
                      to="/stables/$stableId/horses/$horseId/edit"
                      params={{ stableId, horseId: horse._id }}
                    />
                  }
                >
                  Edit horse
                </DashboardNavigationMenuLink>
              )}
            </DashboardNavigationMenuGroup>
          </DashboardNavigation>
        }
      />

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
      {activeCategory === 'care' && (
        <HorseCareSection stableId={stableId} horse={horse} events={events} />
      )}
      {activeCategory === 'nutrition' && (
        <HorseNutritionSection
          stableId={stableId}
          horse={horse}
          events={events}
        />
      )}
      {activeCategory === 'documents' && (
        <HorseDocumentsSection
          stableId={stableId}
          horse={horse}
          events={events}
        />
      )}
    </DashboardPage>
  )
}

function getHorseDetailCategory(
  pathAfterHorse: string,
): HorseDetailCategory | undefined {
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
