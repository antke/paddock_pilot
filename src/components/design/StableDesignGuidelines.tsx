import { useState } from 'react'
import {
  CaretDownIcon,
  CheckIcon,
  ClockIcon,
  PlusIcon,
  XIcon,
} from '@phosphor-icons/react'

import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { DashboardBadgeList } from '#/components/dashboard/DashboardBadgeList'
import { DashboardPercentBadge } from '#/components/dashboard/DashboardBadges'
import {
  DashboardItemCard,
  DashboardItemBodyText,
  DashboardItemRecordCard,
  DashboardItemRecordContent,
  DashboardItemRecordFooter,
} from '#/components/dashboard/DashboardItemCard'
import type { DashboardItemAccent } from '#/components/dashboard/DashboardItemCard'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import {
  DashboardBrandWordmark,
  DashboardDisplayHeading,
} from '#/components/dashboard/DashboardDisplayHeading'
import {
  DashboardHeroSection,
  DashboardHeroTitle,
} from '#/components/dashboard/DashboardHeroSection'
import { DashboardInlineHeader } from '#/components/dashboard/DashboardInlineHeader'
import { DashboardInlinePanel } from '#/components/dashboard/DashboardInlinePanel'
import {
  DashboardLayoutGrid,
  DashboardLayoutStack,
} from '#/components/dashboard/DashboardLayoutGrid'
import { DashboardLoadingState } from '#/components/dashboard/DashboardLoadingState'
import { DashboardMetaList } from '#/components/dashboard/DashboardMetaList'
import { DashboardSectionTabGroup } from '#/components/dashboard/DashboardNavigation'
import {
  DashboardSectionCard,
  DashboardSubsection,
} from '#/components/dashboard/DashboardSectionCard'
import { DashboardTablePanel } from '#/components/dashboard/DashboardTable'
import {
  DetailGrid,
  DetailIconList,
  DetailPanelGrid,
  DetailPrintListBlock,
  DetailStack,
} from '#/components/dashboard/DetailBlocks'
import {
  CalendarDayCell,
  CalendarDayEventList,
  CalendarDayHeader,
  CalendarDayNumber,
  CalendarEventChip,
  CalendarEventChipMeta,
  CalendarEventChipTitle,
  CalendarGrid,
  CalendarMutedPill,
  CalendarShell,
  CalendarWeekdayCell,
  CalendarWeekdayRow,
} from '#/components/events/EventCalendar'
import { EventDateBadge } from '#/components/events/EventDateBadge'
import { FileUploadField } from '#/components/forms/FileUploadField'
import { FormHelpTooltip } from '#/components/forms/FormHelpTooltip'
import { InlineForm } from '#/components/forms/FormLayout'
import { FormSubmitActions } from '#/components/forms/FormSubmitActions'
import {
  HorseCardLink,
  HorseSelectionCard,
} from '#/components/horses/HorseCard'
import { RouteStatusAlert } from '#/components/layout/RouteStatusAlert'
import { CreateRecordDialog } from '#/components/list-layout/CreateRecordDialog'
import { ListFilterBar } from '#/components/list-filtering/ListFilterBar'
import {
  CareReminderCategoryBadge,
  CareReminderPriorityBadge,
  CareReminderStatusBadge,
} from '#/components/reminders/CareReminderBadges'
import type {
  ListFilterSelectedFacets,
  ListFilterUiConfig,
} from '#/components/list-filtering/listFiltering'
import {
  ActivityTimelineBody,
  ActivityTimelineCanvas,
  ActivityTimelineCaption,
  ActivityTimelineCurrentPeriodBadge,
  ActivityTimelineEventBadgeRow,
  ActivityTimelineEventBlock,
  ActivityTimelineEventText,
  ActivityTimelineEventTitle,
  ActivityTimelineGrid,
  ActivityTimelineGridPeriodButton,
  ActivityTimelineHeaderRow,
  ActivityTimelineListEntry,
  ActivityTimelineOverviewPanel,
  ActivityTimelineOverviewPeriodButton,
  ActivityTimelineOverviewRail,
  ActivityTimelineOverviewTrack,
  ActivityTimelinePeriodButton,
  ActivityTimelinePeriodLabel,
  ActivityTimelineRoot,
  ActivityTimelineScrollArea,
  ActivityTimelineTodayMarker,
  ActivityTimelineViewportPanel,
  ActivityTimelineWindow,
  ActivityTimelineWindowDrag,
  ActivityTimelineWindowHandle,
} from '#/components/timeline/ActivityTimeline'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { ChoiceButtonGroup } from '#/components/ui/choice-button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import {
  Field,
  FieldDescription,
  FieldGrid,
  FieldHeader,
  FieldHeaderContent,
  FieldLabel,
  FieldLabelRow,
  FieldLegend,
  FieldOptionGroup,
  FieldPanel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Progress } from '#/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '#/components/ui/radio-group'
import { Select } from '#/components/ui/select'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { Switch } from '#/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { TextLabel } from '#/components/ui/text-label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import { cn } from '#/lib/utils'
import type {
  CareReminderCategory,
  CareReminderPriority,
  CareReminderStatus,
} from 'shared/reminders/careReminderSchema'

type ReminderTone = 'overdue' | 'today' | 'upcoming'

type ReminderSpecimen = {
  title: string
  category: CareReminderCategory
  due: string
  horse: string
  owner: string
  description: string
  priority: CareReminderPriority
  status: CareReminderStatus
  tone: ReminderTone
}

type DemoFacetId = 'horse' | 'state' | 'category'
type GuidelineTabId = 'care' | 'timeline' | 'notes' | 'providers'

const palette = [
  ['Canvas', '--background'],
  ['Paper', '--card'],
  ['Rail', '--border'],
  ['Ink', '--foreground'],
  ['Green', '--primary'],
  ['Leather', '--secondary'],
  ['Brass', '--chart-3'],
  ['Clay', '--destructive'],
] satisfies Array<[string, string]>

const principles = [
  {
    title: 'One source of style',
    body: 'Buttons, badges, cards, tabs, fields, filters, and list rows should be styled through shared primitives.',
  },
  {
    title: 'Keep the proven layout',
    body: 'Existing dense screens already work. Preserve their structure and update rails, fill, type, radius, and state treatment.',
  },
  {
    title: 'Warm utility, not decoration',
    body: 'Use canvas backgrounds, hard working edges, sparse earth accents, and photography only where it adds real context.',
  },
]

const typographyFamilies = [
  {
    name: 'Product sans',
    token: 'font-sans',
    className: 'font-sans',
    sample: 'Paddock operations and everyday interface copy',
    use: 'Default application UI, controls, records, descriptions, and data.',
  },
  {
    name: 'Display condensed',
    token: 'font-display',
    className: 'font-display font-black uppercase',
    sample: 'FIELD OFFICE',
    use: 'Hero, page, section, and panel display headings only.',
  },
  {
    name: 'Brand serif',
    token: 'font-serif',
    className: 'font-serif font-bold',
    sample: 'Paddock Pilot',
    use: 'Brand wordmark and rare editorial accents.',
  },
  {
    name: 'Data mono',
    token: 'font-mono',
    className: 'font-mono',
    sample: '2026-07-16  •  EVT-1042',
    use: 'Tokens, code, identifiers, and technical reference values.',
  },
] as const

const typographyWeights = [
  {
    name: 'Normal',
    token: 'font-normal',
    value: '400',
    className: 'font-normal',
  },
  {
    name: 'Medium',
    token: 'font-medium',
    value: '500',
    className: 'font-medium',
  },
  {
    name: 'Semibold',
    token: 'font-semibold',
    value: '600',
    className: 'font-semibold',
  },
  { name: 'Bold', token: 'font-bold', value: '700', className: 'font-bold' },
  { name: 'Black', token: 'font-black', value: '900', className: 'font-black' },
] as const

const typographySizes = [
  { token: 'text-[0.62rem]', value: '9.92px', className: 'text-[0.62rem]' },
  { token: 'text-[0.625rem]', value: '10px', className: 'text-[0.625rem]' },
  { token: 'text-[10px]', value: '10px', className: 'text-[10px]' },
  { token: 'text-[0.68rem]', value: '10.88px', className: 'text-[0.68rem]' },
  { token: 'text-[0.7rem]', value: '11.2px', className: 'text-[0.7rem]' },
  { token: 'text-[0.72rem]', value: '11.52px', className: 'text-[0.72rem]' },
  { token: 'text-xs', value: '12px', className: 'text-xs' },
  { token: 'text-sm', value: '14px', className: 'text-sm' },
  { token: 'text-base', value: '16px', className: 'text-base' },
  { token: 'text-lg', value: '18px', className: 'text-lg' },
  { token: 'text-xl', value: '20px', className: 'text-xl' },
  { token: 'text-2xl', value: '24px', className: 'text-2xl' },
  { token: 'text-3xl', value: '30px', className: 'text-3xl' },
  { token: 'text-4xl', value: '36px', className: 'text-4xl' },
  { token: 'text-5xl', value: '48px', className: 'text-5xl' },
  { token: 'text-6xl', value: '60px', className: 'text-6xl' },
  { token: 'text-7xl', value: '72px', className: 'text-7xl' },
] as const

const typographyLineHeights = [
  { token: 'leading-none', value: '1' },
  { token: 'leading-[0.92]', value: '0.92' },
  { token: 'leading-tight', value: '1.25' },
  { token: 'leading-snug', value: '1.375' },
  { token: 'leading-normal', value: '1.5' },
  { token: 'leading-4', value: '16px' },
  { token: 'leading-5', value: '20px' },
  { token: 'leading-6', value: '24px' },
  { token: 'leading-7', value: '28px' },
] as const

