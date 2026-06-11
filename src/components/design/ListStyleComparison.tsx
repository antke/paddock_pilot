import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '#/components/ui/navigation-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { cn } from '#/lib/utils'
import type { ReactNode } from 'react'
import { DashboardHierarchyLab } from './DashboardHierarchyLab'

type SampleRecord = {
  title: string
  meta: string
  detail: string
  status: string
  tone: 'default' | 'warning' | 'calm'
}

type ReviewQueueItem = {
  component: string
  path: string
  recommendation: string
  needsChoice: boolean
}

type ManagementRecord = {
  title: string
  meta: string
  detail: string
  tags: string[]
  actionLabel: string
}

type EventRecord = {
  title: string
  date: string
  time: string
  meta: string
  status: string
}

type CareOverviewRecord = {
  title: string
  kicker: string
  meta: string[]
  signal: string
  tone: 'due' | 'planned' | 'attention'
}

const sampleRecords = [
  {
    title: 'Willow',
    meta: 'Owner: Amelia Hart · Warmblood',
    detail: 'Dental check due next week',
    status: 'Care due',
    tone: 'warning',
  },
  {
    title: 'Jasper',
    meta: 'Owner: North Yard · Gelding',
    detail: 'Training session tomorrow at 09:30',
    status: 'Upcoming',
    tone: 'calm',
  },
  {
    title: 'Mabel',
    meta: 'Owner: Rowan Field · Cob',
    detail: 'Profile and documents up to date',
    status: 'Ready',
    tone: 'default',
  },
] satisfies SampleRecord[]

const reviewQueue = [
  {
    component: 'Care overview rows',
    path: 'src/components/dashboard/DashboardCareOverview.tsx',
    recommendation:
      'Directly apply Soft pocket framed rows; no new choice needed.',
    needsChoice: false,
  },
  {
    component: 'Stable upcoming events',
    path: 'src/components/stables/StableUpcomingEvents.tsx',
    recommendation:
      'Directly apply the selected row treatment with the date block preserved.',
    needsChoice: false,
  },
  {
    component: 'Documents / providers / reminders',
    path: 'DocumentsCard, StableProvidersCard, CareRemindersCard',
    recommendation:
      'Use the selected maintenance row: title link + bottom-right actions.',
    needsChoice: false,
  },
  {
    component: 'Event list',
    path: 'src/components/events/EventList.tsx',
    recommendation:
      'Needs a table-vs-agenda choice before changing the real component.',
    needsChoice: true,
  },
  {
    component: 'Care alerts',
    path: 'src/components/stables/StableDashboardAlerts.tsx',
    recommendation:
      'Later pass: severity/alert layout choice, likely separate from row styling.',
    needsChoice: true,
  },
] satisfies ReviewQueueItem[]

const managementRecords = [
  {
    title: 'Dentistry invoice.pdf',
    meta: 'PDF · 184 KB · Willow',
    detail:
      'Linked to annual dental check. Notes mention follow-up in six months.',
    tags: ['Invoice', 'Horse record'],
    actionLabel: 'Open',
  },
  {
    title: 'Dr. Clara Evans',
    meta: 'Vet · clara@example.com · 07700 900123',
    detail:
      'Preferred contact for urgent lameness checks and vaccination planning.',
    tags: ['Vet', 'Primary'],
    actionLabel: 'Edit',
  },
] satisfies ManagementRecord[]

const eventRecords = [
  {
    title: 'Farrier visit',
    date: '19 Jun',
    time: '09:30',
    meta: 'Hoof trimming · 3 horses · Main yard',
    status: 'Upcoming',
  },
  {
    title: 'Dental check',
    date: '24 Jun',
    time: '14:00',
    meta: 'Dentist · Willow · Recurring yearly',
    status: 'Planned',
  },
] satisfies EventRecord[]

const careOverviewRecords = [
  {
    title: 'Annual dental check',
    kicker: 'Due · 24 Jun',
    meta: ['Health', 'North Yard', 'Willow'],
    signal: 'High priority',
    tone: 'due',
  },
  {
    title: 'Farrier visit',
    kicker: '09:30 · 28 Jun',
    meta: ['Hoof trimming', 'Main yard', '3 horses'],
    signal: 'Planned',
    tone: 'planned',
  },
  {
    title: 'Jasper',
    kicker: 'Needs attention',
    meta: ['West stable', '2 active issues', '1 overdue'],
    signal: 'Attention',
    tone: 'attention',
  },
] satisfies CareOverviewRecord[]

