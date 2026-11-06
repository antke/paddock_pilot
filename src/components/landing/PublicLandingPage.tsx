import { Link } from '@tanstack/react-router'

import { LanguageSelector } from '#/i18n/LanguageSelector'
import { useT } from '#/i18n/LocaleProvider'
import { CountryArrow, CountryHeader, CountryPage } from './CountryLandingHero'
import { YardBoard } from './YardBoard'
import './publicLanding.css'

/*
 * One selling point: get rid of the whiteboard and the group chat. The opening
 * photograph sinks into the evergreen wall the yard's board hangs on, scrolling
 * wipes that board clean, and the page closes on the same words.
 */

const LANDING_PHOTOS = {
  yard: {
    src: '/landing-lab/field-office-panorama-960.jpg',
    srcSet:
      '/landing-lab/field-office-panorama-480.jpg 480w, /landing-lab/field-office-panorama-960.jpg 960w, /landing-lab/field-office-panorama-1600.jpg 1600w',
  },
}

function CreateAccountLink({ onBoard = false }: { onBoard?: boolean }) {
  const t = useT()
  return (
    <Link
      className={`country-button${onBoard ? ' lp-button-board' : ''}`}
      to="/sign-up/$"
    >
      {t('landing.createAccount')} <CountryArrow />
    </Link>
  )
}

export function PublicLandingPage() {
  const t = useT()

  const questions = [
    {
      question: t('publicLanding.faq.yardQuestion'),
      answer: t('publicLanding.faq.yardAnswer'),
    },
    {
      question: t('publicLanding.faq.accessQuestion'),
      answer: t('publicLanding.faq.accessAnswer'),
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
              />
            </div>
            <div className="country-container lp-hero-copy">
              <h1 id="lp-hero-title">
                <span>{t('publicLanding.headline1')}</span>
                <span>{t('publicLanding.headline2')}</span>
              </h1>
              <div className="lp-hero-intro">
                <p className="lp-lede">{t('publicLanding.intro')}</p>
                <CreateAccountLink />
              </div>
            </div>
          </section>

          <YardBoard action={<CreateAccountLink onBoard />} />

          <section className="lp-share" aria-labelledby="lp-share-title">
            <div className="lp-share-photo">
              <img
                className="lp-photo"
                {...LANDING_PHOTOS.yard}
                sizes="300vw"
                alt={t('publicLanding.sharePhoto')}
                width={1600}
                height={872}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="lp-share-body">
              <h2 id="lp-share-title" className="lp-h2">
                <span>{t('publicLanding.shareTitleOne')}</span>{' '}
                <span>{t('publicLanding.shareTitleTwo')}</span>
              </h2>
              <p className="lp-lede">{t('publicLanding.shareCopy')}</p>
            </div>
          </section>

          <section className="lp-faq" aria-labelledby="lp-faq-title">
            <div className="country-container">
              <h2 id="lp-faq-title" className="lp-h2">
                {t('publicLanding.faqTitle')}
              </h2>
              <dl className="lp-faq-list">
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
                {questions.map((item) => (
                  <div key={item.question}>
                    <dt>{item.question}</dt>
                    <dd>{item.answer}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section className="lp-close" aria-labelledby="lp-close-title">
            <div className="country-container">
              <h2 id="lp-close-title" className="lp-close-title">
                {t('publicLanding.closeTitle')}
              </h2>
              <div className="lp-close-action">
                <p className="lp-lede">{t('publicLanding.closeDescription')}</p>
                <CreateAccountLink />
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
