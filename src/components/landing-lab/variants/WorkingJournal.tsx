import { useT } from '#/i18n/LocaleProvider'
import {
  CurrentLandingAction,
  CurrentLandingClose,
  CurrentLandingPage,
} from '../CurrentLandingLabPrimitives'
import { useCurrentLandingCapabilities } from '../currentLandingLabContent'
import type { LandingLabVariantProps } from '../LandingLabPrimitives'

export default function WorkingJournal({ theme }: LandingLabVariantProps) {
  const t = useT()
  const capabilities = useCurrentLandingCapabilities()
  return (
    <CurrentLandingPage theme={theme} className="direction-working">
      <main id="main-content">
        <section
          className="working-opening current-inner"
          aria-labelledby="working-title"
        >
          <h1 id="working-title">
            <span>{t('landingDirections.workingTitle1')}</span>{' '}
            <span>{t('landingDirections.workingTitle2')}</span>{' '}
            <span>{t('landingDirections.workingTitle3')}</span>
          </h1>
          <div>
            <p>{t('landingDirections.intro')}</p>
            <CurrentLandingAction />
          </div>
        </section>
        <section
          className="working-story"
          aria-labelledby="working-story-title"
        >
          <div className="current-inner">
            <h2 id="working-story-title">
              {t('landingDirections.capabilityTitle')}
            </h2>
            <ol>
              {capabilities.map((capability, index) => (
                <li key={capability.id}>
                  <span className="working-number" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3>{capability.title}</h3>
                  <p>{capability.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <CurrentLandingClose />
      </main>
    </CurrentLandingPage>
  )
}
