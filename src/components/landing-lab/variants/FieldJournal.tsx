import { useT } from '#/i18n/LocaleProvider'
import {
  CurrentLandingAction,
  CurrentLandingClose,
  CurrentLandingPage,
  CurrentLandingPhoto,
} from '../CurrentLandingLabPrimitives'
import { useCurrentLandingCapabilities } from '../currentLandingLabContent'
import type { LandingLabVariantProps } from '../LandingLabPrimitives'

export default function FieldJournal({ theme }: LandingLabVariantProps) {
  const t = useT()
  const capabilities = useCurrentLandingCapabilities()
  return (
    <CurrentLandingPage
      theme={theme}
      className="direction-journal"
      overlayHeader
    >
      <main id="main-content">
        <section
          className="journal-opening current-inverse"
          aria-labelledby="journal-title"
        >
          <CurrentLandingPhoto priority />
          <div className="current-inner">
            <h1 id="journal-title">
              <span>{t('landing.hero1')}</span>{' '}
              <span>{t('landing.hero2')}</span>{' '}
              <span>{t('landing.hero3')}</span>
            </h1>
            <p>{t('landingDirections.intro')}</p>
            <CurrentLandingAction inverse />
          </div>
        </section>
        <section
          className="journal-shared current-inverse"
          aria-labelledby="journal-shared-title"
        >
          <div className="current-inner">
            <h2 id="journal-shared-title">
              {t('landingDirections.sharedTitle')}
            </h2>
            <div className="journal-capabilities">
              {capabilities.map((capability) => (
                <article key={capability.id}>
                  <h3>{capability.title}</h3>
                  <p>{capability.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <CurrentLandingClose />
      </main>
    </CurrentLandingPage>
  )
}
