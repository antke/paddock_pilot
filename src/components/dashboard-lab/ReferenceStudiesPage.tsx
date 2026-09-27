import { Field, FieldLabel } from '#/components/ui/field'
import { Table } from '#/components/ui/table'
import { DashboardRecordDetails } from '#/components/dashboard/DashboardRecordDetails'
import { useMemo, useState } from 'react'
import { Button, ButtonLink } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { LabPageHeader, LabPageShell } from '#/components/lab/LabChrome'
import { ActiveStableHeader } from '#/components/dashboard/command-center/ActiveStableHeader'
import { TodayBriefingCard } from '#/components/dashboard/command-center/TodayBriefingCard'
import { MiniCalendarCard } from '#/components/dashboard/command-center/MiniCalendarCard'
import { HorseRosterCard } from '#/components/dashboard/command-center/HorseRosterCard'
import { StableCommandCenter } from '#/components/dashboard/command-center/StableCommandCenter'
import {
  DashboardItemRecordCard,
  DashboardItemRecordContent,
} from '#/components/dashboard/DashboardItemCard'
import {
  HealthIssuesCard,
  CareRemindersSummaryCard,
  PriorityQueueCard,
} from '#/components/dashboard/command-center/PriorityQueueCard'
import { formatShortDateKey } from '#/lib/dateDisplay'
import { careReminderCategoryLabels } from 'shared/reminders/careReminderSchema'
import { createDashboardContainmentFixture } from './dashboardContainmentFixtures'
import { referenceStudies } from './referenceStudies'
import type { ReferenceStudy } from './referenceStudies'
import './dashboardContainmentStudy.css'
import './referenceStudies.css'

const notes = [
  'Compare the turnout notes with the previous entry and attach the latest observations.',
  'Confirm the follow-up arrangements and record any instructions from the visit.',
  'Check the existing record before arranging the next appointment.',
  'Use the same measurement method as the previous entry and update the horse record.',
  'Confirm the appointment with the provider and share the time with the yard.',
  'Check the remaining stock and the current plan before placing an order.',
]
type DemoData = ReturnType<typeof createDashboardContainmentFixture>
type DemoReminder = DemoData['dueReminders'][number]
type Filter = 'all' | 'overdue' | 'upcoming' | 'completed'

