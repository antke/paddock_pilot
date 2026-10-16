import { useT } from '#/i18n/LocaleProvider'
import {
  CurrentLandingAction,
  CurrentLandingClose,
  CurrentLandingPage,
} from '../CurrentLandingLabPrimitives'
import { useCurrentLandingCapabilities } from '../currentLandingLabContent'
import type { LandingLabVariantProps } from '../LandingLabPrimitives'

export default function PineStatement({ theme }: LandingLabVariantProps) {
  const t = useT()
  const capabilities = useCurrentLandingCapabilities()
  return (
    <CurrentLandingPage
      theme={theme}
      className="direction-statement"
      overlayHeader
    >
      <main id="main-content">
        <section
          className="statement-opening current-inverse"
          aria-labelledby="statement-title"
        >
          <div className="current-inner">
            <h1 id="statement-title">
              <span>{t('landingDirections.statementTitle1')}</span>{' '}
              <span>{t('landingDirections.statementTitle2')}</span>
            </h1>
            <div className="statement-intro">
              <p>{t('landingDirections.intro')}</p>
              <CurrentLandingAction inverse />
            </div>
          </div>
        </section>
        <section
          className="statement-story"
          aria-labelledby="statement-story-title"
        >
          <div className="current-inner">
            <h2 id="statement-story-title">
              {t('landingDirections.capabilityTitle')}
            </h2>
          </div>
          <div className="statement-capabilities">
            {capabilities.map((capability) => (
              <article key={capability.id}>
                <h3>{capability.title}</h3>
                <p>{capability.description}</p>
              </article>
            ))}
          </div>
        </section>
        <CurrentLandingClose />
      </main>
    </CurrentLandingPage>
  )
}
