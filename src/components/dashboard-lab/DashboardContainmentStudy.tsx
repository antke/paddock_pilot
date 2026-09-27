import { ActiveStableHeader } from '#/components/dashboard/command-center/ActiveStableHeader'
import { HorseRosterCard } from '#/components/dashboard/command-center/HorseRosterCard'
import { MiniCalendarCard } from '#/components/dashboard/command-center/MiniCalendarCard'
import { PriorityQueueCard } from '#/components/dashboard/command-center/PriorityQueueCard'
import { StableCommandCenter } from '#/components/dashboard/command-center/StableCommandCenter'
import { TodayBriefingCard } from '#/components/dashboard/command-center/TodayBriefingCard'
import type { DashboardCommandData } from '#/components/dashboard/command-center/dashboardTypes'
import { ButtonLink } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import './dashboardContainmentStudy.css'

export const dashboardContainmentOptions = [
  {
    version: '1',
    name: 'Soft sections',
    description:
      'One lightly outlined paper surface per section. Open rows inside. The clearest starting point for a shared yard dashboard.',
  },
  {
    version: '2',
    name: 'Row bands',
    description:
      'Open sections with stronger headers and alternating row shading. Less framing, with each record given a readable lane.',
  },
  {
    version: '3',
    name: 'Focus rail',
    description:
      'One shared surface for the daily plan and horses, with a distinct attention area alongside. Fewer containers, stronger priorities.',
  },
  {
    version: 'current',
    name: 'Current layout',
    description:
      'The existing dashboard, shown with the same data for comparison.',
  },
] as const

const softSectionOptions = [
  {
    version: 'soft-headers',
    name: 'Defined headers',
    description:
      'Integrated header backgrounds make each section easier to identify. Open rows and a consistent heading size keep the interior quiet.',
  },
  {
    version: 'soft-compact',
    name: 'Compact rhythm',
    description:
      'Tighter spacing and a two-column health summary on desktop bring more of the yard into view, with the same readable text and open rows.',
  },
  {
    version: 'soft-gentle',
    name: 'Gentle contrast',
    description:
      'Softer outlines, warm paper surfaces and a lightly tinted attention area. More breathing room, with grouping carried mainly by the surfaces.',
  },
  {
    ...dashboardContainmentOptions[0],
    name: 'Original soft',
    description:
      'The original Soft sections demo, kept here as the reference for these refinements.',
  },
] as const

export function isSoftSectionStudy(version: string) {
  return (
    version === '1' ||
    softSectionOptions.some((item) => item.version === version)
  )
}

export function DashboardContainmentNavigation({
  version,
}: {
  version: string
}) {
  const isSoft = isSoftSectionStudy(version)
  const options = isSoft ? softSectionOptions : dashboardContainmentOptions
  const option = options.find((item) => item.version === version) ?? options[0]

  return (
    <div className="grid gap-3">
      <ButtonLink
        to="/dashboard-lab/$version"
        params={{ version: 'reference-01' }}
        variant="link"
        className="w-fit p-0"
      >
        Explore the 12 reference studies
      </ButtonLink>
      <nav aria-label="Dashboard design demos" className="flex flex-wrap gap-2">
        {options.map((item) => (
          <ButtonLink
            key={item.version}
            to="/dashboard-lab/$version"
            params={{ version: item.version }}
            variant="outline"
            aria-current={option.version === item.version ? 'page' : undefined}
            className={cn(
              'min-h-11',
              option.version === item.version &&
                'border-selection bg-selection-surface text-selection',
            )}
          >
            {item.name}
          </ButtonLink>
        ))}
      </nav>
      <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
        {option.description}
      </p>
      <ButtonLink
        to="/dashboard-lab/$version"
        params={{ version: isSoft ? '2' : 'soft-headers' }}
        variant="link"
        className="w-fit p-0"
      >
        {isSoft
          ? 'Earlier layout comparisons'
          : 'Explore Soft sections refinements'}
      </ButtonLink>
    </div>
  )
}

export function DashboardContainmentStudy({
  data,
  version,
}: {
  data: DashboardCommandData
  version: string
}) {
  if (version === 'current') return <StableCommandCenter data={data} />
  const variant =
    version === '2' ? 'bands' : version === '3' ? 'rail' : 'sections'
  const refinement =
    version === 'soft-headers'
      ? 'headers'
      : version === 'soft-compact'
        ? 'compact'
        : version === 'soft-gentle'
          ? 'gentle'
          : undefined

  return (
    <div data-dashboard-study={variant} data-soft-refinement={refinement}>
      <ActiveStableHeader data={data} />
      <div className="study-layout">
        <div className="study-main">
          <TodayBriefingCard
            className="study-section study-today"
            data={data}
          />
          <MiniCalendarCard className="study-section study-week" data={data} />
          <HorseRosterCard className="study-section study-horses" data={data} />
        </div>
        <PriorityQueueCard
          className="study-section study-attention"
          data={data}
        />
      </div>
    </div>
  )
}