const managementVariants = [
  {
    title: 'Maintenance · title link + actions',
    description:
      'Selected maintenance direction: title carries the open signal; controls sit bottom-right.',
    render: ManagementRightActionsRow,
  },
] satisfies Array<{
  title: string
  description: string
  render: (record: ManagementRecord, highlighted: boolean) => ReactNode
}>

const eventVariants = [
  {
    title: 'Calm agenda',
    description:
      'Selected event direction: agenda row with a quiet date block.',
    render: EventCalmAgendaRow,
  },
] satisfies Array<{
  title: string
  description: string
  render: (record: EventRecord, highlighted: boolean) => ReactNode
}>

const careOverviewVariants = [
  {
    title: 'Light left rail · selected',
    description:
      'The dashboard direction: no filled card background, a compact tone rail, and coloured tags that quickly explain the item.',
    render: CareOverviewRailRow,
  },
  {
    title: 'Faint pocket rail',
    description:
      'A slightly more contained riff with a faint border only; still much lighter than a blocky filled card.',
    render: CareOverviewPocketRow,
  },
] satisfies Array<{
  title: string
  description: string
  render: (record: CareOverviewRecord, highlighted: boolean) => ReactNode
}>

const menuVariants = [
  {
    title: 'Rounded base defaults',
    description:
      'Uses the shared NavigationMenu defaults: rounded triggers, rounded panel, and soft control focus states.',
    triggerClassName: undefined,
    contentClassName: undefined,
    linkClassName: undefined,
  },
  {
    title: 'Soft pill rail',
    description:
      'More compact top-level controls with a muted rail behind the trigger group.',
    listClassName: 'rounded-row bg-muted/50 p-1',
    triggerClassName: 'h-8 rounded-full px-3 data-popup-open:bg-card',
    contentClassName: 'rounded-row p-2',
    linkClassName: 'rounded-md px-3 py-2',
  },
  {
    title: 'Card pocket menu',
    description:
      'A card-like dropdown treatment that mirrors the soft pocket row system.',
    triggerClassName:
      'rounded-row border border-border-subtle bg-card shadow-control hover:border-primary/25 hover:bg-primary/5 data-popup-open:border-primary/25 data-popup-open:bg-primary/8',
    contentClassName: 'rounded-row bg-card p-2',
    linkClassName:
      'rounded-row border border-transparent px-3 py-2 hover:border-primary/15 hover:bg-primary/5',
  },
] satisfies Array<{
  title: string
  description: string
  listClassName?: string
  triggerClassName?: string
  contentClassName?: string
  linkClassName?: string
}>

const tabVariants = [
  {
    title: 'Rounded base defaults',
    description:
      'Uses the shared Tabs defaults: soft segmented rail, rounded active control, and the same focus ring as buttons and menus.',
    listClassName: undefined,
    triggerClassName: undefined,
    contentClassName: undefined,
  },
  {
    title: 'Quiet line tabs',
    description:
      'A lighter tab treatment for dense settings screens where the content card already provides the container.',
    listVariant: 'line',
    listClassName: 'gap-3',
    triggerClassName:
      'rounded-none px-0 text-muted-foreground data-active:text-foreground data-active:shadow-none',
    contentClassName: 'border-t border-border-subtle pt-4',
  },
  {
    title: 'Card pocket tabs',
    description:
      'A stronger segmented style for form flows; active state reads like a raised rounded card inside the rail.',
    listClassName: 'rounded-row border border-border-subtle bg-card p-1 shadow-control',
    triggerClassName:
      'rounded-row px-4 data-active:bg-primary/8 data-active:text-primary data-active:shadow-control',
    contentClassName: 'rounded-row border border-border-subtle bg-card p-4',
  },
] satisfies Array<{
  title: string
  description: string
  listVariant?: 'default' | 'line'
  listClassName?: string
  triggerClassName?: string
  contentClassName?: string
}>

