import {
  BellIcon,
  CalendarBlankIcon,
  HorseIcon,
  PhoneIcon,
} from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { useEffect, useId, useRef, useState } from 'react'
import type { CSSProperties, ComponentType } from 'react'

import { LanguageSelector } from '#/i18n/LanguageSelector'
import { useT } from '#/i18n/LocaleProvider'
import { cn } from '#/lib/utils'
import { CountryArrow, CountryHeader, CountryPage } from './CountryLandingHero'
import './publicLanding.css'

/*
 * One selling point: get rid of the whiteboard and the group chat. The board
 * shows the yard's notes as they are, then tidies them once it has been seen.
 * The horses, people and phone numbers on it are fictional; the numbers come
 * from UK ranges reserved for that use.
 */

/** Long enough to read the notes; the board must be almost fully in view. */
const AUTO_TIDY_DELAY_MS = 6000
const AUTO_TIDY_VISIBLE_SHARE = 0.8

type Mess = [x: number, y: number, rotation: number]

const LANDING_PHOTOS = {
  yard: {
    src: '/landing-lab/field-office-panorama-960.jpg',
    srcSet:
      '/landing-lab/field-office-panorama-480.jpg 480w, /landing-lab/field-office-panorama-960.jpg 960w, /landing-lab/field-office-panorama-1600.jpg 1600w',
  },
  palomino: {
    src: '/landing-lab/juniper-palomino-960.jpg',
    srcSet:
      '/landing-lab/juniper-palomino-480.jpg 480w, /landing-lab/juniper-palomino-960.jpg 960w',
  },
}

function CreateAccountLink({ tone = 'ink' }: { tone?: 'ink' | 'paper' }) {
  const t = useT()
  return (
    <Link
      className={cn('country-button', tone === 'paper' && 'lp-button-paper')}
      to="/sign-up/$"
    >
      {t('landing.createAccount')} <CountryArrow />
    </Link>
  )
}

/** Tidies the board once, after it has been in view, unless the visitor acts. */
function useAutoTidy(
  tidy: boolean,
  skip: boolean,
  setTidy: (tidy: boolean) => void,
) {
  const targetRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const target = targetRef.current
    if (
      !target ||
      tidy ||
      skip ||
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }
    let timer: number | undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        window.clearTimeout(timer)
        if (entry?.isIntersecting) {
          timer = window.setTimeout(() => setTidy(true), AUTO_TIDY_DELAY_MS)
        }
      },
      { threshold: AUTO_TIDY_VISIBLE_SHARE },
    )
    observer.observe(target)
    return () => {
      window.clearTimeout(timer)
      observer.disconnect()
    }
  }, [tidy, skip, setTidy])

  return targetRef
}