const typographyRoles = [
  {
    role: 'Brand wordmark',
    owner: 'DashboardBrandWordmark',
    recipe: 'font-serif text-2xl font-bold leading-none',
    className: 'font-serif text-2xl font-bold leading-none',
    sample: 'Paddock Pilot',
  },
  {
    role: 'Hero display title',
    owner: 'DashboardHeroTitle',
    recipe:
      'font-display text-5xl sm:text-6xl lg:text-7xl font-black uppercase leading-[0.92]',
    className:
      'font-display text-5xl font-black uppercase leading-[0.92] sm:text-6xl lg:text-7xl',
    sample: 'Stable HQ',
  },
  {
    role: 'Page display title',
    owner: 'DashboardPageHeader',
    recipe:
      'font-display text-4xl sm:text-5xl font-black uppercase leading-[0.92]',
    className:
      'font-display text-4xl font-black uppercase leading-[0.92] sm:text-5xl',
    sample: 'Horses',
  },
  {
    role: 'Section title',
    owner: 'DashboardSectionHeader · section',
    recipe:
      'font-display text-3xl sm:text-4xl font-black uppercase leading-[0.92]',
    className:
      'font-display text-3xl font-black uppercase leading-[0.92] sm:text-4xl',
    sample: 'Care overview',
  },
  {
    role: 'Panel title',
    owner: 'DashboardSectionHeader · panel',
    recipe:
      'font-display text-2xl sm:text-3xl font-black uppercase leading-[0.92]',
    className:
      'font-display text-2xl font-black uppercase leading-[0.92] sm:text-3xl',
    sample: 'Horses needing attention',
  },
  {
    role: 'Nested heading',
    owner: 'DashboardInlineHeader / DashboardSubsection',
    recipe: 'font-display text-lg font-black uppercase leading-[0.95]',
    className:
      'font-display text-lg font-black uppercase leading-[0.95] tracking-normal',
    sample: 'Provider and cost',
  },
  {
    role: 'Record title',
    owner: 'DashboardItemRecordContent',
    recipe: 'text-lg font-semibold leading-snug',
    className: 'text-lg font-semibold leading-snug',
    sample: 'Annual dental examination',
  },
  {
    role: 'Dense record title',
    owner: 'DashboardItemRecordContent · dense',
    recipe: 'text-base font-medium',
    className: 'text-base font-medium',
    sample: 'Farrier reset · Juniper',
  },
  {
    role: 'Emphasized detail label',
    owner: 'DetailField · emphasis',
    recipe: 'text-base font-bold',
    className: 'text-base font-bold text-foreground/80',
    sample: 'Provider',
  },
  {
    role: 'Emphasized detail value',
    owner: 'DetailField · emphasis',
    recipe: 'text-lg font-semibold leading-7',
    className: 'text-lg font-semibold leading-7',
    sample: 'North County Equine Dental',
  },
  {
    role: 'Body copy',
    owner: 'DashboardItemBodyText',
    recipe: 'text-sm leading-6',
    className: 'text-sm leading-6',
    sample: 'Record practical notes with enough space for quick scanning.',
  },
  {
    role: 'Prominent description',
    owner: 'Page and hero descriptions',
    recipe: 'text-base font-semibold leading-7',
    className: 'text-base font-semibold leading-7 text-muted-foreground',
    sample: 'A concise explanation of the current operational context.',
  },
  {
    role: 'Metadata',
    owner: 'DashboardMetaList · sm',
    recipe: 'text-sm text-muted-foreground',
    className: 'text-sm text-muted-foreground',
    sample: 'Juniper  ·  Mae Turner  ·  Dutch Warmblood',
  },
  {
    role: 'Micro metadata',
    owner: 'DashboardMetaList · micro',
    recipe: 'text-[0.68rem] font-medium leading-4',
    className: 'text-[0.68rem] font-medium leading-4 text-muted-foreground',
    sample: 'UPDATED 12 MIN AGO',
  },
  {
    role: 'Control text',
    owner: 'Inputs and compact actions',
    recipe: 'text-sm font-medium',
    className: 'text-sm font-medium',
    sample: 'Search horses',
  },
  {
    role: 'Technical reference',
    owner: 'Style lab and identifiers',
    recipe: 'font-mono text-xs',
    className: 'font-mono text-xs',
    sample: 'eventHorseDetails.listForEvent',
  },
] as const

