import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '#/components/ui/navigation-menu'
import { Select } from '#/components/ui/select'
import { Textarea } from '#/components/ui/textarea'
import { cn } from '#/lib/utils'

type SurfaceRole =
  | 'section'
  | 'input surface'
  | 'content surface'
  | 'empty state'

type SurfaceVariant = {
  id: string
  name: string
  label: string
  description: string
  bestFor: string
  classes: {
    section: string
    filter: string
    form: string
    listItem: string
    empty: string
    info: string
    roleLabel: string
  }
}

const surfaceVariants = [
  {
    id: 'input-outline',
    name: 'Input outline',
    label: 'Option 1',
    description:
      'Removes the input background entirely and uses a clear shared outline for filters and forms. Content stays as the filled family.',
    bestFor: 'Testing whether borders alone can define input areas without adding more fill color.',
    classes: {
      section: 'rounded-panel bg-muted/30 p-5 md:p-6',
      filter:
        'rounded-row border border-primary/35 bg-transparent p-4 shadow-control',
      form:
        'rounded-row border border-primary/35 bg-transparent p-5 shadow-control',
      listItem:
        'rounded-row bg-background/62 p-4 shadow-control transition-colors hover:bg-primary/5 hover:shadow-surface',
      empty:
        'rounded-row bg-background/35 p-4 text-sm text-muted-foreground shadow-inner',
      info: 'rounded-row bg-background/42 p-4',
      roleLabel: 'bg-primary/10 text-primary',
    },
  },
  {
    id: 'cool-input',
    name: 'Cool input tint',
    label: 'Option 2',
    description:
      'Gives filters and forms a restrained cool tint so input areas are instantly recognisable, while display content stays neutral.',
    bestFor: 'A more visible input/content split without adding borders everywhere.',
    classes: {
      section: 'rounded-panel bg-muted/25 p-5 md:p-6',
      filter:
        'rounded-row bg-sky-500/10 p-4 shadow-control ring-1 ring-sky-500/15',
      form:
        'rounded-row bg-sky-500/10 p-5 shadow-control ring-1 ring-sky-500/15',
      listItem:
        'rounded-row bg-background/62 p-4 shadow-control transition-colors hover:bg-primary/5 hover:shadow-surface',
      empty:
        'rounded-row bg-background/32 p-4 text-sm text-muted-foreground shadow-inner',
      info: 'rounded-row bg-background/40 p-4',
      roleLabel: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
    },
  },
  {
    id: 'warm-input',
    name: 'Warm input tint',
    label: 'Option 3',
    description:
      'Uses a warmer operational tint for the input family. It is more characterful, but still keeps display content neutral.',
    bestFor: 'Checking whether a warmer input surface suits the stable-management tone better.',
    classes: {
      section: 'rounded-panel bg-muted/25 p-5 md:p-6',
      filter:
        'rounded-row bg-amber-500/10 p-4 shadow-control ring-1 ring-amber-500/15',
      form:
        'rounded-row bg-amber-500/10 p-5 shadow-control ring-1 ring-amber-500/15',
      listItem:
        'rounded-row bg-background/62 p-4 shadow-control transition-colors hover:bg-primary/5 hover:shadow-surface',
      empty:
        'rounded-row bg-background/35 p-4 text-sm text-muted-foreground shadow-inner',
      info: 'rounded-row bg-background/42 p-4',
      roleLabel: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    },
  },
] satisfies Array<SurfaceVariant>

const roleLabels = [
  'section',
  'input surface',
  'content surface',
  'empty state',
] satisfies Array<SurfaceRole>