function NotesBoard() {
  const t = useT()
  const id = useId()
  const [tidy, setTidy] = useState(false)
  const [visitorChose, setVisitorChose] = useState(false)
  const figureRef = useAutoTidy(tidy, visitorChose, setTidy)

  const choose = (next: boolean) => {
    setVisitorChose(true)
    setTidy(next)
  }

  const groups: ReadonlyArray<{
    title: string
    Icon: ComponentType<{ 'aria-hidden'?: boolean; className?: string }>
    notes: ReadonlyArray<{
      scribble: string
      title: string
      meta: string
      /** Offsets as fractions of the note's own box, then degrees. */
      mess: Mess
    }>
  }> = [
    {
      title: t('publicLanding.board.calendar'),
      Icon: CalendarBlankIcon,
      notes: [
        {
          scribble: t('publicLanding.board.farrierNote'),
          title: t('publicLanding.board.farrierTitle'),
          meta: t('publicLanding.board.farrierMeta'),
          mess: [2.22, 1.12, -3],
        },
        {
          scribble: t('publicLanding.board.turnoutNote'),
          title: t('publicLanding.board.turnoutTitle'),
          meta: t('publicLanding.board.turnoutMeta'),
          mess: [3.24, -1.02, 2.5],
        },
      ],
    },
    {
      title: t('publicLanding.board.reminders'),
      Icon: BellIcon,
      notes: [
        {
          scribble: t('publicLanding.board.wormerNote'),
          title: t('publicLanding.board.wormerTitle'),
          meta: t('publicLanding.board.wormerMeta'),
          mess: [-1.06, 1.18, 2],
        },
        {
          scribble: t('publicLanding.board.boosterNote'),
          title: t('publicLanding.board.boosterTitle'),
          meta: t('publicLanding.board.boosterMeta'),
          mess: [0.04, -1.08, -2.5],
        },
      ],
    },
    {
      title: t('publicLanding.board.horses'),
      Icon: HorseIcon,
      notes: [
        {
          scribble: t('publicLanding.board.feedNote'),
          title: t('publicLanding.board.feedTitle'),
          meta: t('publicLanding.board.feedMeta'),
          mess: [-2.14, 0.08, -1.5],
        },
        {
          scribble: t('publicLanding.board.healthNote'),
          title: t('publicLanding.board.healthTitle'),
          meta: t('publicLanding.board.healthMeta'),
          mess: [1.08, 0.1, 3.5],
        },
      ],
    },
    {
      title: t('publicLanding.board.contacts'),
      Icon: PhoneIcon,
      notes: [
        {
          scribble: t('publicLanding.board.vetNote'),
          title: t('publicLanding.board.vetTitle'),
          meta: t('publicLanding.board.vetMeta'),
          mess: [-2.24, 1.2, -2],
        },
        {
          scribble: t('publicLanding.board.providerNote'),
          title: t('publicLanding.board.providerTitle'),
          meta: t('publicLanding.board.providerMeta'),
          mess: [-1.12, -1.1, 1.5],
        },
      ],
    },
  ]

  return (
    <figure
      ref={figureRef}
      className="lp-board-figure"
      aria-labelledby={`${id}-title`}
      data-tidy={tidy ? 'true' : 'false'}
    >
      <div className="lp-board-bar">
        <h3 id={`${id}-title`} className="lp-board-title">
          {t(
            tidy
              ? 'publicLanding.board.tidyTitle'
              : 'publicLanding.board.messyTitle',
          )}
        </h3>
        <div
          className="lp-switch"
          role="group"
          aria-label={t('publicLanding.board.switchLabel')}
        >
          <button
            type="button"
            aria-pressed={!tidy}
            onClick={() => choose(false)}
          >
            {t('publicLanding.board.asItIs')}
          </button>
          <button
            type="button"
            aria-pressed={tidy}
            onClick={() => choose(true)}
          >
            {t('publicLanding.board.tidyUp')}
          </button>
        </div>
      </div>
      <div className="lp-board">
        {groups.map(({ title, Icon, notes }) => (
          <div key={title} className="lp-col">
            <h4 className="lp-col-title">{title}</h4>
            <ul>
              {notes.map((note) => (
                <li
                  key={note.title}
                  className="lp-note"
                  style={
                    {
                      '--mx': note.mess[0],
                      '--my': note.mess[1],
                      '--mr': `${note.mess[2]}deg`,
                    } as CSSProperties
                  }
                >
                  <span className="lp-note-scribble" aria-hidden={tidy}>
                    {note.scribble}
                  </span>
                  <span className="lp-note-tidy" aria-hidden={!tidy}>
                    <Icon aria-hidden={true} className="lp-icon" />
                    <span>
                      <span className="lp-note-title">{note.title}</span>
                      <span className="lp-note-meta">{note.meta}</span>
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </figure>
  )
}

export function PublicLandingPage() {
  const t = useT()

  const keeps = [
    {
      lead: t('publicLanding.keeps.remindersLead'),
      rest: t('publicLanding.keeps.remindersRest'),
    },
    {
      lead: t('publicLanding.keeps.notesLead'),
      rest: t('publicLanding.keeps.notesRest'),
    },
    {
      lead: t('publicLanding.keeps.planLead'),
      rest: t('publicLanding.keeps.planRest'),
    },
    {
      lead: t('publicLanding.keeps.moveLead'),
      rest: t('publicLanding.keeps.moveRest'),
    },
  ]
  const sharing = [
    {
      title: t('publicLanding.share.helperTitle'),
      copy: t('publicLanding.share.helperCopy'),
    },
    {
      title: t('publicLanding.share.yardTitle'),
      copy: t('publicLanding.share.yardCopy'),
    },
    {
      title: t('publicLanding.share.accessTitle'),
      copy: t('publicLanding.share.accessCopy'),
    },
  ]
  const questions = [
    {
      question: t('publicLanding.faq.yardQuestion'),
      answer: t('publicLanding.faq.yardAnswer'),
    },
    {
      question: t('publicLanding.faq.accessQuestion'),
      answer: t('publicLanding.faq.accessAnswer'),
    },
    {
      question: t('publicLanding.faq.moveQuestion'),
      answer: t('publicLanding.faq.moveAnswer'),
    },
    {
      question: t('publicLanding.faq.keepQuestion'),
      answer: t('publicLanding.faq.keepAnswer'),
    },
    {
      question: t('publicLanding.faq.vetQuestion'),
      answer: t('publicLanding.faq.vetAnswer'),
    },
  ]

  return (
    <CountryPage>
      <div className="lp">
        <CountryHeader overlay />
        <main id="country-main">
          <section className="lp-hero" aria-labelledby="lp-hero-title">
            <div className="lp-hero-photo">
              <img
                className="lp-photo"
                {...LANDING_PHOTOS.yard}
                sizes="100vw"
                alt={t('landing.yardPhoto')}
                width={1600}
                height={872}
                fetchPriority="high"
                decoding="async"
                style={{ objectPosition: '60% 40%' }}
              />
            </div>
            <div className="country-container lp-hero-panel-wrap">
              <div className="lp-hero-panel">
                <h1 id="lp-hero-title">
                  <span>{t('publicLanding.headline1')}</span>
                  <span>{t('publicLanding.headline2')}</span>
                </h1>
                <div className="lp-hero-intro">
                  <p className="lp-lede">{t('publicLanding.intro')}</p>
                  <CreateAccountLink />
                </div>
              </div>
            </div>
          </section>

          <section
            className="lp-board-section lp-on-ink"
            aria-labelledby="lp-board-heading"
          >
            <div className="country-container">
              <div className="lp-board-intro">
                <h2 id="lp-board-heading" className="lp-h2">
                  {t('publicLanding.boardTitle')}
                </h2>
                <p className="lp-lede">{t('publicLanding.boardDescription')}</p>
              </div>
              <NotesBoard />
            </div>
          </section>

          <section className="lp-keeps" aria-labelledby="lp-keeps-title">
            <div className="country-container">
              <h2 id="lp-keeps-title" className="lp-h2">
                {t('publicLanding.keepsTitle')}
              </h2>
              <ul className="lp-keeps-list">
                {keeps.map((line) => (
                  <li key={line.lead}>
                    <span className="lp-keeps-lead">{line.lead}</span>{' '}
                    {line.rest}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="lp-share" aria-labelledby="lp-share-title">
            <div className="lp-share-photo">
              <img
                className="lp-photo"
                {...LANDING_PHOTOS.palomino}
                sizes="(max-width: 899px) 100vw, 46vw"
                alt={t('landing.horsePhoto')}
                width={960}
                height={768}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="lp-share-body">
              <h2 id="lp-share-title" className="lp-h2">
                {t('publicLanding.shareTitle')}
              </h2>
              <div className="lp-share-list">
                {sharing.map((item) => (
                  <div key={item.title}>
                    <h3>{item.title}</h3>
                    <p>{item.copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="lp-faq" aria-labelledby="lp-faq-title">
            <div className="country-container lp-faq-grid">
              <div className="lp-faq-intro">
                <h2 id="lp-faq-title" className="lp-h2">
                  {t('publicLanding.faqTitle')}
                </h2>
                <p className="lp-lede">{t('publicLanding.faqDescription')}</p>
              </div>
              <dl className="lp-faq-list">
                {questions.map((item) => (
                  <div key={item.question}>
                    <dt>{item.question}</dt>
                    <dd>{item.answer}</dd>
                  </div>
                ))}
                <div>
                  <dt>{t('publicLanding.faq.costQuestion')}</dt>
                  <dd>
                    {t('publicLanding.faq.costAnswer')}{' '}
                    <Link to="/pricing" className="lp-inline-link">
                      {t('navigation.plans')}
                    </Link>
                    .
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          <section
            className="lp-close lp-on-ink"
            aria-labelledby="lp-close-title"
          >
            <div className="country-container lp-close-grid">
              <h2 id="lp-close-title" className="lp-h2">
                {t('publicLanding.closeTitle')}
              </h2>
              <div>
                <p className="lp-lede">{t('publicLanding.closeDescription')}</p>
                <CreateAccountLink tone="paper" />
              </div>
            </div>
          </section>
        </main>
        <footer className="country-footer">
          <div className="country-footer-inner">
            <p>Paddock Pilot © {new Date().getFullYear()}</p>
            <div className="country-footer-controls">
              <nav aria-label={t('navigation.footer')}>
                <Link className="country-text-link" to="/pricing">
                  {t('navigation.plans')}
                </Link>
                <Link className="country-text-link" to="/sign-in/$">
                  {t('navigation.signIn')}
                </Link>
              </nav>
              <div className="country-footer-language">
                <LanguageSelector compact />
              </div>
            </div>
          </div>
        </footer>
      </div>
    </CountryPage>
  )
}
