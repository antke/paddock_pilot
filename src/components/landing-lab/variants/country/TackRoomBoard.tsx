import { useId, useState } from 'react'
import type { CSSProperties } from 'react'

import type { LandingLabVariantProps } from '../../LandingLabPrimitives'
import {
  CountryLabAction,
  CountryLabExample,
  CountryLabIcon,
  CountryLabPhoto,
  CountryLabShell,
} from './CountryLabKit'
import './tackRoomBoard.css'

/*
 * THESIS: Start where yards are today (whiteboard, group chat, notebook)
 * and tidy it, in one interaction, into Paddock Pilot. Refuses abstract
 * benefit copy; the same eight notes prove the change.
 */

type Note = {
  scribble: string
  title: string
  meta: string
  icon: 'calendar' | 'bell' | 'horse' | 'phone'
  /** Messy offsets as fractions of the note's own box: x, y, rotation. */
  mess: [number, number, number]
}

const groups: ReadonlyArray<{ title: string; notes: ReadonlyArray<Note> }> = [
  {
    title: 'Calendar',
    notes: [
      {
        scribble: 'FARRIER Thurs 10.30 — both??',
        title: 'Farrier · Thursday 10:30',
        meta: 'Juniper, Bramble · Sam Taylor',
        icon: 'calendar',
        mess: [2.22, 1.12, -3],
      },
      {
        scribble: 'Sunday turnout — who’s doing it?',
        title: 'Sunday turnout · 07:30',
        meta: 'Priya',
        icon: 'calendar',
        mess: [3.24, -1.02, 2.5],
      },
    ],
  },
  {
    title: 'Reminders',
    notes: [
      {
        scribble: 'Bramble wormer due!!',
        title: 'Worming due Tuesday',
        meta: 'Bramble',
        icon: 'bell',
        mess: [-1.06, 1.18, 2],
      },
      {
        scribble: 'flu jab Juniper — Nov?',
        title: 'Flu and tetanus booster',
        meta: 'Juniper · due 18 November',
        icon: 'bell',
        mess: [0.04, -1.08, -2.5],
      },
    ],
  },
  {
    title: 'Horses',
    notes: [
      {
        scribble: 'Juniper: SOAKED hay only, ½ scoop chaff',
        title: 'Juniper · Feeding',
        meta: 'Soaked hay, half a scoop of chaff',
        icon: 'horse',
        mess: [-2.14, 0.08, -1.5],
      },
      {
        scribble: 'B. off his tea — keep an eye',
        title: 'Bramble · Health note',
        meta: 'Off his feed Monday evening; check again Tuesday',
        icon: 'horse',
        mess: [1.08, 0.1, 3.5],
      },
    ],
  },
  {
    title: 'Contacts',
    notes: [
      {
        scribble: 'Vet — 01632 960512 (on the fridge)',
        title: 'Dale Vets',
        meta: 'Vet · 01632 960512',
        icon: 'phone',
        mess: [-2.24, 1.2, -2],
      },
      {
        scribble: 'Sam farrier 07700 900418',
        title: 'Sam Taylor',
        meta: 'Farrier · 07700 900418',
        icon: 'phone',
        mess: [-1.12, -1.1, 1.5],
      },
    ],
  },
]

const keepsWorking = [
  'Reminders come round again: the farrier every six weeks, boosters every year.',
  'Notes stay with the horse they’re about, not in a chat that scrolls away.',
  'Helpers see the jobs they help with. Private records stay private.',
  'Move yards, and the whole history comes with you.',
]

function Board() {
  const [tidy, setTidy] = useState(false)
  const id = useId()

  return (
    <figure
      className="tb-board-figure"
      aria-labelledby={`${id}-title`}
      data-tidy={tidy ? 'true' : 'false'}
    >
      <div className="tb-board-bar">
        <h3 id={`${id}-title`} className="tb-board-title">
          {tidy ? 'In Paddock Pilot' : 'The tack room whiteboard'}
        </h3>
        <div
          className="tb-switch"
          role="group"
          aria-label="Show the yard’s notes"
        >
          <button
            type="button"
            aria-pressed={!tidy}
            onClick={() => setTidy(false)}
          >
            As it is
          </button>
          <button
            type="button"
            aria-pressed={tidy}
            onClick={() => setTidy(true)}
          >
            Tidy it up
          </button>
        </div>
      </div>
      <div className="tb-board">
        {groups.map((group) => (
          <div key={group.title} className="tb-col">
            <h4 className="tb-col-title">{group.title}</h4>
            <ul>
              {group.notes.map((note) => (
                <li
                  key={note.title}
                  className="tb-note"
                  style={
                    {
                      '--mx': note.mess[0],
                      '--my': note.mess[1],
                      '--mr': `${note.mess[2]}deg`,
                    } as CSSProperties
                  }
                >
                  <span className="tb-note-scribble" aria-hidden={tidy}>
                    {note.scribble}
                  </span>
                  <span className="tb-note-tidy" aria-hidden={!tidy}>
                    <CountryLabIcon name={note.icon} />
                    <span>
                      <span className="tb-note-title">{note.title}</span>
                      <span className="tb-note-meta cty-tnum">{note.meta}</span>
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <figcaption className="tb-caption">
        <CountryLabExample>
          Example notes. Names and numbers are fictional.
        </CountryLabExample>
      </figcaption>
    </figure>
  )
}

export default function TackRoomBoard(_props: LandingLabVariantProps) {
  return (
    <CountryLabShell className="tb">
      <section className="tb-hero" aria-labelledby="tb-hero-title">
        <div className="tb-hero-photo">
          <CountryLabPhoto
            name="gate"
            sizes="100vw"
            priority
            position="62% center"
          />
        </div>
        <div className="cty-container tb-hero-copy">
          <h1 id="tb-hero-title">
            <span>Fewer “did anyone…?” messages.</span>
            <span>More time with the horses.</span>
          </h1>
          <div className="tb-hero-intro">
            <p>
              Paddock Pilot turns the yard whiteboard, the group chat and the
              notebook by the feed room into one shared place for plans, records
              and care.
            </p>
            <CountryLabAction tone="paper" />
          </div>
        </div>
      </section>

      <section className="tb-board-section" aria-labelledby="tb-board-heading">
        <div className="cty-container">
          <div className="tb-board-intro">
            <h2 id="tb-board-heading" className="cty-h2">
              Every yard has a board like this.
            </h2>
            <p className="cty-lede">
              Notes get rubbed out, messages scroll away and the vet’s number
              lives on somebody’s phone. Give it one tidy home.
            </p>
          </div>
          <Board />
        </div>
      </section>

      <section className="tb-keeps cty-on-ink" aria-labelledby="tb-keeps-title">
        <div className="cty-container tb-keeps-grid">
          <h2 id="tb-keeps-title" className="cty-h2">
            Then it keeps itself tidy.
          </h2>
          <ul className="tb-keeps-list">
            {keepsWorking.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="cty-close tb-close" aria-labelledby="tb-close-title">
        <div className="cty-container cty-close-grid">
          <h2 id="tb-close-title" className="cty-h2">
            Wipe the whiteboard clean.
          </h2>
          <div>
            <p className="cty-lede">
              Create your account, add your horses, and bring the rest of the
              yard along when you’re ready.
            </p>
            <CountryLabAction />
          </div>
        </div>
      </section>
    </CountryLabShell>
  )
}
