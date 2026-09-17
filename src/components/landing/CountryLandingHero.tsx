import { useId, useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import './countryLanding.css'

export type CountryComposition = 'journal' | 'open-yard'

export function CountryArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export function CountryHeader({ overlay = false }: { overlay?: boolean }) {
  return (
    <header
      className={`country-header${overlay ? ' country-header-overlay' : ''}`}
    >
      <a href="#country-main" className="country-skip">
        Skip to content
      </a>
      <nav className="country-header-inner" aria-label="Public navigation">
        <Link
          className="country-wordmark"
          to="/"
          aria-label="Paddock Pilot home"
        >
          <span>Paddock</span> <span>Pilot</span>
          <span className="country-wordmark-dot">.</span>
        </Link>
        <div className="country-header-actions">
          <Link className="country-text-link" to="/sign-in/$">
            Sign in
          </Link>
          <Link className="country-button country-button-small" to="/sign-up/$">
            Create account
          </Link>
        </div>
      </nav>
    </header>
  )
}

export function CountryPage({ children }: { children: ReactNode }) {
  return <div className="country-page">{children}</div>
}

export function CountryCareExample() {
  const [completed, setCompleted] = useState(true)
  const id = useId()

  return (
    <figure
      className="country-care"
      id="country-care-example"
      aria-labelledby={`${id}-title`}
    >
      <div className="country-care-top">
        <h2 id={`${id}-title`}>Juniper’s care</h2>
        <span className="country-example-label">Example</span>
      </div>
      <div
        className="country-care-switch"
        role="group"
        aria-label="Example visit status"
      >
        <button
          type="button"
          aria-pressed={!completed}
          onClick={() => setCompleted(false)}
        >
          Planned
        </button>
        <button
          type="button"
          aria-pressed={completed}
          onClick={() => setCompleted(true)}
        >
          Completed
        </button>
      </div>
      <div className="country-visit">
        <div className="country-visit-title">
          <h3>Farrier visit</h3>
          {completed ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-label="Completed"
              role="img"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="m8 12 2.5 2.5L16 9"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          ) : null}
        </div>
        <p className="country-visit-date">Thursday · 10:30</p>
        <div
          className="country-visit-note"
          aria-live="polite"
          aria-atomic="true"
        >
          <p>
            {completed
              ? 'Trim completed. Next visit to be arranged.'
              : 'Sam Taylor, farrier.'}
          </p>
        </div>
      </div>
    </figure>
  )
}

function CountryYardPhoto() {
  return (
    <picture className="country-yard-photo">
      <source
        media="(max-width: 699px)"
        srcSet="/landing-lab/field-office-panorama-480.jpg 480w, /landing-lab/field-office-panorama-960.jpg 960w"
        sizes="100vw"
      />
      <img
        src="/landing-lab/field-office-panorama-960.jpg"
        srcSet="/landing-lab/field-office-panorama-480.jpg 480w, /landing-lab/field-office-panorama-960.jpg 960w, /landing-lab/field-office-panorama-1600.jpg 1600w"
        sizes="100vw"
        alt="A chestnut horse looking out over the stable gate in the evening light."
        width="1600"
        height="872"
        fetchPriority="high"
        decoding="async"
      />
    </picture>
  )
}

export function CountryLandingHero({
  composition = 'journal',
}: {
  composition?: CountryComposition
}) {
  return (
    <section
      className={`country-hero country-hero-${composition}`}
      aria-labelledby="country-hero-title"
    >
      <div className="country-hero-title-group">
        <h1 id="country-hero-title">
          <span>A little less admin.</span>
          <span>A little more time</span>
          <span>at the yard.</span>
        </h1>
      </div>
      <div className="country-hero-intro">
        <p>
          One shared place for your stable’s plans, horse records and everyday
          care—so everyone knows what’s happening.
        </p>
        <Link className="country-button" to="/sign-up/$">
          Create your account <CountryArrow />
        </Link>
      </div>
      {composition === 'open-yard' ? <CountryCareExample /> : null}
      <CountryYardPhoto />
    </section>
  )
}
