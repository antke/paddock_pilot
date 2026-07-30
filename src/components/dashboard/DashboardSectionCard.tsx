import type { ComponentProps, ReactNode } from 'react'

import { Card, CardContent, CardFooter, CardHeader } from '#/components/ui/card'
import { Separator } from '#/components/ui/separator'
import { cn } from '#/lib/utils'
import { DashboardInlineHeader } from './DashboardInlineHeader'
import { DashboardSectionHeader } from './DashboardSectionHeader'

type DashboardSectionHeaderProps = ComponentProps<typeof DashboardSectionHeader>
type DashboardInlineHeaderProps = ComponentProps<typeof DashboardInlineHeader>
type DashboardSectionCardContentGap =
  | 'tight'
  | 'compact'
  | 'default'
  | 'comfortable'
  | 'loose'
type DashboardSectionCardContentTextSize = 'default' | 'sm'
type DashboardSectionCardContentLayout =
  | 'block'
  | 'default'
  | 'flexColumn'
  | 'splitRail'
  | 'twoColumn'
type DashboardSubsectionGap = 'compact' | 'default' | 'loose'
type DashboardSectionCardWidth = 'auto' | 'full'

type DashboardSectionCardProps = Omit<
  ComponentProps<typeof Card>,
  'children' | 'title'
> &
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
    | 'titleClassName'
  > & {
    children?: ReactNode
    contentClassName?: string
    contentGap?: DashboardSectionCardContentGap
    contentLayout?: DashboardSectionCardContentLayout
    contentTextSize?: DashboardSectionCardContentTextSize
    footer?: ReactNode
    footerClassName?: string
    headerClassName?: string
    size?: DashboardSectionHeaderProps['size']
    title?: DashboardSectionHeaderProps['title']
    width?: DashboardSectionCardWidth
  }

type DashboardSubsectionProps = Omit<
  ComponentProps<'div'>,
  'children' | 'title'
> &
  Pick<
    DashboardInlineHeaderProps,
    | 'aside'
    | 'as'
    | 'description'
    | 'descriptionClassName'
    | 'descriptionSize'
    | 'headingClassName'
    | 'title'
    | 'titleClassName'
    | 'titleSize'
    | 'titleWeight'
  > & {
    children: ReactNode
    contentClassName?: string
    gap?: DashboardSubsectionGap
    headerClassName?: string
  }

const dashboardSectionCardContentGapClassNames = {
  tight: 'gap-2',
  compact: 'gap-3',
  default: 'gap-4',
  comfortable: 'gap-5',
  loose: 'gap-6',
} satisfies Record<DashboardSectionCardContentGap, string>

export const dashboardSectionCardContentClassName = 'grid'

const dashboardSectionCardContentLayoutClassNames = {
  block: 'block',
  default: dashboardSectionCardContentClassName,
  flexColumn: 'flex flex-col',
  splitRail: 'grid lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.6fr)]',
  twoColumn: 'grid sm:grid-cols-2',
} satisfies Record<DashboardSectionCardContentLayout, string>

const dashboardSubsectionGapClassNames = {
  compact: 'gap-3',
  default: 'gap-4',
  loose: 'gap-5',
} satisfies Record<DashboardSubsectionGap, string>

export function DashboardSectionCard({
  actions,
  actionsClassName,
  as,
  badges,
  children,
  className,
  contentClassName,
  contentGap = 'default',
  contentLayout = 'default',
  contentTextSize = 'default',
  description,
  descriptionClassName,
  descriptionSize,
  descriptionWidth,
  footer,
  footerClassName,
  headerClassName,
  headingClassName,
  size = 'panel',
  title,
  titleClassName,
  width = 'auto',
  ...props
}: DashboardSectionCardProps) {
  const hasContent = children !== undefined && children !== null
  const hasFooter = footer !== undefined && footer !== null
  const hasHeader =
    title !== undefined ||
    description !== undefined ||
    actions !== undefined ||
    badges !== undefined

  return (
    <Card
      data-slot="dashboard-section-card"
      className={cn(width === 'full' && 'w-full', className)}
      {...props}
    >
      {hasHeader && (
        <CardHeader className={headerClassName}>
          <DashboardSectionHeader
            actions={actions}
            actionsClassName={actionsClassName}
            as={as}
            badges={badges}
            description={description}
            descriptionClassName={descriptionClassName}
            descriptionSize={descriptionSize}
            descriptionWidth={descriptionWidth}
            headingClassName={headingClassName}
            size={size}
            title={title}
            titleClassName={titleClassName}
          />
        </CardHeader>
      )}

      {hasContent && (
        <CardContent
          className={cn(
            dashboardSectionCardContentLayoutClassNames[contentLayout],
            dashboardSectionCardContentGapClassNames[contentGap],
            contentTextSize === 'sm' && 'text-sm',
            contentClassName,
          )}
        >
          {children}
        </CardContent>
      )}

      {hasFooter && (
        <CardFooter className={footerClassName}>{footer}</CardFooter>
      )}
    </Card>
  )
}

export function DashboardSectionDivider({
  className,
  ...props
}: ComponentProps<typeof Separator>) {
  return <Separator className={cn('bg-border-subtle', className)} {...props} />
}

export function DashboardSubsection({
  aside,
  as = 'h3',
  children,
  className,
  contentClassName,
  description,
  descriptionClassName,
  descriptionSize,
  gap = 'default',
  headerClassName,
  headingClassName,
  title,
  titleClassName,
  titleSize = 'lg',
  titleWeight,
  ...props
}: DashboardSubsectionProps) {
  const content = contentClassName ? (
    <div className={contentClassName}>{children}</div>
  ) : (
    children
  )

  return (
    <div
      data-slot="dashboard-subsection"
      className={cn('grid', dashboardSubsectionGapClassNames[gap], className)}
      {...props}
    >
      <DashboardInlineHeader
        aside={aside}
        as={as}
        className={headerClassName}
        description={description}
        descriptionClassName={descriptionClassName}
        descriptionSize={descriptionSize}
        headingClassName={headingClassName}
        title={title}
        titleClassName={titleClassName}
        titleSize={titleSize}
        titleWeight={titleWeight}
      />

      {content}
    </div>
  )
}