export function SurfaceSystemPageLab() {
  return (
    <div className="grid gap-6">
      <section className="rounded-panel border border-border-subtle bg-card/75 p-5 shadow-card md:p-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="grid gap-2">
            <Badge variant="outline" className="w-fit bg-background/70">
              Surface system lab
            </Badge>
            <div className="grid gap-2">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Component role recognition
              </h2>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                Compare the top three restrained surface systems for filters,
                forms, list records, empty states, and read-only information.
                These variants test a two-family model: input surfaces for
                filters/forms, and content surfaces for records/info.
              </p>
            </div>
          </div>

          <div className="flex max-w-xl flex-wrap gap-2 lg:justify-end">
            {roleLabels.map((role) => (
              <Badge key={role} variant="outline" className="bg-background/65">
                {role}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6">
        {surfaceVariants.map((variant) => (
          <SurfaceVariantPreview key={variant.id} variant={variant} />
        ))}
      </div>
    </div>
  )
}

function SurfaceVariantPreview({ variant }: { variant: SurfaceVariant }) {
  return (
    <section className="grid gap-4">
      <div className="grid gap-2 px-1 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.36fr)] md:items-end">
        <div>
          <Badge variant="outline" className="mb-3 bg-background/70">
            {variant.label}
          </Badge>
          <h3 className="text-xl font-semibold tracking-tight">
            {variant.name}
          </h3>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
            {variant.description}
          </p>
        </div>
        <p className="rounded-row bg-muted/35 p-3 text-xs leading-5 text-muted-foreground">
          <span className="font-semibold text-foreground">Best for: </span>
          {variant.bestFor}
        </p>
      </div>

      <div className={variant.classes.section}>
        <div className="grid gap-6">
          <SurfaceHeader variant={variant} />

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.42fr)] lg:items-start">
            <div className="grid gap-4">
              <FilterSpecimen variant={variant} />
              <ListItemSpecimen variant={variant} />
              <EmptyStateSpecimen variant={variant} />
            </div>

            <FormSpecimen variant={variant} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <InfoSpecimen variant={variant} label="Vet" value="Dr. Mira Bell" />
            <InfoSpecimen variant={variant} label="Vet phone" value="07400 123 456" />
            <InfoSpecimen variant={variant} label="Farrier" value="Oak Lane Forge" />
            <InfoSpecimen
              variant={variant}
              label="Emergency notes"
              value="Prefers quiet handling around the wash bay."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function SurfaceHeader({ variant }: { variant: SurfaceVariant }) {
  return (
    <div className="grid gap-5">
      <NavigationMenu className="justify-start">
        <NavigationMenuList className="flex-wrap justify-start gap-1">
          {['Care reminders', 'Health issues'].map((tab, index) => (
            <NavigationMenuItem key={tab}>
              <NavigationMenuLink
                render={<button type="button" />}
                data-active={index === 0 || undefined}
              >
                {tab}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      <div className="grid gap-1.5 px-4">
        <div className="flex flex-wrap items-center gap-2">
          <RoleBadge variant={variant} role="section" />
          <h4 className="text-2xl font-semibold leading-tight tracking-tight">
            Care reminders
          </h4>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Track due checks, reviews, and follow-ups for this horse.
        </p>
      </div>
    </div>
  )
}

function FilterSpecimen({ variant }: { variant: SurfaceVariant }) {
  return (
    <div className={variant.classes.filter}>
      <div className="grid gap-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
          <label className="grid min-w-0 gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <span className="flex items-center gap-2">
              Search
              <RoleBadge variant={variant} role="input surface" />
            </span>
            <Input
              type="search"
              value="vaccination"
              readOnly
              aria-label="Search specimen"
            />
          </label>
          <Button type="button" variant="outline">
            Filters
            <span className="inline-flex size-5 flex-none items-center justify-center rounded-full bg-primary text-[0.625rem] font-medium leading-none text-primary-foreground">
              2
            </span>
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
            State: Overdue ×
          </span>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
            Category: Vet ×
          </span>
          <Button type="button" variant="ghost" size="xs">
            Clear all
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <label className="grid gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            State
            <Select defaultValue="overdue" aria-label="State filter specimen">
              <option value="all">All states</option>
              <option value="overdue">Overdue</option>
            </Select>
          </label>
          <label className="grid gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Category
            <Select defaultValue="vet" aria-label="Category filter specimen">
              <option value="all">All categories</option>
              <option value="vet">Vet</option>
            </Select>
          </label>
          <label className="grid gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Priority
            <Select defaultValue="high" aria-label="Priority filter specimen">
              <option value="all">All priorities</option>
              <option value="high">High</option>
            </Select>
          </label>
        </div>
      </div>
    </div>
  )
}

function ListItemSpecimen({ variant }: { variant: SurfaceVariant }) {
  return (
    <div className={variant.classes.listItem}>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="grid min-w-0 gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <RoleBadge variant={variant} role="content surface" />
            <h5 className="text-lg font-semibold leading-snug tracking-[-0.01em]">
              Upload vaccination certificate
            </h5>
          </div>
          <p className="text-sm text-muted-foreground">
            Due 28 Jun 2026 · Juniper · Vet
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            Record row with status, metadata, and actions. It should feel like
            existing content, not a tool panel or create form.
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Badge variant="destructive">High</Badge>
          <Badge variant="outline">Pending</Badge>
          <Button type="button" variant="ghost" size="sm">
            Complete
          </Button>
        </div>
      </div>
    </div>
  )
}

function FormSpecimen({ variant }: { variant: SurfaceVariant }) {
  return (
    <form className={cn(variant.classes.form, 'grid gap-5')}>
      <div className="grid gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <RoleBadge variant={variant} role="input surface" />
          <h5 className="text-lg font-semibold leading-snug tracking-tight">
            Create reminder
          </h5>
        </div>
        <p className="text-sm text-muted-foreground">
          The strongest nested surface: this is where users enter new data.
        </p>
      </div>

      <label className="grid gap-1.5 text-sm font-medium">
        Title
        <Input defaultValue="Book next farrier visit" />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">
          Due date
          <Input type="date" defaultValue="2026-06-28" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Category
          <Select defaultValue="vet">
            <option value="vet">Vet</option>
            <option value="admin">Admin</option>
          </Select>
        </label>
      </div>

      <label className="grid gap-1.5 text-sm font-medium">
        Notes
        <Textarea defaultValue="Bring updated vaccination records." />
      </label>

      <Button type="button" variant="secondary" className="ml-auto w-fit">
        Add reminder
      </Button>
    </form>
  )
}

function EmptyStateSpecimen({ variant }: { variant: SurfaceVariant }) {
  return (
    <div className={variant.classes.empty}>
      <div className="flex flex-wrap items-center gap-2">
        <RoleBadge variant={variant} role="empty state" />
        <p>No reminders match these filters.</p>
      </div>
    </div>
  )
}

function InfoSpecimen({
  variant,
  label,
  value,
}: {
  variant: SurfaceVariant
  label: string
  value: string
}) {
  return (
    <div className={variant.classes.info}>
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
        <RoleBadge variant={variant} role="content surface" />
      </div>
      <div className="mt-3 text-sm font-medium leading-6">{value}</div>
    </div>
  )
}

function RoleBadge({
  variant,
  role,
}: {
  variant: SurfaceVariant
  role: SurfaceRole
}) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em]',
        variant.classes.roleLabel,
      )}
    >
      {role}
    </span>
  )
}
