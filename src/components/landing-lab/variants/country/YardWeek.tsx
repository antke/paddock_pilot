import { useId, useState } from 'react'

import type { LandingLabVariantProps } from '../../LandingLabPrimitives'
import {
  CountryLabAction,
  CountryLabExample,
  CountryLabIcon,
  CountryLabPhoto,
  CountryLabShell,
} from './CountryLabKit'
import './yardWeek.css'

/*
 * THESIS: The live landing, finished. Same photographic opening, then the
 * product's everyday job (a shared week) shown working, before the record
 * and the sharing model. Refuses the toy single-visit preview.
 */

type DayEntry = {
  time: string
  title: string
  horses: string
  who?: string
  done?: boolean
}

const week: ReadonlyArray<{
  short: string
  long: string
  date: string
  entries: ReadonlyArray<DayEntry>
}> = [
  {
    short: 'Mon',
    long: 'Monday',
    date: '3',
    entries: [
      {
        time: '07:30',
        title: 'Morning feed and turnout',
        horses: 'Juniper, Bramble',
        who: 'Priya',
        done: true,
      },
      {
        time: '17:00',
        title: 'Bring in, rugs on',
        horses: 'Juniper, Bramble',
        who: 'Tom',
        done: true,
      },
    ],
  },
  {
    short: 'Tue',
    long: 'Tuesday',
    date: '4',
    entries: [
      {
        time: '09:00',
        title: 'Worming due',
        horses: 'Bramble',
        who: 'Reminder',
      },
      {
        time: '18:30',
        title: 'Flatwork lesson',
        horses: 'Bramble',
        who: 'With Alex, instructor',
      },
    ],
  },
  {
    short: 'Wed',
    long: 'Wednesday',
    date: '5',
    entries: [
      {
        time: '11:00',
        title: 'Saddle fitting',
        horses: 'Juniper',
        who: 'Rhian Hughes, saddle fitter',
      },
    ],
  },
  {
    short: 'Thu',
    long: 'Thursday',
    date: '6',
    entries: [
      {
        time: '07:30',
        title: 'Morning feed and turnout',
        horses: 'Juniper, Bramble',
        who: 'Priya',
      },
      {
        time: '10:30',
        title: 'Farrier visit',
        horses: 'Juniper, Bramble',
        who: 'Sam Taylor, farrier',
      },
      {
        time: '16:00',
        title: 'Cold hose near fore',
        horses: 'Juniper',
        who: 'Tom',
      },
    ],
  },
  {
    short: 'Fri',
    long: 'Friday',
    date: '7',
    entries: [
      {
        time: '08:00',
        title: 'Hay delivery',
        horses: 'Whole yard',
        who: 'Priya',
      },
    ],
  },
  {
    short: 'Sat',
    long: 'Saturday',
    date: '8',
    entries: [
      {
        time: '10:00',
        title: 'Hack out',
        horses: 'Juniper, Bramble',
        who: 'Tom and Priya',
      },
    ],
  },
  {
    short: 'Sun',
    long: 'Sunday',
    date: '9',
    entries: [
      {
        time: '07:30',
        title: 'Sunday turnout',
        horses: 'Juniper, Bramble',
        who: 'Priya',
      },
    ],
  },
]

const reminders = [
  { title: 'Flu and tetanus booster', horse: 'Bramble', due: 'In 3 weeks' },
  { title: 'Dentist', horse: 'Juniper', due: 'Next month' },
  { title: 'Farrier', horse: 'Juniper, Bramble', due: 'Every 6 weeks' },
]

const record = [
  {
    label: 'Health and vaccinations',
    value: 'Booster recorded 18 October, certificate attached',
  },
  { label: 'Feeding', value: 'Soaked hay, half a scoop of chaff, twice daily' },
  { label: 'Documents', value: 'Passport, insurance, vet history' },
  { label: 'Care contacts', value: 'Vet, farrier, dentist, saddle fitter' },
  { label: 'Training log', value: 'Lessons, hacks and schooling sessions' },
]

