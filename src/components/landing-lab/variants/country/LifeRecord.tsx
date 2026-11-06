import { useEffect, useRef, useState } from 'react'

import type { LandingLabVariantProps } from '../../LandingLabPrimitives'
import {
  CountryLabAction,
  CountryLabExample,
  CountryLabIcon,
  CountryLabPhoto,
  CountryLabShell,
} from './CountryLabKit'
import './lifeRecord.css'

/*
 * THESIS: The product's most distinctive truth leads: a horse's record
 * belongs to the horse and follows it from yard to yard. Refuses the
 * feature-list page; one horse's life carries every capability.
 */

type Entry = {
  when: string
  title: string
  note: string
  yard: string
  kind: 'move' | 'care' | 'doc' | 'session'
}

const entries: ReadonlyArray<Entry> = [
  {
    when: 'May 2019',
    title: 'Bramble comes home',
    note: 'Profile started: chestnut gelding, passport and insurance attached.',
    yard: 'At home',
    kind: 'doc',
  },
  {
    when: 'March 2021',
    title: 'Moves to Oak Lane Livery',
    note: 'Joins the yard calendar. Feeds, turnout and visits are shared with the yard team.',
    yard: 'Oak Lane Livery',
    kind: 'move',
  },
  {
    when: 'Every 6 weeks',
    title: 'Farrier, Sam Taylor',
    note: 'Front shoes on, hinds trimmed. The next visit is booked from the reminder.',
    yard: 'Oak Lane Livery',
    kind: 'care',
  },
  {
    when: 'February 2023',
    title: 'Vet visit: slight lameness',
    note: 'Box rest notes and the recheck date shared with the two helpers who do his evenings.',
    yard: 'Oak Lane Livery',
    kind: 'care',
  },
  {
    when: 'August 2024',
    title: 'Moves to Hollins Farm',
    note: 'Every entry comes too. Oak Lane no longer sees Bramble’s records; Hollins sees only what his owner shares.',
    yard: 'Hollins Farm',
    kind: 'move',
  },
  {
    when: 'October 2026',
    title: 'Flu and tetanus booster',
    note: 'Certificate attached. A reminder is set for next year.',
    yard: 'Hollins Farm',
    kind: 'doc',
  },
  {
    when: 'Today',
    title: 'Flatwork lesson with Alex',
    note: 'Invited for this session, Alex adds the lesson notes to Bramble’s training log.',
    yard: 'Hollins Farm',
    kind: 'session',
  },
]

const audiences = [
  {
    who: 'You, the owner',
    sees: 'Everything, and a clear list of who else can see it.',
  },
  {
    who: 'Helpers you invite',
    sees: 'View or edit, as you choose. No stable membership needed.',
  },
  {
    who: 'Your stable',
    sees: 'The shared calendar, plus the records you choose to share.',
  },
  {
    who: 'A rider or instructor',
    sees: 'Only the session they’re invited to.',
  },
]

function iconFor(kind: Entry['kind']) {
  if (kind === 'move') return 'horse' as const
  if (kind === 'doc') return 'doc' as const
  if (kind === 'session') return 'calendar' as const
  return 'check' as const
}

function Timeline() {
  const [active, setActive] = useState(0)
  const refs = useRef<Array<HTMLLIElement | null>>([])

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (observed) => {
        for (const item of observed) {
          if (item.isIntersecting) {
            setActive(Number((item.target as HTMLElement).dataset.index))
          }
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    for (const node of refs.current) if (node) observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const current = entries[active]
  const yards = Array.from(new Set(entries.map((entry) => entry.yard)))

  return (
    <div className="lr-timeline-grid">
      <div className="lr-sticky">
        <h2 id="lr-story-title" className="cty-h2">
          One record, from the first entry to today.
        </h2>
        <p className="cty-lede">
          Owners change yards. Helpers come and go. The record stays put, with
          the horse it belongs to.
        </p>
        <div className="lr-now" aria-hidden="true">
          <span className="lr-now-label">Where Bramble lives</span>
          <span className="lr-now-yard" key={current.yard}>
            {current.yard}
          </span>
          <ol className="lr-now-path">
            {yards.map((yard) => (
              <li
                key={yard}
                data-state={
                  yard === current.yard
                    ? 'current'
                    : yards.indexOf(yard) < yards.indexOf(current.yard)
                      ? 'past'
                      : 'future'
                }
              >
                {yard}
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div>
        <div className="lr-list-head">
          <span>Bramble’s record</span>
          <CountryLabExample />
        </div>
        <ol className="lr-list">
          {entries.map((entry, index) => (
            <li
              key={entry.title}
              ref={(node) => {
                refs.current[index] = node
              }}
              data-index={index}
              data-kind={entry.kind}
              data-active={index === active ? 'true' : undefined}
              data-ahead={index > active ? 'true' : undefined}
              className="lr-entry"
            >
              <span className="lr-entry-mark">
                <CountryLabIcon name={iconFor(entry.kind)} />
              </span>
              <span className="lr-entry-when cty-tnum">{entry.when}</span>
              <h3 className="lr-entry-title">{entry.title}</h3>
              <p className="lr-entry-note">{entry.note}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

export default function LifeRecord(_props: LandingLabVariantProps) {
  return (
    <CountryLabShell className="lr" overlayHeader={false}>
      <section className="lr-hero" aria-labelledby="lr-hero-title">
        <div className="lr-hero-copy">
          <h1 id="lr-hero-title">Every horse deserves a good memory.</h1>
          <p className="cty-lede">
            Vaccinations, farrier visits, feed changes and vet notes, kept in
            one record that stays with your horse—through every yard it calls
            home.
          </p>
          <div className="cty-actions">
            <CountryLabAction />
            <a className="cty-text-action" href="#lr-story">
              Read Bramble’s record
            </a>
          </div>
        </div>
        <div className="lr-hero-photo">
          <CountryLabPhoto
            name="gate-portrait"
            sizes="(max-width: 899px) 100vw, 50vw"
            priority
            position="30% 40%"
          />
        </div>
      </section>

      <section
        id="lr-story"
        className="lr-story cty-on-ink"
        aria-labelledby="lr-story-title"
      >
        <div className="cty-container">
          <Timeline />
        </div>
      </section>

      <section className="lr-access" aria-labelledby="lr-access-title">
        <div className="cty-container lr-access-grid">
          <div>
            <h2 id="lr-access-title" className="cty-h2">
              It’s your horse’s record. You decide who reads it.
            </h2>
          </div>
          <dl className="lr-ledger">
            {audiences.map((row) => (
              <div key={row.who}>
                <dt>{row.who}</dt>
                <dd>{row.sees}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        className="cty-close lr-close cty-on-ink"
        aria-labelledby="lr-close-title"
      >
        <div className="cty-container cty-close-grid">
          <h2 id="lr-close-title" className="cty-h2">
            Start your horse’s record today.
          </h2>
          <div>
            <p className="cty-lede">
              Add the basics now and fill in the rest as it happens. It stays
              yours, wherever you ride.
            </p>
            <CountryLabAction tone="paper" />
          </div>
        </div>
      </section>
    </CountryLabShell>
  )
}
