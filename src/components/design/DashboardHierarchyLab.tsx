import { Badge } from '#/components/ui/badge'
import { cn } from '#/lib/utils'
import type { ReactNode } from 'react'

type DashboardConcept = {
  title: string
  purpose: string
  hierarchy: string[]
  render: () => ReactNode
}

const urgentItems = [
  'Dental check overdue · Willow',
  'Medication review · Jasper',
  'Farrier confirmation needed · 09:30',
]

const todayItems = [
  { time: '08:30', title: 'Feed and turnout check', meta: 'Whole stable' },
  { time: '09:30', title: 'Farrier visit', meta: '3 horses · Main yard' },
  { time: '14:00', title: 'Dental check', meta: 'Willow · Vet room' },
]

const secondarySections = [
  { title: 'Next 7 days', detail: '6 events planned · busiest day Friday' },
  { title: 'Horse roster', detail: 'Willow, Jasper, Mabel, Fern, Scout' },
  { title: 'Stable notes', detail: '2 notes updated this week' },
]

const concepts = [
  {
    title: '1 · Daily briefing first',
    purpose:
      'Best default dashboard: a short summary, then urgent work, then today’s actual schedule. Everything else is available but secondary.',
    hierarchy: ['Summary', 'Urgent items', 'Today timeline', 'Expandable secondary details'],
    render: DailyBriefingPreview,
  },
  {
    title: '2 · Triage board',
    purpose:
      'Best for busy yards: urgency dominates the top of the page, and non-critical information is compressed into small supporting panels.',
    hierarchy: ['Critical banner', 'Action queue', 'Today schedule', 'Collapsed reference panels'],
    render: TriageBoardPreview,
  },
  {
    title: '3 · Calm progressive board',
    purpose:
      'Best when the current dashboard feels too dense: one large next action, a tiny today strip, and “open when needed” sections.',
    hierarchy: ['Plain-language summary', 'One next action', 'Compact today strip', 'Details on click'],
    render: CalmProgressivePreview,
  },
] satisfies DashboardConcept[]

export function DashboardHierarchyLab() {
  return (
    <section className="grid gap-5">
      <div className="grid max-w-4xl gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Dashboard structure pass
        </p>
        <h2 className="text-xl font-semibold tracking-tight">
          Information hierarchy concepts
        </h2>
        <p className="text-sm text-muted-foreground">
          These are intentionally less detailed than the current dashboard. The goal is to
          make the first screen answer: what matters today, what is urgent, and what can wait.
        </p>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-3">
        {concepts.map((concept) => (
          <article
            key={concept.title}
            className="grid gap-4 rounded-panel border border-border-subtle bg-card p-4 shadow-control"
          >
            <div className="grid gap-2">
              <h3 className="text-base font-semibold tracking-tight">{concept.title}</h3>
              <p className="text-sm text-muted-foreground">{concept.purpose}</p>
              <ol className="flex flex-wrap gap-1.5">
                {concept.hierarchy.map((item) => (
                  <li key={item}>
                    <Badge variant="outline">{item}</Badge>
                  </li>
                ))}
              </ol>
            </div>
            {concept.render()}
          </article>
        ))}
      </div>
    </section>
  )
}

function DailyBriefingPreview() {
  return (
    <div className="grid gap-3 rounded-row bg-muted/30 p-3">
      <SummaryPanel
        badge="Today summary"
        title="Paddock Pilot has 3 scheduled items today. One care task needs attention before lunch."
      />
      <UrgentList compact={false} />
      <TodayTimeline limit={3} />
      <SecondaryDetails />
    </div>
  )
}

function TriageBoardPreview() {
  return (
    <div className="grid gap-3 rounded-row bg-muted/30 p-3">
      <div className="rounded-row border border-destructive/20 bg-destructive/8 p-3">
        <Badge variant="destructive">Needs action</Badge>
        <p className="mt-2 text-lg font-semibold tracking-tight">
          2 urgent care items should be handled before the afternoon schedule.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_0.9fr] xl:grid-cols-1">
        <UrgentList compact />
        <TodayTimeline limit={2} />
      </div>
      <SecondaryDetails compact />
    </div>
  )
}

function CalmProgressivePreview() {
  return (
    <div className="grid gap-3 rounded-row bg-muted/30 p-3">
      <SummaryPanel
        badge="Morning note"
        title="A light day overall. Start with Willow’s dental follow-up, then keep the 09:30 farrier visit on track."
      />
      <div className="rounded-row border border-primary/20 bg-primary/8 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Next best action
        </p>
        <p className="mt-1 font-semibold">Review Willow’s overdue dental reminder</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Open details only if you need notes, documents, or history.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {todayItems.map((item) => (
          <span
            key={item.title}
            className="rounded-full border border-border-subtle bg-card px-3 py-1.5 text-xs"
          >
            <span className="font-semibold">{item.time}</span> · {item.title}
          </span>
        ))}
      </div>
      <SecondaryDetails />
    </div>
  )
}

function SummaryPanel({ badge, title }: { badge: string; title: string }) {
  return (
    <div className="rounded-row border border-border-subtle bg-card p-3">
      <Badge variant="secondary">{badge}</Badge>
      <p className="mt-3 text-xl font-semibold leading-tight tracking-tight">{title}</p>
    </div>
  )
}

function UrgentList({ compact }: { compact: boolean }) {
  const items = compact ? urgentItems.slice(0, 2) : urgentItems

  return (
    <div className="rounded-row border border-border-subtle bg-card p-3">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold">Urgent queue</h4>
        <Badge variant="outline">{items.length}</Badge>
      </div>
      <div className="mt-2 grid gap-1.5">
        {items.map((item, index) => (
          <div key={item} className="flex items-center gap-2 text-sm">
            <span
              className={cn(
                'size-2 rounded-full',
                index === 0 ? 'bg-destructive' : 'bg-amber-500',
              )}
            />
            <span className="line-clamp-1">{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TodayTimeline({ limit }: { limit: number }) {
  return (
    <div className="rounded-row border border-border-subtle bg-card p-3">
      <h4 className="text-sm font-semibold">Today timeline</h4>
      <div className="mt-2 grid gap-2">
        {todayItems.slice(0, limit).map((item) => (
          <div key={item.title} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-2 text-sm">
            <span className="font-semibold text-primary">{item.time}</span>
            <span className="min-w-0">
              <span className="line-clamp-1 font-medium">{item.title}</span>
              <span className="line-clamp-1 text-xs text-muted-foreground">{item.meta}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SecondaryDetails({ compact = false }: { compact?: boolean }) {
  return (
    <div className="grid gap-1.5">
      {secondarySections.slice(0, compact ? 2 : secondarySections.length).map((section) => (
        <details
          key={section.title}
          className="group rounded-row border border-border-subtle bg-card px-3 py-2 text-sm"
        >
          <summary className="cursor-pointer list-none font-medium marker:hidden">
            <span className="inline-flex w-full items-center justify-between gap-3">
              {section.title}
              <span className="text-xs text-muted-foreground group-open:hidden">Open</span>
              <span className="hidden text-xs text-muted-foreground group-open:inline">Hide</span>
            </span>
          </summary>
          <p className="mt-2 text-muted-foreground">{section.detail}</p>
        </details>
      ))}
    </div>
  )
}