export function ListStyleComparison() {
  return (
    <div className="grid gap-10">
      <header className="grid max-w-3xl gap-2">
        <p className="text-sm font-medium text-primary">Style lab</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Selected list row direction
        </h1>
        <p className="text-sm text-muted-foreground">
          Soft pocket framed is the current go-to row treatment. This page stays
          available as a side-by-side lab for future component experiments.
        </p>
      </header>

      <DashboardHierarchyLab />

      <section className="grid gap-4">
        <div className="grid max-w-3xl gap-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            New component defaults
          </p>
          <h2 className="text-base font-semibold tracking-tight">
            Navigation menu treatments
          </h2>
          <p className="text-sm text-muted-foreground">
            The shared NavigationMenu now has rounded app defaults. These variants
            show transportable class overrides that can be copied onto triggers,
            content, and links when a feature needs a stronger local treatment.
          </p>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-3">
          {menuVariants.map((variant) => (
            <section
              key={variant.title}
              className="grid gap-3 rounded-row border border-border-subtle bg-card p-4"
            >
              <div className="grid gap-1">
                <h3 className="text-sm font-semibold">{variant.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {variant.description}
                </p>
              </div>
              <MenuTreatmentPreview variant={variant} />
            </section>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <div className="grid max-w-3xl gap-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            New component defaults
          </p>
          <h2 className="text-base font-semibold tracking-tight">
            Tabs treatments
          </h2>
          <p className="text-sm text-muted-foreground">
            Tabs now share the rounded control focus language. These variants show
            the base segmented default plus copyable alternatives for quieter
            settings pages and stronger form sections.
          </p>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-3">
          {tabVariants.map((variant) => (
            <section
              key={variant.title}
              className="grid gap-3 rounded-row border border-border-subtle bg-card p-4"
            >
              <div className="grid gap-1">
                <h3 className="text-sm font-semibold">{variant.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {variant.description}
                </p>
              </div>
              <TabsTreatmentPreview variant={variant} />
            </section>
          ))}
        </div>
      </section>

      <section className="grid max-w-2xl gap-4">
        <div className="grid gap-1">
          <h2 className="text-base font-semibold tracking-tight">
            Soft pocket · framed
          </h2>
          <p className="text-sm text-muted-foreground">
            Subtle border, rounded highlighted state, and enough structure for
            busy record lists without becoming a heavy card.
          </p>
        </div>

        <div className="grid gap-3">
          {sampleRecords.map((record, index) => (
            <div key={record.title}>
              <SoftPocketFramedRow record={record} highlighted={index === 0} />
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <div className="grid gap-1">
          <h2 className="text-base font-semibold tracking-tight">
            Remaining review queue
          </h2>
          <p className="text-sm text-muted-foreground">
            Components that can take the selected row directly are marked as
            direct. Components with denser actions get examples below first.
          </p>
        </div>

        <div className="grid gap-2 lg:grid-cols-2">
          {reviewQueue.map((item) => (
            <div
              key={item.component}
              className="rounded-row border border-border-subtle bg-card px-3 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">{item.component}</h3>
                <Badge variant={item.needsChoice ? 'secondary' : 'outline'}>
                  {item.needsChoice ? 'Review in lab' : 'Direct apply'}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{item.path}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {item.recommendation}
              </p>
            </div>
          ))}
        </div>
      </section>

      <ComparisonSection
        eyebrow="Selected"
        title="Maintenance rows"
        description="Documents, providers, and reminders use this selected treatment: title-link affordance, rounded hover pocket, and bottom-right controls."
        variants={managementVariants}
        records={managementRecords}
      />

      <ComparisonSection
        eyebrow="Needs choice"
        title="Event list direction"
        description="The current event list is a table. Calm agenda is the selected direction; tags stay together so labels like Main yard do not split awkwardly."
        variants={eventVariants}
        records={eventRecords}
      />

      <ComparisonSection
        eyebrow="New dashboard pass"
        title="Care overview list directions"
        description="Options for due reminders, upcoming care, horses needing attention, and stable workload. Pocket cards is applied to the dashboard; compact rail remains here as a comparison."
        variants={careOverviewVariants}
        records={careOverviewRecords}
      />
    </div>
  )
}

function MenuTreatmentPreview({
  variant,
}: {
  variant: (typeof menuVariants)[number]
}) {
  return (
    <NavigationMenu>
      <NavigationMenuList className={cn('justify-start', variant.listClassName)}>
        <NavigationMenuItem>
          <NavigationMenuTrigger className={variant.triggerClassName}>
            Stable
          </NavigationMenuTrigger>
          <NavigationMenuContent className={variant.contentClassName}>
            <div className="grid w-56 gap-1">
              <NavigationMenuLink href="#overview" className={variant.linkClassName}>
                Overview
              </NavigationMenuLink>
              <NavigationMenuLink href="#settings" className={variant.linkClassName}>
                Settings
              </NavigationMenuLink>
              <NavigationMenuLink href="#members" className={variant.linkClassName}>
                Members
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger className={variant.triggerClassName}>
            Schedule
          </NavigationMenuTrigger>
          <NavigationMenuContent className={variant.contentClassName}>
            <div className="grid w-56 gap-1">
              <NavigationMenuLink href="#events" className={variant.linkClassName}>
                All events
              </NavigationMenuLink>
              <NavigationMenuLink href="#calendar" className={variant.linkClassName}>
                Calendar
              </NavigationMenuLink>
              <NavigationMenuLink href="#reminders" className={variant.linkClassName}>
                Reminders
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function TabsTreatmentPreview({
  variant,
}: {
  variant: (typeof tabVariants)[number]
}) {
  return (
    <Tabs defaultValue="overview" className="gap-3">
      <TabsList variant={variant.listVariant} className={variant.listClassName}>
        <TabsTrigger value="overview" className={variant.triggerClassName}>
          Overview
        </TabsTrigger>
        <TabsTrigger value="members" className={variant.triggerClassName}>
          Members
        </TabsTrigger>
        <TabsTrigger value="providers" className={variant.triggerClassName}>
          Providers
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className={variant.contentClassName}>
        <div className="grid gap-2">
          <p className="font-medium">Stable profile</p>
          <p className="text-muted-foreground">
            Location, owner details, emergency contact, and operating notes.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="members" className={variant.contentClassName}>
        Members invited to the stable and their access levels.
      </TabsContent>
      <TabsContent value="providers" className={variant.contentClassName}>
        Farriers, vets, dentists, and other recurring care providers.
      </TabsContent>
    </Tabs>
  )
}

function ComparisonSection<TRecord>({
  eyebrow,
  title,
  description,
  variants,
  records,
}: {
  eyebrow: string
  title: string
  description: string
  variants: Array<{
    title: string
    description: string
    render: (record: TRecord, highlighted: boolean) => ReactNode
  }>
  records: TRecord[]
}) {
  return (
    <section className="grid gap-4">
      <div className="grid max-w-3xl gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {eyebrow}
        </p>
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {variants.map((variant) => (
          <section key={variant.title} className="grid gap-3">
            <div className="grid gap-1">
              <h3 className="text-sm font-semibold">{variant.title}</h3>
              <p className="text-sm text-muted-foreground">
                {variant.description}
              </p>
            </div>
            <div className="grid gap-2">
              {records.map((record, index) => (
                <div key={index}>{variant.render(record, index === 0)}</div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}

function SoftPocketFramedRow({
  record,
  highlighted,
}: {
  record: SampleRecord
  highlighted: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 border border-transparent px-3 py-3 transition-colors hover:rounded-row hover:border-primary/15 hover:bg-primary/5',
        highlighted &&
          'rounded-row border-primary/20 bg-primary/8 ring-1 ring-primary/15',
      )}
    >
      <RecordAvatar record={record} className="bg-card" />
      <div className="min-w-0 flex-1">
        <RowHeader record={record} />
        <p className="mt-1 text-sm text-muted-foreground">{record.detail}</p>
      </div>
    </div>
  )
}

function RecordAvatar({
  record,
  className,
}: {
  record: SampleRecord
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex size-11 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-muted/70 text-sm font-semibold',
        className,
      )}
    >
      {record.title.charAt(0)}
    </div>
  )
}

function RowHeader({ record }: { record: SampleRecord }) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="line-clamp-1 text-sm font-semibold text-foreground">
          {record.title}
        </p>
        <p className="line-clamp-1 text-xs text-muted-foreground">
          {record.meta}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <StatusBadge record={record} />
        <Button variant="ghost" size="sm" className="shadow-none">
          Open
        </Button>
      </div>
    </div>
  )
}

function StatusBadge({ record }: { record: SampleRecord }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'hidden sm:inline-flex',
        record.tone === 'warning' && 'border-amber-400/40 bg-amber-100/60',
        record.tone === 'calm' && 'border-primary/25 bg-primary/10',
      )}
    >
      {record.status}
    </Badge>
  )
}

function ManagementRightActionsRow(
  record: ManagementRecord,
  highlighted: boolean,
) {
  return (
    <div
      className={cn(
        'group/open grid cursor-pointer gap-3 border border-transparent px-3 py-3 transition-colors hover:rounded-row hover:border-primary/15 hover:bg-primary/5',
        highlighted &&
          'rounded-row border-primary/20 bg-primary/8 ring-1 ring-primary/15',
      )}
    >
      <ManagementRowMain record={record} openableTitle />
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" className="shadow-none">
          {record.actionLabel}
        </Button>
        <Button type="button" variant="ghost" size="sm" className="shadow-none">
          Remove
        </Button>
      </div>
    </div>
  )
}

function ManagementRowMain({
  record,
  openableTitle = false,
}: {
  record: ManagementRecord
  openableTitle?: boolean
}) {
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <h4
          className={cn(
            'text-sm font-semibold underline-offset-4',
            openableTitle &&
              'transition-colors group-hover/open:text-primary group-hover/open:underline',
          )}
        >
          {record.title}
        </h4>
        {record.tags.map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{record.meta}</p>
      <p className="text-sm text-muted-foreground">{record.detail}</p>
    </div>
  )
}

function EventCalmAgendaRow(record: EventRecord, highlighted: boolean) {
  return (
    <div
      className={cn(
        'group/open flex cursor-pointer items-center gap-3 border border-transparent px-3 py-3 transition-colors hover:rounded-row hover:border-primary/15 hover:bg-primary/5',
        highlighted &&
          'rounded-row border-primary/20 bg-primary/8 ring-1 ring-primary/15',
      )}
    >
      <DateBlock record={record} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-sm font-semibold underline-offset-4 transition-colors group-hover/open:text-primary group-hover/open:underline">
            {record.title}
          </h4>
        </div>
        <EventMeta record={record} />
      </div>
    </div>
  )
}

function EventMeta({ record }: { record: EventRecord }) {
  return (
    <p className="flex flex-wrap gap-x-1.5 gap-y-1 text-sm text-muted-foreground">
      {[record.status, ...record.meta.split(' · ')].map((item) => (
        <span key={item} className="whitespace-nowrap">
          {item}
        </span>
      ))}
    </p>
  )
}

function DateBlock({ record }: { record: EventRecord }) {
  const [day, month] = record.date.split(' ')

  return (
    <div className="grid min-w-14 justify-items-center rounded-md border border-border-subtle bg-card px-2 py-1 text-center">
      <span className="text-xs font-medium text-muted-foreground">{month}</span>
      <span className="text-lg font-semibold leading-none">{day}</span>
      <span className="mt-1 text-xs text-muted-foreground">{record.time}</span>
    </div>
  )
}

function CareOverviewPocketRow(
  record: CareOverviewRecord,
  highlighted: boolean,
) {
  return (
    <div
      className={cn(
        'group/open grid cursor-pointer gap-2 rounded-row border border-border-subtle border-l-4 bg-transparent py-3 pl-4 pr-3 transition-colors hover:border-primary/15 hover:bg-primary/5',
        highlighted && 'border-primary/20 bg-primary/5 ring-1 ring-primary/10',
        record.tone === 'due' && 'border-l-amber-400',
        record.tone === 'planned' && 'border-l-primary/45',
        record.tone === 'attention' && 'border-l-destructive/45',
      )}
    >
      <CareOverviewContent record={record} />
    </div>
  )
}

function CareOverviewRailRow(record: CareOverviewRecord, highlighted: boolean) {
  return (
    <div
      className={cn(
        'group/open grid cursor-pointer gap-2 rounded-row border border-transparent border-l-4 bg-transparent py-3 pl-4 pr-3 transition-colors hover:border-primary/15 hover:bg-primary/5',
        highlighted && 'border-primary/15 bg-primary/5 ring-1 ring-primary/10',
        record.tone === 'due' && 'border-l-4 border-l-amber-400',
        record.tone === 'planned' && 'border-l-4 border-l-primary/45',
        record.tone === 'attention' && 'border-l-4 border-l-destructive/45',
      )}
    >
      <CareOverviewContent record={record} />
    </div>
  )
}

function CareOverviewContent({ record }: { record: CareOverviewRecord }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-sm font-semibold underline-offset-4 transition-colors group-hover/open:text-primary group-hover/open:underline">
          {record.title}
        </h4>
        <CareOverviewTag tone={record.tone}>{record.signal}</CareOverviewTag>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{record.kicker}</p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {record.meta.map((item, index) => (
          <CareOverviewTag key={item} tone={careOverviewMetaTones[index]}>
            {item}
          </CareOverviewTag>
        ))}
      </div>
    </div>
  )
}

const careOverviewMetaTones = ['planned', 'stable', 'horse'] as const

function CareOverviewTag({
  tone,
  children,
}: {
  tone: 'due' | 'planned' | 'attention' | 'stable' | 'horse'
  children: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'shadow-none',
        tone === 'attention' &&
          'border-destructive/25 bg-destructive/10 text-destructive',
        tone === 'due' && 'border-amber-400/35 bg-amber-100/45 text-amber-900',
        tone === 'planned' && 'border-primary/25 bg-primary/8 text-primary',
        tone === 'stable' &&
          'border-slate-400/25 bg-slate-100/40 text-slate-700 dark:border-slate-500/30 dark:bg-slate-900/30 dark:text-slate-200',
        tone === 'horse' &&
          'border-emerald-500/25 bg-emerald-100/35 text-emerald-800 dark:bg-emerald-950/25 dark:text-emerald-200',
      )}
    >
      {children}
    </Badge>
  )
}
