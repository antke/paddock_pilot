import { HorseIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { LanguageSelector } from '#/i18n/LanguageSelector'
import { useT } from '#/i18n/LocaleProvider'
import { cn } from '#/lib/utils'
import {
  CountryArrow,
  CountryHeader,
  CountryPage,
} from '#/components/landing/CountryLandingHero'
import './countryLab.css'

/*
 * Shared kit for the country-landing lab round. Every concept keeps the live
 * landing's world (paper, evergreen, Fraunces Country, Manrope, yard
 * photography) and varies structure, copy and the signature interaction.
 * Example horses, people and phone numbers are fictional and labelled.
 */

export function CountryLabShell({
  children,
  className,
  overlayHeader = true,
}: {
  children: ReactNode
  className?: string
  overlayHeader?: boolean
}) {
  return (
    <CountryPage>
      <div className={cn('cty-page', className)}>
        <CountryHeader overlay={overlayHeader} />
        <main id="country-main">{children}</main>
        <CountryLabFooter />
      </div>
    </CountryPage>
  )
}

export function CountryLabFooter() {
  const t = useT()
  return (
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
  )
}

export function CountryLabAction({
  children = 'Create your account',
  tone = 'ink',
  className,
}: {
  children?: ReactNode
  tone?: 'ink' | 'paper'
  className?: string
}) {
  return (
    <Link
      className={cn(
        'country-button',
        tone === 'paper' && 'cty-button-paper',
        className,
      )}
      to="/sign-up/$"
    >
      {children} <CountryArrow />
    </Link>
  )
}

export function CountryLabExample({
  className,
  children = 'Example',
}: {
  className?: string
  children?: ReactNode
}) {
  return <span className={cn('cty-example', className)}>{children}</span>
}

type PhotoName = 'gate' | 'gate-portrait' | 'palomino'

const photos: Record<
  PhotoName,
  { srcSet: string; src: string; width: number; height: number; alt: string }
> = {
  gate: {
    src: '/landing-lab/field-office-panorama-960.jpg',
    srcSet:
      '/landing-lab/field-office-panorama-480.jpg 480w, /landing-lab/field-office-panorama-960.jpg 960w, /landing-lab/field-office-panorama-1600.jpg 1600w',
    width: 1600,
    height: 872,
    alt: 'A chestnut horse looking out over the stable gate in the evening light.',
  },
  'gate-portrait': {
    src: '/landing-lab/juniper-portrait-960.jpg',
    srcSet:
      '/landing-lab/juniper-portrait-480.jpg 384w, /landing-lab/juniper-portrait-960.jpg 768w, /landing-lab/juniper-portrait-1600.jpg 1280w',
    width: 1280,
    height: 1600,
    alt: 'A chestnut horse standing at a wooden rail beside a whitewashed stable in low evening sun.',
  },
  palomino: {
    src: '/landing-lab/juniper-palomino-960.jpg',
    srcSet:
      '/landing-lab/juniper-palomino-480.jpg 480w, /landing-lab/juniper-palomino-960.jpg 960w',
    width: 960,
    height: 768,
    alt: 'A palomino horse with a golden coat and ivory mane in a sunny stable yard.',
  },
}

export function CountryLabPhoto({
  name,
  sizes,
  className,
  priority = false,
  position,
}: {
  name: PhotoName
  sizes: string
  className?: string
  priority?: boolean
  position?: string
}) {
  const photo = photos[name]
  return (
    <img
      className={cn('cty-photo', className)}
      src={photo.src}
      srcSet={photo.srcSet}
      sizes={sizes}
      alt={photo.alt}
      width={photo.width}
      height={photo.height}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      style={position ? { objectPosition: position } : undefined}
    />
  )
}

/** Small drawn icons in the landing's 1.5px stroke grammar. */
export function CountryLabIcon({
  name,
  className,
}: {
  name: 'lock' | 'check' | 'bell' | 'calendar' | 'horse' | 'phone' | 'doc'
  className?: string
}) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    className: cn('cty-icon', className),
  }
  switch (name) {
    case 'lock':
      return (
        <svg {...common}>
          <rect x="5" y="10.5" width="14" height="9.5" rx="1.5" />
          <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
        </svg>
      )
    case 'check':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 2.5 2.5L16 9" />
        </svg>
      )
    case 'bell':
      return (
        <svg {...common}>
          <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15Z" />
          <path d="M10 20.5a2.2 2.2 0 0 0 4 0" />
        </svg>
      )
    case 'calendar':
      return (
        <svg {...common}>
          <rect x="4" y="5.5" width="16" height="14.5" rx="1.5" />
          <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
        </svg>
      )
    case 'horse':
      return <HorseIcon aria-hidden="true" className={common.className} />
    case 'phone':
      return (
        <svg {...common}>
          <path d="M6.5 4h3l1.5 4-2 1.5a10 10 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A15 15 0 0 1 4.5 6a2 2 0 0 1 2-2Z" />
        </svg>
      )
    case 'doc':
      return (
        <svg {...common}>
          <path d="M7 3.5h7l4 4v13H7Z" />
          <path d="M14 3.5v4h4M10 12h5M10 15.5h5" />
        </svg>
      )
  }
}