const componentInventory = [
  {
    group: 'Page shell',
    canonical:
      'PageLayout, AppShell primitives, appBodyClassName, AppMain, AppMainContent, Header, Footer, ThemeToggle, DashboardPage, DashboardPageHeader, DashboardHeroSection, DashboardHeroContent, DashboardHeroText, DashboardHeroTitle, DashboardHeroActions, LabRouteBoundary, LabPageShell, LabPageHeader, LabPageSectionLabel, LabPreviewSeparator, dashboard chrome helpers',
    use: 'App shell, stable pages, detail pages, internal review pages, marketing-adjacent app pages',
    status: 'Canonical',
    rule: 'Keep root shell chrome in AppShell primitives, including body typography/selection classes, sticky header, brand link, utility cluster, main wrapper, content width, and footer rhythm. Use DashboardPage gap, width, and verticalAlign props for route-level rhythm, width, and centered utility pages before adding local page stack classes. Use DashboardPageHeader title sizing and contentLayout for standard, centered, or wide-breakpoint route headers, and DashboardHeroSection with DashboardHeroContent, DashboardHeroText, DashboardHeroTitle, and DashboardHeroActions for custom hero compositions before adding local title, header flex, action rail, or hero shell classes. Use LabRouteBoundary, LabPageShell, LabPageHeader, LabPageSectionLabel, and LabPreviewSeparator, including shared DashboardActions action slots, auth/pending route treatment, and preview rails, for internal review routes before adding local panel, title, label, separator, signed-out, pending, or action-row recipes.',
  },
  {
    group: 'Public landing pages',
    canonical:
      'LandingPageShell, LandingHeroGrid, LandingHeroActionStack, LandingPreviewShell, LandingCopyBlock, LandingTitle, LandingLead, LandingSplitSection, LandingFeatureList, LandingCompactStack, LandingMutedValue, LandingCtaSection, and LandingAppPreview',
    use: 'Signed-out public page, marketing copy blocks, public hero split, app preview, public CTA bands',
    status: 'Canonical',
    rule: 'Keep public page rhythm, hero splits, landing copy typography, feature lists, muted preview values, and CTA section chrome in landing primitives before adding local landing page grid, heading, muted-copy, or CTA class recipes. Use dashboard primitives inside LandingAppPreview only through these landing wrappers when the public page needs a tailored editorial composition.',
  },
  {
    group: 'Command center',
    canonical:
      'dashboard/command-center StableCommandCenter, dashboardData, dashboardTypes, and command-center modules',
    use: 'Signed-in home dashboard, stable overview briefing, priority queue, horse roster, care board, and compact calendar composition',
    status: 'Canonical',
    rule: 'Keep production dashboard compositions in dashboard/command-center and let internal review routes import the promoted StableCommandCenter implementation. Keep command-center data shaping in dashboardData/dashboardTypes, and avoid production imports from review-route folders.',
  },
  {
    group: 'Route state',
    canonical:
      'AuthStateSwitch, DashboardLoadingState, RoutePending, Spinner, RouteStatusAlert, RouteEntityNotFoundAlert, and SignedOutRoutePrompt',
    use: 'Signed-in/out route branches, Clerk loading fallbacks, suspense pending states, sign-in prompts, not-found route states',
    status: 'Canonical',
    rule: 'Use AuthStateSwitch for Clerk loading/loaded branches, DashboardLoadingState for reusable loading surfaces, RoutePending for route-level suspense chrome, Spinner for loading glyphs and animation, RouteEntityNotFoundAlert for stable, horse, and event not-found states, RouteStatusAlert with its tone, width, description, and actions props for custom not-found/error states with shared neutral alert chrome, narrow route messages, and action-row spacing, and SignedOutRoutePrompt for sign-in prompts before adding route-local status markup, local border-left alert classes, local max-width recipes, repeated not-found copy, direct animate-spin icons, or direct Clerk loading branches.',
  },
  {
    group: 'Gated features',
    canonical: 'FeatureAccessPrompt and FeatureAccessBackLink',
    use: 'Premium feature locks, subscription upgrade CTAs, back links from unavailable feature screens',
    status: 'Canonical',
    rule: 'Use FeatureAccessPrompt for page-level premium gates so badge, card, pricing CTA, and secondary back action styling stay centralized; use FeatureAccessBackLink for the secondary return action in unavailable feature screens.',
  },
  {
    group: 'Section headers',
    canonical:
      'DashboardSection, DashboardLayoutGrid, DashboardLayoutStack, DashboardSectionHeader, DashboardSectionCard, DashboardSectionDivider, DashboardSubsection, DashboardPageHeader, and DashboardInlineHeader',
    use: 'Dashboard sections, list panels, tab sections, nested headings, card headers with actions',
    status: 'Canonical',
    rule: 'Use DashboardSection with its gap, padding, tone, chrome, contentAlign, and span props for dashboard, detail, tab, brand CTA, public app-style panel shells, and section placement before adding local app-panel, border, radius, fill, gap, col-span, padding, or content-alignment recipes; every titled DashboardSectionCard inherits the canonical display-style panel title by default, and card-like DashboardSection compositions must use size="panel" rather than a compact UI heading; reserve DashboardInlineHeader and DashboardSubsection typography for nested record, lane, or inset-surface headings only; reserve semantic accent rails for repeated DashboardItemCard records, where they communicate record type or urgency; use DashboardSection padding values, including roomy, for command-center emphasis before adding feature-local border or padding overrides; use DashboardLayoutGrid variants for equal, sidebar, split, splitWide, thirds, thirdsCompact, quarters, alert-column, and command-center section body compositions before adding local responsive grid recipes; use DashboardLayoutStack for repeated vertical page, column, and rail stacks before adding local grid gap wrappers; keep direct ui/Card, CardHeader, CardContent, CardFooter, and Separator usage inside DashboardSectionCard and DashboardSectionDivider; use DashboardSectionCard contentLayout for block, form-stack, two-column, and split-rail card bodies, contentGap for Card header/body/footer rhythm, contentTextSize for compact card bodies, and width for full-width card placement before adding local contentClassName layout, gap, text-size, or width recipes; use DashboardSectionDivider for card section breaks, DashboardSubsection for repeated compact heading-plus-content blocks inside cards or sections, DashboardSectionHeader and DashboardPageHeader contentLayout/descriptionSize/descriptionWidth plus shared badge-cluster handling for standard headers, and DashboardInlineHeader with its gap, descriptionSize, and aside badge-cluster handling for standalone compact headings before adding local header markup.',
  },
  {
    group: 'Typography labels',
    canonical:
      'ui/TextLabel, DashboardMetaList, textDisplay helpers, and numberDisplay helpers',
    use: 'Metric labels, fieldset legends, nested labels, and compact metadata strings',
    status: 'Canonical',
    rule: 'Keep muted uppercase product labels in TextLabel, rendered compact metadata strings in DashboardMetaList, string-only metadata assembly in formatMetaText/formatLineText, comma and conjunction lists in formatCommaList/formatConjunctionList, and count/plural labels in formatCountLabel; repeated tracking, separator, list joining, pluralization, and weight classes should stay out of feature files.',
  },
  {
    group: 'Domain badges',
    canonical:
      'ui/Badge, DashboardBadgeList, DashboardBadges, EventBadges, CareReminderBadges, DocumentBadges, HorseBadges, HorseCareBadges, StableBadges, and StableInvitationBadges',
    use: 'Status, priority, category, type, role, horse/stable entity labels, counts, and invitation-state chips',
    status: 'Canonical',
    rule: 'Use DashboardBadgeList for badge cluster spacing and alignment, DashboardBadges for generic count, value, percentage, and premium/plan labels, domain badge wrappers for labels and variants tied to schema values or named entities, and reserve raw Badge usage for specimen swatches and truly one-off neutral tags.',
  },
  {
    group: 'Actions',
    canonical:
      'ui/Button, ui/ButtonLink, ui/ActionGroup, DashboardActions, DashboardPageHeader action slots, DashboardSectionHeader action slots, DialogFooter, AlertDialogFooter, FormSubmitActions, and FormSubmitButtons',
    use: 'Primary CTAs, secondary links, row action groups, form footers, icon buttons, badge/action clusters',
    status: 'Canonical',
    rule: 'Keep ordinary button appearance inside ui/Button and buttonVariants, including subtle low-emphasis controls and chip-icon remove buttons; keep low-level action-row and footer spacing in ActionGroup; use DashboardActions for dashboard/header/card and public CTA action rows, including its width prop for full-width footers, DialogFooter and AlertDialogFooter for modal footers, FormSubmitActions for wrapped inline or dialog submit/cancel rows, FormSubmitButtons for compact inline submit pairs inside existing layouts, and toast action buttons routed through buttonVariants. Specialized interactive geometry, such as timeline cells, scrub handles, calendar day cells, and drag targets, should stay in its domain primitive owner rather than feature files.',
  },
  {
    group: 'Search and filters',
    canonical:
      'FilteredDashboardItemList, ListFilterLayout, ListFilterControls, getListFilterEmptyMessage, ListFilterBar, ListFilterChips, ListFilterPanel, and ListLoadMoreFooter',
    use: 'Reminders, documents, horse detail records, internal review specimens',
    status: 'Canonical',
    rule: 'Use FilteredDashboardItemList for filtered DashboardItemList sections that only need controls, filtered-empty copy, and row rendering; use ListFilterLayout with ListFilterControls when the list owner has custom split empty title/description, scroll windows, expansion actions, card-level toolbar slots, or paginated loading footers; use useListFiltering/useListQueryState for filtered state, pass hideWhenEmpty when local filtering knows totalCount, and use getListFilterEmptyMessage for no-data versus no-results empty copy outside FilteredDashboardItemList; use ListLoadMoreFooter for paginated list footers; keep first-page loading as an explicit list loading state instead of an emptyMessage string; keep ListFilterBar direct usage for controlled specimens and primitive internals only; search surface, expandable filter panel, active chip label/value typography, chip-row spacing through ActionGroup, remove buttons, clear-action styling, loading-more affordance, and filtered-empty policy all belong in the list-filtering primitives.',
  },
  {
    group: 'Record cards and rows',
    canonical:
      'DashboardItemCard helpers, DashboardItemList, DashboardItemCard, DashboardItemLinkCard, DashboardItemRecordCard, DashboardItemRecordFooter, DashboardItemMediaCard, DashboardItemActionRow, DashboardItemActionColumn, DashboardItemActions, DashboardItemCardContent, DashboardItemRecordContent, dashboard item text helpers, DashboardInlineHeader, DashboardMetaList, and DashboardSectionCard for framed panels',
    use: 'Care reminders, documents, horses, providers, events, alerts, health, medication, nutrition, timeline',
    status: 'Canonical',
    rule: 'Keep row stacks, plain item shells, route-link item shells, content-plus-action record cards, preview/media rows, full-width row footers, open/link rows, selected row state, list content alignment, row density, record title sizing, open-row title hover treatment through titleTone, compact item title sizing, inline header title size/weight, title/meta/badge layout, metadata spacing, badge cluster layout through DashboardBadgeList, centered side actions, horizontal bottom-left footer actions through actionsPlacement, compact metadata separators through DashboardMetaList, and description/body text, including muted body tone, in DashboardItemCard helpers before adding local row markup, hover-title classes, selected background/border recipes, alignment classes, text color classes, or padding overrides. Use density="compact" on DashboardItemRecordCard and DashboardItemOpenLink for dense lists. Specialized timeline, calendar, date marker, avatar, filter, and overlay geometry should stay in their own primitive owners instead of feature files.',
  },
  {
    group: 'Tables and matrices',
    canonical: 'ui/Table inside DashboardTablePanel',
    use: 'Dense comparison grids, care matrices, tabular settings or report sections',
    status: 'Canonical',
    rule: 'Use Table primitives inside DashboardTablePanel for true tabular comparisons and report matrices only; use TableHead/TableCell align props for numeric or right-aligned columns before adding local text-alignment classes; use DashboardItemCard, Detail blocks, or DashboardInlinePanel variants for dense lists, key/value summaries, and interactive rows so tables do not become a catch-all dashboard layout.',
  },
  {
    group: 'Progress and gauges',
    canonical: 'ui/Progress plus DashboardPercentBadge for the numeric value',
    use: 'Analysis coverage, documentation completeness, compact completion meters',
    status: 'Canonical',
    rule: 'Use Progress for semantic completion meters with accessible labels, pair it with DashboardPercentBadge for visible numeric values, and keep threshold decisions in feature components; timeline marks, active navigation rails, and chart scrub handles are not progress meters.',
  },
  {
    group: 'Date and schedule markers',
    canonical:
      'dateDisplay helpers, eventDisplay helpers, EventDateBadge, EventBadges, and EventRow',
    use: 'Event agenda rows, dashboard upcoming events, compact schedule previews, event type/status/recurrence badges, reminder due dates, record timestamps, timeline metadata',
    status: 'Canonical',
    rule: 'Use EventRow for linked event rows and choose its agenda, contextual, compact, or summary variant according to the surrounding date context. EventRow owns title treatment, date/time presentation, metadata formatting, badge placement, and interaction states. Use EventDateBadge for non-row schedule blocks, EventBadges for standalone event labels, and dateDisplay or eventDisplay helpers for date-key creation, month keys, today defaults, short/medium labels, ranges, date-time strings, timestamp dates, and date-key to timestamp conversion. Use formatEventDateTime before assembling local "date at time" strings. Use plain DashboardMetaList text for due dates, medication ranges, and timeline metadata instead of inventing local date tiles.',
  },
  {
    group: 'Calendars and date grids',
    canonical:
      'EventCalendar primitives, EventCalendarChrome helpers, StableEventsCalendar, and MiniCalendarCard',
    use: 'Month calendars, mini dashboard calendars, day cells, event chips, event popovers, hidden-count pills',
    status: 'Canonical',
    rule: 'Keep route month calendars in StableEventsCalendar, compact dashboard week calendars in MiniCalendarCard, visual month-grid pieces in EventCalendar primitives, and class recipes for cells, chips, selected-day panels, and week-day states in EventCalendarChrome. Feature files should not add local calendar grid, day-cell, event-chip, or selected-day style recipes.',
  },
  {
    group: 'Entity media',
    canonical:
      'HorseAvatar, HorseCard, HorseCardLink, HorseSelectionCard, DocumentPreview, DashboardItemRecordCard, and DashboardItemMediaCard for entity row shells',
    use: 'Horse rows, rosters, profile headers, document previews, full-row horse links, and horse selection grids',
    status: 'Canonical',
    rule: 'Use HorseAvatar for horse image and initial fallback frames, HorseCard for static horse identity cards, HorseCardLink whenever a horse card opens its detail page, and HorseSelectionCard for full-card selection with outline feedback. Horse collections always use the rounded bordered card treatment with card spacing; borderless line rows and chrome overrides are not supported. Horse links must make the whole card clickable and must not add a separate open button. Use DocumentPreview for uploaded document image/file fallback frames, DashboardItemRecordCard for content-plus-action entity row shells, and DashboardItemMediaCard for preview/media rows instead of local image/fallback, title-hover, selection-outline, icon-button, or row action recipes.',
  },
  {
    group: 'Detail and metric blocks',
    canonical:
      'DashboardMetric, DashboardMetricStrip, DashboardInlinePanel, DashboardInlinePanelButton, DashboardInlinePanelLink, PrintSummary primitives, DetailGrid, DetailPanelGrid, DetailStack, DetailSummaryGrid, DetailMetricBlock, DetailPanel, DetailField, DetailPrintField, DetailPrintListBlock, DetailKeyValueRow, DetailTextBlock, DetailListBlock, DetailIconList, DetailListGrid, DetailNoteBlock, DashboardEmptyState, NoStablesPrompt, and NoHorsesPrompt',
    use: 'Analysis metrics, profile panels, care contacts, timeline entries, nested detail blocks, labeled notes, labeled lists, empty states, first-run stable prompts, horse empty states',
    status: 'Canonical',
    rule: 'Use DashboardMetricStrip with DashboardMetric for summary strips; use DashboardInlinePanel and its button/link variants with stack, tight/compact padding, textSize, and tone props for inset feature panels and highlighted action panels, DetailGrid, DetailPanelGrid, DetailStack, DetailSummaryGrid, and detail block components for labeled values, summary/divided rows, compact key/value rows, grouped panel layouts, detail sub-stacks, printable fields and lists, prose notes, labeled lists, semantic icon lists, paired list grids, framed empty states, and DashboardEmptyState spacing for bare inline fallbacks before dropping to dashboardInlinePanelClassName. Use DetailMetricBlock size="compact" for dense metric cells before adding local metric grid or value margin overrides. Use DetailField, DetailDisplayField, DetailSummaryField, DetailPanel, and DetailNoteBlock span props for known detail-grid spanning before adding local col-span utilities. Use PrintSummaryPage, PrintSummaryHeader, PrintSummarySection, PrintSummaryEmptyState, PrintSummaryRecordPanel, PrintSummaryRecordHeader, PrintSummaryBodyText, and PrintSummaryScreenOnly for print-friendly routes before adding local print chrome classes; use DetailPrintField and DetailPrintListBlock for print-friendly field and list content before adding local print label or bullet-list recipes. Use DetailKeyValueRow valueTone, DetailIconList iconTone, and detailToneTextClassNames for semantic detail values/icons instead of raw red/green utilities. Keep dashboardInlinePanelClassName inside primitive or specialized owner files only. Use DetailPanel gap before adding local grouped-panel spacing. Use NoStablesPrompt default copy for shared first-run stable CTAs unless the route needs contextual dashboard copy, and use NoHorsesPrompt with stableId for shared horse-empty states and add-horse CTAs.',
  },
  {
    group: 'Charts and planning rails',
    canonical:
      'ActivityTimeline primitives, ActivityTimelineListEntry, StableActivityTimelineChart, DashboardEmptyState, and Badge',
    use: 'Analysis timelines, dense schedule planning, scroll overview rails, period markers',
    status: 'Canonical',
    rule: 'Keep chart math local, but route timeline roots, viewport panels, sticky period headers, period labels, period tags, period grid cells, event blocks, event text rows, event badge rows, overview tracks, visible-window controls, captions, empty states, chronological list entries, and tags through ActivityTimeline primitives before adding chart-local rail, list-entry shell, or block classes. Timeline buttons are geometric selection and drag surfaces, not ordinary CTAs, so their custom button chrome belongs in ActivityTimeline primitives only.',
  },
  {
    group: 'State labels',
    canonical:
      'ui/Badge variants, size variants, DashboardBadgeList, DashboardBadges, EventBadges, HorseBadges, HorseCareBadges, CareReminderBadges, DocumentBadges, StableBadges, and StableInvitationBadges',
    use: 'Priority, status, category, counts, plan labels, provider type, reminder category/priority/status, event type/status/recurrence, health issue severity/status, medication status',
    status: 'Canonical',
    rule: 'Keep color semantics, compact row labels, counters, and micro tags inside Badge; use semanticBadgeVariants for shared severity/attention mappings, DashboardBadgeList props for wrap spacing and alignment, DashboardBadges for generic counts, values, percentages, and plan labels, CareReminderBadges for reminder labels, EventBadges for event labels, HorseBadges for horse entity/count labels, HorseCareBadges for health, medication, weight, nutrition, or timeline labels, DocumentBadges for document labels, and StableBadges or StableInvitationBadges for stable-domain labels before adding local badge maps or badge cluster classes.',
  },
  {
    group: 'Tabs and segmented nav',
    canonical:
      'ui/Tabs, DashboardNavigation, DashboardNavigationLinkItem, DashboardNavigationMenuGroup, DashboardNavigationMenuLink, DashboardNavigationMenuButton, DashboardSectionTabs, DashboardSectionTabGroup, NavigationMenuButtonLink, ToggleGroup',
    use: 'Horse detail sections, settings, forms, care/timeline/notes/providers',
    status: 'Canonical',
    rule: 'Use DashboardSectionTabGroup for tabs paired with a dashboard section, DashboardSectionTabs for standalone minor-section switches, DashboardNavigation with DashboardNavigationLinkItem variant section for persistent major route tabs, and TabsList variant section for major page or form sections. Reserve default Tabs for compact mode switches such as Simple and Advanced. Use DashboardNavigation align and alignMode props for responsive or always-end placement, DashboardNavigationMenuGroup with contentWidth plus DashboardNavigationMenuLink or DashboardNavigationMenuButton for dropdown navigation shells, and ToggleGroup with its wrap prop for compact choices; keep list wrapping, menu widths, alignment, and segmented chrome out of route files.',
  },
  {
    group: 'Forms',
    canonical:
      'RouteFormCard, RouteFormActions, InlineForm, FormGroup, FormSection, FormTabsContent, SelectableCardField, SelectableCardCheckbox, SelectableCardLabel, DashboardInlineForm, DashboardInlineField, CreateRecordDialog, RecordDialog primitives, Field, FieldGroup, FieldGrid, FieldPanel, FieldDescription, FieldLabelRow, FieldHeader, FieldHeaderContent, FieldOptionGroup, FieldInlineControl, FieldInlineText, FileUploadField, Input, Select, Textarea, Checkbox, RadioGroup, ChoiceButtonGroup, FormSubmitActions, and FormSubmitButtons',
    use: 'Stable, horse, event, provider, reminder, document workflows',
    status: 'Canonical',
    rule: 'Use RouteFormCard for create/edit routes, including its contentGap prop for route-form body rhythm, RouteFormActions for page form footers, and InlineForm or DashboardInlineForm for embedded forms. Split a manageable form into always-visible FormGroup sections; reserve animated FormSection accordions for forms whose field count is genuinely difficult to scan, and keep the first or most essential section open. Use InlineForm layout for known compact inline compositions, FormTabsContent only when the content represents genuinely separate views rather than sequential form data, SelectableCardField, SelectableCardCheckbox, and SelectableCardLabel for generic checkbox/radio rows that wrap a full card, and HorseSelectionCard for horse pickers so selection is represented by the card outline rather than an adjacent control. Use CreateRecordDialog with RecordDialog primitives for dialog create flows, FieldGroup with its gap prop for vertical field stacks, FieldGrid for responsive field columns, FieldPanel with its gap prop for inset form groups, FieldDescription for block helper copy, FieldLabel width and interactive props for full-width clickable labels, FieldLabelRow for labels paired with help or tooltip controls, FieldHeader and FieldHeaderContent for fieldset legends or labels paired with an aside badge/action, FieldOptionGroup for wrapped radio or checkbox option clusters, FieldInlineControl for compact input-prefix-suffix rows, FieldInlineText for muted inline prefixes and suffixes, Input width and Textarea minHeight for control sizing, FileUploadField for file inputs with optional help, DashboardInlineField for selectable rows, and FormSubmitActions or FormSubmitButtons for cancel/submit rows before adding local grid, spacing, dialog sizing, helper-text classes, label/help flex rows, field-header flex rows, option-cluster flex rows, inline-control flex rows, file-input field recipes, compact input width recipes, control-size recipes, or floating-trigger recipes.',
  },
  {
    group: 'Feedback and overlays',
    canonical:
      'Dialog, DialogHeader, DialogTitle, DialogDescription, CreateRecordDialog, RecordDialog primitives, AlertDialog, DropdownMenu, Tooltip, Alert, Sonner, Spinner, showAppSuccessToast, showAppErrorToast, and showAppValidationToast',
    use: 'Create flows, destructive confirms, upload states, toast feedback',
    status: 'Canonical',
    rule: 'Use dialog title and description typography from the dialog primitive rather than local heading classes; use CreateRecordDialog and RecordDialog primitives for record-create trigger/content chrome; use Alert for inline feedback, DropdownMenu and Tooltip for transient controls, the local Toaster for feedback chrome, toast placement, action styling, and Spinner-powered loading icons, showAppSuccessToast for operation success feedback, showAppErrorToast for mutation or operation failures, and showAppValidationToast for form validation messages before adding repeated toast.success/toast.error copy.',
  },
] satisfies Array<{
  group: string
  canonical: string
  use: string
  status: 'Canonical' | 'Started' | 'Audit'
  rule: string
}>

