import { createFileRoute } from '@tanstack/react-router'
import {
  CountryHeader,
  CountryLandingHero,
  CountryPage,
} from '#/components/landing/CountryLandingHero'
import './country-study.css'
import { PublicLandingPage } from '#/components/landing/PublicLandingPage'

export const Route = createFileRoute('/landing-lab/country-study')({
  validateSearch: (search: Record<string, unknown>) => ({
    composition:
      search.composition === 'open-yard'
        ? ('open-yard' as const)
        : ('journal' as const),
    mode:
      search.mode === 'preview' ? ('preview' as const) : ('review' as const),
    viewport:
      search.viewport === 'mobile' ? ('mobile' as const) : ('desktop' as const),
  }),
  head: () => ({
    meta: [
      { title: 'Two country openings · Paddock Pilot' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: CountryStudy,
})

function CountryStudy() {
  const { composition, mode, viewport } = Route.useSearch()

  if (mode === 'preview') {
    if (composition === 'journal') return <PublicLandingPage />
    return (
      <CountryPage>
        <CountryHeader />
        <main id="country-main">
          <CountryLandingHero composition={composition} />
        </main>
      </CountryPage>
    )
  }

  const previewUrl = `/landing-lab/country-study?composition=${composition}&mode=preview`

  return (
    <div className="country-study">
      <header className="country-study-toolbar">
        <div className="country-study-title">
          <strong>Two country openings</strong>
          <span>Same story. Two ways in.</span>
        </div>
        <nav className="country-study-options" aria-label="Hero composition">
          <a
            aria-current={composition === 'journal' ? 'page' : undefined}
            href={`?composition=journal&viewport=${viewport}`}
          >
            A · Field journal
          </a>
          <a
            aria-current={composition === 'open-yard' ? 'page' : undefined}
            href={`?composition=open-yard&viewport=${viewport}`}
          >
            B · Open yard
          </a>
        </nav>
        <nav className="country-study-viewport" aria-label="Preview size">
          <a
            aria-current={viewport === 'desktop' ? 'page' : undefined}
            href={`?composition=${composition}&viewport=desktop`}
          >
            Desktop
          </a>
          <a
            aria-current={viewport === 'mobile' ? 'page' : undefined}
            href={`?composition=${composition}&viewport=mobile`}
          >
            Phone
          </a>
        </nav>
        <a
          className="country-study-open"
          href={previewUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open full size ↗
        </a>
      </header>
      <p className="country-study-description">
        {composition === 'journal'
          ? 'A full-width stable photograph opens the page, followed by a dedicated shared-care example.'
          : 'A generous typographic opening, followed by a landscape photograph and a quiet care record.'}
      </p>
      <div className={`country-study-stage country-study-stage-${viewport}`}>
        <iframe
          title={`${composition === 'journal' ? 'Field journal' : 'Open yard'} ${viewport} preview`}
          src={previewUrl}
        />
      </div>
    </div>
  )
}
