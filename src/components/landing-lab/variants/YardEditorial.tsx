import { useT } from '#/i18n/LocaleProvider'
import {
  CurrentLandingAction,
  CurrentLandingClose,
  CurrentLandingPage,
  CurrentLandingPhoto,
} from '../CurrentLandingLabPrimitives'
import { useCurrentLandingCapabilities } from '../currentLandingLabContent'
import type { LandingLabVariantProps } from '../LandingLabPrimitives'

export default function YardEditorial({ theme }: LandingLabVariantProps) {
  const t = useT()
  const capabilities = useCurrentLandingCapabilities()
  return (
    <CurrentLandingPage theme={theme} className="direction-editorial">
      <main id="main-content">
        <section
          className="editorial-opening current-inner"
          aria-labelledby="editorial-title"
        >
          <h1 id="editorial-title">
            <span>{t('landingDirections.editorialTitle1')}</span>{' '}
            <span>{t('landingDirections.editorialTitle2')}</span>
          </h1>
          <div className="editorial-intro">
            <p>{t('landingDirections.intro')}</p>
            <CurrentLandingAction />
          </div>
        </section>
        <CurrentLandingPhoto className="editorial-photo" />
        <section
          className="editorial-story current-inner"
          aria-labelledby="editorial-story-title"
        >
          <h2 id="editorial-story-title">
            {t('landingDirections.capabilityTitle')}
          </h2>
          <div>
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