const reminders = [
  {
    title: 'Hoof trim follow-up',
    category: 'farrier',
    due: 'Due 18 Jun',
    horse: 'Maple',
    owner: 'Farrier note',
    description:
      'Check left fore after the farrier visit. Add a note if she is still short on the lane.',
    priority: 'high',
    status: 'pending',
    tone: 'overdue',
  },
  {
    title: 'Worming schedule',
    category: 'medication',
    due: 'Due today',
    horse: 'Willow',
    owner: 'Vet protocol',
    description:
      'Confirm weight estimate before dose. Provider note is attached to the horse record.',
    priority: 'medium',
    status: 'pending',
    tone: 'today',
  },
  {
    title: 'Feed review',
    category: 'nutrition',
    due: '24 Jun',
    horse: 'Juniper',
    owner: 'Stable manager',
    description:
      'Review evening ration after two weeks on the lower starch mix.',
    priority: 'low',
    status: 'pending',
    tone: 'upcoming',
  },
] satisfies Array<ReminderSpecimen>

const filterConfig = {
  searchLabel: 'Search reminders',
  searchPlaceholder: 'Search title, notes, horse, or category',
  facets: [
    {
      id: 'horse',
      label: 'Horse',
      allLabel: 'All horses',
      options: [
        { value: 'maple', label: 'Maple' },
        { value: 'willow', label: 'Willow' },
        { value: 'juniper', label: 'Juniper' },
      ],
    },
    {
      id: 'state',
      label: 'State',
      allLabel: 'All states',
      options: [
        { value: 'overdue', label: 'Overdue' },
        { value: 'today', label: 'Today' },
        { value: 'upcoming', label: 'Upcoming' },
      ],
    },
    {
      id: 'category',
      label: 'Category',
      allLabel: 'All categories',
      options: [
        { value: 'hoof', label: 'Hoof care' },
        { value: 'medication', label: 'Medication' },
        { value: 'nutrition', label: 'Nutrition' },
      ],
    },
  ],
} satisfies ListFilterUiConfig<DemoFacetId>

const guidelineTabs = [
  { id: 'care', label: 'Care' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'notes', label: 'Notes' },
  { id: 'providers', label: 'Providers' },
] satisfies Array<{ id: GuidelineTabId; label: string }>

export function StableDesignGuidelines() {
  return (
    <div className="relative left-1/2 min-h-screen w-screen -translate-x-1/2 bg-background text-foreground">
      <div className="mx-auto grid max-w-[90rem] gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <GuidelineHeader />
        <PrinciplesSection />
        <FoundationSection />
        <TypographyInventorySection />
        <ComponentSpecimens />
        <CareTemplateSection />
        <InventorySection />
        <RolloutSection />
      </div>
    </div>
  )
}

