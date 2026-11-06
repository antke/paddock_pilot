import { useId, useState } from 'react'

import type { LandingLabVariantProps } from '../../LandingLabPrimitives'
import {
  CountryLabAction,
  CountryLabExample,
  CountryLabIcon,
  CountryLabPhoto,
  CountryLabShell,
} from './CountryLabKit'
import './sameThursday.css'

/*
 * THESIS: Shared care is a matter of perspective. One Thursday, seen by the
 * owner, a helper and the yard, demonstrates shared plans and private
 * records in a single switch. Refuses the role-comparison table.
 */

type Viewer = 'owner' | 'helper' | 'yard'

type Row = {
  time: string
  title: string
  detail: string
  /** What each viewer sees; null means the record is private to them. */
  view: Record<Viewer, string | null>
}

const rows: ReadonlyArray<Row> = [
  {
    time: '07:30',
    title: 'Morning feed',
    detail: 'Done by Priya',
    view: {
      owner: 'Soaked hay, half a scoop of chaff.',
      helper: 'Soaked hay, half a scoop of chaff.',
      yard: 'Done by Priya.',
    },
  },
  {
    time: '10:30',
    title: 'Farrier visit',
    detail: 'Sam Taylor',
    view: {
      owner: 'Front shoes and a trim. Sam has the yard’s address.',
      helper: 'Bring her in by 10:15 and leave her headcollar on.',
      yard: 'On the yard calendar.',
    },
  },
  {
    time: '14:00',
    title: 'Health note',
    detail: 'Near fore',
    view: {
      owner:
        'Slight heat in near fore. Cold hose after work; vet if no better Saturday.',
      helper: 'Cold hose near fore for ten minutes after work.',
      yard: null,
    },
  },
  {
    time: '18:00',
    title: 'Flatwork lesson',
    detail: 'With Alex',
    view: {
      owner: 'Alex will add notes to Juniper’s training log afterwards.',
      helper: 'Tack up by 17:45.',
      yard: 'Arena booked 18:00–19:00.',
    },
  },
]

const viewers: ReadonlyArray<{
  id: Viewer
  label: string
  summary: string
}> = [
  {
    id: 'owner',
    label: 'Juniper’s owner',
    summary: 'Everything about Juniper, and who else can see it.',
  },
  {
    id: 'helper',
    label: 'Her sharer',
    summary: 'Invited as an editor: sees the jobs and records what’s done.',
  },
  {
    id: 'yard',
    label: 'The yard',
    summary:
      'The shared calendar. Juniper’s records stay private unless shared.',
  },
]

const stages = [
  {
    title: 'Just you',
    copy: 'Keep your horse’s care, calendar and contacts in order. No stable needed.',
  },
  {
    title: 'Add a helper',
    copy: 'Invite a sharer, friend or groom to view or edit, without joining your yard.',
  },
  {
    title: 'Bring the yard',
    copy: 'Connect your stable to share its calendar and coordinate with the other owners.',
  },
]

function Perspectives() {
  const [viewer, setViewer] = useState<Viewer>('owner')
  const id = useId()
  const active = viewers.find((entry) => entry.id === viewer) ?? viewers[0]

  return (
    <figure className="st-view cty-on-paper" aria-labelledby={`${id}-title`}>
      <div className="st-view-bar">
        <h3 id={`${id}-title`} className="st-view-title">
          Thursday 6 · Juniper
        </h3>
        <CountryLabExample />
      </div>
      <div className="st-viewers" role="group" aria-label="See Thursday as">
        {viewers.map((entry) => (
          <button
            key={entry.id}
            type="button"
            aria-pressed={entry.id === viewer}
            onClick={() => setViewer(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>
      <p className="st-summary" aria-live="polite">
        {active.summary}
      </p>
      <ol className="st-rows" data-viewer={viewer}>
        {rows.map((row) => {
          const seen = row.view[viewer]
          return (
            <li
              key={row.title}
              className="st-row"
              data-private={seen === null ? 'true' : undefined}
            >
              <span className="st-row-time cty-tnum">{row.time}</span>
              <span className="st-row-main">
                <span className="st-row-title">
                  {row.title}
                  <span className="st-row-detail"> · {row.detail}</span>
                </span>
                {seen === null ? (
                  <span className="st-row-private">
                    <CountryLabIcon name="lock" />
                    Private to Juniper’s owner and her helpers
                  </span>
                ) : (
                  <span className="st-row-note" key={viewer}>
                    {seen}
                  </span>
                )}
              </span>
            </li>
          )
        })}
      </ol>
    </figure>
  )
}

export default function SameThursday(_props: LandingLabVariantProps) {
  return (
    <CountryLabShell className="st">
      <section className="st-hero" aria-labelledby="st-hero-title">
        <div className="st-hero-photo">
          <CountryLabPhoto
            name="gate"
            sizes="100vw"
            priority
            position="60% 40%"
          />
        </div>
        <div className="cty-container st-hero-panel-wrap">
          <div className="st-hero-panel">
            <h1 id="st-hero-title">Good care takes a few good people.</h1>
            <div className="st-hero-intro">
              <p className="cty-lede">
                Paddock Pilot gives owners, helpers and small yards one shared
                plan, while each horse’s records stay with its owner.
              </p>
              <CountryLabAction />
            </div>
          </div>
        </div>
      </section>

      <section className="st-day cty-on-ink" aria-labelledby="st-day-title">
        <div className="cty-container st-day-grid">
          <div className="st-day-copy">
            <h2 id="st-day-title" className="cty-h2">
              Same Thursday. Three points of view.
            </h2>
            <p className="cty-lede">
              Everyone works from one plan. What each person sees depends on
              their part in the horse’s care, so the yard can share appointments
              without sharing everything.
            </p>
          </div>
          <Perspectives />
        </div>
      </section>

      <section className="st-grow" aria-labelledby="st-grow-title">
        <div className="cty-container st-grow-grid">
          <div className="st-grow-photo">
            <CountryLabPhoto
              name="palomino"
              sizes="(max-width: 699px) 100vw, 36vw"
            />
          </div>
          <div>
            <h2 id="st-grow-title" className="cty-h2">
              Start with you and your horse.
            </h2>
            <ol className="st-stages">
              {stages.map((stage) => (
                <li key={stage.title}>
                  <h3>{stage.title}</h3>
                  <p>{stage.copy}</p>
                </li>
              ))}
            </ol>
            <p className="st-grow-note">
              The same account and the same horse records work at every step.
            </p>
          </div>
        </div>
      </section>

      <section className="cty-close st-close" aria-labelledby="st-close-title">
        <div className="cty-container cty-close-grid">
          <h2 id="st-close-title" className="cty-h2">
            Room for everyone who helps.
          </h2>
          <div>
            <p className="cty-lede">
              Create your account, add your horse and invite the people who
              share the work.
            </p>
            <CountryLabAction />
          </div>
        </div>
      </section>
    </CountryLabShell>
  )
}
