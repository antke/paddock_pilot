import { Link } from '@tanstack/react-router'
import {
  CountryArrow,
  CountryHeader,
  CountryLandingHero,
  CountryPage,
  CountryCareExample,
} from './CountryLandingHero'

export function PublicLandingPage() {
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
                Good care is
                <br />a shared effort.
              </h2>
              <p>
                No more searching through old messages, notebooks or post-it
                notes. Everything you need is in one place, so you can spend
                more time on what matters.
              </p>
            </div>
            <div className="country-product-preview">
              <div
                className="country-product-bar"
                aria-label="Example horse record"
              >
                <span>Paddock Pilot</span>
                <span>Horses / Juniper</span>
              </div>
              <div className="country-product-content">
                <div className="country-horse-profile">
                  <img
                    src="/landing-lab/juniper-palomino-480.jpg"
                    srcSet="/landing-lab/juniper-palomino-480.jpg 480w, /landing-lab/juniper-palomino-960.jpg 960w"
                    sizes="(max-width: 699px) 90px, 300px"
                    alt="Juniper, a palomino horse with a golden coat and ivory mane."
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
                Make yourself
                <br />
                at home.
              </h2>
            </div>
            <div className="country-start-action">
              <p>Create your stable, add your horse and invite your friends.</p>
              <Link className="country-button" to="/sign-up/$">
                Create your account <CountryArrow />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="country-footer">
        <div className="country-footer-inner">
          <p>Paddock Pilot © {new Date().getFullYear()}</p>
          <nav aria-label="Footer navigation">
            <Link className="country-text-link" to="/pricing">
              Plans
            </Link>
            <Link className="country-text-link" to="/sign-in/$">
              Sign in
            </Link>
          </nav>
        </div>
      </footer>
    </CountryPage>
  )
}
