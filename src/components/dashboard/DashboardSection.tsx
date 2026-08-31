import type { ComponentProps, ReactNode } from 'react'

import { cn } from '#/lib/utils'
import type { DashboardChrome } from './dashboardChrome'
import { dashboardSectionClassName } from './dashboardChrome'
import { DashboardSectionHeader } from './DashboardSectionHeader'

type DashboardSectionHeaderProps = ComponentProps<typeof DashboardSectionHeader>
type DashboardSectionGap = 'compact' | 'roomy' | 'default' | 'loose'
type DashboardSectionPadding = 'default' | 'compact' | 'roomy' | 'none'
type DashboardSectionSpan = 'lg2' | 'xl2' | 'xl3'
type DashboardSectionTone = 'default' | 'brand' | 'brandQuiet' | 'reference'
type DashboardSectionContentAlign = 'default' | 'start'

type DashboardSectionProps = Omit<
  ComponentProps<'section'>,
  'children' | 'title'
> &
  Omit<
    Pick<
      DashboardSectionHeaderProps,
      | 'actions'
      | 'actionsClassName'
      | 'as'
      | 'badges'
      | 'description'
      | 'descriptionClassName'
      | 'descriptionSize'
      | 'descriptionWidth'
      | 'headingClassName'
      | 'title'
      | 'titleClassName'
      | 'titleStyle'
    >,
    'title'
  > & {
    children: ReactNode
    chrome?: DashboardChrome
    contentAlign?: DashboardSectionContentAlign
    gap?: DashboardSectionGap
    headerClassName?: string
    padding?: DashboardSectionPadding
    size?: DashboardSectionHeaderProps['size']
    span?: DashboardSectionSpan
    title?: DashboardSectionHeaderProps['title']
    tone?: DashboardSectionTone
  }

const dashboardSectionGapClassNames = {
  compact: 'gap-4',
  roomy: 'gap-5',
  default: 'gap-6',
  loose: 'gap-8',
} satisfies Record<DashboardSectionGap, string>

const dashboardSectionPaddingClassNames = {
  default: '',
  compact: 'p-5 md:p-5',
  roomy: 'p-6 md:p-6',
  none: 'p-0 md:p-0',
} satisfies Record<DashboardSectionPadding, string>

const dashboardSectionToneClassNames = {
  default: '',
  brand: 'bg-primary text-primary-foreground',
  brandQuiet:
    'border-brand-surface-border bg-brand-surface text-brand-surface-foreground [&_[data-slot=text-label]]:text-brand-surface-muted-foreground',
  reference:
    'border-border bg-card text-card-foreground [&_[data-slot=dashboard-display-heading]]:text-primary [&_[data-slot=text-label]]:text-primary',
} satisfies Record<DashboardSectionTone, string>

const dashboardSectionSpanClassNames = {
  lg2: 'lg:col-span-2',
  xl2: 'xl:col-span-2',
  xl3: 'xl:col-span-3',
} satisfies Record<DashboardSectionSpan, string>

const dashboardSectionContentAlignClassNames = {
  default: '',
  start: 'content-start',
} satisfies Record<DashboardSectionContentAlign, string>

export const dashboardSectionLayoutClassName = 'grid'

export function DashboardSection({
  actions,
  actionsClassName,
  as,
  badges,
  children,
  chrome = 'cards',
  className,
  contentAlign = 'default',
  description,
  descriptionClassName,
  descriptionSize,
  descriptionWidth,
  gap = 'default',
  headerClassName,
  headingClassName,
  padding = 'default',
  size = 'section',
  span,
  title,
  titleClassName,
  titleStyle,
  tone = 'default',
  ...props
}: DashboardSectionProps) {
  const hasHeader = title !== undefined && title !== null

  return (
    <section
      data-slot="dashboard-section"
      {...props}
      className={dashboardSectionClassName(
        chrome,
        cn(
          dashboardSectionLayoutClassName,
          dashboardSectionGapClassNames[gap],
          dashboardSectionContentAlignClassNames[contentAlign],
          dashboardSectionPaddingClassNames[padding],
          span && dashboardSectionSpanClassNames[span],
          dashboardSectionToneClassNames[tone],
          className,
        ),
      )}
    >
      {hasHeader && (
        <DashboardSectionHeader
          actions={actions}
          actionsClassName={actionsClassName}
          as={as}
          badges={badges}
          className={headerClassName}
          description={description}
          descriptionClassName={descriptionClassName}
          descriptionSize={descriptionSize}
          descriptionWidth={descriptionWidth}
          headingClassName={headingClassName}
          size={size}
          title={title}
          titleClassName={titleClassName}
          titleStyle={titleStyle}
        />
      )}

      {children}
    </section>
  )
}