export function ReferenceStudiesPage({ study }: { study: ReferenceStudy }) {
  const consolidated = study.id === 'candidate'
  const [comparison, setComparison] = useState<'candidate' | 'current'>(
    'candidate',
  )
  const current = consolidated && comparison === 'current'
  const data = useMemo(createDashboardContainmentFixture, [])
  const [view, setView] = useState<'dashboard' | 'reminders'>('dashboard')
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [notice, setNotice] = useState('')
  const [lastCompleted, setLastCompleted] = useState<string>()
  const activeData = useMemo(() => {
    const dueReminders = data.dueReminders.filter(
      (item) => !completed.has(item.id),
    )
    return {
      ...data,
      dueReminders,
      overview: {
        ...data.overview,
        dueReminders,
        summary: {
          ...data.overview.summary,
          dueReminderCount: dueReminders.length,
          overdueReminderCount: dueReminders.filter((item) => item.overdue)
            .length,
        },
        stableSummaries: data.overview.stableSummaries.map((summary) =>
          summary.stableId === data.stable._id
            ? {
                ...summary,
                dueReminderCount: dueReminders.length,
                overdueReminderCount: dueReminders.filter(
                  (item) => item.overdue,
                ).length,
              }
            : summary,
        ),
      },
      urgentCount:
        data.attentionHorses.reduce(
          (sum, horse) => sum + horse.highIssueCount,
          0,
        ) + dueReminders.length,
    }
  }, [completed, data])
  const overdueCount = activeData.dueReminders.filter(
    (item) => item.overdue,
  ).length
  function toggleComplete(item: DemoReminder) {
    const wasCompleted = completed.has(item.id)
    setCompleted((entries) => {
      const next = new Set(entries)
      if (wasCompleted) next.delete(item.id)
      else next.add(item.id)
      return next
    })
    setLastCompleted(wasCompleted ? undefined : item.id)
    setNotice(
      `${item.title}: ${wasCompleted ? 'reopened' : 'completed'} in this demo.`,
    )
  }
  return (
    <LabPageShell>
      <LabPageHeader
        title={
          consolidated
            ? 'One candidate — dashboard and care'
            : 'Soft sections — 12 reference studies'
        }
        description="The same fictional yard in every version. Compare the dashboard and full care list. Reminder changes stay in this preview; dashboard record links lead to the app."
      >
        {consolidated ? (
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Compare design"
          >
            <Button
              variant={current ? 'outline' : 'secondary'}
              aria-pressed={!current}
              onClick={() => setComparison('candidate')}
            >
              Candidate
            </Button>
            <Button
              variant={current ? 'secondary' : 'outline'}
              aria-pressed={current}
              onClick={() => setComparison('current')}
            >
              Current UI
            </Button>
          </div>
        ) : (
          <>
            <ButtonLink
              to="/dashboard-lab/$version"
              params={{ version: 'candidate' }}
              variant="link"
              className="w-fit p-0"
            >
              Try the consolidated candidate
            </ButtonLink>
            <nav className="reference-picker" aria-label="Reference studies">
              {referenceStudies.map((option) => (
                <ButtonLink
                  key={option.id}
                  to="/dashboard-lab/$version"
                  params={{ version: `reference-${option.id}` }}
                  variant={option.id === study.id ? 'secondary' : 'ghost'}
                  aria-current={option.id === study.id ? 'page' : undefined}
                >
                  {option.id} · {option.name}
                </ButtonLink>
              ))}
            </nav>
          </>
        )}
        {!consolidated && (
          <div className="reference-explanation">
            <div>
              <h2>
                {consolidated
                  ? current
                    ? 'Current UI · same sample data'
                    : study.name
                  : `${study.id} · ${study.name}`}
              </h2>
              <p>
                {current
                  ? 'Existing dashboard composition and record styling, using the same local sample. Changes made to reminders carry across both views.'
                  : study.thesis}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              <strong>Tradeoff:</strong> {study.tradeoff}
            </p>
          </div>
        )}
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Preview surface"
        >
          <Button
            variant={view === 'dashboard' ? 'secondary' : 'outline'}
            aria-pressed={view === 'dashboard'}
            onClick={() => setView('dashboard')}
          >
            Dashboard
          </Button>
          <Button
            variant={view === 'reminders' ? 'secondary' : 'outline'}
            aria-pressed={view === 'reminders'}
            onClick={() => setView('reminders')}
          >
            Care reminders · {data.dueReminders.length}
          </Button>
          <ButtonLink
            to="/dashboard-lab/$version"
            params={{ version: '1' }}
            variant="link"
          >
            Original soft sections
          </ButtonLink>
        </div>
        {!consolidated && (
          <details className="reference-matrix">
            <summary>Compare all 12 combinations</summary>
            <div className="overflow-x-auto">
              <Table>
                <caption>
                  All studies preserve warm typography, semantic action colors,
                  visible control boundaries and keyboard focus.
                </caption>
                <thead>
                  <tr>
                    <th>Demo</th>
                    <th>Surface / header</th>
                    <th>Records</th>
                    <th>Layout / emphasis</th>
                    <th>References</th>
                  </tr>
                </thead>
                <tbody>
                  {referenceStudies.map((option) => (
                    <tr key={option.id}>
                      <th scope="row">
                        {option.id} · {option.name}
                      </th>
                      <td>
                        {option.canvas} / {option.header}
                      </td>
                      <td>
                        {option.density}, {option.rows}
                        {option.anchors ? ', horse anchors' : ''};{' '}
                        {option.grouping === 'none'
                          ? 'one list'
                          : `by ${option.grouping}`}
                      </td>
                      <td>
                        {option.layout} / {option.emphasis}
                      </td>
                      <td>{option.source}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </details>
        )}
      </LabPageHeader>
      <div
        className={current ? 'reference-baseline' : 'reference-surface'}
        data-reference-study={study.id}
        data-canvas={study.canvas}
        data-headers={study.header}
        data-density={study.density}
        data-rows={study.rows}
        data-layout={study.layout}
        data-emphasis={study.emphasis}
      >
        {view === 'dashboard' ? (
          current ? (
            <StableCommandCenter data={activeData} />
          ) : (
            <>
              <ActiveStableHeader data={activeData} />
              {study.emphasis === 'summary' && (
                <div className="reference-urgent">
                  <div>
                    <strong>{overdueCount} overdue care reminders</strong>
                    <p>
                      Review overdue tasks alongside{' '}
                      {data.overview.summary.highSeverityIssueCount}{' '}
                      high-severity health issues.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilter('overdue')
                      setView('reminders')
                    }}
                  >
                    Review overdue care
                  </Button>
                </div>
              )}
              <div data-dashboard-study="sections">
                <div className="study-layout">
                  {study.layout === 'priority' && (
                    <PriorityQueueCard
                      className="study-section study-attention"
                      data={activeData}
                    />
                  )}
                  <div className="study-main">
                    <TodayBriefingCard
                      className="study-section study-today"
                      data={activeData}
                    />
                    <MiniCalendarCard
                      className="study-section study-week"
                      data={activeData}
                    />
                    <HorseRosterCard
                      className="study-section study-horses"
                      data={activeData}
                    />
                  </div>
                  {consolidated ? (
                    <div className="candidate-attention">
                      <HealthIssuesCard
                        className="study-section study-health"
                        visibleItemLimit={3}
                        data={activeData}
                      />
                      <CareRemindersSummaryCard
                        className="study-section study-care"
                        visibleItemLimit={3}
                        data={activeData}
                        onViewReminders={() => {
                          setFilter('all')
                          setQuery('')
                          setView('reminders')
                        }}
                      />
                    </div>
                  ) : (
                    study.layout !== 'priority' && (
                      <PriorityQueueCard
                        className="study-section study-attention"
                        data={activeData}
                      />
                    )
                  )}
                </div>
              </div>
            </>
          )
        ) : (
          <>
            <header className="reference-care-heading">
              <div>
                <h2>Care reminders</h2>
                <p>
                  Cedar Ridge Barn · {data.dueReminders.length - completed.size}{' '}
                  open · {completed.size} completed
                </p>
              </div>
              <Button
                variant="outline"
                disabled={completed.size === 0 && !query && filter === 'all'}
                onClick={() => {
                  setCompleted(new Set())
                  setQuery('')
                  setFilter('all')
                  setNotice('Demo restored.')
                  setLastCompleted(undefined)
                }}
              >
                Reset demo
              </Button>
            </header>
            <section
              className="reference-care-section"
              aria-label="Care reminder list"
            >
              <div className="reference-toolbar">
                <Field>
                  <FieldLabel htmlFor="reference-search">
                    Search reminders
                  </FieldLabel>
                  <Input
                    id="reference-search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Title, horse, category or notes"
                  />
                </Field>
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-label="Reminder status"
                >
                  {(['all', 'overdue', 'upcoming', 'completed'] as const).map(
                    (value) => (
                      <Button
                        key={value}
                        variant={filter === value ? 'secondary' : 'ghost'}
                        aria-pressed={filter === value}
                        onClick={() => setFilter(value)}
                      >
                        {
                          {
                            all: 'All',
                            overdue: 'Overdue',
                            upcoming: 'Upcoming',
                            completed: 'Completed',
                          }[value]
                        }
                      </Button>
                    ),
                  )}
                </div>
              </div>
              <div className="reference-notice" role="status">
                {notice}
                {lastCompleted && (
                  <Button
                    variant="link"
                    onClick={() => {
                      const item = data.dueReminders.find(
                        (entry) => entry.id === lastCompleted,
                      )
                      if (item) toggleComplete(item)
                    }}
                  >
                    Undo
                  </Button>
                )}
              </div>
              <ReminderGroups
                data={data}
                study={study}
                completed={completed}
                query={query}
                filter={filter}
                onComplete={toggleComplete}
                current={current}
                consolidated={consolidated}
              />
            </section>
          </>
        )}
      </div>
    </LabPageShell>
  )
}

function ReminderGroups({
  data,
  study,
  completed,
  query,
  filter,
  onComplete,
  current = false,
  consolidated = false,
}: {
  data: DemoData
  study: ReferenceStudy
  completed: Set<string>
  query: string
  filter: Filter
  onComplete: (item: DemoReminder) => void
  current?: boolean
  consolidated?: boolean
}) {
  const indexed = data.dueReminders.map((item, index) => ({
    ...item,
    note: notes[index % notes.length],
  }))
  const visible = indexed.filter((item) => {
    const done = completed.has(item.id)
    const matchesFilter =
      filter === 'all' ||
      (filter === 'completed'
        ? done
        : !done && (filter === 'overdue' ? item.overdue : !item.overdue))
    return (
      matchesFilter &&
      `${item.title} ${item.horseName} ${careReminderCategoryLabels[item.category]} ${item.note}`
        .toLowerCase()
        .includes(query.toLowerCase())
    )
  })
  const groups = new Map<string, typeof indexed>()
  visible.forEach((item) => {
    const group =
      study.grouping === 'horse'
        ? (item.horseName ?? 'Yard')
        : study.grouping === 'date'
          ? completed.has(item.id)
            ? 'Completed'
            : item.overdue
              ? 'Overdue'
              : 'Upcoming'
          : 'All reminders'
    groups.set(group, [...(groups.get(group) ?? []), item])
  })
  if (!visible.length)
    return (
      <div className="reference-empty">
        <h3>No reminders match</h3>
        <p>
          Try another search or status. Demo completion can be undone or reset.
        </p>
      </div>
    )
  return (
    <div className="reference-groups">
      {Array.from(groups.entries()).map(([title, items]) => (
        <section
          key={title}
          aria-label={title}
          className="reference-reminder-group"
        >
          {study.grouping !== 'none' && (
            <h3 className="reference-group-title">
              {title} <span>{items.length}</span>
            </h3>
          )}
          <ul className="reference-records">
            {items.map((item) => {
              const done = completed.has(item.id)
              if (current)
                return (
                  <li key={item.id}>
                    <DashboardItemRecordCard
                      chrome="flat"
                      density="comfortable"
                      accent={
                        done ? 'primary' : item.overdue ? 'danger' : 'none'
                      }
                      actionsPlacement="footer"
                      actionBadges={
                        <span className="text-sm">
                          {done
                            ? 'Completed'
                            : item.overdue
                              ? 'Overdue'
                              : 'Upcoming'}
                        </span>
                      }
                      actions={
                        <Button
                          variant="outline"
                          aria-label={`${done ? 'Reopen' : 'Complete'} ${item.title}`}
                          onClick={() => onComplete(item)}
                        >
                          {done ? 'Reopen' : 'Complete'}
                        </Button>
                      }
                    >
                      <DashboardItemRecordContent
                        headingLevel={3}
                        title={item.title}
                        meta={
                          <>
                            {formatShortDateKey(item.dueDate)} ·{' '}
                            {item.horseName} ·{' '}
                            {careReminderCategoryLabels[item.category]}
                          </>
                        }
                        description={item.note}
                      />
                    </DashboardItemRecordCard>
                  </li>
                )
              return (
                <li
                  key={item.id}
                  className="reference-record"
                  data-completed={done}
                >
                  {study.anchors && (
                    <span className="reference-anchor" aria-hidden="true">
                      {item.horseName?.slice(0, 1) ?? 'Y'}
                    </span>
                  )}
                  <div className="reference-date">
                    <span>
                      {done ? 'Due date' : item.overdue ? 'Overdue' : 'Due'}
                    </span>
                    <time dateTime={item.dueDate}>
                      {formatShortDateKey(item.dueDate)}
                    </time>
                  </div>
                  <div className="reference-record-body">
                    <h4>{item.title}</h4>
                    <p className="reference-meta">
                      {item.horseName ?? 'Yard'}{' '}
                      <span aria-hidden="true">·</span>{' '}
                      {careReminderCategoryLabels[item.category]}
                    </p>
                    {consolidated ? (
                      <DashboardRecordDetails recordTitle={item.title}>
                        {item.note}
                      </DashboardRecordDetails>
                    ) : (
                      <p className="reference-note">{item.note}</p>
                    )}
                  </div>
                  <div className="reference-record-actions">
                    {done && (
                      <span className="text-sm text-primary">Completed</span>
                    )}
                    {!done && item.overdue && (
                      <span className="reference-overdue">Overdue</span>
                    )}
                    <Button
                      variant="outline"
                      aria-label={`${done ? 'Reopen' : 'Complete'} ${item.title}`}
                      onClick={() => onComplete(item)}
                    >
                      {done ? 'Reopen' : 'Complete'}
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