function YardWeekPlanner() {
  const [selected, setSelected] = useState(3)
  const id = useId()
  const day = week[selected]

  return (
    <figure className="yw-planner cty-on-paper" aria-labelledby={`${id}-title`}>
      <div className="yw-planner-head">
        <h3 id={`${id}-title`} className="yw-planner-title">
          Oak Lane Yard · this week
        </h3>
        <CountryLabExample />
      </div>
      <div className="yw-days" role="group" aria-label="Choose a day">
        {week.map((entry, index) => (
          <button
            key={entry.short}
            type="button"
            aria-pressed={index === selected}
            aria-label={`${entry.long} ${entry.date}, ${entry.entries.length} ${entry.entries.length === 1 ? 'entry' : 'entries'}`}
            onClick={() => setSelected(index)}
            className="yw-day"
          >
            <span className="yw-day-name">{entry.short}</span>
            <span className="yw-day-date cty-tnum">{entry.date}</span>
            <span className="yw-day-dots" aria-hidden="true">
              {entry.entries.map((item) => (
                <i key={item.time + item.title} />
              ))}
            </span>
          </button>
        ))}
      </div>
      <div className="yw-planner-body">
        <div className="yw-agenda" aria-live="polite">
          <p className="yw-agenda-day">
            {day.long} {day.date}
          </p>
          <ol>
            {day.entries.map((entry) => (
              <li key={entry.time + entry.title} className="yw-entry">
                <span className="yw-entry-time cty-tnum">{entry.time}</span>
                <span className="yw-entry-main">
                  <span className="yw-entry-title">{entry.title}</span>
                  <span className="yw-entry-meta">
                    {entry.horses}
                    {entry.who ? ` · ${entry.who}` : null}
                  </span>
                </span>
                {entry.done ? (
                  <span className="yw-entry-done">
                    <CountryLabIcon name="check" />
                    <span>Done</span>
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
        <aside className="yw-reminders" aria-label="Care reminders">
          <p className="yw-reminders-title">
            <CountryLabIcon name="bell" /> Coming up
          </p>
          <ul>
            {reminders.map((reminder) => (
              <li key={reminder.title}>
                <span className="yw-reminder-title">{reminder.title}</span>
                <span className="yw-reminder-meta">
                  {reminder.horse} · {reminder.due}
                </span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </figure>
  )
}

export default function YardWeek(_props: LandingLabVariantProps) {
  return (
    <CountryLabShell className="yw">
      <section
        className="country-hero country-hero-journal"
        aria-labelledby="yw-hero-title"
      >
        <div className="country-hero-title-group">
          <h1 id="yw-hero-title">
            <span>A little less admin.</span>
            <span>A little more time</span>
            <span>at the yard.</span>
          </h1>
        </div>
        <div className="country-hero-intro">
          <p>
            Plans, horse records and everyday care in one shared place—so
            whoever’s at the yard knows what’s done and what’s next.
          </p>
          <div className="cty-actions">
            <CountryLabAction tone="paper" />
            <a className="cty-text-action" href="#yw-week">
              See a week at the yard
            </a>
          </div>
        </div>
        <picture className="country-yard-photo">
          <CountryLabPhoto
            name="gate"
            sizes="100vw"
            priority
            position="65% center"
          />
        </picture>
      </section>

      <section
        id="yw-week"
        className="yw-week cty-on-ink"
        aria-labelledby="yw-week-title"
      >
        <div className="cty-container">
          <div className="yw-split">
            <h2 id="yw-week-title" className="cty-h2">
              The whole week, on one calendar.
            </h2>
            <p className="cty-lede">
              Farrier visits, lessons, turnout and feeds sit together, with
              reminders for what’s coming up. Everyone who helps sees the same
              plan, so nobody has to ask twice.
            </p>
          </div>
          <YardWeekPlanner />
        </div>
      </section>

      <section className="yw-record" aria-labelledby="yw-record-title">
        <div className="cty-container yw-record-grid">
          <div className="yw-record-photo">
            <CountryLabPhoto
              name="palomino"
              sizes="(max-width: 699px) 100vw, 42vw"
            />
          </div>
          <div className="yw-record-body">
            <h2 id="yw-record-title" className="cty-h2">
              Everything about your horse, kept with your horse.
            </h2>
            <p className="cty-lede">
              One record for health, feeding, documents and the people who look
              after them. If your horse moves yards, its history moves too.
            </p>
            <dl
              className="yw-record-list"
              aria-label="Juniper’s record, example"
            >
              {record.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="yw-share" aria-labelledby="yw-share-title">
        <div className="cty-container">
          <h2 id="yw-share-title" className="cty-h2 yw-share-title">
            Share the work. Keep what’s yours.
          </h2>
          <div className="yw-share-grid">
            <div>
              <h3>Invite a helper</h3>
              <p>
                Give a sharer, friend or groom access to your horse, as a viewer
                or an editor. They don’t need to join your stable.
              </p>
            </div>
            <div>
              <h3>Connect your yard</h3>
              <p>
                Join your stable to share its calendar and coordinate with the
                other owners and helpers there.
              </p>
            </div>
            <div>
              <h3>Decide who sees what</h3>
              <p>
                Your horse’s records stay with you. You choose what the yard can
                see, one record at a time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="cty-close yw-close" aria-labelledby="yw-close-title">
        <div className="cty-container cty-close-grid">
          <h2 id="yw-close-title" className="cty-h2">
            Start with one horse.
          </h2>
          <div>
            <p className="cty-lede">
              Add your horse today, then invite help or connect your yard when
              you’re ready.
            </p>
            <CountryLabAction />
          </div>
        </div>
      </section>
    </CountryLabShell>
  )
}