function GuidelineHeader() {
  return (
    <DashboardHeroSection className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-stretch">
      <div className="grid content-between gap-8">
        <div className="grid max-w-4xl gap-4">
          <DashboardHeroTitle>Warm utility system</DashboardHeroTitle>
          <p className="max-w-3xl text-base font-semibold leading-7 text-muted-foreground">
            The app should feel practical, familiar, and horse-world adjacent
            without falling into antique styling. This page is the working
            template for shared primitives, dense record screens, and rollout
            rules.
          </p>
        </div>

        <DashboardActions align="start">
          <Button type="button">
            <PlusIcon data-icon="inline-start" weight="bold" />
            Primary action
          </Button>
          <Button type="button" variant="outline">
            Secondary action
          </Button>
        </DashboardActions>
      </div>

      <DashboardInlinePanel
        chrome="soft"
        padding="none"
        className="min-h-64 overflow-hidden"
      >
        <img
          src="/design-moodboards/stable-field-office-hero.png"
          alt="Chestnut horse outside a warm stable yard"
          className="h-full w-full object-cover"
        />
      </DashboardInlinePanel>
    </DashboardHeroSection>
  )
}

function PrinciplesSection() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {principles.map((principle) => (
        <DashboardSectionCard
          key={principle.title}
          title={principle.title}
          description={principle.body}
        />
      ))}
    </section>
  )
}

function FoundationSection() {
  return (
    <section className="grid items-start gap-6">
      <DashboardSectionCard
        title="Foundation Tokens"
        description="These are the app-level values other components should consume. Avoid local theme variables unless a component has a real semantic reason to introduce one."
        contentLayout="block"
      >
        <DetailStack gap="loose">
          <DetailGrid columns={4}>
            {palette.map(([name, token]) => (
              <DashboardInlinePanel key={token} padding="tight" stack="default">
                <div
                  className="h-16 border border-border-subtle"
                  style={{ backgroundColor: `var(${token})` }}
                />
                <div>
                  <p className="font-semibold">{name}</p>
                  <p className="text-xs text-muted-foreground">{token}</p>
                </div>
              </DashboardInlinePanel>
            ))}
          </DetailGrid>

          <DetailPanelGrid variant="equal">
            <DashboardInlinePanel stack="compact" textSize="sm">
              <TextLabel as="p">Panel grids</TextLabel>
              <p className="text-muted-foreground">
                Grouped detail panels should use DetailPanelGrid before adding
                local responsive grid recipes.
              </p>
            </DashboardInlinePanel>
            <DashboardInlinePanel stack="compact" textSize="sm">
              <TextLabel as="p">Icon lists</TextLabel>
              <DetailIconList
                icon={CheckIcon}
                iconTone="positive"
                items={[
                  'Use DetailStack before local gap utilities',
                  'Use DetailIconList before custom icon rows',
                ]}
              />
            </DashboardInlinePanel>
            <DashboardInlinePanel stack="compact" textSize="sm">
              <TextLabel as="p">Print summaries</TextLabel>
              <DetailPrintListBlock
                label="Care handoff list"
                items={['Morning feed confirmed', 'Vet packet attached']}
              />
            </DashboardInlinePanel>
          </DetailPanelGrid>
        </DetailStack>
      </DashboardSectionCard>
    </section>
  )
}

function TypographyInventorySection() {
  return (
    <DashboardLayoutStack as="section" id="typography-system" gap="compact">
      <DashboardSectionCard
        as="h2"
        size="page"
        title="Typography System"
        description="A source-wide inventory of the type families, semantic roles, weights, sizes, line heights, and casing currently used by the application. Use the role names when reviewing or assigning typography."
      />

      <DashboardSectionCard
        title="Semantic roles"
        description="These recurring text treatments are already owned by shared components. Choose a role first; use a raw utility only when no semantic owner fits."
        contentGap="compact"
      >
        {typographyRoles.map((item) => (
          <DashboardItemCard
            key={item.role}
            density="compact"
            className="grid min-w-0 gap-4 overflow-hidden lg:grid-cols-[12rem_minmax(0,1fr)_minmax(15rem,0.7fr)] lg:items-center"
          >
            <div className="min-w-0">
              <TextLabel as="p" weight="black" tracking="none">
                {item.role}
              </TextLabel>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {item.owner}
              </p>
            </div>
            <div className="min-w-0 overflow-hidden py-1">
              <p className={cn('break-words', item.className)}>{item.sample}</p>
            </div>
            <code className="break-words font-mono text-xs leading-5 text-muted-foreground">
              {item.recipe}
            </code>
          </DashboardItemCard>
        ))}
      </DashboardSectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardSectionCard
          title="Font families"
          description={`${typographyFamilies.length} families appear in the source. Sans remains the product default; the other families have narrow jobs.`}
          contentGap="compact"
        >
          {typographyFamilies.map((item) => (
            <DashboardItemCard
              key={item.token}
              density="compact"
              className="grid gap-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <TextLabel as="p" weight="black" tracking="none">
                  {item.name}
                </TextLabel>
                <code className="font-mono text-xs text-muted-foreground">
                  {item.token}
                </code>
              </div>
              <p className={cn('text-xl leading-tight', item.className)}>
                {item.sample}
              </p>
              <p className="text-xs leading-5 text-muted-foreground">
                {item.use}
              </p>
            </DashboardItemCard>
          ))}
        </DashboardSectionCard>

        <DashboardSectionCard
          title="Font weights"
          description={`${typographyWeights.length} weights are active. Most interface hierarchy should stay between medium and bold; black is reserved for display and emphatic labels.`}
          contentGap="compact"
        >
          {typographyWeights.map((item) => (
            <DashboardItemCard
              key={item.token}
              density="compact"
              className="grid gap-2 sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:items-center"
            >
              <div>
                <TextLabel as="p" weight="black" tracking="none">
                  {item.name}
                </TextLabel>
                <p className="font-mono text-xs text-muted-foreground">
                  {item.value}
                </p>
              </div>
              <p className={cn('text-base', item.className)}>
                Stable records stay easy to scan.
              </p>
              <code className="font-mono text-xs text-muted-foreground">
                {item.token}
              </code>
            </DashboardItemCard>
          ))}
        </DashboardSectionCard>
      </div>

      <DashboardSectionCard
        title="Complete size scale"
        description={`${typographySizes.length} size utilities were found in application source. The six sub-xs values are specialist microcopy sizes; the standard scale carries the main hierarchy.`}
        contentGap="compact"
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {typographySizes.map((item) => (
            <DashboardItemCard
              key={item.token}
              density="compact"
              className="grid min-w-0 gap-4 overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <code className="font-mono text-xs font-semibold">
                  {item.token}
                </code>
                <Badge variant="outline">{item.value}</Badge>
              </div>
              <p
                className={cn(
                  'max-w-full overflow-hidden whitespace-nowrap leading-none',
                  item.className,
                )}
                aria-label={`Sample at ${item.value}`}
              >
                Aa 012
              </p>
            </DashboardItemCard>
          ))}
        </div>
      </DashboardSectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardSectionCard
          title="Line heights"
          description={`${typographyLineHeights.length} line-height utilities are active, from compressed display headings to readable multi-line body copy.`}
          contentGap="compact"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {typographyLineHeights.map((item) => (
              <DashboardItemCard
                key={item.token}
                density="compact"
                className="grid gap-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <code className="font-mono text-xs font-semibold">
                    {item.token}
                  </code>
                  <Badge variant="outline">{item.value}</Badge>
                </div>
                <p className={cn('text-sm', item.token)}>
                  A two-line sample shows
                  <br />
                  the actual vertical rhythm.
                </p>
              </DashboardItemCard>
            ))}
          </div>
        </DashboardSectionCard>

        <DashboardSectionCard
          title="Case and tracking"
          description="The source uses natural case for product copy and uppercase for compact labels or display headings. Letter spacing stays neutral."
          contentGap="compact"
        >
          <DashboardItemCard density="compact" className="grid gap-2">
            <TextLabel as="p" weight="black" tracking="none">
              Natural case
            </TextLabel>
            <p className="text-base font-semibold tracking-normal">
              Stable records and interface actions
            </p>
            <code className="font-mono text-xs text-muted-foreground">
              normal case · tracking-normal
            </code>
          </DashboardItemCard>
          <DashboardItemCard density="compact" className="grid gap-2">
            <TextLabel as="p" size="sm" weight="black" tracking="none">
              Uppercase UI label
            </TextLabel>
            <code className="font-mono text-xs text-muted-foreground">
              TextLabel · uppercase · tracking-normal
            </code>
          </DashboardItemCard>
          <DashboardItemCard density="compact" className="grid gap-2">
            <DashboardDisplayHeading as="p" scale="section">
              Uppercase display
            </DashboardDisplayHeading>
            <code className="font-mono text-xs text-muted-foreground">
              font-display · font-black · uppercase · leading-[0.92]
            </code>
          </DashboardItemCard>
          <DashboardItemCard density="compact" className="grid gap-2">
            <DashboardBrandWordmark className="text-3xl">
              Paddock Pilot
            </DashboardBrandWordmark>
            <code className="font-mono text-xs text-muted-foreground">
              Brand exception · serif · natural case
            </code>
          </DashboardItemCard>
        </DashboardSectionCard>
      </div>
    </DashboardLayoutStack>
  )
}

