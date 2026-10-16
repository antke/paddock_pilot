import type { ReactNode } from 'react'
import { ArrowRight } from '@phosphor-icons/react'

import { ButtonLink } from '#/components/ui/button'
import { LanguageSelector } from '#/i18n/LanguageSelector'
import { useT } from '#/i18n/LocaleProvider'
import { cn } from '#/lib/utils'
import { LandingLabThemeBoundary } from './LandingLabThemeBoundary'
import type { LandingLabVariantProps } from './LandingLabPrimitives'
import './currentLandingLab.css'

export function CurrentLandingPage({
  children,
  className,
  overlayHeader = false,
  theme = 'light',
}: LandingLabVariantProps & {
  children: ReactNode
  className: string
  overlayHeader?: boolean
}) {
  const t = useT()
  return (
    <LandingLabThemeBoundary theme={theme}>
      <div className={cn('current-landing', className)}>
        <a className="current-skip" href="#main-content">
          {t('navigation.skip')}
        </a>
        <header
          className={cn(
            'current-header',
            overlayHeader && 'current-header-overlay',
          )}
        >
          <nav className="current-inner" aria-label={t('navigation.public')}>
            <ButtonLink to="/" variant="ghost" className="current-wordmark">
              Paddock Pilot<span aria-hidden="true">.</span>
            </ButtonLink>
            <ButtonLink
              to="/sign-in/$"
              variant="ghost"
              className="current-sign-in"
            >
              {t('navigation.signIn')}
            </ButtonLink>
          </nav>
        </header>
        {children}
        <footer className="current-footer">
          <div className="current-inner">
            <p>Paddock Pilot © {new Date().getFullYear()}</p>
            <div className="current-footer-controls">
              <nav aria-label={t('navigation.footer')}>
                <ButtonLink to="/pricing" variant="ghost">
                  {t('navigation.plans')}
                </ButtonLink>
                <ButtonLink to="/sign-in/$" variant="ghost">
                  {t('navigation.signIn')}
                </ButtonLink>
              </nav>
              <LanguageSelector compact />
            </div>
          </div>
        </footer>
      </div>
    </LandingLabThemeBoundary>
  )
}

export function CurrentLandingAction({
  inverse = false,
}: {
  inverse?: boolean
}) {
  const t = useT()
  return (
    <ButtonLink
      to="/sign-up/$"
      size="lg"
      variant={inverse ? 'secondary' : 'default'}
      className={cn('current-action', inverse && 'current-action-inverse')}
    >
      {t('landing.createAccount')}
      <ArrowRight data-icon="inline-end" aria-hidden="true" />
    </ButtonLink>
  )
}

export function CurrentLandingPhoto({
  className,
  priority = false,
}: {
  className?: string
  priority?: boolean
}) {
  const t = useT()
  return (
    <picture className={cn('current-photo', className)}>
      <source
        media="(max-width: 699px)"
        srcSet="/landing-lab/field-office-panorama-480.jpg 480w, /landing-lab/field-office-panorama-960.jpg 960w"
        sizes="100vw"
      />
      <img
        src="/landing-lab/field-office-panorama-960.jpg"
        srcSet="/landing-lab/field-office-panorama-480.jpg 480w, /landing-lab/field-office-panorama-960.jpg 960w, /landing-lab/field-office-panorama-1600.jpg 1600w"
        sizes="100vw"
        width="1600"
        height="872"
        alt={t('landing.yardPhoto')}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
      />
    </picture>
  )
}

export function CurrentLandingClose() {
  const t = useT()
  return (
    <section className="current-close" aria-labelledby="current-close-title">
      <div className="current-inner">
        <h2 id="current-close-title">{t('landingDirections.closeTitle')}</h2>
        <div>
          <p>{t('landingDirections.closeDescription')}</p>
          <CurrentLandingAction />
        </div>
      </div>
    </section>
  )
}
