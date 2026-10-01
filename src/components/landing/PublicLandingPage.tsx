import { useT } from '#/i18n/LocaleProvider'
import { Link } from '@tanstack/react-router'
import {
  CountryArrow,
  CountryHeader,
  CountryLandingHero,
  CountryPage,
  CountryCareExample,
} from './CountryLandingHero'

export function PublicLandingPage() {
  const t = useT()
  return (
    <CountryPage>
      <CountryHeader overlay />
      <main id="country-main">
        <CountryLandingHero composition="journal" />
        <section
          className="country-shared"
          id="country-product"
          aria-labelledby="country-shared-title"
        >
          <div className="country-container">
            <div className="country-section-grid">
              <h2 id="country-shared-title">
                {t('landing.sharedTitle1')}
                <br />
                {t('landing.sharedTitle2')}
              </h2>
              <p>{t('landing.sharedDescription')}</p>
            </div>
            <div className="country-product-preview">
              <div
                className="country-product-bar"
                aria-label={t('landing.horseRecord')}
              >
                <span>Paddock Pilot</span>
                <span>{t('landing.horseBreadcrumb')}</span>
              </div>
              <div className="country-product-content">
                <div className="country-horse-profile">
                  <img
                    src="/landing-lab/juniper-palomino-480.jpg"
                    srcSet="/landing-lab/juniper-palomino-480.jpg 480w, /landing-lab/juniper-palomino-960.jpg 960w"
                    sizes="(max-width: 699px) 90px, 300px"
                    alt={t('landing.horsePhoto')}
                    width="480"
                    height="384"
                    loading="lazy"
                  />
                </div>
                <CountryCareExample />
              </div>
            </div>
          </div>
        </section>
        <section
          className="country-start"
          aria-labelledby="country-start-title"
        >
          <div className="country-container country-section-grid">
            <div className="country-start-heading">
              <h2 id="country-start-title">
                {t('landing.startTitle1')}
                <br />
                {t('landing.startTitle2')}
              </h2>
            </div>
            <div className="country-start-action">
              <p>{t('landing.startDescription')}</p>
              <Link className="country-button" to="/sign-up/$">
                {t('landing.createAccount')} <CountryArrow />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="country-footer">
        <div className="country-footer-inner">
          <p>Paddock Pilot © {new Date().getFullYear()}</p>
          <nav aria-label={t('navigation.footer')}>
            <Link className="country-text-link" to="/pricing">
              {t('navigation.plans')}
            </Link>
            <Link className="country-text-link" to="/sign-in/$">
              {t('navigation.signIn')}
            </Link>
          </nav>
        </div>
      </footer>
    </CountryPage>
  )
}