function ComponentSpecimens() {
  const [activeGuidelineTab, setActiveGuidelineTab] =
    useState<GuidelineTabId>('care')
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)

  return (
    <section className="grid items-start gap-6">
      <DashboardSectionCard
        title="Global Primitives"
        description="Use these primitives directly. Do not repeat button, badge, field, card, or tab class recipes in feature files."
        className="order-2"
        contentGap="loose"
      >
        <div className="grid gap-3">
          <TextLabel as="p" size="sm" weight="black" tracking="none">
            Text labels
          </TextLabel>
          <div className="grid gap-2 sm:grid-cols-3">
            <DashboardItemCard chrome="soft">
              <TextLabel>Metric label</TextLabel>
              <p className="mt-3 text-xl font-semibold tracking-normal">
                14 hands
              </p>
            </DashboardItemCard>
            <DashboardItemCard chrome="soft">
              <TextLabel as="h3" size="sm" weight="semibold">
                Panel heading
              </TextLabel>
              <p className="mt-3 text-sm text-muted-foreground">
                Compact detail panels use the same muted label rhythm.
              </p>
            </DashboardItemCard>
            <DashboardItemCard chrome="soft">
              <TextLabel weight="black" tracking="tight">
                Guideline label
              </TextLabel>
              <p className="mt-3 text-sm text-muted-foreground">
                Use tighter tracking only for guideline, section, or
                documentation labels.
              </p>
            </DashboardItemCard>
          </div>
        </div>

        <div className="grid gap-3">
          <TextLabel as="p" size="sm" weight="black" tracking="none">
            Buttons
          </TextLabel>
          <DashboardActions align="start">
            <Button type="button">Default</Button>
            <Button type="button" variant="outline">
              Outline
            </Button>
            <Button type="button" variant="secondary">
              Secondary
            </Button>
            <Button type="button" variant="ghost">
              Ghost
            </Button>
            <Button type="button" variant="subtle">
              Subtle
            </Button>
            <Button type="button" variant="destructive">
              Destructive
            </Button>
          </DashboardActions>
          <DashboardInlinePanel
            chrome="soft"
            padding="tight"
            className="flex flex-wrap items-center justify-between gap-3"
          >
            <div className="grid gap-1">
              <TextLabel as="p" size="micro" weight="semibold">
                Icon actions
              </TextLabel>
              <p className="text-xs text-muted-foreground">
                Compact dismiss and floating-create geometry.
              </p>
            </div>
            <DashboardActions align="start">
              <Button type="button" variant="subtle" size="chip-icon">
                <XIcon weight="bold" aria-hidden={true} />
                <span className="sr-only">Remove filter</span>
              </Button>
              <Button type="button" variant="secondary" size="fab">
                <PlusIcon weight="bold" aria-hidden={true} />
                <span className="sr-only">Floating create action</span>
              </Button>
            </DashboardActions>
          </DashboardInlinePanel>
        </div>

        <div className="grid gap-3">
          <TextLabel as="p" size="sm" weight="black" tracking="none">
            Badges
          </TextLabel>
          <div className="grid gap-3">
            <DashboardBadgeList>
              <Badge>Default</Badge>
              <Badge variant="secondary">Scheduled</Badge>
              <Badge variant="outline">Hoof care</Badge>
              <Badge variant="success">Completed</Badge>
              <Badge variant="warning">Due soon</Badge>
              <Badge variant="info">Active</Badge>
              <Badge variant="neutral">Dismissed</Badge>
              <Badge variant="destructive">Overdue</Badge>
            </DashboardBadgeList>

            <DashboardInlinePanel
              chrome="soft"
              padding="tight"
              className="grid grid-cols-3 gap-3"
            >
              <BadgeSizeSpecimen label="Semantic" size="default">
                Allergy
              </BadgeSizeSpecimen>
              <BadgeSizeSpecimen label="Timeline" size="micro">
                Current
              </BadgeSizeSpecimen>
              <BadgeSizeSpecimen label="Count" size="count">
                3
              </BadgeSizeSpecimen>
            </DashboardInlinePanel>
          </div>
        </div>

        <div className="grid gap-3">
          <TextLabel as="p" size="sm" weight="black" tracking="none">
            Date markers
          </TextLabel>
          <div className="flex flex-wrap items-start gap-3">
            <EventDateBadge date="2026-06-18" time="09:30" />
            <EventDateBadge date="2026-06-21" variant="rail" />
            <EventDateBadge date="2026-07-04" time="14:00" variant="hero" />
          </div>
        </div>

        <div className="grid gap-3">
          <TextLabel as="p" size="sm" weight="black" tracking="none">
            Calendar grid
          </TextLabel>
          <CalendarShell>
            <CalendarWeekdayRow>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
                (weekday) => (
                  <CalendarWeekdayCell key={weekday}>
                    {weekday}
                  </CalendarWeekdayCell>
                ),
              )}
            </CalendarWeekdayRow>
            <CalendarGrid>
              {[
                { day: 18, events: [['Hoof trim', '09:30']] },
                { day: 19, events: [] },
                { day: 20, events: [['Dentist', '13:00']] },
                { day: 21, events: [] },
                { day: 22, events: [['Vaccination', '10:15']] },
                { day: 23, events: [] },
                { day: 24, events: [['Bodywork', '11:45']] },
              ].map(({ day, events }) => (
                <CalendarDayCell key={day} isToday={day === 18}>
                  <CalendarDayHeader>
                    <CalendarDayNumber isToday={day === 18}>
                      {day}
                    </CalendarDayNumber>
                    {events.length > 1 && (
                      <Badge size="count" variant="secondary">
                        {events.length}
                      </Badge>
                    )}
                  </CalendarDayHeader>
                  <CalendarDayEventList>
                    {events.map(([title, time]) => (
                      <CalendarEventChip key={title}>
                        <CalendarEventChipTitle>{title}</CalendarEventChipTitle>
                        <CalendarEventChipMeta>{time}</CalendarEventChipMeta>
                      </CalendarEventChip>
                    ))}
                    {events.length === 0 && (
                      <CalendarMutedPill>Clear</CalendarMutedPill>
                    )}
                  </CalendarDayEventList>
                </CalendarDayCell>
              ))}
            </CalendarGrid>
          </CalendarShell>
        </div>

        <PlanningRailSpecimen />

        <div id="chronological-rail" className="grid gap-3">
          <TextLabel as="p" size="sm" weight="black" tracking="none">
            Chronological rail
          </TextLabel>
          <div>
            <ActivityTimelineListEntry
              accent="danger"
              badges={<Badge variant="destructive">Health</Badge>}
              title="Heat noted in left foreleg"
              meta={<span>Today · 08:20</span>}
              description="Monitor after turnout and add the vet outcome to the record."
            />
            <ActivityTimelineListEntry
              accent="warning"
              badges={<Badge variant="warning">Medication</Badge>}
              title="Anti-inflammatory course started"
              meta={<span>8 Jul · Prescribed by Dr Cole</span>}
            />
            <ActivityTimelineListEntry
              accent="muted"
              badges={<Badge variant="neutral">Completed</Badge>}
              title="Dental float"
              meta={<span>1 Jul · 11:00</span>}
            />
          </div>
        </div>

        <div className="grid gap-3">
          <TextLabel as="p" size="sm" weight="black" tracking="none">
            Progress
          </TextLabel>
          <DashboardSubsection
            title="Completion notes"
            aside={<DashboardPercentBadge value={82} />}
            className="text-sm"
            gap="compact"
            titleWeight="semibold"
          >
            <Progress value={82} label="Completion note coverage" />
          </DashboardSubsection>
        </div>

        <div className="grid gap-3">
          <TextLabel as="p" size="sm" weight="black" tracking="none">
            Tables
          </TextLabel>
          <DashboardTablePanel>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Care type</TableHead>
                  <TableHead>Last done</TableHead>
                  <TableHead align="right">Open</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ['Farrier', '12 Jun', '2'],
                  ['Vaccination', '03 May', '1'],
                  ['Dental', '18 Apr', '0'],
                ].map(([careType, lastDone, open]) => (
                  <TableRow key={careType}>
                    <TableCell className="font-semibold">{careType}</TableCell>
                    <TableCell>{lastDone}</TableCell>
                    <TableCell align="right">
                      <Badge size="count" variant="secondary">
                        {open}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DashboardTablePanel>
        </div>

        <div className="grid gap-3">
          <TextLabel as="p" size="sm" weight="black" tracking="none">
            Status surfaces
          </TextLabel>
          <div className="grid gap-2 lg:grid-cols-3">
            <DashboardLoadingState
              className="min-h-32"
              label="Loading stable records"
            />
            <DashboardEmptyState chrome="soft" title="No records yet">
              Empty, loading, and unavailable states should use shared surfaces
              before feature files add local placeholder chrome.
            </DashboardEmptyState>
            <RouteStatusAlert
              tone="warning"
              title="Review needed"
              className="min-h-32"
            >
              Route-level warnings and missing data states should use the shared
              neutral alert surface instead of local border-left recipes.
            </RouteStatusAlert>
          </div>
        </div>

        <div className="grid gap-3">
          <TextLabel as="p" size="sm" weight="black" tracking="none">
            Section layout grids
          </TextLabel>
          <DashboardLayoutGrid variant="sidebar">
            <DashboardInlinePanel stack="compact">
              <TextLabel as="p" size="micro" weight="semibold">
                Primary area
              </TextLabel>
              <p className="text-sm text-muted-foreground">
                Use the sidebar variant for calendar-plus-summary or
                content-plus-rail dashboard sections.
              </p>
            </DashboardInlinePanel>
            <DashboardInlinePanel stack="compact">
              <TextLabel as="p" size="micro" weight="semibold">
                Side rail
              </TextLabel>
              <p className="text-sm text-muted-foreground">
                Rail widths and responsive breakpoints stay inside the layout
                helper.
              </p>
            </DashboardInlinePanel>
          </DashboardLayoutGrid>
          <DashboardLayoutGrid variant="alertColumns">
            {['Attention', 'Due', 'Planned', 'Gaps'].map((label) => (
              <DashboardInlinePanel key={label} padding="tight">
                <DashboardInlineHeader
                  title={label}
                  titleSize="sm"
                  aside={<DashboardPercentBadge value={25} />}
                />
              </DashboardInlinePanel>
            ))}
          </DashboardLayoutGrid>
          <DashboardLayoutGrid variant="thirds">
            {['Trend', 'Cadence', 'Frequency'].map((label) => (
              <DashboardInlinePanel key={label} padding="tight">
                <TextLabel as="p" size="micro" weight="semibold">
                  {label}
                </TextLabel>
                <p className="text-sm text-muted-foreground">
                  Dense dashboard families use shared grid variants before
                  adding local responsive recipes.
                </p>
              </DashboardInlinePanel>
            ))}
          </DashboardLayoutGrid>
        </div>

        <div className="grid gap-3">
          <TextLabel as="p" size="sm" weight="black" tracking="none">
            Fields
          </TextLabel>
          <FieldGrid breakpoint="sm" gap="compact">
            <Field>
              <FieldLabelRow>
                <FieldLabel htmlFor="guideline-horse">Horse</FieldLabel>
                <FormHelpTooltip label="About field label rows">
                  Pair field labels with help controls through FieldLabelRow so
                  tooltip spacing stays consistent.
                </FormHelpTooltip>
              </FieldLabelRow>
              <Input
                id="guideline-horse"
                readOnly
                value="Maple"
                aria-label="Horse"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="guideline-state">State</FieldLabel>
          <Select id="guideline-state" value="today" disabled>
                <option value="today">Due today</option>
                <option value="overdue">Overdue</option>
              </Select>
            </Field>
          </FieldGrid>
          <FileUploadField
            id="guideline-file"
            name="guideline-file"
            label="Profile file"
            help="Use FileUploadField for file inputs with optional help copy."
            accept="image/*,.pdf"
            disabled
            onFilesChange={() => {}}
          />
          <FieldHeader>
            <FieldHeaderContent>
              <FieldLegend>Selectable horses</FieldLegend>
              <p className="text-sm text-muted-foreground">
                Use FieldHeader when a fieldset title needs an aside badge or
                compact action.
              </p>
            </FieldHeaderContent>
            <Badge variant="neutral">2 selected</Badge>
          </FieldHeader>
          <FieldPanel>
            <p className="text-sm font-semibold">Field panel</p>
            <p className="text-sm text-muted-foreground">
              Use for nested edit forms, saved helpers, and compact form assists
              inside an existing card.
            </p>
          </FieldPanel>
          <FieldOptionGroup>
            {['Mare', 'Gelding', 'Stallion'].map((option) => (
              <Field key={option} orientation="horizontal">
                <span className="size-4 rounded-full border border-input bg-card" />
                <FieldLabel>{option}</FieldLabel>
              </Field>
            ))}
          </FieldOptionGroup>
        </div>

        <FeedbackOverlaySpecimen
          dialogOpen={feedbackDialogOpen}
          onDialogOpenChange={setFeedbackDialogOpen}
        />

        <div className="grid gap-3">
          <TextLabel as="p" size="sm" weight="black" tracking="none">
            Entity media
          </TextLabel>
          <div className="grid gap-2">
            <HorseCardLink
              horse={{
                name: 'Maple',
                ownerName: 'Avery Stone',
                breed: 'Quarter Horse',
              }}
              stableId="stable-guideline"
              horseId="horse-maple"
            />
            <HorseSelectionCard
              id="guideline-horse-juniper"
              horse={{
                name: 'Juniper',
                ownerName: 'Leah Reed',
                breed: 'Cob',
              }}
              checked
              onCheckedChange={() => undefined}
            />
          </div>
        </div>
      </DashboardSectionCard>

      <DashboardSectionCard
        title="Navigation and Filters"
        description="Tabs and list filters are canonical patterns. Their layout should stay consistent across pages."
        className="order-1"
        contentGap="loose"
      >
        <DashboardSectionTabGroup
          activeId={activeGuidelineTab}
          items={guidelineTabs}
          onSelect={setActiveGuidelineTab}
          inset={false}
        >
          <p className="text-sm text-muted-foreground">
            Use section tabs for peer sections on a record, not for isolated
            filters or unrelated actions.
          </p>
        </DashboardSectionTabGroup>

        <FilterSpecimen />

        <PrimitiveControlSpecimen />
      </DashboardSectionCard>
    </section>
  )
}

