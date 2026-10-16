import { useT } from '#/i18n/LocaleProvider'
import {
  CurrentLandingAction,
  CurrentLandingClose,
  CurrentLandingPage,
  CurrentLandingPhoto,
} from '../CurrentLandingLabPrimitives'
import { useCurrentLandingCapabilities } from '../currentLandingLabContent'
import type { LandingLabVariantProps } from '../LandingLabPrimitives'

export default function OpenPaddock({ theme }: LandingLabVariantProps) {
  const t = useT()
  const capabilities = useCurrentLandingCapabilities()
  return (
    <CurrentLandingPage theme={theme} className="direction-paddock">
      <main id="main-content">
        <section className="paddock-opening" aria-labelledby="paddock-title">
          <div className="paddock-heading current-inner">
            <h1 id="paddock-title">
              <span>{t('landingDirections.panoramicTitle1')}</span>{' '}
              <span>{t('landingDirections.panoramicTitle2')}</span>
            </h1>
            <CurrentLandingAction />
          </div>
          <CurrentLandingPhoto priority />
          <div className="paddock-intro current-inner">
            <p>{t('landingDirections.intro')}</p>
          </div>
        </section>
        <section
          className="paddock-story"
          aria-labelledby="paddock-story-title"
        >
          <div className="current-inner">
            <h2 id="paddock-story-title">
              {t('landingDirections.capabilityTitle')}
            </h2>
          </div>
          {capabilities.map((capability, index) => (
            <article
              key={capability.id}
              className={
                index % 2 === 0
                  ? 'paddock-band current-inverse'
                  : 'paddock-band'
              }
            >
              <div className="current-inner">
                <h3>{capability.title}</h3>
                <p>{capability.description}</p>
              </div>
            </article>
          ))}
        </section>
        <CurrentLandingClose />
      </main>
    </CurrentLandingPage>
  )
}
