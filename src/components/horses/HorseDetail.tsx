import { dashboardHeroClassName } from '#/components/dashboard/dashboardChrome'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '#/components/ui/breadcrumb'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '#/components/ui/navigation-menu'
import { Link, useLocation } from '@tanstack/react-router'
import type { Doc } from 'convex/_generated/dataModel'
import { HorseActivitySection } from './HorseActivitySection'
import { HorseCareSection } from './HorseCareSection'
import { HorseDocumentsSection } from './HorseDocumentsSection'
import { HorseNutritionSection } from './HorseNutritionSection'
import { HorseProfileSection } from './HorseProfileSection'

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
}: HorseDetailProps) {
  const { pathname } = useLocation()
  const horseBasePath = `/stables/${stableId}/horses/${horse._id}`
  const pathAfterHorse = pathname.slice(horseBasePath.length)
  const activeCategory = category ?? getHorseDetailCategory(pathAfterHorse)

  return (
    <div className="grid gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link to="/stables">Stables</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link to="/stables/$stableId" params={{ stableId }}>
              Stable
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link to="/stables/$stableId/horses" params={{ stableId }}>
              Horses
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{horse.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className={dashboardHeroClassName('cards')}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-24 overflow-hidden rounded-lg border bg-muted">
              {horse.profileImageUrl ? (
                <img
                  src={horse.profileImageUrl}
                  alt={`${horse.name} profile`}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-2xl font-semibold text-muted-foreground">
                  {horse.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <h1 className="text-2xl font-semibold">{horse.name}</h1>
            </div>
          </div>

          <NavigationMenu className="justify-start lg:justify-end">
            <NavigationMenuList className="flex-wrap justify-start gap-1 lg:justify-end">
              {categoryItems.map((item) => (
                <NavigationMenuItem key={item.id}>
                  <NavigationMenuLink
                    render={
                      <Link
                        to={`/stables/$stableId/horses/$horseId/${item.id}`}
                        params={{ stableId, horseId: horse._id }}
                      />
                    }
                    data-active={activeCategory === item.id || undefined}
                  >
                    {item.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </header>

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
    </div>
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

export function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  )
}