function BadgeSizeSpecimen({
  label,
  size,
  children,
}: {
  label: string
  size: 'default' | 'micro' | 'count'
  children: string
}) {
  const variant =
    size === 'micro' ? 'success' : size === 'default' ? 'neutral' : 'default'

  return (
    <div className="grid justify-items-start gap-1.5">
      <TextLabel as="p" size="micro" weight="semibold">
        {label}
      </TextLabel>
      <Badge variant={variant} size={size}>
        {children}
      </Badge>
    </div>
  )
}

function PlanningRailSpecimen() {
  const periods = [
    { label: 'Jun 17', density: 0.22, active: false },
    { label: 'Jun 18', density: 0.9, active: true },
    { label: 'Jun 19', density: 0.45, active: false },
  ]
  const gridTemplateColumns = `repeat(${periods.length}, minmax(9rem, 1fr))`

  return (
    <div className="grid gap-3">
      <TextLabel as="p" size="sm" weight="black" tracking="none">
        Planning rails
      </TextLabel>
      <ActivityTimelineRoot className="min-h-0">
        <ActivityTimelineViewportPanel>
          <ActivityTimelineScrollArea className="max-h-none overflow-hidden">
            <ActivityTimelineCanvas>
              <ActivityTimelineHeaderRow style={{ gridTemplateColumns }}>
                {periods.map((period) => (
                  <ActivityTimelinePeriodButton
                    key={period.label}
                    selected={period.active}
                  >
                    {period.active && (
                      <ActivityTimelineCurrentPeriodBadge>
                        Today
                      </ActivityTimelineCurrentPeriodBadge>
                    )}
                    <TextLabel size="micro" weight="semibold">
                      Day
                    </TextLabel>
                    <ActivityTimelinePeriodLabel>
                      {period.label}
                    </ActivityTimelinePeriodLabel>
                  </ActivityTimelinePeriodButton>
                ))}
              </ActivityTimelineHeaderRow>

              <ActivityTimelineBody className="h-32">
                <ActivityTimelineGrid style={{ gridTemplateColumns }}>
                  {periods.map((period) => (
                    <ActivityTimelineGridPeriodButton
                      key={period.label}
                      selected={period.active}
                      hasActivity={period.density > 0.3}
                      aria-label={period.label}
                    />
                  ))}
                </ActivityTimelineGrid>
                <ActivityTimelineEventBlock
                  accentColor="var(--primary)"
                  style={{
                    left: '9.5rem',
                    top: '1.25rem',
                    width: '13rem',
                    height: '5.7rem',
                  }}
                >
                  <ActivityTimelineEventTitle>
                    <ActivityTimelineEventText>
                      Hoof trim follow-up
                    </ActivityTimelineEventText>
                  </ActivityTimelineEventTitle>
                  <DashboardMetaList
                    size="micro"
                    gap="compact"
                    separator="dot"
                    className="min-w-0 overflow-hidden"
                  >
                    <span>Farrier</span>
                    <span>09:30</span>
                    <span>Planned</span>
                  </DashboardMetaList>
                  <ActivityTimelineEventBadgeRow>
                    <Badge variant="outline" size="micro">
                      repeats
                    </Badge>
                    <Badge variant="outline" size="micro">
                      2d
                    </Badge>
                  </ActivityTimelineEventBadgeRow>
                </ActivityTimelineEventBlock>
              </ActivityTimelineBody>
            </ActivityTimelineCanvas>
          </ActivityTimelineScrollArea>
        </ActivityTimelineViewportPanel>

        <ActivityTimelineOverviewPanel>
          <ActivityTimelineOverviewRail>
            <ActivityTimelineOverviewTrack>
              {periods.map((period) => (
                <ActivityTimelineOverviewPeriodButton
                  key={period.label}
                  density={period.density}
                  aria-label={`${period.label} overview`}
                />
              ))}
            </ActivityTimelineOverviewTrack>
            <ActivityTimelineTodayMarker style={{ left: '50%' }} />
            <ActivityTimelineWindow style={{ left: '30%', width: '45%' }}>
              <ActivityTimelineWindowHandle
                edge="start"
                aria-label="Resize visible timeline start"
              />
              <ActivityTimelineWindowDrag aria-label="Move visible timeline window" />
              <ActivityTimelineWindowHandle
                edge="end"
                aria-label="Resize visible timeline end"
              />
            </ActivityTimelineWindow>
          </ActivityTimelineOverviewRail>
        </ActivityTimelineOverviewPanel>

        <ActivityTimelineCaption>
          Planning rails should use ActivityTimeline primitives for chrome,
          blocks, overview windows, tags, and captions.
        </ActivityTimelineCaption>

        <ActivityTimelineListEntry
          badges={
            <>
              <Badge variant="secondary">Health</Badge>
              <Badge variant="warning">Watch</Badge>
            </>
          }
          title="Heat in left foreleg"
          meta={
            <>
              <span>Noted Jun 18</span>
              <span>Resolved Jun 21</span>
            </>
          }
          description="Chronological timeline rows should keep the same shell, badge row, dense title, metadata, and content spacing."
        >
          <DashboardItemBodyText>
            Use this entry primitive for timeline list rows before composing a
            local panel by hand.
          </DashboardItemBodyText>
        </ActivityTimelineListEntry>
      </ActivityTimelineRoot>
    </div>
  )
}

function FeedbackOverlaySpecimen({
  dialogOpen,
  onDialogOpenChange,
}: {
  dialogOpen: boolean
  onDialogOpenChange: (open: boolean) => void
}) {
  return (
    <div className="grid gap-3">
      <TextLabel as="p" size="sm" weight="black" tracking="none">
        Feedback and overlays
      </TextLabel>
      <div className="grid gap-3">
        <Alert>
          <AlertTitle>Upload ready</AlertTitle>
          <AlertDescription>
            Inline feedback should use the alert primitive before adding local
            rail, color, or text recipes.
          </AlertDescription>
        </Alert>

        <DashboardItemCard chrome="soft" className="grid gap-3">
          <DashboardInlineHeader
            title="Transient controls"
            description="Menus and tooltips inherit overlay color, border, radius, and motion from their primitive files."
            descriptionSize="xs"
            titleWeight="semibold"
          />
          <DashboardActions align="start">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button type="button" variant="outline" />}
              >
                More actions
                <CaretDownIcon data-icon="inline-end" weight="bold" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Record tools</DropdownMenuLabel>
                  <DropdownMenuItem>Mark reviewed</DropdownMenuItem>
                  <DropdownMenuItem>Send reminder</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  Remove record
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  render={<Button type="button" variant="ghost" />}
                >
                  Help
                </TooltipTrigger>
                <TooltipContent>
                  Keep helper copy in the shared tooltip surface.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                showAppSuccessToast({
                  title: 'Care record saved',
                  description:
                    "Juniper's record is ready for the next handoff.",
                })
              }
            >
              Success toast
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                showAppErrorToast({
                  title: 'Could not save record',
                  description: 'Review the form and try again.',
                })
              }
            >
              Error toast
            </Button>
          </DashboardActions>
        </DashboardItemCard>

        <CreateRecordDialog
          open={dialogOpen}
          onOpenChange={onDialogOpenChange}
          triggerLabel="Open record dialog"
          title="Add care record"
          description="Record-create flows should use CreateRecordDialog and the shared form action row."
        >
          <InlineForm
            gap="compact"
            onSubmit={(event) => {
              event.preventDefault()
              onDialogOpenChange(false)
            }}
          >
            <FieldGrid breakpoint="sm" gap="compact">
              <Field>
                <FieldLabel htmlFor="guideline-dialog-title">Title</FieldLabel>
                <Input
                  id="guideline-dialog-title"
                  defaultValue="Hoof trim follow-up"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="guideline-dialog-due">Due</FieldLabel>
                <Input
                  id="guideline-dialog-due"
                  defaultValue="2026-06-18"
                  type="date"
                />
              </Field>
            </FieldGrid>
            <FormSubmitActions
              isSubmitting={false}
              submitLabel="Save record"
              submittingLabel="Saving"
              onCancel={() => onDialogOpenChange(false)}
            />
          </InlineForm>
        </CreateRecordDialog>
      </div>
    </div>
  )
}

function FilterSpecimen() {
  const [query, setQuery] = useState('hoof')
  const [selectedFacets, setSelectedFacets] = useState<
    ListFilterSelectedFacets<DemoFacetId>
  >({
    horse: 'maple',
    state: 'overdue',
    category: 'hoof',
  })

  const isFiltering =
    query.trim().length > 0 || Object.values(selectedFacets).some(Boolean)

  return (
    <ListFilterBar
      config={filterConfig}
      query={query}
      onQueryChange={setQuery}
      selectedFacets={selectedFacets}
      onFacetChange={(facetId, value) =>
        setSelectedFacets((current) => {
          const next = { ...current }

          if (value) {
            next[facetId] = value
          } else {
            delete next[facetId]
          }

          return next
        })
      }
      onReset={() => {
        setQuery('')
        setSelectedFacets({})
      }}
      isFiltering={isFiltering}
    />
  )
}

function PrimitiveControlSpecimen() {
  const [nightCheck, setNightCheck] = useState(true)
  const [autoNotify, setAutoNotify] = useState(true)
  const [cadence, setCadence] = useState('weekly')
  const [visitStatus, setVisitStatus] = useState<'planned' | 'completed'>(
    'planned',
  )

  return (
    <DashboardInlinePanel stack="default">
      <DashboardInlineHeader
        title="Primitive controls"
        description="Small controls use the same warm surfaces as cards, fields, tabs, and filters."
        titleWeight="semibold"
        descriptionSize="xs"
        aside={<Badge variant="secondary">Global</Badge>}
      />

      <Tabs defaultValue="routine">
        <TabsList variant="section">
          <TabsTrigger value="routine">Routine</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="routine" className="grid gap-3">
          <FieldPanel gap="compact">
            <FieldHeader>
              <FieldHeaderContent>
                <FieldLegend variant="label">Care preferences</FieldLegend>
                <FieldDescription>
                  Checkbox, switch, radio, and progress states should all read
                  as one material system.
                </FieldDescription>
              </FieldHeaderContent>
              <Badge variant="outline">Specimen</Badge>
            </FieldHeader>

            <FieldGrid breakpoint="sm" gap="compact">
              <Field orientation="horizontal">
                <Checkbox
                  id="guideline-night-check"
                  checked={nightCheck}
                  onCheckedChange={setNightCheck}
                />
                <FieldLabel htmlFor="guideline-night-check" interactive>
                  Night check required
                </FieldLabel>
              </Field>

              <Field orientation="horizontal">
                <Switch
                  id="guideline-auto-notify"
                  checked={autoNotify}
                  onCheckedChange={setAutoNotify}
                />
                <FieldLabel htmlFor="guideline-auto-notify" interactive>
                  Auto notify team
                </FieldLabel>
              </Field>
            </FieldGrid>

            <Field>
              <FieldLabel>Visit status</FieldLabel>
              <ChoiceButtonGroup
                value={visitStatus}
                options={[
                  { value: 'planned', label: 'Planned' },
                  { value: 'completed', label: 'Completed' },
                ]}
                onValueChange={setVisitStatus}
              />
            </Field>

            <RadioGroup
              value={cadence}
              onValueChange={setCadence}
              aria-label="Care cadence"
            >
              <FieldOptionGroup>
                <Field orientation="horizontal">
                  <RadioGroupItem
                    id="guideline-cadence-weekly"
                    value="weekly"
                  />
                  <FieldLabel htmlFor="guideline-cadence-weekly" interactive>
                    Weekly
                  </FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <RadioGroupItem
                    id="guideline-cadence-monthly"
                    value="monthly"
                  />
                  <FieldLabel htmlFor="guideline-cadence-monthly" interactive>
                    Monthly
                  </FieldLabel>
                </Field>
              </FieldOptionGroup>
            </RadioGroup>

            <div className="grid gap-2">
              <TextLabel as="p" size="sm" weight="semibold" tracking="none">
                Completion coverage
              </TextLabel>
              <Progress value={72} label="Completion coverage" />
            </div>
          </FieldPanel>
        </TabsContent>
        <TabsContent value="alerts">
          <DashboardEmptyState chrome="soft">
            Alert preference content uses the same tab panel rhythm.
          </DashboardEmptyState>
        </TabsContent>
        <TabsContent value="billing">
          <DashboardEmptyState chrome="soft">
            Billing preference content uses the same tab panel rhythm.
          </DashboardEmptyState>
        </TabsContent>
      </Tabs>
    </DashboardInlinePanel>
  )
}

function CareTemplateSection() {
  return (
    <DashboardLayoutStack as="section" id="care-specimen" gap="compact">
      <DashboardSectionCard
        as="h2"
        size="page"
        title="Care Card Template"
        description="Keep the current care-card layout. The style comes from shared rows, badges, and buttons so every detail screen can inherit the same treatment."
        actions={
          <Button type="button">
            <PlusIcon data-icon="inline-start" weight="bold" />
            Add reminder
          </Button>
        }
      />

      <DashboardSectionCard
        title="Care ledger"
        description="Real components, real spacing, and no local button or badge system."
        contentGap="compact"
      >
        {reminders.map((reminder) => (
          <ReminderRow key={reminder.title} reminder={reminder} />
        ))}
      </DashboardSectionCard>
    </DashboardLayoutStack>
  )
}

function ReminderRow({ reminder }: { reminder: ReminderSpecimen }) {
  const accent = {
    overdue: 'danger',
    today: 'warning',
    upcoming: 'primary',
  } satisfies Record<ReminderTone, DashboardItemAccent>

  return (
    <DashboardItemRecordCard
      accent={accent[reminder.tone]}
      actionsPlacement="footer"
      actionsClassName="ml-auto"
      actionBadges={
        <>
          <CareReminderPriorityBadge priority={reminder.priority} />
          <CareReminderStatusBadge
            status={reminder.status}
            overdue={reminder.tone === 'overdue'}
          />
        </>
      }
      actions={
        <>
          <Button type="button" variant="ghost" size="sm">
            <CheckIcon data-icon="inline-start" weight="bold" />
            Complete
          </Button>
          <Button type="button" variant="ghost" size="sm">
            <ClockIcon data-icon="inline-start" weight="bold" />
            Dismiss
          </Button>
          <Button type="button" variant="ghost" size="sm">
            Remove
          </Button>
        </>
      }
      footer={
        <DashboardItemRecordFooter textSize="sm">
          <DashboardItemBodyText>
            Use DashboardItemRecordFooter for full-width notes, edit forms, and
            detail blocks attached to an action row.
          </DashboardItemBodyText>
        </DashboardItemRecordFooter>
      }
    >
      <DashboardItemRecordContent
        title={reminder.title}
        titleBadges={
          <CareReminderCategoryBadge
            category={reminder.category}
            className="w-fit"
          />
        }
        meta={
          <>
            <span>{reminder.due}</span>
            <span>{reminder.horse}</span>
            <span>{reminder.owner}</span>
          </>
        }
        metaSeparator="slash"
        metaClassName="font-semibold"
        description={reminder.description}
        descriptionClassName="max-w-3xl"
      />
    </DashboardItemRecordCard>
  )
}

function InventorySection() {
  return (
    <DashboardLayoutStack as="section" gap="compact">
      <DashboardSectionCard
        as="h2"
        size="page"
        title="Component Inventory"
        description="This is the refactor map. If a page needs one of these patterns, it should use the listed canonical component before adding custom styles."
      />

      <div className="grid gap-3">
        {componentInventory.map((item) => (
          <DashboardItemCard
            key={item.group}
            className="grid gap-4 lg:grid-cols-[12rem_minmax(0,1fr)_8rem_minmax(14rem,0.7fr)] lg:items-start"
          >
            <div>
              <TextLabel as="p" weight="black" tracking="none">
                Group
              </TextLabel>
              <p className="font-semibold">{item.group}</p>
            </div>
            <div>
              <TextLabel as="p" weight="black" tracking="none">
                Canonical source
              </TextLabel>
              <p className="font-semibold">{item.canonical}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.use}</p>
            </div>
            <div>
              <TextLabel as="p" weight="black" tracking="none">
                Status
              </TextLabel>
              <InventoryStatusBadge status={item.status} />
            </div>
            <div>
              <TextLabel as="p" weight="black" tracking="none">
                Implementation rule
              </TextLabel>
              <p className="text-sm text-muted-foreground">{item.rule}</p>
            </div>
          </DashboardItemCard>
        ))}
      </div>
    </DashboardLayoutStack>
  )
}

function InventoryStatusBadge({
  status,
}: {
  status: (typeof componentInventory)[number]['status']
}) {
  const variant = {
    Canonical: 'secondary',
  } satisfies Record<
    (typeof componentInventory)[number]['status'],
    'secondary' | 'outline' | 'destructive'
  >

  return <Badge variant={variant[status]}>{status}</Badge>
}

function RolloutSection() {
  const steps = [
    'Keep primitives global: Button, Badge, Card, Tabs, Field, FieldPanel, Input, Select.',
    'Replace repeated title, button, badge, toast, and row styles with shared helpers.',
    'Move feature screens onto the warm token layer without changing their core layout.',
    'Use this page as the review checklist before adding a new component pattern.',
  ]

  return (
    <DashboardSectionCard
      title="Rollout Rules"
      description="The goal is consistency first, then incremental visual tuning."
      contentGap="compact"
    >
      {steps.map((step, index) => (
        <DashboardItemCard
          key={step}
          chrome="soft"
          density="compact"
          className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)]"
        >
          <Badge size="count" variant="secondary" aria-hidden={true}>
            {index + 1}
          </Badge>
          <p className="text-sm font-semibold leading-6">{step}</p>
        </DashboardItemCard>
      ))}

      <RouteStatusAlert tone="danger" title="Design-system debt">
        New one-off class recipes for primary buttons, cards, badges, filters,
        and row titles should be treated as design-system debt.
      </RouteStatusAlert>
    </DashboardSectionCard>
  )
}
